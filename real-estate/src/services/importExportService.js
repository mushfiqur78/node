/**
 * Import/Export Service
 * Handles CSV, Excel, and JSON parsing/generation for properties
 */

const XLSX = require('xlsx');

// ── Column mapping: file column → property field ──────────────────
const COLUMN_MAP = {
  'title':           'title',
  'description':     'description',
  'address':         'address',
  'property_name':   'propertyName',
  'property_id':     'propertyId',
  'slug':            'slug',
  'area_size':       'areaSize',
  'bedrooms':        'bedrooms',
  'bathrooms':       'bathrooms',
  'balcony':         'balcony',
  'floor':           'floor',
  'contact_number':  'contactNumber',
  'video_url':       'videoUrl',
  'total_price':     'pricing.totalPrice',
  'rent_per_month':  'pricing.rentPerMonth',
  'price_per_sft':   'pricing.pricePerSft',
  'service_charge':  'pricing.serviceCharge',
  'parking_price':   'pricing.parkingPrice',
  'expiry_date':     'expiryDate',
  'status':          'status',
  'source':          'source',
};

const REQUIRED_FIELDS = ['title', 'description', 'address'];
const NUMERIC_FIELDS  = ['areaSize','bedrooms','bathrooms','balcony','pricing.totalPrice','pricing.rentPerMonth','pricing.pricePerSft','pricing.serviceCharge','pricing.parkingPrice'];

// ── Parse date safely ─────────────────────────────────────────────
const parseDate = (val) => {
  if (!val) return null;
  if (typeof val === 'number') {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return new Date(d.y, d.m - 1, d.d);
  }
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

// ── Set nested value (e.g. pricing.totalPrice) ────────────────────
const setNested = (obj, path, value) => {
  const parts = path.split('.');
  if (parts.length === 1) { obj[path] = value; return; }
  if (!obj[parts[0]]) obj[parts[0]] = {};
  obj[parts[0]][parts[1]] = value;
};

// ── Normalize property row (shared for CSV/Excel/JSON) ────────────
const normalizeRow = (row) => {
  const normalized = {};
  Object.entries(row).forEach(([k, v]) => {
    normalized[k.toLowerCase().trim().replace(/\s+/g, '_')] = v;
  });
  return normalized;
};

// ── Parse rows from CSV/Excel buffer ─────────────────────────────
exports.parseSheet = (buffer, format) => {
  const workbook = XLSX.read(buffer, { type: 'buffer', raw: format === 'csv' ? false : undefined });
  const sheet    = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet, { defval: '' });
};

// ── Parse JSON buffer ─────────────────────────────────────────────
exports.parseJSON = (buffer) => {
  // Strip UTF-8 BOM if present (0xEF 0xBB 0xBF)
  let text = buffer.toString('utf-8');
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  text = text.trim();

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON format: ' + e.message);
  }

  // Accept array, { properties: [...] }, { data: [...] }, { data: { properties: [...] } }
  if (Array.isArray(data))                       return data;
  if (Array.isArray(data?.properties))           return data.properties;
  if (Array.isArray(data?.data))                 return data.data;
  if (Array.isArray(data?.data?.properties))     return data.data.properties;
  throw new Error('JSON must be an array of property objects');
};

