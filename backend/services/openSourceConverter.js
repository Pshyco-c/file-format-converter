/**
 * Open-Source File Conversion Service
 * Uses ImageMagick and LibreOffice for FREE unlimited conversions
 * 
 * Supported conversions:
 * - Images: JPG, PNG, SVG, BMP, GIF, WEBP, TIFF, ICO
 * - Documents: PDF, DOCX, XLSX, PPTX, DOC, XLS, PPT, ODT, ODS, ODP
 * - Text: TXT, RTF, CSV, JSON
 * - Archives: ZIP (extraction only)
 * 
 * Requirements:
 * - ImageMagick (for image processing)
 * - LibreOffice (for document conversion)
 * - FFmpeg (optional, for video/audio)
 */

const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ============================================
// Utility Functions
// ============================================

/**
 * Check if a command is installed
 */
function isCommandAvailable(command) {
  try {
    if (os.platform() === 'win32') {
      execSync(`where ${command}`, { stdio: 'ignore' });
    } else {
      execSync(`which ${command}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Get output file path
 */
function getOutputPath(inputPath, outputFormat) {
  const dir = path.dirname(inputPath);
  const basename = path.basename(inputPath, path.extname(inputPath));
  const timestamp = Date.now();
  return path.join(dir, `${basename}_${timestamp}.${outputFormat}`);
}

/**
 * Format detection from file extension
 */
function getFormatFromFile(filePath) {
  return path.extname(filePath).toLowerCase().substring(1);
}

/**
 * Detect if format is image, document, or other
 */
function getFormatType(format) {
  const imageFormats = ['jpg', 'jpeg', 'png', 'svg', 'bmp', 'gif', 'webp', 'tiff', 'tif', 'ico'];
  const docFormats = ['pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp', 'rtf'];
  const textFormats = ['txt', 'csv', 'json'];

  if (imageFormats.includes(format.toLowerCase())) return 'image';
  if (docFormats.includes(format.toLowerCase())) return 'document';
  if (textFormats.includes(format.toLowerCase())) return 'text';
  return 'unknown';
}

/**
 * Execute command and return promise
 */
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Command failed: ${stderr || error.message}`));
      } else {
        resolve(stdout);
      }
    });
  });
}

// ============================================
// Image Conversion (ImageMagick)
// ============================================

async function convertImage(inputPath, outputFormat) {
  if (!isCommandAvailable('magick') && !isCommandAvailable('convert')) {
    throw new Error('ImageMagick is not installed. Please install it first.');
  }

  const outputPath = getOutputPath(inputPath, outputFormat);
  const command = os.platform() === 'win32'
    ? `magick "${inputPath}" "${outputPath}"`
    : `convert "${inputPath}" "${outputPath}"`;

  console.log(`🖼️  Converting image: ${inputPath} → ${outputPath}`);
  await executeCommand(command);

  if (!fs.existsSync(outputPath)) {
    throw new Error('Conversion failed: output file not created');
  }

  return outputPath;
}

// ============================================
// Document Conversion (LibreOffice)
// ============================================

async function convertDocument(inputPath, outputFormat) {
  if (!isCommandAvailable('soffice')) {
    throw new Error('LibreOffice is not installed. Please install it first.');
  }

  const outputDir = path.dirname(inputPath);
  const command = os.platform() === 'win32'
    ? `soffice --headless --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`
    : `libreoffice --headless --convert-to ${outputFormat} --outdir "${outputDir}" "${inputPath}"`;

  console.log(`📄 Converting document: ${inputPath} → ${outputFormat}`);
  await executeCommand(command);

  // LibreOffice creates file with original basename but new extension
  const basename = path.basename(inputPath, path.extname(inputPath));
  const outputPath = path.join(outputDir, `${basename}.${outputFormat}`);

  if (!fs.existsSync(outputPath)) {
    throw new Error('Conversion failed: output file not created');
  }

  return outputPath;
}

// ============================================
// PDF Conversion
// ============================================

async function convertToPDF(inputPath) {
  const inputFormat = getFormatFromFile(inputPath).toLowerCase();
  const imageFormats = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'tiff', 'tif'];
  const docFormats = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'ods', 'odp'];

  if (imageFormats.includes(inputFormat)) {
    return await convertImage(inputPath, 'pdf');
  } else if (docFormats.includes(inputFormat)) {
    return await convertDocument(inputPath, 'pdf');
  } else if (inputFormat === 'txt') {
    // Convert text to PDF via LibreOffice
    return await convertDocument(inputPath, 'pdf');
  } else {
    throw new Error(`Cannot convert ${inputFormat} to PDF`);
  }
}

async function convertFromPDF(inputPath, outputFormat) {
  const outputFormatLower = outputFormat.toLowerCase();
  const docFormats = ['docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp', 'txt', 'rtf'];
  const imageFormats = ['jpg', 'png', 'bmp', 'gif'];

  if (docFormats.includes(outputFormatLower)) {
    return await convertDocument(inputPath, outputFormatLower);
  } else if (imageFormats.includes(outputFormatLower)) {
    return await convertImage(inputPath, outputFormatLower);
  } else {
    throw new Error(`Cannot convert PDF to ${outputFormat}`);
  }
}

