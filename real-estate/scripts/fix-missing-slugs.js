const mongoose = require('mongoose');
const Property = require('../src/models/Property');
const slugify = require('slugify');

async function fixMissingSlugs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate');
    console.log('Connected to database');

    // Find properties without slugs
    const propertiesWithoutSlugs = await Property.find({
      $or: [{ slug: null }, { slug: '' }, { slug: { $exists: false } }]
    });

    console.log(`\nFound ${propertiesWithoutSlugs.length} properties without slugs\n`);

    for (const property of propertiesWithoutSlugs) {
      // Generate slug from title
      let baseSlug = slugify(property.title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;

      // Check if slug exists, if yes, add counter
      while (await Property.findOne({ slug, _id: { $ne: property._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Update property with new slug using updateOne to bypass validation
      await Property.updateOne(
        { _id: property._id },
        { $set: { slug } }
      );

      console.log(`✓ Fixed: ${property.title.substring(0, 40)}`);
      console.log(`  New slug: ${slug}\n`);
    }

    console.log('All slugs fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fixMissingSlugs();
