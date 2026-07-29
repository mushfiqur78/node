/**
 * Advanced Search Service
 * Handles complex property search with multiple filters
 */

const Property = require('../models/Property');

/**
 * Build MongoDB filter from search parameters
 */
exports.buildSearchFilter = (params) => {
  const filter = { source: 'marketplace', status: 'approved' };

  // ─── Basic Filters ────────────────────────────────────────────────
  if (params.type) filter.type = params.type;
  if (params.location) filter.location = params.location;
  if (params.purpose) filter.purpose = params.purpose;
  if (params.label) filter.label = params.label;

  // ─── Numeric Filters ──────────────────────────────────────────────
  if (params.bedrooms) {
    if (params.bedrooms === '5+') {
      filter.bedrooms = { $gte: 5 };
    } else {
      filter.bedrooms = Number(params.bedrooms);
    }
  }

  if (params.bathrooms) {
    if (params.bathrooms === '5+') {
      filter.bathrooms = { $gte: 5 };
    } else {
      filter.bathrooms = Number(params.bathrooms);
    }
  }

  if (params.balcony) {
    if (params.balcony === '3+') {
      filter.balcony = { $gte: 3 };
    } else {
      filter.balcony = Number(params.balcony);
    }
  }

  // ─── Price Range ──────────────────────────────────────────────────
  if (params.minPrice || params.maxPrice) {
    const priceFilter = {};
    if (params.minPrice) priceFilter.$gte = Number(params.minPrice);
    if (params.maxPrice) priceFilter.$lte = Number(params.maxPrice);

    filter.$or = [
      { 'pricing.totalPrice': priceFilter },
      { 'pricing.rentPerMonth': priceFilter },
    ];
  }

  // ─── Price Per Sqft Range ─────────────────────────────────────────
  if (params.minPricePerSft || params.maxPricePerSft) {
    const pricePerSftFilter = {};
    if (params.minPricePerSft) pricePerSftFilter.$gte = Number(params.minPricePerSft);
    if (params.maxPricePerSft) pricePerSftFilter.$lte = Number(params.maxPricePerSft);
    filter['pricing.pricePerSft'] = pricePerSftFilter;
  }

  // ─── Area Range ───────────────────────────────────────────────────
  if (params.minArea || params.maxArea) {
    filter.areaSize = {};
    if (params.minArea) filter.areaSize.$gte = Number(params.minArea);
    if (params.maxArea) filter.areaSize.$lte = Number(params.maxArea);
  }

  // ─── Floor Filter ─────────────────────────────────────────────────
  if (params.floor) {
    if (params.floor === 'ground') {
      filter.floor = { $in: ['Ground', 'ground', '0', 'G'] };
    } else if (params.floor === '10+') {
      filter.floor = { $regex: /^([1-9]\d+|[1-9]\d)$/ }; // 10 or more
    } else {
      filter.floor = params.floor;
    }
  }

  // ─── Admin Flags ──────────────────────────────────────────────────
  if (params.isVerified === 'true') {
    filter['adminFlags.isVerified'] = true;
  }

  if (params.isRedHot === 'true') {
    filter['adminFlags.isRedHot'] = true;
  }

  if (params.hasDiningSpace === 'true') {
    filter['adminFlags.hasDiningSpace'] = true;
  }

  if (params.hasLivingRoom === 'true') {
    filter['adminFlags.hasLivingRoom'] = true;
  }

  // ─── Features Filter ──────────────────────────────────────────────
  // User can search by specific features (parking, gym, pool, etc.)
  if (params.features) {
    const featureIds = Array.isArray(params.features) 
      ? params.features 
      : params.features.split(',');
    
    filter.$and = featureIds.map(featureId => ({
      $or: [
        { primaryFeatures: featureId },
        { amenities: featureId },
        { otherFeatures: featureId },
      ],
    }));
  }

  // ─── Parking Filter ───────────────────────────────────────────────
  if (params.hasParking === 'true') {
    filter['pricing.parkingPrice'] = { $exists: true, $ne: null, $gt: 0 };
  }

  // ─── Service Charge Filter ────────────────────────────────────────
  if (params.maxServiceCharge) {
    filter['pricing.serviceCharge'] = { $lte: Number(params.maxServiceCharge) };
  }

  // ─── View Count Filter (Popular properties) ───────────────────────
  if (params.minViews) {
    filter.viewCount = { $gte: Number(params.minViews) };
  }

  // ─── Date Range Filter ────────────────────────────────────────────
  if (params.listedAfter || params.listedBefore) {
    filter.createdAt = {};
    if (params.listedAfter) filter.createdAt.$gte = new Date(params.listedAfter);
    if (params.listedBefore) filter.createdAt.$lte = new Date(params.listedBefore);
  }

  // ─── Full-Text Search ─────────────────────────────────────────────
  if (params.search) {
    const searchRegex = { $regex: params.search, $options: 'i' };
    
    // If filter already has $or (from price), combine with $and
    if (filter.$or) {
      const existingOr = filter.$or;
      delete filter.$or;
      filter.$and = [
        { $or: existingOr },
        {
          $or: [
            { title: searchRegex },
            { description: searchRegex },
            { address: searchRegex },
            { propertyId: searchRegex },
            { propertyName: searchRegex },
          ],
        },
      ];
    } else {
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
        { propertyId: searchRegex },
        { propertyName: searchRegex },
      ];
    }
  }

  // ─── Expiry Filter (exclude expired) ──────────────────────────────
  if (params.excludeExpired !== 'false') {
    filter.$or = filter.$or || [];
    filter.$or.push(
      { expiryDate: null },
      { expiryDate: { $gt: new Date() } }
    );
  }

  return filter;
};

