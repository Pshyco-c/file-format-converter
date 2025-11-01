const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  fromFormat: {
    type: String,
    required: true
  },
  toFormat: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'processing'],
    default: 'processing'
  },
  fileUrl: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: 0
  },
  error: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
conversionSchema.index({ timestamp: -1 });
conversionSchema.index({ status: 1 });

module.exports = mongoose.model('Conversion', conversionSchema);
