/**
 * Check Properties Script
 * Shows all properties in database with their status and source
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Property = require('../src/models/Property');
const PropertyType = require('../src/models/PropertyType');
const Location = require('../src/models/Location');
const Purpose = require('../src/models/Purpose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ MongoDB connected\n');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkProperties = async () => {
  try {
    await connectDB();

    const properties = await Property.find()
      .populate('type', 'name')
      .populate('location', 'name')
      .populate('purpose', 'name')
      .select('title status source createdByRole type location purpose pricing');

    console.log(`Total properties in database: ${properties.length}\n`);

    if (properties.length === 0) {
      console.log('No properties found. Run seed-properties.js to create sample data.');
      process.exit(0);
    }

    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   Status: ${prop.status}`);
      console.log(`   Source: ${prop.source}`);
      console.log(`   Created By: ${prop.createdByRole}`);
      console.log(`   Type: ${prop.type?.name || 'N/A'}`);
      console.log(`   Location: ${prop.location?.name || 'N/A'}`);
      console.log(`   Purpose: ${prop.purpose?.name || 'N/A'}`);
      console.log(`   Price: ${prop.pricing?.totalPrice || prop.pricing?.rentPerMonth || 'N/A'}`);
      console.log('');
    });

    // Count by status
    const approved = properties.filter(p => p.status === 'approved').length;
    const pending = properties.filter(p => p.status === 'pending').length;
    const rejected = properties.filter(p => p.status === 'rejected').length;

    // Count by source
    const marketplace = properties.filter(p => p.source === 'marketplace').length;
    const admin = properties.filter(p => p.source === 'admin').length;

    console.log('Summary:');
    console.log(`- Approved: ${approved}`);
    console.log(`- Pending: ${pending}`);
    console.log(`- Rejected: ${rejected}`);
    console.log(`- Marketplace: ${marketplace}`);
    console.log(`- Admin: ${admin}`);

    console.log('\n⚠️  Note: Frontend API only shows properties with:');
    console.log('   - source: "marketplace"');
    console.log('   - status: "approved"');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkProperties();
