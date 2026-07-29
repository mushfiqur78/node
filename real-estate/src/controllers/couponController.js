/**
 * Coupon Controller
 */
const { Coupon, CouponUsage } = require('../models/Coupon');
const { parsePagination, buildMeta } = require('../utils/pagination');

// ── Admin: POST /api/v1/admin/coupons ────────────────────────────
exports.createCoupon = async (req, res, next) => {
  try {
    const { code, type, value, maxUses, isPublic, ownerUserId, propertyId, expiryDate } = req.body;

    if (type === 'percent' && value > 100) {
      return res.status(422).json({ success: false, message: 'Percent discount cannot exceed 100%' });
    }
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) return res.status(409).json({ success: false, message: 'Coupon code already exists' });

    const coupon = await Coupon.create({ code, type, value, maxUses, isPublic, ownerUserId, propertyId, expiryDate });
    res.status(201).json({ success: true, message: 'Coupon created', data: coupon });
  } catch (err) { next(err); }
};

// ── Admin: PUT /api/v1/admin/coupons/:id ─────────────────────────
exports.updateCoupon = async (req, res, next) => {
  try {
    // For partial updates, fetch existing type if not provided in body
    const existing = await Coupon.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'Coupon not found' });

    const effectiveType  = req.body.type  ?? existing.type;
    const effectiveValue = req.body.value ?? existing.value;

    if (effectiveType === 'percent' && effectiveValue > 100) {
      return res.status(422).json({ success: false, message: 'Percent discount cannot exceed 100%' });
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: coupon });
  } catch (err) { next(err); }
};

// ── Admin: DELETE /api/v1/admin/coupons/:id ──────────────────────
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
    res.json({ success: true, message: 'Coupon deactivated' });
  } catch (err) { next(err); }
};

// ── Admin: GET /api/v1/admin/coupons ─────────────────────────────
exports.listCoupons = async (req, res, next) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const filter = {};
    if (req.query.isPublic !== undefined) filter.isPublic = req.query.isPublic === 'true';

    const [data, total] = await Promise.all([
      Coupon.find(filter)
        .populate('ownerUserId', 'name email')
        .populate('propertyId',  'title')
        .sort(sort).skip(skip).limit(limit).lean(),
      Coupon.countDocuments(filter),
    ]);
    res.json({ success: true, data, pagination: buildMeta(total, page, limit) });
  } catch (err) { next(err); }
};

// ── User: GET /api/v1/coupons/public ─────────────────────────────
// Returns all active public coupons (not expired, not fully used)
exports.getPublicCoupons = async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isPublic:  true,
      isActive:  true,
      expiryDate: { $gt: now },
      $or: [
        { maxUses: 0 },
        { $expr: { $lt: ['$usedCount', '$maxUses'] } },
      ],
    })
      .select('code type value maxUses usedCount expiryDate')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: coupons });
  } catch (err) { next(err); }
};

// ── User: GET /api/v1/coupons/check?code=X&propertyId=Y ──────────
exports.checkCoupon = async (req, res, next) => {
  try {
    const { code, propertyId } = req.query;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
    const err = _validateCoupon(coupon, propertyId);
    if (err) return res.status(400).json({ success: false, message: err });
    res.json({ success: true, message: 'Coupon is valid', data: _formatCoupon(coupon) });
  } catch (err) { next(err); }
};

// ── User: POST /api/v1/coupons/apply ─────────────────────────────
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, propertyId } = req.body;
    const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
    const err = _validateCoupon(coupon, propertyId);
    if (err) return res.status(400).json({ success: false, message: err });

    const existing = await CouponUsage.findOne({ userId: req.user._id, couponId: coupon._id });
    if (existing?.status === 'reserved')  return res.status(409).json({ success: false, message: 'Coupon already reserved' });
    if (existing?.status === 'confirmed') return res.status(409).json({ success: false, message: 'Coupon already used' });

    // Atomic increment — unlimited coupon (maxUses=0) skips the count check
    const updated = await Coupon.findOneAndUpdate(
      {
        _id:      coupon._id,
        isActive: true,
        $or: [
          { maxUses: 0 },                                      // unlimited
          { $expr: { $lt: ['$usedCount', '$maxUses'] } },     // within limit
        ],
      },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!updated) return res.status(409).json({ success: false, message: 'Coupon is fully used' });

    const usage = await CouponUsage.create({ userId: req.user._id, couponId: coupon._id, status: 'reserved' });
    res.status(201).json({ success: true, message: 'Coupon reserved', data: { usage, coupon: _formatCoupon(updated) } });
  } catch (err) { next(err); }
};

// ── User: POST /api/v1/coupons/confirm ───────────────────────────
exports.confirmCoupon = async (req, res, next) => {
  try {
    const usage = await CouponUsage.findById(req.body.usageId);
    if (!usage) return res.status(404).json({ success: false, message: 'Usage not found' });
    if (usage.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (usage.status !== 'reserved') return res.status(400).json({ success: false, message: `Cannot confirm a ${usage.status} coupon` });
    usage.status = 'confirmed';
    await usage.save();
    res.json({ success: true, data: usage });
  } catch (err) { next(err); }
};

// ── User: POST /api/v1/coupons/cancel ────────────────────────────
exports.cancelCoupon = async (req, res, next) => {
  try {
    const usage = await CouponUsage.findById(req.body.usageId);
    if (!usage) return res.status(404).json({ success: false, message: 'Usage not found' });
    if (usage.userId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Forbidden' });
    if (usage.status === 'confirmed') return res.status(400).json({ success: false, message: 'Cannot cancel a confirmed coupon' });
    if (usage.status === 'cancelled') return res.status(400).json({ success: false, message: 'Already cancelled' });

    await Promise.all([
      CouponUsage.findByIdAndUpdate(usage._id, { status: 'cancelled' }),
      Coupon.findByIdAndUpdate(usage.couponId, { $inc: { usedCount: -1 } }),
    ]);
    res.json({ success: true, message: 'Coupon cancelled and usage rolled back' });
  } catch (err) { next(err); }
};

// ── Private helpers ───────────────────────────────────────────────
const _validateCoupon = (coupon, propertyId) => {
  if (!coupon || !coupon.isActive) return 'Coupon not found or inactive';
  if (new Date(coupon.expiryDate) < new Date()) return 'Coupon has expired';
  // maxUses 0 = unlimited, skip usage check
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return 'Coupon has reached its usage limit';
  if (coupon.propertyId && propertyId && coupon.propertyId.toString() !== propertyId.toString()) {
    return 'Coupon is not valid for this property';
  }
  return null;
};

const _formatCoupon = (c) => ({
  id: c._id, code: c.code, type: c.type, value: c.value,
  remaining: c.maxUses - c.usedCount, expiryDate: c.expiryDate,
});
