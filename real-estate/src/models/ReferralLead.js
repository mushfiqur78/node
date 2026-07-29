const mongoose = require('mongoose');

/**
 * ReferralLead — guest or authenticated user expressing interest via referral link
 * Named ReferralLead to avoid conflict with any future Enquiry/Lead model
 */
const referralLeadSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, trim: true, lowercase: true },
    phone:        { type: String, required: true, trim: true },
    propertyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    referralCode: { type: String, default: null },
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status:       { type: String, enum: ['pending', 'contacted', 'converted', 'rejected'], default: 'pending', index: true },
    notes:        { type: String, default: null },
  },
  { timestamps: true }
);

referralLeadSchema.index({ email: 1, propertyId: 1 });
referralLeadSchema.index({ referralCode: 1 });

module.exports = mongoose.model('ReferralLead', referralLeadSchema);
