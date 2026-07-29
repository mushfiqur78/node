/**
 * Admin Property Controller
 * Super admin only: list all, approve, reject, delete any property
 */

const Property = require('../models/Property');
const { deleteImage } = require('../services/imageService');

// ─── GET /api/admin/properties/:id ───────────────────────────────
exports.adminGetProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('type', 'name')
      .populate('location', 'name city')
      .populate('purpose', 'name')
      .populate('label', 'name color')
      .populate('primaryFeatures', 'name icon category')
      .populate('amenities', 'name icon category')
      .populate('otherFeatures', 'name icon category')
      .populate('owner', 'name email');

    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property fetched', data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/admin/properties ────────────────────────────────────
exports.adminGetProperties = async (req, res) => {
  try {
    const { status, type, location, purpose, source, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (type)     filter.type = type;
    if (location) filter.location = location;
    if (purpose)  filter.purpose = purpose;
    if (source)   filter.source = source;
    if (status)   filter.status = status;
    if (search) {
      filter.$or = [
        { title:      { $regex: search, $options: 'i' } },
        { address:    { $regex: search, $options: 'i' } },
        { propertyId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .populate('type', 'name')
      .populate('location', 'name city')
      .populate('purpose', 'name')
      .populate('label', 'name color')
      .populate('owner', 'name email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Properties fetched',
      data: { properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/properties/:id/approve ────────────────────────
exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id, { status: 'approved' }, { new: true }
    ).populate('owner', 'name email');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Send email to owner
    try {
      const { sendPropertyApprovedEmail } = require('../services/emailService');
      await sendPropertyApprovedEmail({ ownerEmail: property.owner.email, ownerName: property.owner.name, property });
    } catch (emailErr) {
      console.error('[Email] Property approved email failed:', emailErr.message);
    }

    res.json({ success: true, message: 'Property approved', data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/properties/:id/reject ─────────────────────────
exports.rejectProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id, { status: 'rejected' }, { new: true }
    ).populate('owner', 'name email');
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Send email to owner
    try {
      const { sendPropertyRejectedEmail } = require('../services/emailService');
      await sendPropertyRejectedEmail({ ownerEmail: property.owner.email, ownerName: property.owner.name, property });
    } catch (emailErr) {
      console.error('[Email] Property rejected email failed:', emailErr.message);
    }

    res.json({ success: true, message: 'Property rejected', data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/admin/properties/:id/flags ─────────────────────────
exports.updateFlags = async (req, res) => {
  try {
    const { hasDiningSpace, hasLivingRoom, isVerified, isRedHot } = req.body;

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { adminFlags: { hasDiningSpace, hasLivingRoom, isVerified, isRedHot } },
      { new: true }
    );
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    res.json({ success: true, message: 'Flags updated', data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/admin/properties/:id ────────────────────────────
exports.adminDeleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    deleteImage(property.featuredImage);
    property.gallery.forEach((img) => deleteImage(img));
    await property.deleteOne();

    res.json({ success: true, message: 'Property deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
