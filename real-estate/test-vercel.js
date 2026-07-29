/**
 * Simple test script to verify Vercel deployment configuration
 * Run this locally before deploying to catch common issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Vercel deployment configuration...\n');

let errors = 0;
let warnings = 0;

// Check 1: vercel.json exists
if (fs.existsSync('vercel.json')) {
  console.log('✅ vercel.json found');
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    if (vercelConfig.builds && vercelConfig.builds[0].src === 'api/index.js') {
      console.log('✅ Build configuration is correct');
    } else {
      console.log('❌ Build configuration seems incorrect');
      errors++;
    }
  } catch (e) {
    console.log('❌ vercel.json is invalid JSON');
    errors++;
  }
} else {
  console.log('❌ vercel.json not found');
  errors++;
}

// Check 2: api/index.js exists
if (fs.existsSync('api/index.js')) {
  console.log('✅ api/index.js found');
} else {
  console.log('❌ api/index.js not found');
  errors++;
}

// Check 3: src/app.js exists
if (fs.existsSync('src/app.js')) {
  console.log('✅ src/app.js found');
} else {
  console.log('❌ src/app.js not found');
  errors++;
}

// Check 4: package.json exists and has required dependencies
if (fs.existsSync('package.json')) {
  console.log('✅ package.json found');
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['express', 'mongoose', 'dotenv'];
    const missingDeps = requiredDeps.filter(dep => !pkg.dependencies[dep]);
    if (missingDeps.length === 0) {
      console.log('✅ All required dependencies present');
    } else {
      console.log(`⚠️  Missing dependencies: ${missingDeps.join(', ')}`);
      warnings++;
    }
  } catch (e) {
    console.log('❌ package.json is invalid JSON');
    errors++;
  }
} else {
  console.log('❌ package.json not found');
  errors++;
}

// Check 5: .env.example exists
if (fs.existsSync('.env.example')) {
  console.log('✅ .env.example found');
} else {
  console.log('⚠️  .env.example not found (create one for documentation)');
  warnings++;
}

// Check 6: .vercelignore exists
if (fs.existsSync('.vercelignore')) {
  console.log('✅ .vercelignore found');
} else {
  console.log('⚠️  .vercelignore not found (recommended)');
  warnings++;
}

// Check 7: node_modules should be ignored
if (fs.existsSync('.vercelignore')) {
  const ignoreContent = fs.readFileSync('.vercelignore', 'utf8');
  if (ignoreContent.includes('node_modules')) {
    console.log('✅ node_modules is ignored');
  } else {
    console.log('⚠️  node_modules should be in .vercelignore');
    warnings++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`\nResults: ${errors} errors, ${warnings} warnings\n`);

if (errors === 0 && warnings === 0) {
  console.log('🎉 Everything looks good! Ready to deploy to Vercel.');
  console.log('\nNext steps:');
  console.log('1. Install Vercel CLI: npm install -g vercel');
  console.log('2. Login: vercel login');
  console.log('3. Deploy: vercel --prod');
  console.log('\n⚠️  Don\'t forget to set environment variables in Vercel dashboard!');
} else if (errors === 0) {
  console.log('⚠️  Some warnings found, but you can still deploy.');
  console.log('Consider fixing warnings for better deployment experience.');
} else {
  console.log('❌ Please fix the errors before deploying.');
  process.exit(1);
}
