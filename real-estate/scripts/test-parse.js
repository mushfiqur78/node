const { parseJSON } = require('../src/services/importExportService');

// Test 1: simple array
const buf1 = Buffer.from('[{"title":"Test","description":"desc","address":"addr"}]');
try {
  const r = parseJSON(buf1);
  console.log('Test 1 OK:', r.length, 'rows');
} catch(e) {
  console.log('Test 1 FAIL:', e.message);
}

// Test 2: file with BOM
const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
const buf2 = Buffer.concat([bom, buf1]);
try {
  const r = parseJSON(buf2);
  console.log('Test 2 (BOM) OK:', r.length, 'rows');
} catch(e) {
  console.log('Test 2 (BOM) FAIL:', e.message);
}

// Test 3: actual test-import.json
const fs = require('fs');
const buf3 = fs.readFileSync('test-import.json');
console.log('File bytes (first 10):', [...buf3.slice(0,10)]);
console.log('File content:', buf3.toString('utf-8').substring(0, 100));
try {
  const r = parseJSON(buf3);
  console.log('Test 3 (file) OK:', r.length, 'rows');
} catch(e) {
  console.log('Test 3 (file) FAIL:', e.message);
}
