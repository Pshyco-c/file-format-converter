// backend/services/conversionService.js
// This file abstracts the conversion logic for easy API switching

/**
 * Conversion Service - Abstraction layer for different conversion APIs
 * To switch APIs:
 * 1. Create a new function below
 * 2. Update the ACTIVE_SERVICE constant
 * 3. No frontend changes needed!
 */

// ============================================
// ConvertAPI Implementation
// ============================================
async function convertWithConvertAPI(file, fromFormat, toFormat) {
  const ConvertAPI = require('convertapi');
  const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);

  const result = await convertapi.convert(toFormat, {
    File: file.path,
  }, fromFormat);

  return {
    fileUrl: result.files[0].url,
    fileName: `${file.originalname.split('.')[0]}.${toFormat}`,
  };
}

// ============================================
// CloudConvert Implementation
// ============================================
async function convertWithCloudConvert(file, fromFormat, toFormat) {
  const CloudConvert = require('cloudconvert');
  const fs = require('fs');

  const cloudconvert = new CloudConvert({
    apiKey: process.env.CLOUDCONVERT_API_KEY,
  });

  const job = await cloudconvert.jobs.create({
    tasks: {
      'import-my-file': {
        operation: 'import/upload',
        file: fs.createReadStream(file.path),
      },
      'convert-file': {
        operation: 'convert',
        input: 'import-my-file',
        output_format: toFormat,
        input_format: fromFormat,
      },
      'export-file': {
        operation: 'export/url',
        input: 'convert-file',
      },
    },
  });

  const exportTask = job.tasks.filter((t) => t.name === 'export-file')[0];
  const fileUrl = exportTask.result.files[0].url;

  return {
    fileUrl,
    fileName: `${file.originalname.split('.')[0]}.${toFormat}`,
  };
}

// ============================================
// Zamzar Implementation
// ============================================
async function convertWithZamzar(file, fromFormat, toFormat) {
  const axios = require('axios');
  const FormData = require('form-data');
  const fs = require('fs');

  const form = new FormData();
  form.append('file', fs.createReadStream(file.path));
  form.append('target_format', toFormat);

  // Submit conversion job
  const response = await axios.post('https://api.zamzar.com/v1/jobs', form, {
    headers: form.getHeaders(),
    auth: {
      username: process.env.ZAMZAR_API_KEY,
      password: '',
    },
  });

  const jobId = response.data.id;

  // Poll for completion
  let completed = false;
  let fileUrl = null;
  let attempts = 0;

  while (!completed && attempts < 60) {
    const jobStatus = await axios.get(
      `https://api.zamzar.com/v1/jobs/${jobId}`,
      {
        auth: {
          username: process.env.ZAMZAR_API_KEY,
          password: '',
        },
      }
    );

    if (jobStatus.data.status === 'successful') {
      fileUrl = jobStatus.data.output_files[0].download_url;
      completed = true;
    } else if (jobStatus.data.status === 'failed') {
      throw new Error('Conversion failed');
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }

  if (!completed) {
    throw new Error('Conversion timeout');
  }

  return {
    fileUrl,
    fileName: `${file.originalname.split('.')[0]}.${toFormat}`,
  };
}

// ============================================
// Aspose Cloud Implementation
// ============================================
async function convertWithAsposeCloud(file, fromFormat, toFormat) {
  const axios = require('axios');
  const FormData = require('form-data');
  const fs = require('fs');

  const form = new FormData();
  form.append('file', fs.createReadStream(file.path));

  const response = await axios.post(
    `https://api.aspose.cloud/v3.0/conversion/convert?format=${toFormat}`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${process.env.ASPOSE_API_TOKEN}`,
      },
    }
  );

  // Aspose returns file in response, so we need to upload to storage
  const fileUrl = response.data.downloadUrl;

  return {
    fileUrl,
    fileName: `${file.originalname.split('.')[0]}.${toFormat}`,
  };
}

// ============================================
// Open-Source Implementation (ImageMagick + LibreOffice)
// ============================================
async function convertWithOpenSource(file, fromFormat, toFormat) {
  const openSourceConverter = require('./openSourceConverter');
  return await openSourceConverter.convert(file, fromFormat, toFormat);
}

// ============================================
// Main Conversion Router
// ============================================

const CONVERSION_SERVICES = {
  convertapi: convertWithConvertAPI,
  cloudconvert: convertWithCloudConvert,
  zamzar: convertWithZamzar,
  aspose: convertWithAsposeCloud,
  opensource: convertWithOpenSource,
};

// Change this to switch APIs - options: 'convertapi', 'cloudconvert', 'zamzar', 'aspose', 'opensource'
const ACTIVE_SERVICE = process.env.CONVERSION_SERVICE || 'convertapi';

/**
 * Main conversion function - automatically uses the active service
 * @param {Object} file - Multer file object
 * @param {String} fromFormat - Source file format (e.g., 'pdf')
 * @param {String} toFormat - Target file format (e.g., 'docx')
 * @returns {Promise<Object>} - { fileUrl, fileName }
 */
async function convert(file, fromFormat, toFormat) {
  const conversionService = CONVERSION_SERVICES[ACTIVE_SERVICE];

  if (!conversionService) {
    throw new Error(
      `Unknown conversion service: ${ACTIVE_SERVICE}. Available: ${Object.keys(CONVERSION_SERVICES).join(', ')}`
    );
  }

  console.log(`📁 Converting ${fromFormat} → ${toFormat} using ${ACTIVE_SERVICE}`);
  return await conversionService(file, fromFormat, toFormat);
}

module.exports = {
  convert,
  ACTIVE_SERVICE,
  AVAILABLE_SERVICES: Object.keys(CONVERSION_SERVICES),
};
