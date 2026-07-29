/**
 * Check Missing Images Script
 * Finds properties without featuredImage
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../src/models/Property');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected\n');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkMissingImages = async () => {
  try {
    await connectDB();

    const properties = await Property.find()
      .select('title featuredImage gallery');

    console.log(`Total properties: ${properties.length}\n`);

    let missingFeatured = 0;
    let missingGallery = 0;

    properties.forEach((prop, index) => {
      const hasFeaturedImage = prop.featuredImage && prop.featuredImage.url;
      const hasGallery = prop.gallery && prop.gallery.length > 0;

      if (!hasFeaturedImage) {
        console.log(`❌ Missing featuredImage: ${prop.title}`);
        missingFeatured++;
      }

      if (!hasGallery) {
        console.log(`⚠️  No gallery images: ${prop.title}`);
        missingGallery++;
      }

      if (hasFeaturedImage) {
        console.log(`✓ ${prop.title}`);
        console.log(`  Featured: ${prop.featuredImage.url}`);
        console.log(`  Gallery: ${prop.gallery?.length || 0} images`);
      }
      console.log('');
    });

    console.log('Summary:');
    console.log(`- Properties with featuredImage: ${properties.length - missingFeatured}`);
    console.log(`- Properties without featuredImage: ${missingFeatured}`);
    console.log(`- Properties with gallery: ${properties.length - missingGallery}`);
    console.log(`- Properties without gallery: ${missingGallery}`);

    if (missingFeatured > 0) {
      console.log('\n⚠️  Some properties are missing featuredImage!');
      console.log('Run: node scripts/fix-properties.js to fix them.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkMissingImages();
