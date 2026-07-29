const { ReferralClick } = require('../models/Referral');
const ReferralLead = require('../models/ReferralLead');
const User = require('../models/User');

/**
 * Fraud Detection Service for Referral System
 */

// Check if IP has suspicious activity
exports.checkSuspiciousIP = async (ip) => {
  const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
  const since = new Date(Date.now() - timeWindow);

  const [clickCount, leadCount, signupCount] = await Promise.all([
    ReferralClick.countDocuments({ ip, createdAt: { $gte: since } }),
    ReferralLead.countDocuments({ createdAt: { $gte: since } }), // Can't directly query by IP in leads
    User.countDocuments({ createdAt: { $gte: since } }), // Assuming User model tracks IP
  ]);

  const maxClicksPerDay = parseInt(process.env.MAX_CLICKS_PER_IP_PER_DAY, 10) || 50;
  const maxLeadsPerDay = parseInt(process.env.MAX_LEADS_PER_IP_PER_DAY, 10) || 10;

  return {
    isSuspicious: clickCount > maxClicksPerDay || leadCount > maxLeadsPerDay,
    clickCount,
    leadCount,
    signupCount,
    reason: clickCount > maxClicksPerDay 
      ? `Too many clicks from IP (${clickCount} in 24h)` 
      : leadCount > maxLeadsPerDay 
      ? `Too many leads from IP (${leadCount} in 24h)` 
      : null,
  };
};

// Check if email has multiple leads
exports.checkDuplicateEmail = async (email) => {
  const leads = await ReferralLead.find({ email }).lean();
  const uniqueProperties = new Set(leads.map(l => l.propertyId.toString()));
  
  return {
    isDuplicate: leads.length > 1,
    totalLeads: leads.length,
    uniqueProperties: uniqueProperties.size,
    leads: leads.slice(0, 5), // Return first 5 for review
  };
};

// Check if user is self-referring (creating fake accounts)
exports.checkSelfReferral = async (userId, referralCode) => {
  const { Referral } = require('../models/Referral');
  const referrer = await Referral.findOne({ refCode: referralCode });
  
  if (!referrer) return { isSelfReferral: false };
  
  return {
    isSelfReferral: referrer.userId.toString() === userId.toString(),
    referrerId: referrer.userId,
  };
};

// Check conversion rate anomaly (too high = suspicious)
exports.checkConversionAnomaly = async (refCode) => {
  const { Referral } = require('../models/Referral');
  const referral = await Referral.findOne({ refCode });
  
  if (!referral || referral.totalClicks === 0) {
    return { isAnomalous: false, conversionRate: 0 };
  }

  const conversionRate = (referral.conversions / referral.totalClicks) * 100;
  const normalMaxRate = parseFloat(process.env.MAX_CONVERSION_RATE, 10) || 30; // 30% is suspiciously high

  return {
    isAnomalous: conversionRate > normalMaxRate && referral.conversions > 5,
    conversionRate: conversionRate.toFixed(2),
    totalClicks: referral.totalClicks,
    conversions: referral.conversions,
    reason: conversionRate > normalMaxRate 
      ? `Conversion rate too high (${conversionRate.toFixed(2)}%)` 
      : null,
  };
};

// Check if same device/browser pattern (fingerprinting)
exports.checkDevicePattern = async (refCode) => {
  const clicks = await ReferralClick.find({ refCode }).lean();
  
  if (clicks.length < 5) return { isSuspicious: false };

  // Count unique device signatures
  const signatures = clicks.map(c => `${c.device.os}-${c.device.browser}-${c.device.device}`);
  const uniqueSignatures = new Set(signatures);
  
  // If 80%+ clicks from same device signature = suspicious
  const uniqueRatio = uniqueSignatures.size / clicks.length;
  
  return {
    isSuspicious: uniqueRatio < 0.2 && clicks.length > 10,
    totalClicks: clicks.length,
    uniqueDevices: uniqueSignatures.size,
    uniqueRatio: (uniqueRatio * 100).toFixed(2) + '%',
    reason: uniqueRatio < 0.2 ? 'Most clicks from same device' : null,
  };
};

// Comprehensive fraud check
exports.runFraudCheck = async ({ ip, email, userId, refCode }) => {
  const checks = await Promise.all([
    ip ? this.checkSuspiciousIP(ip) : Promise.resolve({ isSuspicious: false }),
    email ? this.checkDuplicateEmail(email) : Promise.resolve({ isDuplicate: false }),
    refCode ? this.checkConversionAnomaly(refCode) : Promise.resolve({ isAnomalous: false }),
    refCode ? this.checkDevicePattern(refCode) : Promise.resolve({ isSuspicious: false }),
  ]);

  const [ipCheck, emailCheck, conversionCheck, deviceCheck] = checks;

  const fraudScore = 
    (ipCheck.isSuspicious ? 30 : 0) +
    (emailCheck.isDuplicate ? 20 : 0) +
    (conversionCheck.isAnomalous ? 30 : 0) +
    (deviceCheck.isSuspicious ? 20 : 0);

  return {
    isFraudulent: fraudScore >= 50,
    fraudScore,
    checks: {
      ip: ipCheck,
      email: emailCheck,
      conversion: conversionCheck,
      device: deviceCheck,
    },
    recommendation: 
      fraudScore >= 70 ? 'Block immediately' :
      fraudScore >= 50 ? 'Manual review required' :
      fraudScore >= 30 ? 'Monitor closely' :
      'Looks legitimate',
  };
};
