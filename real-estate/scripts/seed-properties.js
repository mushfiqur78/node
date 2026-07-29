/**
 * Seed Properties Script
 * Creates sample properties with images for testing
 * Run: node scripts/seed-properties.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../src/models/Property');
const PropertyType = require('../src/models/PropertyType');
const Location = require('../src/models/Location');
const Purpose = require('../src/models/Purpose');
const User = require('../src/models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedProperties = async () => {
  try {
    await connectDB();

    // Get admin user
    const admin = await User.findOne({ role: 'super_admin' });
    if (!admin) {
      console.error('❌ Admin user not found. Please run the server first to create admin.');
      process.exit(1);
    }

    // Get or create property types
    let residential = await PropertyType.findOne({ name: 'Residential' });
    if (!residential) {
      residential = await PropertyType.create({ name: 'Residential', slug: 'residential' });
    }

    let commercial = await PropertyType.findOne({ name: 'Commercial' });
    if (!commercial) {
      commercial = await PropertyType.create({ name: 'Commercial', slug: 'commercial' });
    }

    // Get or create locations
    const locationNames = ['Gulshan', 'Dhanmondi', 'Bashundhara', 'Uttara', 'Mirpur', 'Banani'];
    const locations = [];
    
    for (const name of locationNames) {
      let location = await Location.findOne({ name });
      if (!location) {
        location = await Location.create({ 
          name, 
          slug: name.toLowerCase(),
          city: 'Dhaka'
        });
      }
      locations.push(location);
    }

    // Get or create purposes
    let sell = await Purpose.findOne({ name: 'Sell' });
    if (!sell) {
      sell = await Purpose.create({ name: 'Sell', slug: 'sell' });
    }

    let rent = await Purpose.findOne({ name: 'Rent' });
    if (!rent) {
      rent = await Purpose.create({ name: 'Rent', slug: 'rent' });
    }

    // Check if properties already exist
    const existingCount = await Property.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  ${existingCount} properties already exist. Skipping seed.`);
      console.log('To re-seed, delete existing properties first.');
      process.exit(0);
    }

    // Sample properties data
    const properties = [
      // Buy Properties
      {
        title: '3 Bedroom Luxury Apartment in Gulshan',
        description: 'Beautiful 3 bedroom apartment with modern amenities, spacious living area, and stunning city views. Located in the heart of Gulshan.',
        type: residential._id,
        location: locations[0]._id, // Gulshan
        purpose: sell._id,
        pricing: {
          totalPrice: 16500000, // 1.65 Crore
          pricePerSft: 8500,
        },
        address: 'Road 45, Gulshan 2, Dhaka',
        areaSize: 1940,
        bedrooms: 3,
        bathrooms: 3,
        balcony: 2,
        floor: '5th Floor',
        featuredImage: {
          url: '/uploads/properties/1776189977780-ty6ihvnfezg.webp',
          alt: 'Luxury apartment in Gulshan',
        },
        gallery: [
          { url: '/uploads/properties/1776189978602-2n5dbnao7uk.webp' },
          { url: '/uploads/properties/1776189978603-6ipknx3jp2o.webp' },
        ],
        contactNumber: '+8801712345678',
        owner: admin._id,
        createdByRole: 'super_admin',
        status: 'approved',
        source: 'admin',
      },
      {
        title: '4 Bedroom Duplex Villa in Bashundhara',
        description: 'Spacious duplex villa with private garden, modern kitchen, and premium finishes. Perfect for families.',
        type: residential._id,
        location: locations[2]._id, // Bashundhara
        purpose: sell._id,
        pricing: {
          totalPrice: 28000000, // 2.8 Crore
          pricePerSft: 9000,
        },
        address: 'Block E, Bashundhara R/A, Dhaka',
        areaSize: 3111,
        bedrooms: 4,
        bathrooms: 4,
        balcony: 3,
        floor: 'Ground + 1st Floor',
        featuredImage: {
          url: '/uploads/properties/1776193184253-1rpgxpuwd65.webp',
          alt: 'Duplex villa in Bashundhara',
        },
        gallery: [
          { url: '/uploads/properties/1776193184341-hgic82ymmh8.webp' },
          { url: '/uploads/properties/1776193184341-sotj1sxrpeq.webp' },
        ],
        contactNumber: '+8801712345678',
        owner: admin._id,
        createdByRole: 'super_admin',
        status: 'approved',
        source: 'admin',
      },
      {
        title: '2 Bedroom Modern Flat in Dhanmondi',
        description: 'Cozy 2 bedroom flat with contemporary design, well-ventilated rooms, and convenient location.',
        type: residential._id,
        location: locations[1]._id, // Dhanmondi
        purpose: sell._id,
        pricing: {
          totalPrice: 12500000, // 1.25 Crore
          pricePerSft: 8000,
        },
        address: 'Road 27, Dhanmondi, Dhaka',
        areaSize: 1562,
        bedrooms: 2,
        bathrooms: 2,
        balcony: 1,
        floor: '3rd Floor',
        featuredImage: {
          url: '/uploads/properties/1776267136647-jyi2o5ihnvb.webp',
          alt: 'Modern flat in Dhanmondi',
        },
        gallery: [
          { url: '/uploads/properties/1776267136991-q5fbj5nsfuc.webp' },
          { url: '/uploads/properties/1776267136991-wj35dkgoe1.webp' },
        ],
        contactNumber: '+8801712345678',
        owner: admin._id,
        createdByRole: 'super_admin',
        status: 'approved',
        source: 'admin',
      },
      // Rent Properties
      {
        title: '3 Bedroom Apartment for Rent in Banani',
        description: 'Well-maintained 3 bedroom apartment available for rent. Includes parking, security, and backup power.',
        type: residential._id,
        location: locations[5]._id, // Banani
        purpose: rent._id,
        pricing: {
          rentPerMonth: 45000,
          serviceCharge: 5000,
        },
        address: 'Road 11, Banani, Dhaka',
        areaSize: 1800,
        bedrooms: 3,
        bathrooms: 3,
        balcony: 2,
        floor: '4th Floor',
        featuredImage: {
          url: '/uploads/properties/1776955949444-97jc65qza4.webp',
          alt: 'Apartment for rent in Banani',
        },
        contactNumber: '+8801712345678',
        owner: admin._id,
        createdByRole: 'super_admin',
        status: 'approved',
        source: 'admin',
      },
      {
        title: '2 Bedroom Flat for Rent in Uttara',
        description: 'Affordable 2 bedroom flat in Uttara. Close to schools, hospitals, and shopping centers.',
        type: residential._id,
        location: locations[3]._id, // Uttara
        purpose: rent._id,
        pricing: {
          rentPerMonth: 28000,
          serviceCharge: 3000,
        },
        address: 'Sector 7, Uttara, Dhaka',
        areaSize: 1200,
        bedrooms: 2,
        bathrooms: 2,
        balcony: 1,
        floor: '6th Floor',
        featuredImage: {
          url: '/uploads/properties/1776189977780-ty6ihvnfezg.webp',
          alt: 'Flat for rent in Uttara',
        },
        contactNumber: '+8801712345678',
        owner: admin._id,
        createdByRole: 'super_admin',
        status: 'approved',
        source: 'admin',
      },
      {
        title: 'Commercial Office Space in Gulshan',
        description: '1154 sqft commercial office space for rent. Ideal for corporate offices, startups, or consultancy firms.',
        type: commercial._id,
        location: locations[0]._id, // Gulshan
        purpose: rent._id,
        pricing: {
          rentPerMonth: 65000,
          serviceCharge: 8000,
        },
        address: 'Gulshan Avenue, Gulshan 1, Dhaka',
        areaSize: 1154,
        bedrooms: 0,
        bathrooms: 1,
        floor: '8th Floor',
        featuredImage: {
          url: '/uploads/properties/1776193184253-1rpgxpuwd65.webp',
          alt: 'Commercial office space in Gulshan',
        },
        contactNumber: '+8801712345678',
        owner: admin._id,
        createdByRole: 'super_admin',
        status: 'approved',
        source: 'admin',
      },
      {
        title: '4 Bedroom Family House in Mirpur',
        description: 'Spacious family house with garden, parking, and modern amenities. Perfect for large families.',
        type: residential._id,
        location: locations[4]._id, // Mirpur
        purpose: rent._id,
        pricing: {
          rentPerMonth: 38000,
          serviceCharge: 4000,
        },
        address: 'Mirpur DOHS, Dhaka',
        areaSize: 2200,
        bedrooms: 4,
        bathrooms: 3,
        balcony: 2,
        floor: 'Ground Floor',
        featuredImage: {
          url: '/uploads/properties/1776267136647-jyi2o5ihnvb.webp',
          alt: 'Family house in Mirpur',
        },
        contactNumber: '+8801712345678',
        owner: admin._id,
        createdByRole: 'super_admin',
        status: 'approved',
        source: 'admin',
      },
    ];

    // Insert properties
    const created = await Property.insertMany(properties);
    console.log(`✓ Successfully created ${created.length} properties`);
    console.log('\nProperty Summary:');
    console.log(`- Buy Properties: ${created.filter(p => p.purpose.toString() === sell._id.toString()).length}`);
    console.log(`- Rent Properties: ${created.filter(p => p.purpose.toString() === rent._id.toString()).length}`);
    console.log(`- Residential: ${created.filter(p => p.type.toString() === residential._id.toString()).length}`);
    console.log(`- Commercial: ${created.filter(p => p.type.toString() === commercial._id.toString()).length}`);
    
    console.log('\n✓ Seed completed successfully!');
    console.log('You can now view properties on the frontend: http://localhost:3001');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedProperties();
