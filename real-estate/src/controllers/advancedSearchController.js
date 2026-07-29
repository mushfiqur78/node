/**
 * Advanced Search Controller
 * Handles complex property searches with multiple filters
 */

const Property = require('../models/Property');
const SavedSearch = require('../models/SavedSearch');
const {
  buildSearchFilter,
  buildSortOptions,
  getSearchSuggestions,
  getFilterCounts,
  getPriceStats,
} = require('../services/advancedSearchService');
const { parsePagination, buildMeta } = require('../utils/pagination');

// ─── POST /api/v1/properties/search ──────────────────────────────
exports.advancedSearch = async (req, res, next) => {
  try {
    const params = req.body; // Use POST for complex filters
    const { page, limit, skip, sort } = parsePagination(req.query);

    // Build filter from search parameters
    const filter = buildSearchFilter(params);

    // Build sort options
    const sortOptions = buildSortOptions(params.sortBy, params.sortOrder);

    // Execute search
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('type', 'name')
        .populate('location', 'name city')
        .populate('label', 'name color')
        .populate('purpose', 'name')
        .populate('primaryFeatures', 'name icon')
        .populate('amenities', 'name icon')
        .populate('owner', 'name email phone avatar')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Property.countDocuments(filter),
    ]);

    res.json({
      success: true,
      message: 'Search completed',
      data: {
        properties,
        pagination: buildMeta(total, page, limit),
        appliedFilters: params,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/properties/search/suggestions ───────────────────
exports.getSearchSuggestions = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: { suggestions: [] },
      });
    }

    const suggestions = await getSearchSuggestions(q, Number(limit));

    res.json({
      success: true,
      data: { suggestions },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/properties/search/filters ───────────────────────
exports.getAvailableFilters = async (req, res, next) => {
  try {
    // Get base filter from query (e.g., if user already selected a location)
    const baseFilter = buildSearchFilter(req.query);

    // Get counts for each filter option
    const filterCounts = await getFilterCounts(baseFilter);

    // Get price statistics
    const priceStats = await getPriceStats(baseFilter);

    res.json({
      success: true,
      message: 'Filter options fetched',
      data: {
        filters: filterCounts,
        priceStats,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/v1/properties/search/save ─────────────────────────
exports.saveSearch = async (req, res, next) => {
  try {
    const { name, filters, alertEnabled = true, alertFrequency = 'daily' } = req.body;

    if (!name || !filters) {
      return res.status(400).json({
        success: false,
        message: 'Name and filters are required',
      });
    }

    // Check if user already has a saved search with this name
    const existing = await SavedSearch.findOne({
      userId: req.user._id,
      name,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A saved search with this name already exists',
      });
    }

    // Get current match count
    const searchFilter = buildSearchFilter(filters);
    const matchCount = await Property.countDocuments(searchFilter);

    const savedSearch = await SavedSearch.create({
      userId: req.user._id,
      name,
      filters,
      alertEnabled,
      alertFrequency,
      matchCount,
    });

    res.status(201).json({
      success: true,
      message: 'Search saved successfully',
      data: { savedSearch },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/properties/search/saved ─────────────────────────
exports.getSavedSearches = async (req, res, next) => {
  try {
    const savedSearches = await SavedSearch.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    // Update match counts
    const updatedSearches = await Promise.all(
      savedSearches.map(async (search) => {
        const filter = buildSearchFilter(search.filters);
        const currentCount = await Property.countDocuments(filter);
        const hasNewMatches = currentCount > search.matchCount;

        return {
          ...search,
          currentMatchCount: currentCount,
          hasNewMatches,
        };
      })
    );

    res.json({
      success: true,
      data: { savedSearches: updatedSearches },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/properties/search/saved/:id ─────────────────────
exports.getSavedSearchById = async (req, res, next) => {
  try {
    const savedSearch = await SavedSearch.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'Saved search not found',
      });
    }

    // Get current matches
    const filter = buildSearchFilter(savedSearch.filters);
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('type', 'name')
        .populate('location', 'name city')
        .populate('purpose', 'name')
        .limit(20)
        .sort({ createdAt: -1 })
        .lean(),
      Property.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        savedSearch,
        properties,
        total,
        hasNewMatches: total > savedSearch.matchCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/v1/properties/search/saved/:id ───────────────────
exports.updateSavedSearch = async (req, res, next) => {
  try {
    const { name, filters, alertEnabled, alertFrequency } = req.body;

    const savedSearch = await SavedSearch.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'Saved search not found',
      });
    }

    if (name) savedSearch.name = name;
    if (filters) savedSearch.filters = filters;
    if (alertEnabled !== undefined) savedSearch.alertEnabled = alertEnabled;
    if (alertFrequency) savedSearch.alertFrequency = alertFrequency;

    // Update match count if filters changed
    if (filters) {
      const searchFilter = buildSearchFilter(filters);
      savedSearch.matchCount = await Property.countDocuments(searchFilter);
    }

    await savedSearch.save();

    res.json({
      success: true,
      message: 'Saved search updated',
      data: { savedSearch },
    });
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/v1/properties/search/saved/:id ──────────────────
exports.deleteSavedSearch = async (req, res, next) => {
  try {
    const savedSearch = await SavedSearch.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!savedSearch) {
      return res.status(404).json({
        success: false,
        message: 'Saved search not found',
      });
    }

    res.json({
      success: true,
      message: 'Saved search deleted',
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/v1/properties/search/popular ───────────────────────
exports.getPopularSearches = async (req, res, next) => {
  try {
    // Get most common search filters from saved searches
    const popularFilters = await SavedSearch.aggregate([
      {
        $group: {
          _id: {
            type: '$filters.type',
            location: '$filters.location',
            purpose: '$filters.purpose',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get most viewed properties (trending)
    const trending = await Property.find({
      status: 'approved',
      source: 'marketplace',
    })
      .populate('type', 'name')
      .populate('location', 'name city')
      .populate('purpose', 'name')
      .sort({ viewCount: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        popularFilters,
        trending,
      },
    });
  } catch (err) {
    next(err);
  }
};
