const mongoose = require('mongoose');
const Banner = require('../src/models/Banner');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate');
  const result = await Banner.updateMany(
    { overlayOpacity: { $exists: false } },
    { $set: { overlayOpacity: 55 } }
  );
  console.log(`Updated ${result.modifiedCount} banners with default overlayOpacity: 55`);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
