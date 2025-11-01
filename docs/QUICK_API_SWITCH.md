# 🚀 Quick API Replacement Guide

## The Easiest Way (Using Abstraction Layer)

### **Step 1: Add the Service Layer** ✅
We've already created `backend/services/conversionService.js` with all the API implementations.

### **Step 2: Update Your `.env` File**

```env
# Choose your conversion service
CONVERSION_SERVICE=convertapi  # Options: convertapi, cloudconvert, zamzar, aspose

# Add your API credentials
CONVERTAPI_SECRET=your_key_here
# OR
CLOUDCONVERT_API_KEY=your_key_here
# OR
ZAMZAR_API_KEY=your_key_here
# OR
ASPOSE_API_TOKEN=your_key_here

# Other configs
MONGODB_URI=mongodb://localhost:27017/file-converter
PORT=5000
```

### **Step 3: Update `backend/server.js`**

Replace the conversion logic with:

```javascript
// At the top of the file
const conversionService = require('./services/conversionService');

// In the /api/convert endpoint, replace the conversion call with:
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

    // Use the abstraction layer
    const result = await conversionService.convert(req.file, fromFormat, toFormat);
    
    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    console.log(`✅ Conversion successful: ${result.fileUrl}`);

    // Save conversion to database
    const conversion = new Conversion({
      fileName: req.file.originalname,
      fromFormat: fromFormat.toLowerCase(),
      toFormat: toFormat.toLowerCase(),
      status: 'success',
      fileUrl: result.fileUrl,
      fileSize: req.file.size
    });

    await conversion.save();

    res.json({
      success: true,
      fileUrl: result.fileUrl,
      fileName: result.fileName,
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
```

### **Step 4: Install Required Packages**

For each API you use, install its package:

```bash
# For ConvertAPI (already installed)
npm install convertapi

# For CloudConvert
npm install cloudconvert

# For Zamzar
npm install axios form-data

# For Aspose
npm install axios form-data
```

### **Step 5: Test Your New API**

```bash
# Restart the server
npm run dev

# Test conversion
curl -X POST http://localhost:5000/api/convert \
  -F "file=@test.pdf" \
  -F "fromFormat=pdf" \
  -F "toFormat=docx"
```

---

## 🎯 Quick Comparison: Which API to Choose?

### **ConvertAPI** ✅ Current
- ✅ Simple to use
- ✅ Fast conversions
- ✅ Good documentation
- ✅ $15-200/month
- ❌ Limited free tier

### **CloudConvert** ⭐ Recommended
- ✅ Best documentation
- ✅ Most formats supported
- ✅ Very fast
- ✅ Free tier available
- ✅ Async processing
- ✅ Webhooks support
- ❌ Slightly more complex

### **Zamzar**
- ✅ Pay-as-you-go (no monthly fees)
- ✅ Reliable
- ✅ Simple API
- ❌ Slower than others
- ❌ No free tier
- ❌ Requires polling

### **Aspose.Cloud**
- ✅ Comprehensive
- ✅ Multiple services
- ✅ Good support
- ❌ Complex setup
- ❌ Premium pricing

---

## 📝 Common Changes per API

### **Switching from ConvertAPI to CloudConvert**

1. **Update `.env`:**
   ```env
   CONVERSION_SERVICE=cloudconvert
   CLOUDCONVERT_API_KEY=your_key_here
   ```

2. **Install package:**
   ```bash
   npm install cloudconvert
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

Done! ✅ No other changes needed.

### **Switching from ConvertAPI to Zamzar**

1. **Update `.env`:**
   ```env
   CONVERSION_SERVICE=zamzar
   ZAMZAR_API_KEY=your_key_here
   ```

2. **Install packages:**
   ```bash
   npm install axios form-data
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

Done! ✅

---

## 🔧 Adding a New API

### **Step 1: Add to `conversionService.js`**

```javascript
// Add your new API function
async function convertWithMyAPI(file, fromFormat, toFormat) {
  // Your conversion logic here
  return {
    fileUrl: 'https://example.com/converted-file.pdf',
    fileName: `${file.originalname.split('.')[0]}.${toFormat}`,
  };
}

// Add to the services object
const CONVERSION_SERVICES = {
  convertapi: convertWithConvertAPI,
  cloudconvert: convertWithCloudConvert,
  zamzar: convertWithZamzar,
  myapi: convertWithMyAPI, // Add here
};
```

### **Step 2: Update `.env`**

```env
CONVERSION_SERVICE=myapi
MYAPI_KEY=your_key_here
```

### **Step 3: Restart and Test**

```bash
npm run dev
```

---

## ❌ Troubleshooting

### **"Conversion service not found"**
- Check `CONVERSION_SERVICE` value in `.env`
- Must match: `convertapi`, `cloudconvert`, `zamzar`, or `aspose`
- Restart server after changing `.env`

### **"API key not found"**
- Check `.env` file has correct variable name
- Make sure `process.env.XXX_API_KEY` matches
- Restart server

### **"Unknown format"**
- Not all APIs support all formats
- Add format validation
- Check API documentation for supported formats

### **"Timeout or slow conversion"**
- Some APIs take longer
- Increase timeout in polling loop
- Consider using webhook instead of polling

---

## 💡 Best Practices

1. **Always use `.env` for credentials** - Never hardcode API keys
2. **Test with different formats** - Some APIs have limitations
3. **Monitor API usage** - Track costs and conversion count
4. **Implement retry logic** - Handle temporary failures
5. **Use abstraction layer** - Makes switching easier
6. **Log everything** - Debug faster
7. **Cache results** - Reduce API calls for identical requests
8. **Set timeouts** - Prevent hanging requests

---

## 📚 Resources

- [CloudConvert API Docs](https://cloudconvert.com/api/docs)
- [Zamzar API Docs](https://www.zamzar.com/api/reference)
- [Aspose Cloud API](https://products.aspose.cloud/)
- [ConvertAPI Docs](https://www.convertapi.com/doc)
- [ILovePDF API](https://www.ilovepdf.com/api)

---

## 🎉 Summary

**To switch APIs:**
1. Change `CONVERSION_SERVICE` in `.env`
2. Add API key to `.env`
3. Restart server
4. Done! 🚀