// ============================================
// Format Mapping for LibreOffice
// ============================================

function mapLibreOfficeFormat(format) {
  const formatMap = {
    docx: 'docx',
    doc: 'doc',
    pdf: 'pdf',
    xlsx: 'xlsx',
    xls: 'xls',
    pptx: 'pptx',
    ppt: 'ppt',
    odt: 'odt',
    ods: 'ods',
    odp: 'odp',
    rtf: 'rtf',
    txt: 'txt',
    csv: 'csv',
    json: 'txt', // Save as text
  };

  return formatMap[format.toLowerCase()] || format.toLowerCase();
}

// ============================================
// Main Conversion Function
// ============================================

async function convert(file, fromFormat, toFormat) {
  const fromType = getFormatType(fromFormat);
  const toType = getFormatType(toFormat);

  console.log(`\n🚀 Open-Source Conversion: ${fromFormat} → ${toFormat}`);
  console.log(`   Type: ${fromType} → ${toType}`);

  let outputPath;

  try {
    // Handle same format
    if (fromFormat.toLowerCase() === toFormat.toLowerCase()) {
      throw new Error('Source and target formats are the same');
    }

    // Image to Image
    if (fromType === 'image' && toType === 'image') {
      outputPath = await convertImage(file.path, toFormat);
    }

    // Image to PDF
    else if (fromType === 'image' && toFormat.toLowerCase() === 'pdf') {
      outputPath = await convertImage(file.path, 'pdf');
    }

    // PDF to Image
    else if (fromFormat.toLowerCase() === 'pdf' && toType === 'image') {
      outputPath = await convertFromPDF(file.path, toFormat);
    }

    // Document to Document
    else if (fromType === 'document' && toType === 'document') {
      const targetFormat = mapLibreOfficeFormat(toFormat);
      outputPath = await convertDocument(file.path, targetFormat);
    }

    // Document to PDF
    else if (fromType === 'document' && toFormat.toLowerCase() === 'pdf') {
      outputPath = await convertDocument(file.path, 'pdf');
    }

    // PDF to Document
    else if (fromFormat.toLowerCase() === 'pdf' && toType === 'document') {
      const targetFormat = mapLibreOfficeFormat(toFormat);
      outputPath = await convertFromPDF(file.path, targetFormat);
    }

    // Text conversions
    else if ((fromType === 'text' || fromFormat === 'pdf') && toType === 'text') {
      if (fromFormat.toLowerCase() === 'pdf') {
        outputPath = await convertFromPDF(file.path, toFormat);
      } else {
        outputPath = await convertDocument(file.path, mapLibreOfficeFormat(toFormat));
      }
    }

    // Text to Document
    else if (fromType === 'text' && toType === 'document') {
      const targetFormat = mapLibreOfficeFormat(toFormat);
      outputPath = await convertDocument(file.path, targetFormat);
    }

    // Document to Text
    else if (fromType === 'document' && toType === 'text') {
      outputPath = await convertDocument(file.path, mapLibreOfficeFormat(toFormat));
    }

    else {
      throw new Error(
        `Conversion from ${fromFormat} to ${toFormat} is not supported by open-source tools`
      );
    }

    if (!outputPath || !fs.existsSync(outputPath)) {
      throw new Error('Conversion completed but output file not found');
    }

    console.log(`✅ Conversion successful: ${outputPath}`);

    // Read file and return as downloadable
    const fileBuffer = fs.readFileSync(outputPath);
    const downloadUrl = `/api/download/${path.basename(outputPath)}`;

    // Clean up temp file after a delay (keep for download)
    setTimeout(() => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
        console.log(`🧹 Cleaned up: ${outputPath}`);
      }
    }, 300000); // 5 minutes

    return {
      fileUrl: downloadUrl,
      fileName: `${path.basename(file.originalname, path.extname(file.originalname))}.${toFormat}`,
      localPath: outputPath, // Store path for download endpoint
    };

  } catch (error) {
    console.error(`❌ Conversion failed: ${error.message}`);

    // Cleanup on error
    if (outputPath && fs.existsSync(outputPath)) {
      try {
        fs.unlinkSync(outputPath);
      } catch (e) {
        console.error('Error cleaning up failed conversion:', e);
      }
    }

    throw error;
  }
}

// ============================================
// Health Check
// ============================================

function healthCheck() {
  const checks = {
    imagemagick: isCommandAvailable('magick') || isCommandAvailable('convert'),
    libreoffice: isCommandAvailable('soffice'),
  };

  return checks;
}

// ============================================
// Supported Formats
// ============================================

const SUPPORTED_FORMATS = {
  images: ['jpg', 'jpeg', 'png', 'svg', 'bmp', 'gif', 'webp', 'tiff', 'tif', 'ico'],
  documents: ['pdf', 'docx', 'xlsx', 'pptx', 'doc', 'xls', 'ppt', 'odt', 'ods', 'odp'],
  text: ['txt', 'rtf', 'csv', 'json'],
};

// ============================================
// Exports
// ============================================

module.exports = {
  convert,
  healthCheck,
  SUPPORTED_FORMATS,
  isCommandAvailable,
  getFormatType,
};
