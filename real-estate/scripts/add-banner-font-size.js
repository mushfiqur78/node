const mongoose = require('mongoose');
const Banner = require('../src/models/Banner');

/**
 * Migration Script: Add titleFontSize to existing banners
 * Sets default font size to '3xl' for all existing banners
 */

async function addBannerFontSize() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate');
    console.log('Connected to database');

    // Find all banners without titleFontSize
    const banners = await Banner.find({
      $or: [
        { titleFontSize: { $exists: false } },
        { titleFontSize: null },
        { titleFontSize: '' }
      ]
    });

    console.log(`\nFound ${banners.length} banners without titleFontSize\n`);

    if (banners.length === 0) {
      console.log('All banners already have titleFontSize field!');
      process.exit(0);
    }

    // Update each banner with default font size
    for (const banner of banners) {
      await Banner.updateOne(
        { _id: banner._id },
        { $set: { titleFontSize: '3xl' } }
      );

      console.log(`✓ Updated: ${banner.title || 'Untitled Banner'}`);
      console.log(`  Font Size: 3xl (default)\n`);
    }

    console.log('All banners updated successfully!');
    console.log('\nAvailable font sizes:');
    console.log('- sm, base, lg, xl, 2xl, 3xl (default), 4xl, 5xl, 6xl, 7xl, 8xl, 9xl');
    console.log('\nYou can now update font sizes from the admin panel.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addBannerFontSize();
