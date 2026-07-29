const mongoose = require('mongoose');
const slugify  = require('slugify');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate');
  const Location = require('../src/models/Location');

  const locations = await Location.find({ $or: [{ slug: null }, { slug: { $exists: false } }] });
  console.log(`Found ${locations.length} locations without slugs`);

  for (const loc of locations) {
    const base   = slugify(loc.name, { lower: true, strict: true });
    const exists = await Location.findOne({ slug: base, _id: { $ne: loc._id } });
    const slug   = exists ? `${base}-${Date.now()}` : base;
    await Location.updateOne({ _id: loc._id }, { $set: { slug } });
    console.log(`✓ ${loc.name} → ${slug}`);
  }

  console.log('\nDone!');
  process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