// ── Map raw row to property data ──────────────────────────────────
exports.mapRow = (row, rowIndex) => {
  const errors = [];
  const data   = {};
  const normalized = normalizeRow(row);

  // ── Handle flat snake_case format (from template/export) ──────
  Object.entries(COLUMN_MAP).forEach(([col, field]) => {
    if (normalized[col] !== undefined && normalized[col] !== '') {
      const val = normalized[col];
      if (field === 'expiryDate') {
        const d = parseDate(val);
        if (d) setNested(data, field, d);
      } else if (NUMERIC_FIELDS.includes(field)) {
        const n = Number(val);
        if (!isNaN(n)) setNested(data, field, n);
      } else {
        setNested(data, field, String(val).trim());
      }
    }
  });

  // ── Handle full camelCase MongoDB document format ──────────────
  // Direct camelCase fields
  const directFields = [
    'title','description','address','propertyName','propertyId','slug',
    'areaSize','bedrooms','bathrooms','balcony','floor','contactNumber',
    'videoUrl','status','source','createdByRole',
  ];
  directFields.forEach(f => {
    if (row[f] !== undefined && row[f] !== '' && row[f] !== null) {
      const numFields = ['areaSize','bedrooms','bathrooms','balcony'];
      data[f] = numFields.includes(f) ? Number(row[f]) : row[f];
    }
  });

  // Pricing object
  if (row.pricing && typeof row.pricing === 'object') {
    data.pricing = {};
    const pFields = ['totalPrice','rentPerMonth','pricePerSft','serviceCharge','parkingPrice'];
    pFields.forEach(pf => {
      if (row.pricing[pf] !== undefined && row.pricing[pf] !== null) {
        data.pricing[pf] = Number(row.pricing[pf]) || 0;
      }
    });
  }

  // Expiry date
  if (row.expiryDate) {
    const d = parseDate(row.expiryDate);
    if (d) data.expiryDate = d;
  }

  // Purpose/location/type — accept name string OR ObjectId string
  // (controller will resolve names to ObjectIds)
  if (row.purpose) {
    data.purpose = typeof row.purpose === 'object'
      ? (row.purpose?.name || row.purpose?._id || null)
      : row.purpose;
  }
  if (row.location) {
    data.location = typeof row.location === 'object'
      ? (row.location?.name || row.location?._id || null)
      : row.location;
  }
  if (row.type) {
    data.type = typeof row.type === 'object'
      ? (row.type?.name || row.type?._id || null)
      : row.type;
  }

  // Validate required fields
  REQUIRED_FIELDS.forEach(f => {
    if (!data[f]) errors.push({ row: rowIndex, field: f, message: `${f} is required` });
  });

  return { data, errors };
};

// ── Build export row ──────────────────────────────────────────────
const buildExportRow = (p) => ({
  property_id:    p.propertyId || '',
  title:          p.title || '',
  description:    p.description || '',
  address:        p.address || '',
  property_name:  p.propertyName || '',
  slug:           p.slug || '',
  area_size:      p.areaSize || '',
  bedrooms:       p.bedrooms || '',
  bathrooms:      p.bathrooms || '',
  balcony:        p.balcony || '',
  floor:          p.floor || '',
  contact_number: p.contactNumber || '',
  video_url:      p.videoUrl || '',
  total_price:    p.pricing?.totalPrice || '',
  rent_per_month: p.pricing?.rentPerMonth || '',
  price_per_sft:  p.pricing?.pricePerSft || '',
  service_charge: p.pricing?.serviceCharge || '',
  parking_price:  p.pricing?.parkingPrice || '',
  status:         p.status || '',
  source:         p.source || '',
  expiry_date:    p.expiryDate ? new Date(p.expiryDate).toISOString().split('T')[0] : '',
  created_at:     p.createdAt ? new Date(p.createdAt).toISOString().split('T')[0] : '',
});

// ── Generate export (CSV/Excel/JSON) ─────────────────────────────
exports.generateExport = (properties, format) => {
  const rows = properties.map(buildExportRow);

  if (format === 'json') {
    return Buffer.from(JSON.stringify(rows, null, 2), 'utf-8');
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Properties');

  if (format === 'csv')   return XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

// ── Generate sample template (CSV/Excel/JSON) ─────────────────────
exports.generateTemplate = (format) => {
  const sample = [{
    title:          'Sample Property Title',
    description:    'Property description here',
    address:        '123 Main Street, Dhaka',
    property_name:  'Green Villa',
    area_size:      1200,
    bedrooms:       3,
    bathrooms:      2,
    balcony:        1,
    floor:          '5th',
    contact_number: '01700000000',
    total_price:    5000000,
    rent_per_month: '',
    price_per_sft:  4166,
    service_charge: '',
    parking_price:  '',
    video_url:      '',
    expiry_date:    '2025-12-31',
  }];

  if (format === 'json') {
    return Buffer.from(JSON.stringify(sample, null, 2), 'utf-8');
  }

  const ws = XLSX.utils.json_to_sheet(sample);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Properties');

  if (format === 'csv') return XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

// ── Generate error report (CSV or JSON) ──────────────────────────
exports.generateErrorReport = (errors, format = 'csv') => {
  const rows = errors.map(e => ({
    row:     e.row,
    field:   e.field,
    message: e.message,
    data:    typeof e.data === 'object' ? JSON.stringify(e.data) : e.data || '',
  }));

  if (format === 'json') {
    return Buffer.from(JSON.stringify(rows, null, 2), 'utf-8');
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Errors');
  return XLSX.write(wb, { type: 'buffer', bookType: 'csv' });
};