/**
 * Build sort options
 */
exports.buildSortOptions = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const sortOptions = {};
  
  const allowedSort = [
    'createdAt',
    'pricing.totalPrice',
    'pricing.rentPerMonth',
    'pricing.pricePerSft',
    'areaSize',
    'viewCount',
    'bedrooms',
    'bathrooms',
  ];

  const field = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
  sortOptions[field] = sortOrder === 'asc' ? 1 : -1;

  // Secondary sort by createdAt for consistency
  if (field !== 'createdAt') {
    sortOptions.createdAt = -1;
  }

  return sortOptions;
};

/**
 * Get search suggestions based on partial input
 */
exports.getSearchSuggestions = async (query, limit = 10) => {
  if (!query || query.length < 2) return [];

  const searchRegex = { $regex: query, $options: 'i' };

  const suggestions = await Property.find({
    status: 'approved',
    source: 'marketplace',
    $or: [
      { title: searchRegex },
      { address: searchRegex },
      { propertyId: searchRegex },
    ],
  })
    .select('title propertyId address slug featuredImage')
    .limit(limit)
    .lean();

  return suggestions;
};

/**
 * Get filter options with counts (for faceted search)
 */
exports.getFilterCounts = async (baseFilter = {}) => {
  const filter = { ...baseFilter, status: 'approved', source: 'marketplace' };

  const [
    typeCounts,
    locationCounts,
    purposeCounts,
    bedroomCounts,
    bathroomCounts,
  ] = await Promise.all([
    // Property types with counts
    Property.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $lookup: { from: 'propertytypes', localField: '_id', foreignField: '_id', as: 'type' } },
      { $unwind: '$type' },
      { $project: { _id: 1, name: '$type.name', count: 1 } },
      { $sort: { count: -1 } },
    ]),

    // Locations with counts
    Property.aggregate([
      { $match: filter },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $lookup: { from: 'locations', localField: '_id', foreignField: '_id', as: 'location' } },
      { $unwind: '$location' },
      { $project: { _id: 1, name: '$location.name', city: '$location.city', count: 1 } },
      { $sort: { count: -1 } },
    ]),

    // Purposes with counts
    Property.aggregate([
      { $match: filter },
      { $group: { _id: '$purpose', count: { $sum: 1 } } },
      { $lookup: { from: 'purposes', localField: '_id', foreignField: '_id', as: 'purpose' } },
      { $unwind: '$purpose' },
      { $project: { _id: 1, name: '$purpose.name', count: 1 } },
      { $sort: { count: -1 } },
    ]),

    // Bedroom counts
    Property.aggregate([
      { $match: filter },
      { $group: { _id: '$bedrooms', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),

    // Bathroom counts
    Property.aggregate([
      { $match: filter },
      { $group: { _id: '$bathrooms', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    types: typeCounts,
    locations: locationCounts,
    purposes: purposeCounts,
    bedrooms: bedroomCounts,
    bathrooms: bathroomCounts,
  };
};

/**
 * Get price range statistics
 */
exports.getPriceStats = async (filter = {}) => {
  const baseFilter = { ...filter, status: 'approved', source: 'marketplace' };

  const stats = await Property.aggregate([
    { $match: baseFilter },
    {
      $group: {
        _id: null,
        minTotalPrice: { $min: '$pricing.totalPrice' },
        maxTotalPrice: { $max: '$pricing.totalPrice' },
        avgTotalPrice: { $avg: '$pricing.totalPrice' },
        minRentPrice: { $min: '$pricing.rentPerMonth' },
        maxRentPrice: { $max: '$pricing.rentPerMonth' },
        avgRentPrice: { $avg: '$pricing.rentPerMonth' },
        minArea: { $min: '$areaSize' },
        maxArea: { $max: '$areaSize' },
        avgArea: { $avg: '$areaSize' },
      },
    },
  ]);

  return stats[0] || {};
};

/**
 * Save search for user (for alerts)
 */
exports.saveSearch = async (userId, searchParams, name) => {
  const SavedSearch = require('../models/SavedSearch');
  
  return await SavedSearch.create({
    userId,
    name,
    filters: searchParams,
    alertEnabled: true,
  });
};

/**
 * Get saved searches for user
 */
exports.getSavedSearches = async (userId) => {
  const SavedSearch = require('../models/SavedSearch');
  return await SavedSearch.find({ userId }).sort({ createdAt: -1 });
};
