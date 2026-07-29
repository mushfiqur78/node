/**
 * WordPress → Import Format Converter
 * 
 * Usage:
 *   node scripts/convert-wp-properties.js [input.json] [output.json]
 * 
 * Defaults:
 *   input  → published-properties.json  (in project root)
 *   output → converted-properties.json  (in project root)
 * 
 * Then upload converted-properties.json via Admin → Import/Export → Import
 */

const fs   = require('fs');
const path = require('path');

// ── Args ──────────────────────────────────────────────────────────
const inputFile  = process.argv[2] || path.join(__dirname, '../../published-properties.json');
const outputFile = process.argv[3] || path.join(__dirname, '../../converted-properties.json');

// ── Strip HTML tags ───────────────────────────────────────────────
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')   // remove tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

// ── Parse price string → BDT number ──────────────────────────────
// Handles: "1.46 Crore", "50 Lakh", "85,000", "9629", ""
function parsePriceToBDT(str) {
  if (!str || str === '') return null;
  const s = String(str).toLowerCase().trim();

  if (s.includes('crore')) {
    const n = parseFloat(s.replace(/[^0-9.]/g, ''));
    return Math.round(n * 10_000_000);
  }
  if (s.includes('lakh')) {
    const n = parseFloat(s.replace(/[^0-9.]/g, ''));
    return Math.round(n * 100_000);
  }
  // plain number (remove commas)
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

// ── Get first value from array or string ─────────────────────────
function first(val) {
  if (Array.isArray(val)) return val[0] || '';
  return val || '';
}

// ── Capitalize first letter ───────────────────────────────────────
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ── Convert one WordPress property row ───────────────────────────
function convertRow(wp) {
  const meta = wp.meta || {};
  const tax  = wp.tax  || {};

  // Purpose: "sell" → "sell", "rent" → "rent"
  const labelArr = tax.property_label || [];
  const label    = first(labelArr).toLowerCase();
  const purpose  = label === 'rent' ? 'rent' : 'sell';

  // Location: first item of array, capitalize
  const locationRaw = first(tax.property_location || []);
  const location    = capitalize(locationRaw);

  // Type: first item, capitalize
  const typeRaw = first(tax.property_type || []);
  const type    = capitalize(typeRaw);

  // Address: use location text or fallback to location name
  const address = meta._property_location_text
    ? String(meta._property_location_text).trim()
    : location
    ? `${location}, Dhaka`
    : 'Dhaka';

  // Pricing
  const totalPrice   = parsePriceToBDT(meta._total_price);
  const rentPerMonth = parsePriceToBDT(meta._rent_price_per_month);
  const pricePerSft  = meta._price_per_sft ? Number(meta._price_per_sft) || null : null;
  const serviceCharge = parsePriceToBDT(meta._service_charge);
  const parkingPrice  = parsePriceToBDT(meta._parking_price);

  const pricing = {};
  if (purpose === 'rent' && rentPerMonth) pricing.rentPerMonth = rentPerMonth;
  if (purpose === 'sell' && totalPrice)   pricing.totalPrice   = totalPrice;
  if (pricePerSft)   pricing.pricePerSft   = pricePerSft;
  if (serviceCharge) pricing.serviceCharge = serviceCharge;
  if (parkingPrice)  pricing.parkingPrice  = parkingPrice;

  // Description: strip HTML
  const description = stripHtml(wp.content) || wp.title;

  // Features: convert slug to readable name
  const featureSlugs = tax.property_feature || [];
  const featureNames = featureSlugs.map(f =>
    f.split('-').map(w => capitalize(w)).join(' ')
  );

  const converted = {
    title:         wp.title || '',
    description,
    address,
    propertyName:  meta._project_name || '',
    propertyId:    meta._property_id  || '',
    areaSize:      Number(meta._property_area)    || 0,
    bedrooms:      Number(meta._property_bedrooms) || 0,
    bathrooms:     Number(meta._property_bathrooms)|| 0,
    balcony:       Number(meta._property_balcony)  || 0,
    floor:         meta._property_floor_no || '',
    contactNumber: meta._contact_phone || '',
    videoUrl:      meta._property_youtube || '',
    purpose,
    location,
    type,
    pricing,
    status:        'approved',
    source:        'admin',
    // Keep image URLs for reference (won't auto-upload, but stored as notes)
    _featured_url: wp.featured_url || '',
    _gallery_urls: wp.gallery_urls || [],
    _features:     featureNames,
    _wp_id:        wp.old_id || '',
  };

  // Slug: generate unique slug by appending propertyId or old_id
  const slugBase = (wp.title || 'property')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const uniqueSuffix = meta._property_id || wp.old_id || Date.now();
  converted.slug = `${slugBase}-${uniqueSuffix}`;

  return converted;
}

// ── Main ──────────────────────────────────────────────────────────
try {
  console.log(`\n📂 Reading: ${inputFile}`);

  if (!fs.existsSync(inputFile)) {
    console.error(`❌ File not found: ${inputFile}`);
    console.error('   Place published-properties.json in the project root folder.');
    process.exit(1);
  }

  let raw = fs.readFileSync(inputFile, 'utf-8');
  // Strip BOM
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);

  const wpData = JSON.parse(raw);
  const rows   = Array.isArray(wpData) ? wpData
    : Array.isArray(wpData.properties) ? wpData.properties
    : [];

  if (!rows.length) {
    console.error('❌ No rows found in the JSON file.');
    process.exit(1);
  }

  console.log(`✅ Found ${rows.length} properties\n`);

  const converted = [];
  const skipped   = [];

  rows.forEach((row, i) => {
    try {
      const c = convertRow(row);

      // Validate minimum required fields
      if (!c.title) {
        skipped.push({ index: i + 1, reason: 'Missing title' });
        return;
      }
      if (!c.description) {
        skipped.push({ index: i + 1, reason: 'Missing description', title: c.title });
        return;
      }

      converted.push(c);
      console.log(`  ✓ [${i + 1}] ${c.title.substring(0, 60)}`);
      console.log(`       Purpose: ${c.purpose} | Location: ${c.location} | Type: ${c.type}`);
      if (c.pricing.totalPrice)   console.log(`       Price: BDT ${c.pricing.totalPrice.toLocaleString()}`);
      if (c.pricing.rentPerMonth) console.log(`       Rent: BDT ${c.pricing.rentPerMonth.toLocaleString()}/month`);
      console.log('');
    } catch (err) {
      skipped.push({ index: i + 1, reason: err.message, title: row.title });
    }
  });

  // Write output
  fs.writeFileSync(outputFile, JSON.stringify(converted, null, 2), 'utf-8');

  console.log('─'.repeat(60));
  console.log(`✅ Converted: ${converted.length} properties`);
  if (skipped.length) {
    console.log(`⚠️  Skipped:   ${skipped.length} properties`);
    skipped.forEach(s => console.log(`   Row ${s.index}: ${s.reason} — ${s.title || ''}`));
  }
  console.log(`\n📄 Output saved to: ${outputFile}`);

  // Show unique locations used — admin may need to add missing ones
  const locations = [...new Set(converted.map(c => c.location).filter(Boolean))];
  console.log(`\n📍 Locations used: ${locations.join(', ')}`);
  console.log('   Make sure these exist in Admin → Config → Locations before importing.\n');
  console.log('👉 Next step: Upload converted-properties.json via Admin → Import/Export → Import\n');

} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
