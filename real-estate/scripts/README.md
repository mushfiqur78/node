# 🔧 Referral System Scripts

এই folder এ referral system এর জন্য utility scripts আছে।

---

## 📜 Available Scripts

### 1. **migrate-referral-system.js**
Database migration script যা existing data তে নতুন fields যোগ করে।

**কখন চালাবেন:**
- প্রথমবার referral system v2.0 setup করার সময়
- Database এ নতুন fields যোগ করার জন্য

**কিভাবে চালাবেন:**
```bash
# Method 1: npm script দিয়ে
npm run migrate:referral

# Method 2: সরাসরি node দিয়ে
node scripts/migrate-referral-system.js
```

**কি করে:**
- ✅ Referrals collection এ `isActive` এবং `expiresAt` যোগ করে
- ✅ Rewards collection এ `paidAt`, `cancelledAt`, `cancelReason` যোগ করে
- ✅ ReferralLeads collection এ `status` এবং `notes` যোগ করে
- ✅ প্রয়োজনীয় indexes তৈরি করে

**Output:**
```
🔄 Connecting to MongoDB...
✅ Connected to MongoDB

📝 Updating Referrals collection...
✅ Updated 5 referral documents
   - Added: isActive (default: true)
   - Added: expiresAt (default: null)

📝 Updating Rewards collection...
✅ Updated 3 reward documents
   - Added: paidAt (default: null)
   - Added: cancelledAt (default: null)
   - Added: cancelReason (default: null)

📝 Updating ReferralLeads collection...
✅ Updated 10 referral lead documents
   - Added: status (default: 'pending')
   - Added: notes (default: null)

📝 Creating indexes...
✅ Created index: referrals.isActive
✅ Created index: rewards.status
✅ Created index: referralleads.status
✅ Created index: referralclicks.refCode + ip

🎉 Migration completed successfully!

📊 Summary:
   - Referrals updated: 5
   - Rewards updated: 3
   - Leads updated: 10
   - Indexes created: 4+

✅ Next steps:
   1. Restart your server: npm run dev
   2. Test the new endpoints
   3. Check REFERRAL_SYSTEM.md for API documentation

🔌 Disconnected from MongoDB
```

---

### 2. **test-referral-system.js**
Database এবং configuration test করার script।

**কখন চালাবেন:**
- Migration এর পরে verify করার জন্য
- নতুন fields properly যোগ হয়েছে কিনা check করার জন্য
- Environment variables সঠিক আছে কিনা verify করার জন্য

**কিভাবে চালাবেন:**
```bash
# Method 1: npm script দিয়ে
npm run test:referral

# Method 2: সরাসরি node দিয়ে
node scripts/test-referral-system.js
```

**কি করে:**
- ✅ Database collections এ নতুন fields আছে কিনা check করে
- ✅ Indexes properly তৈরি হয়েছে কিনা verify করে
- ✅ Database statistics দেখায়
- ✅ Environment variables check করে

**Output:**
```
🧪 Testing Referral System v2.0

🔄 Connecting to MongoDB...
✅ Connected to MongoDB

📝 Test 1: Checking Referrals collection...
✅ Referrals collection has new fields
   Sample: isActive=true, expiresAt=null

📝 Test 2: Checking Rewards collection...
✅ Rewards collection has new fields
   Sample: paidAt=null, cancelledAt=null

📝 Test 3: Checking ReferralLeads collection...
✅ ReferralLeads collection has new fields
   Sample: status=pending, notes=null

📝 Test 4: Checking indexes...
✅ Referrals.isActive index
✅ Rewards.status index
✅ ReferralLeads.status index

📝 Test 5: Database statistics...
   Total Referrals: 5
   Total Clicks: 120
   Total Leads: 10
   Total Rewards: 3

📝 Test 6: Checking environment variables...
✅ MONGO_URI
✅ JWT_SECRET
✅ REFERRAL_COOKIE_TTL_DAYS
✅ MAX_CLICKS_PER_IP_PER_DAY
✅ MAX_LEADS_PER_IP_PER_DAY
✅ MAX_CONVERSION_RATE
✅ MAX_REWARD_AMOUNT

🎉 Testing completed!

📚 Documentation:
   - REFERRAL_SYSTEM.md - Complete API documentation
   - REFERRAL_IMPROVEMENTS.md - All improvements
   - MIGRATION_GUIDE.md - Migration steps

🔌 Disconnected from MongoDB
```

---

## 🚀 Quick Start Guide

### Step 1: Migration চালান
```bash
npm run migrate:referral
```

### Step 2: Test করুন
```bash
npm run test:referral
```

### Step 3: Server restart করুন
```bash
npm run dev
```

---

## ⚠️ Important Notes

1. **Backup First**: Migration চালানোর আগে database backup নিন
2. **Environment Variables**: `.env` file এ সব variables আছে কিনা check করুন
3. **MongoDB Running**: MongoDB server চালু আছে কিনা verify করুন
4. **Safe to Re-run**: Migration script multiple times চালানো safe (idempotent)

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MongoDB"
**Solution:**
- MongoDB server চালু আছে কিনা check করুন
- `.env` file এ `MONGO_URI` সঠিক আছে কিনা verify করুন

### Error: "Collection not found"
**Solution:**
- এটা normal যদি database empty থাকে
- Server একবার চালান, তাহলে collections automatically তৈরি হবে

### Warning: "No documents found"
**Solution:**
- এটা OK যদি আপনার database এ এখনো data না থাকে
- Migration script শুধু existing documents update করে

---

## 📞 Support

সমস্যা হলে:
1. Error message carefully পড়ুন
2. MongoDB logs check করুন
3. `.env` file verify করুন
4. `MIGRATION_GUIDE.md` দেখুন

---

**Created:** April 18, 2026
**Version:** 2.0.0
