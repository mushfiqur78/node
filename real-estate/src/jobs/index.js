/**
 * Background Jobs — registered on server start
 * All jobs are idempotent and safe to run multiple times.
 */
const cron = require('node-cron');

const geoLookupJob         = require('./geoLookup.job');
const expiredCouponsJob    = require('./expiredCoupons.job');
const reconcileCountersJob = require('./reconcileCounters.job');
const savedSearchAlertsJob = require('./savedSearchAlerts.job');

const log = (label, fn) => async () => {
  try {
    const count = await fn();
    if (count > 0) console.log(`[Job:${label}] processed ${count}`);
  } catch (err) {
    console.error(`[Job:${label}] failed:`, err.message);
  }
};

const startJobs = () => {
  // Geo-resolve unresolved referral clicks — every 5 minutes
  cron.schedule('*/5 * * * *', log('geoLookup', geoLookupJob.run));

  // Cancel stale coupon reservations — every 15 minutes
  cron.schedule('*/15 * * * *', log('expiredCoupons', expiredCouponsJob.run));

  // Reconcile totalClicks counters — every 6 hours
  cron.schedule('0 */6 * * *', log('reconcileCounters', reconcileCountersJob.run));

  // ─── Saved Search Alerts ──────────────────────────────────────────
  // Instant alerts — every hour
  cron.schedule('0 * * * *', async () => {
    try {
      await savedSearchAlertsJob.processInstantAlerts();
    } catch (err) {
      console.error('[Job:instantAlerts] failed:', err.message);
    }
  });

  // Daily alerts — every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      await savedSearchAlertsJob.processDailyAlerts();
    } catch (err) {
      console.error('[Job:dailyAlerts] failed:', err.message);
    }
  });

  // Weekly alerts — every Monday at 9 AM
  cron.schedule('0 9 * * 1', async () => {
    try {
      await savedSearchAlertsJob.processWeeklyAlerts();
    } catch (err) {
      console.error('[Job:weeklyAlerts] failed:', err.message);
    }
  });

  console.log('[Jobs] Background jobs registered');
};

module.exports = { startJobs };
