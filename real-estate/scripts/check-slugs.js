const mongoose = require('mongoose');
const Property = require('../src/models/Property');

async function checkSlugs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate');
    console.log('Connected to database');

    const props = await Property.find({ status: 'approved' })
      .select('_id slug title source')
      .limit(10);

    console.log('\n=== Sample Properties ===\n');
    props.forEach(p => {
      console.log(`ID: ${p._id}`);
      console.log(`Slug: ${p.slug || 'NO SLUG'}`);
      console.log(`Source: ${p.source}`);
      console.log(`Title: ${p.title.substring(0, 50)}`);
      console.log('---');
    });

    const noSlugCount = await Property.countDocuments({ status: 'approved', $or: [{ slug: null }, { slug: '' }] });
    console.log(`\nProperties without slugs: ${noSlugCount}`);

    const marketplaceCount = await Property.countDocuments({ status: 'approved', source: 'marketplace' });
    const adminCount = await Property.countDocuments({ status: 'approved', source: 'admin' });
    console.log(`Marketplace properties: ${marketplaceCount}`);
    console.log(`Admin properties: ${adminCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkSlugs();
