/**
 * Referral Counter Reconciliation Job
 * Syncs the denormalized totalClicks counter on each Referral document
 * against the real count in ReferralClick collection.
 * Runs in batches to avoid memory pressure. Idempotent.
 */
const { Referral, ReferralClick } = require('../models/Referral');

const BATCH_SIZE = 100;

const run = async () => {
  let fixed = 0;
  let skip  = 0;

  while (true) {
    const referrals = await Referral.find({}, 'refCode totalClicks')
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean();

    if (referrals.length === 0) break;

    for (const ref of referrals) {
      const realCount = await ReferralClick.countDocuments({ refCode: ref.refCode });
      if (realCount !== ref.totalClicks) {
        await Referral.findOneAndUpdate({ refCode: ref.refCode }, { totalClicks: realCount });
        fixed++;
      }
    }

    skip += BATCH_SIZE;
    if (referrals.length < BATCH_SIZE) break;
  }

  return fixed;
};

module.exports = { run };
