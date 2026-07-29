/**
 * Saved Search Alerts Job
 * Sends email alerts to users when new properties match their saved searches
 */

const SavedSearch = require('../models/SavedSearch');
const Property = require('../models/Property');
const { buildSearchFilter } = require('../services/advancedSearchService');
const { sendSavedSearchAlert } = require('../services/emailService');

/**
 * Process saved search alerts
 * Runs based on alert frequency (instant, daily, weekly)
 */
exports.processSavedSearchAlerts = async (frequency = 'daily') => {
  try {
    console.log(`[SavedSearchAlerts] Processing ${frequency} alerts...`);

    // Get all saved searches with alerts enabled for this frequency
    const savedSearches = await SavedSearch.find({
      alertEnabled: true,
      alertFrequency: frequency,
    }).populate('userId', 'name email');

    if (savedSearches.length === 0) {
      console.log(`[SavedSearchAlerts] No ${frequency} alerts to process`);
      return;
    }

    let alertsSent = 0;
    let errors = 0;

    for (const savedSearch of savedSearches) {
      try {
        // Build filter from saved search
        const filter = buildSearchFilter(savedSearch.filters);

        // Get date threshold based on frequency
        let dateThreshold;
        if (frequency === 'instant') {
          dateThreshold = new Date(Date.now() - 60 * 60 * 1000); // Last 1 hour
        } else if (frequency === 'daily') {
          dateThreshold = savedSearch.lastAlertSent || new Date(Date.now() - 24 * 60 * 60 * 1000);
        } else if (frequency === 'weekly') {
          dateThreshold = savedSearch.lastAlertSent || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }

        // Find new properties since last alert
        filter.createdAt = { $gte: dateThreshold };

        const newProperties = await Property.find(filter)
          .populate('type', 'name')
          .populate('location', 'name city')
          .populate('purpose', 'name')
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();

        if (newProperties.length > 0) {
          // Send email alert
          await sendSavedSearchAlert({
            user: savedSearch.userId,
            searchName: savedSearch.name,
            properties: newProperties,
            totalMatches: newProperties.length,
          });

          // Update last alert sent and match count
          savedSearch.lastAlertSent = new Date();
          savedSearch.matchCount = await Property.countDocuments(buildSearchFilter(savedSearch.filters));
          await savedSearch.save();

          alertsSent++;
          console.log(`[SavedSearchAlerts] Alert sent to ${savedSearch.userId.email} (${newProperties.length} new properties)`);
        }
      } catch (err) {
        errors++;
        console.error(`[SavedSearchAlerts] Error processing search ${savedSearch._id}:`, err.message);
      }
    }

    console.log(`[SavedSearchAlerts] ${frequency} alerts completed: ${alertsSent} sent, ${errors} errors`);
  } catch (err) {
    console.error('[SavedSearchAlerts] Job failed:', err.message);
  }
};

/**
 * Process instant alerts (runs every hour)
 */
exports.processInstantAlerts = () => {
  return exports.processSavedSearchAlerts('instant');
};

/**
 * Process daily alerts (runs once per day)
 */
exports.processDailyAlerts = () => {
  return exports.processSavedSearchAlerts('daily');
};

/**
 * Process weekly alerts (runs once per week)
 */
exports.processWeeklyAlerts = () => {
  return exports.processSavedSearchAlerts('weekly');
};
