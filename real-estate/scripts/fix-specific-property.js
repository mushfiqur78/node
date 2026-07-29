/**
 * Fix Specific Property
 * Fixes the property with ID 69de821ab1957ecbfff2ec56
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

const fixProperty = async () => {
  try {
    await connectDB();

    const propertyId = '69de821ab1957ecbfff2ec56';
    const property = await Property.findById(propertyId);

    if (!property) {
      console.log('❌ Property not found');
      process.exit(1);
    }

    console.log(`Property: ${property.title}`);
    console.log(`Current featuredImage: ${property.featuredImage?.url || 'MISSING'}`);
    console.log(`SEO ogImage: ${property.seo?.ogImage || 'N/A'}`);

    // Use ogImage as featuredImage
    if (property.seo?.ogImage && (!property.featuredImage || !property.featuredImage.url)) {
      const updates = {
        featuredImage: {
          url: property.seo.ogImage,
          alt: property.title,
          title: property.title
        }
      };

      // Fix malformed gallery
      if (property.gallery && property.gallery.length > 0) {
        const fixedGallery = [];
        for (const item of property.gallery) {
          if (typeof item === 'object' && '0' in item) {
            const chars = Object.values(item);
            const url = chars.join('');
            if (url.startsWith('/uploads/')) {
              fixedGallery.push({ url, alt: '', title: '' });
            }
          } else if (item && item.url) {
            fixedGallery.push(item);
          }
        }
        if (fixedGallery.length > 0) {
          updates.gallery = fixedGallery;
        }
      }

      await Property.findByIdAndUpdate(propertyId, updates);
      console.log('\n✓ Property fixed successfully!');
      console.log(`New featuredImage: ${updates.featuredImage.url}`);
      if (updates.gallery) {
        console.log(`Fixed gallery: ${updates.gallery.length} images`);
      }
    } else {
      console.log('\n⚠️  Cannot fix - no valid image source found');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixProperty();
