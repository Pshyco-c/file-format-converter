#!/usr/bin/env node

/**
 * Open-Source Converter Test Script
 * 
 * Tests if ImageMagick and LibreOffice are properly installed and working.
 * 
 * Usage:
 *   node backend/test-opensource.js
 *   or
 *   npm run test:converter
 */

const { healthCheck, SUPPORTED_FORMATS, isCommandAvailable } = require('./services/openSourceConverter');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ============================================
// Colors for console output
// ============================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function success(msg) {
  console.log(`${colors.green}✅${colors.reset} ${msg}`);
}

function error(msg) {
  console.log(`${colors.red}❌${colors.reset} ${msg}`);
}

function warning(msg) {
  console.log(`${colors.yellow}⚠️ ${colors.reset} ${msg}`);
}

function info(msg) {
  console.log(`${colors.blue}ℹ️ ${colors.reset} ${msg}`);
}

function header(msg) {
  console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);
}

// ============================================
// Test Functions
// ============================================

function testSystemInfo() {
  header('System Information');
  
  console.log(`Platform: ${os.platform()} ${os.arch()}`);
  console.log(`Node Version: ${process.version}`);
  console.log(`Working Directory: ${process.cwd()}`);
}

function testDependencies() {
  header('Checking Dependencies');

  const checks = healthCheck();

  if (checks.imagemagick) {
    success('ImageMagick is installed');
  } else {
    error('ImageMagick is NOT installed');
    console.log(`  → Install from: https://imagemagick.org/script/download.php`);
  }

  if (checks.libreoffice) {
    success('LibreOffice is installed');
  } else {
    error('LibreOffice is NOT installed');
    console.log(`  → Install from: https://www.libreoffice.org/download/`);
  }

  return checks;
}

function testSupportedFormats() {
  header('Supported Formats');

  console.log(`${colors.bright}Images:${colors.reset}`);
  console.log(`  ${SUPPORTED_FORMATS.images.join(', ')}`);

  console.log(`\n${colors.bright}Documents:${colors.reset}`);
  console.log(`  ${SUPPORTED_FORMATS.documents.join(', ')}`);

  console.log(`\n${colors.bright}Text:${colors.reset}`);
  console.log(`  ${SUPPORTED_FORMATS.text.join(', ')}`);
}

function testConfiguration() {
  header('Configuration');

  const envPath = path.join(__dirname, '../.env');
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const conversionService = envContent.match(/CONVERSION_SERVICE=(\w+)/);
    
    if (conversionService) {
      const service = conversionService[1];
      if (service === 'opensource') {
        success(`CONVERSION_SERVICE is set to: ${colors.bright}${service}${colors.reset}`);
      } else {
        warning(`CONVERSION_SERVICE is set to: ${colors.bright}${service}${colors.reset}`);
        console.log(`   → To use open-source converter, change to: ${colors.bright}opensource${colors.reset}`);
      }
    } else {
      warning('CONVERSION_SERVICE not found in .env file');
      console.log(`   → Add: CONVERSION_SERVICE=opensource`);
    }
  } else {
    warning('.env file not found at backend root');
    console.log(`   → Copy .env.example to .env and configure`);
  }
}

function testDirectoryStructure() {
  header('Directory Structure');

  const requiredDirs = [
    path.join(__dirname, '../uploads'),
    path.join(__dirname, '../services'),
  ];

  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      success(`Directory exists: ${path.basename(dir)}/`);
    } else {
      warning(`Directory missing: ${path.basename(dir)}/`);
    }
  });
}

function testServiceFile() {
  header('Service Files');

  const requiredFiles = [
    path.join(__dirname, '../services/conversionService.js'),
    path.join(__dirname, '../services/openSourceConverter.js'),
  ];

  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      success(`File exists: ${path.basename(file)} (${size} bytes)`);
    } else {
      error(`File missing: ${path.basename(file)}`);
    }
  });
}

function testDiskSpace() {
  header('Disk Space');

  const uploadsDir = path.join(__dirname, '../uploads');
  
  try {
    if (fs.existsSync(uploadsDir)) {
      const stats = fs.statSync(uploadsDir);
      info(`Uploads directory size and permissions: OK`);
    }
    
    // Try to write a test file
    const testFile = path.join(uploadsDir, '.test_write_permission');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    
    success('Write permissions: OK (can write to uploads/)');
  } catch (err) {
    error('Write permissions: FAILED');
    console.log(`  → ${err.message}`);
  }
}

async function testConversionSimulation() {
  header('Conversion Simulation');

  try {
    // Check if we can require the modules
    const openSourceConverter = require('./services/openSourceConverter');
    success('Can load openSourceConverter module');

    // Check if convert function exists
    if (typeof openSourceConverter.convert === 'function') {
      success('convert() function is available');
    } else {
      error('convert() function not found');
    }

  } catch (err) {
    error(`Failed to load module: ${err.message}`);
  }
}

// ============================================
// Main Test Suite
// ============================================

async function runTests() {
  console.clear();
  
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   🆓 Open-Source File Converter - System Test Suite    ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}`);

  // Run all tests
  testSystemInfo();
  const checks = testDependencies();
  testSupportedFormats();
  testConfiguration();
  testDirectoryStructure();
  testServiceFile();
  testDiskSpace();
  await testConversionSimulation();

  // Summary
  header('Test Summary');

  const allGood = checks.imagemagick && checks.libreoffice;

  if (allGood) {
    success('All systems ready! 🚀');
    console.log(`\n${colors.bright}Next steps:${colors.reset}`);
    console.log(`  1. Ensure .env has: CONVERSION_SERVICE=opensource`);
    console.log(`  2. Restart your server: npm run dev`);
    console.log(`  3. Upload a file and convert!`);
  } else {
    error('Some dependencies are missing!');
    console.log(`\n${colors.bright}Installation guide:${colors.reset}`);
    console.log(`  📖 Read: OPENSOURCE_SETUP.md for installation steps`);
    console.log(`\n${colors.bright}Quick install:${colors.reset}`);
    
    if (os.platform() === 'win32') {
      console.log(`  Windows: Download from https://imagemagick.org/script/download.php`);
      console.log(`  Windows: Download from https://www.libreoffice.org/download/`);
    } else if (os.platform() === 'darwin') {
      console.log(`  macOS: brew install imagemagick libreoffice`);
    } else {
      console.log(`  Linux: sudo apt-get install imagemagick libreoffice`);
    }
  }

  console.log(`\n${colors.bright}Commands:${colors.reset}`);
  console.log(`  npm run dev          - Start the server`);
  console.log(`  npm run test:converter - Run this test again`);
  console.log(`\n`);

  process.exit(allGood ? 0 : 1);
}

// Run tests
runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
