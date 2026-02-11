#!/usr/bin/env node

/**
 * Setup Verification Script
 * 
 * Verifies that the Polymarket Market Monitor is properly configured
 * and all dependencies are working.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const checks = {
  passed: [],
  failed: [],
  warnings: []
};

console.log('🔍 Polymarket Market Monitor - Setup Verification\n');

// Check 1: Node.js version
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);
  
  if (major >= 18) {
    checks.passed.push(`✅ Node.js version: ${version}`);
  } else {
    checks.failed.push(`❌ Node.js version ${version} is too old. Need 18+`);
  }
}

// Check 2: package.json exists
function checkPackageJson() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    checks.passed.push('✅ package.json found');
    return true;
  } else {
    checks.failed.push('❌ package.json not found');
    return false;
  }
}

// Check 3: node_modules exists
function checkNodeModules() {
  const modulesPath = path.join(__dirname, '..', 'node_modules');
  
  if (fs.existsSync(modulesPath)) {
    checks.passed.push('✅ node_modules installed');
  } else {
    checks.warnings.push('⚠️  node_modules not found - run: npm install');
  }
}

// Check 4: Required directories exist
function checkDirectories() {
  const requiredDirs = [
    'app',
    'components',
    'lib',
    'components/ui',
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
      checks.passed.push(`✅ ${dir}/ directory exists`);
    } else {
      checks.failed.push(`❌ ${dir}/ directory missing`);
    }
  }
}

// Check 5: Required files exist
function checkRequiredFiles() {
  const requiredFiles = [
    'app/layout.tsx',
    'app/page.tsx',
    'app/providers.tsx',
    'components/market-dashboard.tsx',
    'components/market-card.tsx',
    'lib/api.ts',
    'lib/utils.ts',
    'next.config.js',
    'tsconfig.json',
    'tailwind.config.ts',
  ];
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      checks.passed.push(`✅ ${file} exists`);
    } else {
      checks.failed.push(`❌ ${file} missing`);
    }
  }
}

// Check 6: Gamma API accessibility
function checkGammaAPI() {
  return new Promise((resolve) => {
    console.log('📡 Testing Gamma API connection...\n');
    
    // Gamma /markets is paginated; request a small page for a quick health check.
    const url = 'https://gamma-api.polymarket.com/markets?limit=5&active=true&closed=false';
    
    https.get(url, { timeout: 5000 }, (res) => {
      if (res.statusCode === 200) {
        checks.passed.push('✅ Gamma API accessible');
        
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const markets = JSON.parse(data);
            checks.passed.push(`✅ API returned ${markets.length} markets`);
            resolve();
          } catch (e) {
            checks.warnings.push('⚠️  API response not valid JSON');
            resolve();
          }
        });
      } else {
        checks.failed.push(`❌ Gamma API returned status ${res.statusCode}`);
        resolve();
      }
    }).on('error', (err) => {
      checks.failed.push(`❌ Cannot reach Gamma API: ${err.message}`);
      resolve();
    }).on('timeout', () => {
      checks.warnings.push('⚠️  Gamma API request timed out (slow connection?)');
      resolve();
    });
  });
}

// Check 7: TypeScript configuration
function checkTypeScript() {
  const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
  
  try {
    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
    
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.strict) {
      checks.passed.push('✅ TypeScript strict mode enabled');
    } else {
      checks.warnings.push('⚠️  TypeScript strict mode not enabled');
    }
  } catch (e) {
    checks.failed.push('❌ Cannot parse tsconfig.json');
  }
}

// Check 8: Documentation exists
function checkDocumentation() {
  const docs = ['README.md', 'ARCHITECTURE.md', 'CONTRIBUTING.md', 'EXAMPLES.md'];
  
  for (const doc of docs) {
    const docPath = path.join(__dirname, '..', doc);
    if (fs.existsSync(docPath)) {
      checks.passed.push(`✅ ${doc} exists`);
    } else {
      checks.warnings.push(`⚠️  ${doc} missing`);
    }
  }
}

// Run all checks
async function runAllChecks() {
  checkNodeVersion();
  checkPackageJson();
  checkNodeModules();
  checkDirectories();
  checkRequiredFiles();
  await checkGammaAPI();
  checkTypeScript();
  checkDocumentation();
  
  // Print results
  console.log('\n📊 Verification Results:\n');
  
  if (checks.passed.length > 0) {
    console.log('✅ Passed Checks:');
    checks.passed.forEach(check => console.log(`   ${check}`));
    console.log('');
  }
  
  if (checks.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    checks.warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }
  
  if (checks.failed.length > 0) {
    console.log('❌ Failed Checks:');
    checks.failed.forEach(fail => console.log(`   ${fail}`));
    console.log('');
  }
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Summary: ${checks.passed.length} passed, ${checks.warnings.length} warnings, ${checks.failed.length} failed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (checks.failed.length === 0) {
    console.log('🎉 Setup looks good! Run `npm run dev` to start developing.\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks failed. Please fix the issues above.\n');
    process.exit(1);
  }
}

runAllChecks().catch(err => {
  console.error('Error running checks:', err);
  process.exit(1);
});
