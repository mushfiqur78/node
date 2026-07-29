/**
 * Wishlist Controller
 * Authenticated users can save/unsave properties
 */

const Wishlist  = require('../models/Wishlist');
const Property  = require('../models/Property');

// ─── GET /api/wishlist ────────────────────────────────────────────
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'properties',
        match: { status: 'approved' },
        populate: [
          { path: 'type',     select: 'name' },
          { path: 'location', select: 'name city' },
          { path: 'purpose',  select: 'name' },
        ],
      });

    const properties = wishlist?.properties || [];
    res.json({ success: true, message: 'Wishlist fetched', data: { properties, total: properties.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── POST /api/wishlist/:propertyId — toggle save/unsave ──────────
exports.toggleWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      // Create new wishlist and add property
      wishlist = await Wishlist.create({ user: req.user._id, properties: [propertyId] });
      return res.json({ success: true, message: 'Property saved', data: { saved: true } });
    }

    const isSaved = wishlist.properties.some(p => p.toString() === propertyId);

    if (isSaved) {
      // Remove from wishlist
      wishlist.properties = wishlist.properties.filter(p => p.toString() !== propertyId);
      await wishlist.save();
      return res.json({ success: true, message: 'Property removed from wishlist', data: { saved: false } });
    } else {
      // Add to wishlist
      wishlist.properties.push(propertyId);
      await wishlist.save();
      return res.json({ success: true, message: 'Property saved to wishlist', data: { saved: true } });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/wishlist/check/:propertyId ─────────────────────────
exports.checkWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    const saved = wishlist?.properties.some(p => p.toString() === req.params.propertyId) || false;
    res.json({ success: true, data: { saved } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/wishlist/clear ───────────────────────────────────
exports.clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate({ user: req.user._id }, { properties: [] });
    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
