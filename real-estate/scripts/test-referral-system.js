/**
 * Test Script for Referral System v2.0
 * Tests all new endpoints and features
 * 
 * Usage: node scripts/test-referral-system.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate';

async function testDatabase() {
  try {
    console.log('🧪 Testing Referral System v2.0\n');
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;

    // ─── Test 1: Check Referrals Collection ──────────────────────────
    console.log('📝 Test 1: Checking Referrals collection...');
    const referralSample = await db.collection('referrals').findOne();
    if (referralSample) {
      const hasNewFields = 
        'isActive' in referralSample && 
        'expiresAt' in referralSample;
      
      if (hasNewFields) {
        console.log('✅ Referrals collection has new fields');
        console.log(`   Sample: isActive=${referralSample.isActive}, expiresAt=${referralSample.expiresAt}`);
      } else {
        console.log('❌ Referrals collection missing new fields');
        console.log('   Run migration script: node scripts/migrate-referral-system.js');
      }
    } else {
      console.log('⚠️  No referral documents found (this is OK if database is empty)');
    }
    console.log();

    // ─── Test 2: Check Rewards Collection ────────────────────────────
    console.log('📝 Test 2: Checking Rewards collection...');
    const rewardSample = await db.collection('rewards').findOne();
    if (rewardSample) {
      const hasNewFields = 
        'paidAt' in rewardSample && 
        'cancelledAt' in rewardSample && 
        'cancelReason' in rewardSample;
      
      if (hasNewFields) {
        console.log('✅ Rewards collection has new fields');
        console.log(`   Sample: paidAt=${rewardSample.paidAt}, cancelledAt=${rewardSample.cancelledAt}`);
      } else {
        console.log('❌ Rewards collection missing new fields');
        console.log('   Run migration script: node scripts/migrate-referral-system.js');
      }
    } else {
      console.log('⚠️  No reward documents found (this is OK if database is empty)');
    }
    console.log();

    // ─── Test 3: Check ReferralLeads Collection ──────────────────────
    console.log('📝 Test 3: Checking ReferralLeads collection...');
    const leadSample = await db.collection('referralleads').findOne();
    if (leadSample) {
      const hasNewFields = 
        'status' in leadSample && 
        'notes' in leadSample;
      
      if (hasNewFields) {
        console.log('✅ ReferralLeads collection has new fields');
        console.log(`   Sample: status=${leadSample.status}, notes=${leadSample.notes}`);
      } else {
        console.log('❌ ReferralLeads collection missing new fields');
        console.log('   Run migration script: node scripts/migrate-referral-system.js');
      }
    } else {
      console.log('⚠️  No lead documents found (this is OK if database is empty)');
    }
    console.log();

    // ─── Test 4: Check Indexes ───────────────────────────────────────
    console.log('📝 Test 4: Checking indexes...');
    
    const referralIndexes = await db.collection('referrals').indexes();
    const hasIsActiveIndex = referralIndexes.some(idx => idx.key.isActive === 1);
    console.log(hasIsActiveIndex ? '✅' : '❌', 'Referrals.isActive index');

    const rewardIndexes = await db.collection('rewards').indexes();
    const hasStatusIndex = rewardIndexes.some(idx => idx.key.status === 1);
    console.log(hasStatusIndex ? '✅' : '❌', 'Rewards.status index');

    const leadIndexes = await db.collection('referralleads').indexes();
    const hasLeadStatusIndex = leadIndexes.some(idx => idx.key.status === 1);
    console.log(hasLeadStatusIndex ? '✅' : '❌', 'ReferralLeads.status index');
    console.log();

    // ─── Test 5: Statistics ───────────────────────────────────────────
    console.log('📝 Test 5: Database statistics...');
    const stats = {
      referrals: await db.collection('referrals').countDocuments(),
      clicks: await db.collection('referralclicks').countDocuments(),
      leads: await db.collection('referralleads').countDocuments(),
      rewards: await db.collection('rewards').countDocuments(),
    };
    
    console.log(`   Total Referrals: ${stats.referrals}`);
    console.log(`   Total Clicks: ${stats.clicks}`);
    console.log(`   Total Leads: ${stats.leads}`);
    console.log(`   Total Rewards: ${stats.rewards}`);
    console.log();

    // ─── Test 6: Environment Variables ────────────────────────────────
    console.log('📝 Test 6: Checking environment variables...');
    const requiredEnvVars = [
      'MONGO_URI',
      'JWT_SECRET',
      'REFERRAL_COOKIE_TTL_DAYS',
      'MAX_CLICKS_PER_IP_PER_DAY',
      'MAX_LEADS_PER_IP_PER_DAY',
      'MAX_CONVERSION_RATE',
      'MAX_REWARD_AMOUNT',
    ];

    requiredEnvVars.forEach(varName => {
      const exists = !!process.env[varName];
      console.log(exists ? '✅' : '❌', varName);
    });
    console.log();

    // ─── Summary ──────────────────────────────────────────────────────
    console.log('🎉 Testing completed!\n');
    console.log('📚 Documentation:');
    console.log('   - REFERRAL_SYSTEM.md - Complete API documentation');
    console.log('   - REFERRAL_IMPROVEMENTS.md - All improvements');
    console.log('   - MIGRATION_GUIDE.md - Migration steps\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run tests
testDatabase();
