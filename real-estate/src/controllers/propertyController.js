/**
 * Property Controller
 * Handles create, read, update, delete for properties
 * Image processing via imageService
 * Business rules: pricing validation by purpose, auto-approve for super_admin
 */

const Property = require('../models/Property');
const Purpose = require('../models/Purpose');
const { processFeaturedImage, processGalleryImages, deleteImage } = require('../services/imageService');
const { getNewPropertyExpiry } = require('../services/autoExpiryService');

// ─── POST /api/properties ─────────────────────────────────────────
exports.createProperty = async (req, res) => {
  try {
    const body = req.body;

    // Process images
    if (!req.files?.featuredImage?.[0]) {
      return res.status(400).json({ success: false, message: 'Featured image is required' });
    }

    // Parse image metadata sent from frontend
    const featuredMeta  = body.featuredImageMeta  ? JSON.parse(body.featuredImageMeta)  : {};
    const galleryMetas  = body.galleryMetas        ? JSON.parse(body.galleryMetas)        : [];
    const galleryUrls   = body.galleryUrls         ? JSON.parse(body.galleryUrls)         : [];

    let featuredImage;
    if (req.files?.featuredImage?.[0]) {
      // new upload
      featuredImage = await processFeaturedImage(req.files.featuredImage[0], featuredMeta, req.user._id);
    } else if (body.featuredImageUrl) {
      // reuse from library
      featuredImage = JSON.parse(body.featuredImageUrl);
    } else {
      return res.status(400).json({ success: false, message: 'Featured image is required' });
    }

    // gallery: mix of new uploads + library reuse
    const uploadedGallery = req.files?.gallery
      ? await processGalleryImages(req.files.gallery, galleryMetas, req.user._id)
      : [];
    const gallery = [...uploadedGallery, ...galleryUrls];

    // Parse pricing if sent as JSON string (FormData)
    const pricing = typeof body.pricing === 'string' ? JSON.parse(body.pricing) : body.pricing;

    // Validate pricing by purpose
    const purposeDoc = await Purpose.findById(body.purpose);
    if (!purposeDoc) {
      return res.status(400).json({ success: false, message: 'Invalid purpose' });
    }

    const purposeName = purposeDoc.name?.toLowerCase();
    if (purposeName === 'rent' && !pricing?.rentPerMonth) {
      return res.status(400).json({ success: false, message: 'rentPerMonth is required for rent purpose' });
    }
    if (purposeName === 'sell' && !pricing?.totalPrice) {
      return res.status(400).json({ success: false, message: 'totalPrice is required for sell purpose' });
    }

    // Parse array fields if sent as JSON strings (FormData)
    const parseField = (field) =>
      typeof field === 'string' ? JSON.parse(field) : field || [];

    // Auto expiry
    const { expiryDate, expiryMode } = await getNewPropertyExpiry(new Date());

    const property = await Property.create({
      ...body,
      pricing,
      featuredImage,
      gallery,
      primaryFeatures: parseField(body.primaryFeatures),
      amenities:       parseField(body.amenities),
      otherFeatures:   parseField(body.otherFeatures),
      owner:           req.user._id,
      createdByRole:   req.user.role,
      contactNumber:   body.contactNumber || req.user.phone,
      status:          req.user.role === 'super_admin' ? 'approved' : 'pending',
      source:          req.user.role === 'super_admin' ? 'admin' : 'marketplace',
      expiryDate:      body.expiryDate || expiryDate,
      expiryMode:      body.expiryDate ? 'manual' : expiryMode,
    });

    res.status(201).json({ success: true, message: 'Property created', data: { property } });

    // In-app notification + email (non-admin only)
    if (req.user.role !== 'super_admin') {
      try {
        const { notifyPropertySubmitted } = require('../services/notificationService');
        await notifyPropertySubmitted({ property, owner: req.user });
      } catch {}

      try {
        const GeneralSetting = require('../models/GeneralSetting');
        const settings = await GeneralSetting.findOne();
        if (settings?.email && settings?.emailNotifications !== false) {
          const { sendPropertySubmitNotification } = require('../services/emailService');
          await sendPropertySubmitNotification({
            adminEmail: settings.email,
            property,
            owner: { name: req.user.name, email: req.user.email },
          });
        }
      } catch (emailErr) {
        console.error('[Email] Property submit notification failed:', emailErr.message);
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/properties ──────────────────────────────────────────
exports.getProperties = async (req, res) => {
  try {
    const {
      status, type, location, purpose, label,
      search, minPrice, maxPrice, minArea, maxArea,
      bedrooms, bathrooms, source,
      sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 10,
    } = req.query;

    // Show both marketplace and admin properties (all approved properties)
    const filter = { status: 'approved' };

    // Filters
    if (type)     filter.type     = type;
    if (location) filter.location = location;
    if (purpose)  filter.purpose  = purpose;
    if (label)    filter.label    = label;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);

    // Price range
    if (minPrice || maxPrice) {
      filter.$or = [
        { 'pricing.totalPrice':   { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) } },
        { 'pricing.rentPerMonth': { ...(minPrice && { $gte: Number(minPrice) }), ...(maxPrice && { $lte: Number(maxPrice) }) } },
      ];
    }

    // Area range
    if (minArea || maxArea) {
      filter.areaSize = {
        ...(minArea && { $gte: Number(minArea) }),
        ...(maxArea && { $lte: Number(maxArea) }),
      };
    }

    // Full-text search
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address:     { $regex: search, $options: 'i' } },
        { propertyId:  { $regex: search, $options: 'i' } },
      ];
    }

    // Sort
    const sortOptions = {};
    const allowedSort = ['createdAt', 'pricing.totalPrice', 'pricing.rentPerMonth', 'areaSize', 'viewCount'];
    sortOptions[allowedSort.includes(sortBy) ? sortBy : 'createdAt'] = sortOrder === 'asc' ? 1 : -1;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);

    const properties = await Property.find(filter)
      .populate('type', 'name')
      .populate('location', 'name city slug')
      .populate('label', 'name color')
      .populate('purpose', 'name')
      .populate('owner', 'name email phone avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      message: 'Properties fetched',
      data: { properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/properties/slug/:slug ──────────────────────────────
exports.getPropertyBySlug = async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { slug: req.params.slug, status: 'approved' },
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('type', 'name')
      .populate('location', 'name city')
      .populate('label', 'name color')
      .populate('purpose', 'name')
      .populate('primaryFeatures', 'name icon')
      .populate('amenities', 'name icon')
      .populate('otherFeatures', 'name icon')
      .populate('owner', 'name email phone avatar');

    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property fetched', data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/properties/:id ──────────────────────────────────────
exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndUpdate(
      { _id: req.params.id, status: 'approved' },
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('type', 'name')
      .populate('location', 'name city')
      .populate('label', 'name color')
      .populate('purpose', 'name')
      .populate('primaryFeatures', 'name icon')
      .populate('amenities', 'name icon')
      .populate('otherFeatures', 'name icon')
      .populate('owner', 'name email phone avatar');

    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    res.json({ success: true, message: 'Property fetched', data: { property } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/properties/:id/related ─────────────────────────────
exports.getRelatedProperties = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const related = await Property.find({
      _id:      { $ne: property._id },
      status:   'approved',
      source:   'marketplace',
      $or: [
        { type:     property.type },
        { location: property.location },
        { purpose:  property.purpose },
      ],
    })
      .populate('type', 'name')
      .populate('location', 'name city')
      .populate('purpose', 'name')
      .limit(6)
      .sort({ createdAt: -1 });

    res.json({ success: true, message: 'Related properties fetched', data: { properties: related } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── PUT /api/properties/:id ──────────────────────────────────────
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (
      req.user.role !== 'super_admin' &&
      property.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const body    = req.body;
    const updates = { ...body };

    // ── Parse JSON string fields ──────────────────────────────────
    if (updates.pricing && typeof updates.pricing === 'string') updates.pricing = JSON.parse(updates.pricing);
    if (updates.seo     && typeof updates.seo     === 'string') updates.seo     = JSON.parse(updates.seo);
    if (updates.primaryFeatures && typeof updates.primaryFeatures === 'string') updates.primaryFeatures = JSON.parse(updates.primaryFeatures);
    if (updates.amenities       && typeof updates.amenities       === 'string') updates.amenities       = JSON.parse(updates.amenities);
    if (updates.otherFeatures   && typeof updates.otherFeatures   === 'string') updates.otherFeatures   = JSON.parse(updates.otherFeatures);

    // ── Featured image ────────────────────────────────────────────
    if (req.files?.featuredImage?.[0]) {
      // new upload
      const meta = updates.featuredImageMeta ? JSON.parse(updates.featuredImageMeta) : {};
      updates.featuredImage = await processFeaturedImage(req.files.featuredImage[0], meta, req.user._id);
    } else if (updates.featuredImageUrl) {
      // reuse from library
      updates.featuredImage = JSON.parse(updates.featuredImageUrl);
    }
    delete updates.featuredImageMeta;
    delete updates.featuredImageUrl;

    // ── Gallery ───────────────────────────────────────────────────
    const galleryMetas = updates.galleryMetas ? JSON.parse(updates.galleryMetas) : [];
    const galleryUrls  = updates.galleryUrls  ? JSON.parse(updates.galleryUrls)  : [];
    delete updates.galleryMetas;
    delete updates.galleryUrls;

    const uploadedGallery = req.files?.gallery?.length
      ? await processGalleryImages(req.files.gallery, galleryMetas, req.user._id)
      : [];
    if (uploadedGallery.length || galleryUrls.length) {
      updates.gallery = [...uploadedGallery, ...galleryUrls];
    }

    // ── Pricing validation ────────────────────────────────────────
    if (updates.purpose || updates.pricing) {
      const purposeId  = updates.purpose || property.purpose;
      const purposeDoc = await Purpose.findById(purposeId);
      if (purposeDoc) {
        const pName   = purposeDoc.name?.toLowerCase();
        const pricing = updates.pricing || property.pricing;
        if (pName === 'rent' && !pricing?.rentPerMonth) {
          return res.status(400).json({ success: false, message: 'rentPerMonth is required for rent purpose' });
        }
        if (pName === 'sell' && !pricing?.totalPrice) {
          return res.status(400).json({ success: false, message: 'totalPrice is required for sell purpose' });
        }
      }
    }

    // ── Slug uniqueness ───────────────────────────────────────────
    if (updates.slug) {
      const slugify = require('slugify');
      updates.slug  = slugify(updates.slug, { lower: true, strict: true });
      const exists  = await Property.findOne({ slug: updates.slug, _id: { $ne: req.params.id } });
      if (exists) return res.status(400).json({ success: false, message: 'Slug already in use' });
    }

    // super_admin keeps approved status
    if (req.user.role !== 'super_admin') updates.status = 'pending';

    const updated = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, message: 'Property updated', data: { property: updated } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── DELETE /api/properties/:id ───────────────────────────────────
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Only owner or super_admin can delete
    if (
      req.user.role !== 'super_admin' &&
      property.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Delete images from disk
    deleteImage(property.featuredImage);
    property.gallery.forEach((img) => deleteImage(img));

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ─── GET /api/properties/my ───────────────────────────────────────
exports.getMyProperties = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments({ owner: req.user._id });

    const properties = await Property.find({ owner: req.user._id })
      .populate('type', 'name')
      .populate('location', 'name city')
      .populate('purpose', 'name')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'My properties fetched',
      data: { properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
