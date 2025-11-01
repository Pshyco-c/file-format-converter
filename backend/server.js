const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const ConvertAPI = require('convertapi');
const path = require('path');
const fs = require('fs');
const Conversion = require('./models/Conversion');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize ConvertAPI
const convertapi = new ConvertAPI(process.env.CONVERTAPI_SECRET);

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'File Converter API is running',
    timestamp: new Date().toISOString()
  });
});

// Convert file endpoint
app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { fromFormat, toFormat } = req.body;

    if (!fromFormat || !toFormat) {
      return res.status(400).json({ error: 'Source and target formats are required' });
    }

    console.log(`🔄 Converting ${req.file.originalname} from ${fromFormat} to ${toFormat}`);

    // Convert file using ConvertAPI
    const result = await convertapi.convert(toFormat, {
      File: req.file.path
    }, fromFormat);

    // Get the converted file URL
    const fileUrl = result.files[0].url;

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
    
    console.log(`✅ Conversion successful: ${fileUrl}`);

    // Save conversion to database
    const conversion = new Conversion({
      fileName: req.file.originalname,
      fromFormat: fromFormat.toLowerCase(),
      toFormat: toFormat.toLowerCase(),
      status: 'success',
      fileUrl: fileUrl,
      fileSize: req.file.size
    });

    await conversion.save();

    res.json({
      success: true,
      fileUrl: fileUrl,
      fileName: `${req.file.originalname.split('.')[0]}.${toFormat}`,
      conversionId: conversion._id
    });

  } catch (error) {
    console.error('❌ Conversion error:', error);

    // Clean up file if it exists
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting temp file:', err);
      });
    }

    // Save failed conversion to database
    try {
      const failedConversion = new Conversion({
        fileName: req.file?.originalname || 'unknown',
        fromFormat: req.body.fromFormat?.toLowerCase() || 'unknown',
        toFormat: req.body.toFormat?.toLowerCase() || 'unknown',
        status: 'failed',
        error: error.message
      });
      await failedConversion.save();
    } catch (dbError) {
      console.error('❌ Failed to save error to database:', dbError);
    }

    res.status(500).json({ 
      error: 'Conversion failed', 
      message: error.message 
    });
  }
});

// Get conversion history
app.get('/api/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await Conversion.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-__v');

    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error('❌ Error fetching history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch history', 
      message: error.message 
    });
  }
});

// Get conversion by ID
app.get('/api/conversion/:id', async (req, res) => {
  try {
    const conversion = await Conversion.findById(req.params.id);
    
    if (!conversion) {
      return res.status(404).json({ error: 'Conversion not found' });
    }

    res.json({
      success: true,
      conversion: conversion
    });
  } catch (error) {
    console.error('❌ Error fetching conversion:', error);
    res.status(500).json({ 
      error: 'Failed to fetch conversion', 
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API endpoints:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/convert`);
  console.log(`   - GET  /api/history`);
  console.log(`   - GET  /api/conversion/:id`);
});
