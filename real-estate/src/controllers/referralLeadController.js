/**
 * Referral Lead Controller
 */
const ReferralLead = require('../models/ReferralLead');
const { verify }   = require('../utils/cookieSigner');
const { parsePagination, buildMeta } = require('../utils/pagination');
const fraudDetectionService = require('../services/fraudDetectionService');

// ── POST /api/v1/referral-leads ──────────────────────────────────
exports.submitLead = async (req, res, next) => {
  try {
    const { name, email, phone, propertyId, referralCode } = req.body;
    const ip = req.ip || 'unknown';

    // Resolve referral code: body > verified cookie
    let resolvedCode = referralCode || null;
    if (!resolvedCode && req.cookies?.ref) {
      resolvedCode = verify(req.cookies.ref); // null if tampered
    }

    // Fraud detection
    const fraudCheck = await fraudDetectionService.runFraudCheck({
      ip,
      email,
      refCode: resolvedCode,
    });

    if (fraudCheck.isFraudulent) {
      console.warn('[Fraud] Suspicious lead submission:', { email, ip, fraudCheck });
      // Still create lead but flag it for review
    }

    // Check for duplicate lead (same email + property)
    const existingLead = await ReferralLead.findOne({ email, propertyId });
    if (existingLead) {
      return res.status(409).json({ 
        success: false, 
        message: 'You have already submitted interest for this property',
        data: existingLead 
      });
    }

    const lead = await ReferralLead.create({
      name, email, phone, propertyId,
      referralCode: resolvedCode,
      userId: req.user?._id || null,
    });

    // Send notification to property owner (if applicable)
    try {
      const notificationService = require('../services/notificationService');
      const Property = require('../models/Property');
      const property = await Property.findById(propertyId).populate('userId');
      
      if (property && property.userId) {
        await notificationService.createNotification({
          userId: property.userId._id,
          type: 'new_lead',
          title: 'New Lead Received',
          message: `${name} is interested in your property: ${property.title}`,
          metadata: { leadId: lead._id, propertyId, referralCode: resolvedCode }
        });
      }
    } catch (notifErr) {
      console.error('[Notification] Failed to send lead notification:', notifErr.message);
    }

    res.status(201).json({ 
      success: true, 
      message: 'Lead submitted successfully', 
      data: lead,
      fraudWarning: fraudCheck.isFraudulent ? fraudCheck.recommendation : null,
    });
  } catch (err) { next(err); }
};

// ── Admin: GET /api/v1/admin/referral-leads ──────────────────────
exports.listLeads = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const filter = {};
    if (req.query.propertyId)   filter.propertyId   = req.query.propertyId;
    if (req.query.referralCode) filter.referralCode = req.query.referralCode;
    if (req.query.status)       filter.status       = req.query.status;

    const [data, total] = await Promise.all([
      ReferralLead.find(filter).sort(sort).skip(skip).limit(limit)
        .populate('propertyId', 'title propertyId')
        .populate('userId', 'name email')
        .lean(),
      ReferralLead.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: buildMeta(total, page, limit) });
  } catch (err) { next(err); }
};

// ── Admin: PATCH /api/v1/admin/referral-leads/:id ────────────────
exports.updateLeadStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const lead = await ReferralLead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.status = status;
    if (notes) lead.notes = notes;
    await lead.save();

    res.json({ success: true, message: 'Lead status updated', data: lead });
  } catch (err) { next(err); }
};

// ── Admin: DELETE /api/v1/admin/referral-leads/:id ───────────────
exports.deleteLead = async (req, res, next) => {
  try {
    const lead = await ReferralLead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (err) { next(err); }
};
