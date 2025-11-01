# File Converter Backend API

A Node.js/Express backend for file conversion using ConvertAPI and MongoDB.

## Features

- 🔄 File format conversion using ConvertAPI
- 📦 MongoDB for conversion history
- 🚀 RESTful API
- 📝 Comprehensive error handling
- 💾 File upload support with Multer

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- ConvertAPI account (free tier available)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
MONGODB_URI=mongodb://localhost:27017/file-converter
CONVERTAPI_SECRET=your_actual_secret_key
PORT=5000
```

### 3. Get ConvertAPI Secret Key

1. Sign up at [ConvertAPI](https://www.convertapi.com/)
2. Free tier includes 250 conversions/month
3. Copy your secret key from the dashboard
4. Add it to your `.env` file

### 4. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
# Windows: Download from mongodb.com

# Start MongoDB
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will run at `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /api/health
```

### Convert File
```
POST /api/convert
Content-Type: multipart/form-data

Body:
- file: File (required)
- fromFormat: string (required, e.g., "pdf")
- toFormat: string (required, e.g., "docx")
```

### Get Conversion History
```
GET /api/history?limit=10
```

### Get Specific Conversion
```
GET /api/conversion/:id
```

## Testing with curl

```bash
# Health check
curl http://localhost:5000/api/health

# Convert file
curl -X POST http://localhost:5000/api/convert \
  -F "file=@/path/to/your/file.pdf" \
  -F "fromFormat=pdf" \
  -F "toFormat=docx"

# Get history
curl http://localhost:5000/api/history
```

## Frontend Integration

Update your frontend's API base URL to:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Deployment Options

### Railway.app
1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables
4. Deploy automatically

### Render.com
1. Create new Web Service
2. Connect GitHub repo
3. Set environment variables
4. Deploy

### Heroku
```bash
heroku create your-app-name
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set CONVERTAPI_SECRET=your_secret
git push heroku main
```

## Supported Formats

ConvertAPI supports 200+ formats including:

**Documents**: PDF, DOCX, DOC, TXT, RTF, ODT, HTML
**Images**: JPG, PNG, GIF, BMP, TIFF, WEBP, SVG
**Videos**: MP4, AVI, MOV, WMV, FLV, MKV
**Audio**: MP3, WAV, OGG, AAC, FLAC, M4A
**And many more...**

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas, whitelist your IP address

### ConvertAPI Error
- Verify secret key is correct
- Check conversion limits (free tier: 250/month)
- Ensure format combination is supported

### Port Already in Use
```bash
# Change PORT in .env or kill existing process
lsof -ti:5000 | xargs kill -9
```

## Project Structure

```
backend/
├── server.js           # Main Express application
├── models/
│   └── Conversion.js   # MongoDB schema
├── package.json        # Dependencies
├── .env               # Environment variables (create this)
├── .env.example       # Environment template
└── README.md          # This file
```

## License

ISC
