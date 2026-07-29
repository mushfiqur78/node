/**
 * Email Service
 * Handles all transactional emails using Nodemailer
 * Checks GeneralSetting.emailNotifications before sending
 * All email types: enquiry, agent approval, property status
 */

const nodemailer = require('nodemailer');

// ─── Transporter — DB config first, .env fallback ────────────────
const createTransporter = async () => {
  let config = {
    host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
    port:   Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  };

  // Override with DB config if available
  try {
    const GeneralSetting = require('../models/GeneralSetting');
    const settings = await GeneralSetting.findOne();
    if (settings?.smtp?.host && settings?.smtp?.user && settings?.smtp?.pass) {
      config = {
        host:   settings.smtp.host,
        port:   settings.smtp.port || 587,
        secure: settings.smtp.secure || false,
        auth: {
          user: settings.smtp.user,
          pass: settings.smtp.pass,
        },
      };
    }
  } catch {}

  return nodemailer.createTransport(config);
};

// ─── Get FROM address ─────────────────────────────────────────────
const getFromAddress = async () => {
  try {
    const GeneralSetting = require('../models/GeneralSetting');
    const settings = await GeneralSetting.findOne();
    if (settings?.smtp?.from) return settings.smtp.from;
    if (settings?.siteName && settings?.smtp?.user) return `${settings.siteName} <${settings.smtp.user}>`;
  } catch {}
  return process.env.EMAIL_FROM || 'Real Estate <noreply@example.com>';
};

// ─── Check if email notifications are enabled ─────────────────────
const isEmailEnabled = async (type = null) => {
  try {
    const GeneralSetting = require('../models/GeneralSetting');
    const settings = await GeneralSetting.findOne();
    if (!settings) return false;                              // default off
    if (!settings.emailNotifications) return false;           // master switch off
    if (type && !settings[type]) return false;                // individual switch off
    return true;
  } catch { return false; }
};

// ─── Base send function ───────────────────────────────────────────
const sendEmail = async ({ to, subject, html, type = null }) => {
  if (!(await isEmailEnabled(type))) {
    console.log(`[Email] Disabled (${type || 'global'}) — skipped: ${subject}`);
    return;
  }
  try {
    const transporter  = await createTransporter();
    const fromAddress  = await getFromAddress();
    await transporter.sendMail({ from: fromAddress, to, subject, html });
    console.log(`[Email] Sent: ${subject} → ${to}`);
  } catch (error) {
    console.error(`[Email] Failed: ${error.message}`);
  }
};

