/**
 * Migration Script for Referral System v2.0
 * Run this script to update existing database with new fields
 * 
 * Usage: node scripts/migrate-referral-system.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate';

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // ─── Update Referrals Collection ──────────────────────────────────
    console.log('📝 Updating Referrals collection...');
    const referralResult = await db.collection('referrals').updateMany(
      {},
      {
        $set: {
          isActive: true,
          expiresAt: null
        }
      }
    );
    console.log(`✅ Updated ${referralResult.modifiedCount} referral documents`);
    console.log(`   - Added: isActive (default: true)`);
    console.log(`   - Added: expiresAt (default: null)\n`);

    // ─── Update Rewards Collection ────────────────────────────────────
    console.log('📝 Updating Rewards collection...');
    const rewardResult = await db.collection('rewards').updateMany(
      {},
      {
        $set: {
          paidAt: null,
          cancelledAt: null,
          cancelReason: null
        }
      }
    );
    console.log(`✅ Updated ${rewardResult.modifiedCount} reward documents`);
    console.log(`   - Added: paidAt (default: null)`);
    console.log(`   - Added: cancelledAt (default: null)`);
    console.log(`   - Added: cancelReason (default: null)\n`);

    // ─── Update ReferralLeads Collection ──────────────────────────────
    console.log('📝 Updating ReferralLeads collection...');
    const leadResult = await db.collection('referralleads').updateMany(
      {},
      {
        $set: {
          status: 'pending',
          notes: null
        }
      }
    );
    console.log(`✅ Updated ${leadResult.modifiedCount} referral lead documents`);
    console.log(`   - Added: status (default: 'pending')`);
    console.log(`   - Added: notes (default: null)\n`);

    // ─── Create Indexes ───────────────────────────────────────────────
    console.log('📝 Creating indexes...');
    
    await db.collection('referrals').createIndex({ isActive: 1 });
    console.log('✅ Created index: referrals.isActive');

    await db.collection('rewards').createIndex({ status: 1 });
    console.log('✅ Created index: rewards.status');

    await db.collection('referralleads').createIndex({ status: 1 });
    console.log('✅ Created index: referralleads.status');

    // Check if other indexes exist
    const clickIndexes = await db.collection('referralclicks').indexes();
    const hasRefCodeIpIndex = clickIndexes.some(idx => 
      idx.key.refCode === 1 && idx.key.ip === 1
    );
    
    if (!hasRefCodeIpIndex) {
      await db.collection('referralclicks').createIndex({ refCode: 1, ip: 1 });
      console.log('✅ Created index: referralclicks.refCode + ip');
    }

    console.log('\n🎉 Migration completed successfully!\n');

    // ─── Summary ──────────────────────────────────────────────────────
    console.log('📊 Summary:');
    console.log(`   - Referrals updated: ${referralResult.modifiedCount}`);
    console.log(`   - Rewards updated: ${rewardResult.modifiedCount}`);
    console.log(`   - Leads updated: ${leadResult.modifiedCount}`);
    console.log(`   - Indexes created: 4+\n`);

    console.log('✅ Next steps:');
    console.log('   1. Restart your server: npm run dev');
    console.log('   2. Test the new endpoints');
    console.log('   3. Check REFERRAL_SYSTEM.md for API documentation\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run migration
migrate();
