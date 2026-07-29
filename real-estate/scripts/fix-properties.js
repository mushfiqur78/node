/**
 * Fix Properties Script
 * Adds missing featuredImage to properties that don't have one
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

const fixProperties = async () => {
  try {
    await connectDB();

    // Find properties without featuredImage
    const properties = await Property.find();
    
    let fixed = 0;
    for (const prop of properties) {
      let needsUpdate = false;
      const updates = {};

      // Fix missing featuredImage
      if (!prop.featuredImage || !prop.featuredImage.url) {
        // Use first gallery image if available
        if (prop.gallery && prop.gallery.length > 0) {
          // Check if gallery item has url property
          const firstGalleryItem = prop.gallery[0];
          if (firstGalleryItem && typeof firstGalleryItem === 'object' && firstGalleryItem.url) {
            updates.featuredImage = {
              url: firstGalleryItem.url,
              alt: prop.title,
              title: prop.title
            };
            needsUpdate = true;
            console.log(`✓ Fixed featuredImage for: ${prop.title}`);
            console.log(`  Using gallery image: ${firstGalleryItem.url}`);
          } else if (typeof firstGalleryItem === 'object' && '0' in firstGalleryItem) {
            // Malformed gallery - try to reconstruct
            const chars = Object.values(firstGalleryItem);
            const url = chars.join('');
            if (url.startsWith('/uploads/')) {
              updates.featuredImage = {
                url: url,
                alt: prop.title,
                title: prop.title
              };
              needsUpdate = true;
              console.log(`✓ Fixed featuredImage for: ${prop.title}`);
              console.log(`  Reconstructed from malformed gallery: ${url}`);
            }
          }
        }
        
        if (!needsUpdate) {
          console.log(`⚠️  Cannot fix featuredImage for: ${prop.title} (no gallery images available)`);
        }
      }

      // Fix gallery if it's malformed (array of characters instead of objects)
      if (prop.gallery && prop.gallery.length > 0) {
        const firstItem = prop.gallery[0];
        // Check if gallery is malformed (has numeric keys like "0", "1", etc.)
        if (typeof firstItem === 'object' && firstItem !== null && '0' in firstItem) {
          console.log(`⚠️  Malformed gallery detected for: ${prop.title}`);
          // Try to reconstruct the URL from the character array
          const reconstructedUrls = [];
          for (const item of prop.gallery) {
            if (typeof item === 'object' && '0' in item) {
              const chars = Object.values(item);
              const url = chars.join('');
              if (url.startsWith('/uploads/')) {
                reconstructedUrls.push({ url, alt: '', title: '' });
              }
            }
          }
          if (reconstructedUrls.length > 0) {
            updates.gallery = reconstructedUrls;
            needsUpdate = true;
            console.log(`✓ Fixed gallery for: ${prop.title} (${reconstructedUrls.length} images)`);
          }
        }
      }

      if (needsUpdate) {
        await Property.findByIdAndUpdate(prop._id, updates);
        fixed++;
      }
    }

    console.log(`\n✓ Fixed ${fixed} properties`);
    console.log(`Total properties: ${properties.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixProperties();