// ─── Email Templates ──────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; }
  .header { background: #1d4ed8; color: white; padding: 24px; text-align: center; }
  .header h1 { margin: 0; font-size: 22px; }
  .body { padding: 24px; color: #374151; line-height: 1.6; }
  .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; }
  .btn { display: inline-block; background: #1d4ed8; color: white; padding: 10px 24px; border-radius: 6px; text-decoration: none; margin-top: 16px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: bold; }
  .badge-green { background: #d1fae5; color: #065f46; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-yellow { background: #fef3c7; color: #92400e; }
</style></head>
<body><div class="container">
  <div class="header"><h1>Real Estate</h1></div>
  <div class="body">${content}</div>
  <div class="footer">© ${new Date().getFullYear()} Real Estate. All rights reserved.</div>
</div></body></html>`;

// ─── Helper: get email templates from DB ──────────────────────────
const getTemplates = async () => {
  try {
    const GeneralSetting = require('../models/GeneralSetting');
    const settings = await GeneralSetting.findOne();
    return settings?.emailTemplates || {};
  } catch { return {}; }
};

// ─── 1. New Enquiry → Admin ───────────────────────────────────────
exports.sendEnquiryNotification = async ({ adminEmail, enquiry, property }) => {
  const tpl = await getTemplates();
  const subject = tpl.enquirySubject || 'New Property Enquiry';
  const bodyText = tpl.enquiryBody   || 'You have received a new enquiry for the property.';

  await sendEmail({
    to: adminEmail,
    subject: `${subject}: ${property.title}`,
    type: 'notifyEnquiry',
    html: baseTemplate(`
      <h2>${subject}</h2>
      <p>${bodyText}</p>
      <p><strong>Property:</strong> ${property.title} (${property.propertyId || ''})</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Name</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>${enquiry.name}</strong></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Email</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${enquiry.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Phone</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${enquiry.phone || '—'}</td></tr>
        <tr><td style="padding:8px;color:#6b7280;vertical-align:top;">Message</td><td style="padding:8px;">${enquiry.message}</td></tr>
      </table>
    `),
  });
};

// ─── 2. Property Submitted → Admin ───────────────────────────────
exports.sendPropertySubmitNotification = async ({ adminEmail, property, owner }) => {
  const tpl = await getTemplates();
  const subject  = tpl.propertySubmitSubject || 'New Property Submitted for Review';
  const bodyText = tpl.propertySubmitBody    || 'A new property has been submitted and is awaiting your approval.';

  await sendEmail({
    to:      adminEmail,
    subject: `${subject}: ${property.title}`,
    type:    'notifyPropertySubmit',
    html: baseTemplate(`
      <h2>${subject}</h2>
      <p>${bodyText}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Property</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;"><strong>${property.title}</strong></td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">ID</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${property.propertyId || '—'}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;color:#6b7280;">Owner</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${owner?.name || '—'}</td></tr>
        <tr><td style="padding:8px;color:#6b7280;">Email</td><td style="padding:8px;">${owner?.email || '—'}</td></tr>
      </table>
    `),
  });
};

// ─── 3. Agent Approved → User ─────────────────────────────────────
exports.sendAgentApprovalEmail = async ({ agentEmail, agentName }) => {
  await sendEmail({
    to:      agentEmail,
    subject: 'Your account has been approved!',
    html: baseTemplate(`
      <h2>Congratulations, ${agentName}! 🎉</h2>
      <p>Your account has been <span class="badge badge-green">Approved</span> by our admin team.</p>
      <a href="${process.env.FRONTEND_URL}/login" class="btn">Login Now</a>
    `),
  });
};

// ─── 4. Property Approved → Owner ────────────────────────────────
exports.sendPropertyApprovedEmail = async ({ ownerEmail, ownerName, property }) => {
  const tpl = await getTemplates();
  const subject  = tpl.propertyApprovedSubject || 'Your Property Has Been Approved';
  const bodyText = tpl.propertyApprovedBody    || 'Your property has been approved and is now live on our platform.';

  await sendEmail({
    to:      ownerEmail,
    subject: `${subject}: ${property.title}`,
    type:    'notifyPropertyApproved',
    html: baseTemplate(`
      <h2>${subject} ✅</h2>
      <p>Hi ${ownerName},</p>
      <p>${bodyText}</p>
      <p><strong>Property:</strong> ${property.title} (ID: ${property.propertyId || ''})</p>
      <a href="${process.env.FRONTEND_URL}/properties/${property.slug}" class="btn">View Property</a>
    `),
  });
};

// ─── 5. Property Rejected → Owner ────────────────────────────────
exports.sendPropertyRejectedEmail = async ({ ownerEmail, ownerName, property }) => {
  const tpl = await getTemplates();
  const subject  = tpl.propertyRejectedSubject || 'Your Property Was Not Approved';
  const bodyText = tpl.propertyRejectedBody    || 'Unfortunately, your property has not been approved.';

  await sendEmail({
    to:      ownerEmail,
    subject: `${subject}: ${property.title}`,
    type:    'notifyPropertyRejected',
    html: baseTemplate(`
      <h2>${subject}</h2>
      <p>Hi ${ownerName},</p>
      <p>${bodyText}</p>
      <p><strong>Property:</strong> ${property.title} (ID: ${property.propertyId || ''})</p>
      <a href="${process.env.FRONTEND_URL}/contact" class="btn">Contact Support</a>
    `),
  });
};

// ─── 6. Welcome Email → New User ─────────────────────────────────
exports.sendWelcomeEmail = async ({ email, name, role }) => {
  const tpl = await getTemplates();
  const subject  = tpl.welcomeSubject || 'Welcome to Real Estate Platform!';
  const bodyText = tpl.welcomeBody    || 'Thank you for joining our real estate platform.';

  await sendEmail({
    to:      email,
    subject,
    html: baseTemplate(`
      <h2>${subject}</h2>
      <p>Hi ${name},</p>
      <p>${bodyText}</p>
      <a href="${process.env.FRONTEND_URL}/login" class="btn">Get Started</a>
    `),
  });
};

// ─── 6. Password Reset Email ──────────────────────────────────────
exports.sendPasswordResetEmail = async ({ email, name, resetUrl }) => {
  await sendEmail({
    to:      email,
    subject: 'Password Reset Request',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name},</p>
      <p>You requested to reset your password. Click the button below to set a new password.</p>
      <p>This link will expire in <strong>15 minutes</strong>.</p>
      <a href="${resetUrl}" class="btn">Reset Password</a>
      <p style="margin-top:16px;font-size:12px;color:#9ca3af;">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
    `),
  });
};

// ─── 7. Email Verification ────────────────────────────────────────
exports.sendVerificationEmail = async ({ email, name, verifyUrl }) => {
  // Get custom template from DB if available
  let subject = 'Verify Your Email Address';
  let bodyText = 'Thank you for registering! Please verify your email address by clicking the button below.';

  try {
    const GeneralSetting = require('../models/GeneralSetting');
    const settings = await GeneralSetting.findOne();
    if (settings?.emailTemplates?.verificationSubject) subject  = settings.emailTemplates.verificationSubject;
    if (settings?.emailTemplates?.verificationBody)    bodyText = settings.emailTemplates.verificationBody;
  } catch {}

  await sendEmail({
    to:      email,
    subject,
    html: baseTemplate(`
      <h2>${subject}</h2>
      <p>Hi ${name},</p>
      <p>${bodyText}</p>
      <p>This link will expire in <strong>24 hours</strong>.</p>
      <a href="${verifyUrl}" class="btn">Verify Email</a>
      <p style="margin-top:16px;font-size:12px;color:#9ca3af;">If you did not create an account, please ignore this email.</p>
    `),
  });
};

// ─── 8. Saved Search Alert → User ────────────────────────────────
exports.sendSavedSearchAlert = async ({ user, searchName, properties, totalMatches }) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  // Build property list HTML
  const propertyListHtml = properties.map(property => `
    <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:16px;">
      <div style="display:flex;gap:16px;">
        ${property.featuredImage?.url ? `
          <img src="${property.featuredImage.url}" alt="${property.title}" style="width:120px;height:90px;object-fit:cover;border-radius:6px;">
        ` : ''}
        <div style="flex:1;">
          <h3 style="margin:0 0 8px 0;font-size:16px;color:#111827;">
            <a href="${frontendUrl}/properties/${property.slug}" style="color:#1d4ed8;text-decoration:none;">${property.title}</a>
          </h3>
          <p style="margin:0 0 8px 0;color:#6b7280;font-size:14px;">
            ${property.location?.name || ''} ${property.location?.city ? `• ${property.location.city}` : ''}
          </p>
          <div style="display:flex;gap:12px;font-size:14px;color:#374151;">
            ${property.pricing?.totalPrice ? `<span><strong>৳${property.pricing.totalPrice.toLocaleString()}</strong></span>` : ''}
            ${property.pricing?.rentPerMonth ? `<span><strong>৳${property.pricing.rentPerMonth.toLocaleString()}/month</strong></span>` : ''}
            ${property.bedrooms ? `<span>🛏️ ${property.bedrooms} Bed</span>` : ''}
            ${property.bathrooms ? `<span>🚿 ${property.bathrooms} Bath</span>` : ''}
            ${property.areaSize ? `<span>📐 ${property.areaSize} sqft</span>` : ''}
          </div>
        </div>
      </div>
    </div>
  `).join('');

  await sendEmail({
    to: user.email,
    subject: `${totalMatches} New ${totalMatches === 1 ? 'Property' : 'Properties'} Match Your Saved Search: ${searchName}`,
    html: baseTemplate(`
      <h2>🏠 New Properties Match Your Search!</h2>
      <p>Hi ${user.name},</p>
      <p>We found <strong>${totalMatches}</strong> new ${totalMatches === 1 ? 'property' : 'properties'} matching your saved search: <strong>"${searchName}"</strong></p>
      
      <div style="margin:24px 0;">
        ${propertyListHtml}
      </div>

      ${properties.length < totalMatches ? `
        <p style="text-align:center;color:#6b7280;font-size:14px;">
          Showing ${properties.length} of ${totalMatches} new properties
        </p>
      ` : ''}

      <div style="text-align:center;margin-top:24px;">
        <a href="${frontendUrl}/saved-searches" class="btn">View All Matches</a>
      </div>

      <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
        You're receiving this email because you have alerts enabled for this saved search. 
        <a href="${frontendUrl}/saved-searches" style="color:#1d4ed8;">Manage your alerts</a>
      </p>
    `),
  });
};
