# 🚀 Deploying to Render - Complete Guide

This guide will help you deploy your file format converter to Render hosting.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Prepare Your Project](#prepare-your-project)
3. [Deployment Options](#deployment-options)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Configuration](#configuration)
6. [Troubleshooting](#troubleshooting)
7. [Costs & Limits](#costs--limits)

---

## Prerequisites

- ✅ GitHub account with repository pushed
- ✅ Render account (free: https://render.com)
- ✅ Project pushed to GitHub (public or private)
- ✅ Environment variables ready

---

## Prepare Your Project

### 1. Create `render.yaml` in Root Directory

Create a file called `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: file-converter-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: file-converter-db
          property: connectionString
      - key: CONVERSION_SERVICE
        value: convertapi
      - key: CONVERTAPI_API_KEY
        sync: false
      - key: CORS_ORIGIN
        value: https://<your-frontend-url>.onrender.com

  - type: web
    name: file-converter-frontend
    env: static
    region: oregon
    plan: free
    buildCommand: npm run build
    staticPublishPath: dist
    routes:
      - path: /
        destination: /index.html

  - type: postgresql
    name: file-converter-db
    plan: free
    region: oregon
```

### 2. Update Backend `server.js` for Render

Add port configuration:

```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

### 3. Update `package.json` (Root)

Add build script:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "dev:frontend": "vite",
    "dev:backend": "cd backend && npm run dev",
    "dev:full": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build:dev": "vite build --mode development",
    "lint": "eslint ."
  }
}
```

### 4. Update Backend `package.json`

Ensure `start` script is correct:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test:converter": "node test-opensource.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  }
}
```

---

## Deployment Options

### Option 1: Using `render.yaml` (Recommended)
**Best for:** Full stack deployment, auto-deployment from GitHub

**Pros:**
- ✅ One-command deployment
- ✅ Auto-deploy on git push
- ✅ Infrastructure as code
- ✅ Easy to version control

**Cons:**
- ❌ Free tier limitations
- ❌ Can't use ImageMagick/LibreOffice (no system packages)

### Option 2: Manual Deployment
**Best for:** Quick testing, individual services

**Pros:**
- ✅ Flexible configuration
- ✅ Easier debugging
- ✅ More control per service

**Cons:**
- ❌ More manual steps
- ❌ No auto-deploy

### Option 3: Docker Deployment
**Best for:** Complex setups with system dependencies

**Pros:**
- ✅ Can include ImageMagick/LibreOffice
- ✅ Reproducible environment
- ✅ Better control

**Cons:**
- ❌ More complex setup
- ❌ Larger file size

---

## Step-by-Step Deployment

### Method 1: Using `render.yaml` (Easiest)

#### Step 1: Commit and Push to GitHub

```powershell
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

#### Step 2: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

#### Step 3: Deploy with Blueprint

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Select your repository
4. Review configuration from `render.yaml`
5. Add environment variables:
   - `CONVERTAPI_API_KEY`: Your ConvertAPI key
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: 3000 (optional)
6. Click **"Create Blueprint"**

#### Step 4: Wait for Deployment

- Frontend: ~2-3 minutes
- Backend: ~5-10 minutes
- Database: Created automatically

---

### Method 2: Manual Deployment

#### Step 2A: Deploy Backend Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `file-converter-backend`
   - **Environment:** `Node`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (or Starter if you need more)

5. Add Environment Variables:
   ```
   PORT=3000
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/fileconverter
   CONVERSION_SERVICE=convertapi
   CONVERTAPI_API_KEY=your_api_key_here
   CORS_ORIGIN=https://your-frontend.onrender.com
   ```

6. Click **"Create Web Service"**

#### Step 2B: Deploy Frontend Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `file-converter-frontend`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** Free

5. Click **"Create Static Site"**

#### Step 2C: Create MongoDB Database

**Option A: Use MongoDB Atlas (Recommended)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Add to backend environment variables

**Option B: Use Render PostgreSQL (for non-MongoDB setup)**

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure and create
3. Get connection string

---

## Configuration

### Environment Variables Setup

#### Backend Environment Variables

```env
# Server
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fileconverter

# Conversion Service
CONVERSION_SERVICE=convertapi
CONVERTAPI_API_KEY=your_convertapi_key

# Frontend URL (for CORS)
CORS_ORIGIN=https://your-frontend-url.onrender.com

# Optional: Free Converter
USE_OPENSOURCE=false
```

#### Get Environment Variables

**ConvertAPI Key:**
1. Go to https://www.convertapi.com
2. Sign up (free plan available)
3. Get API key from dashboard
4. Add to Render environment

**MongoDB URI:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Replace username and password
5. Add to Render environment

### Update CORS Configuration

In `backend/server.js`:

```javascript
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
```

### Update API Endpoints

In frontend, create `src/config.ts`:

```typescript
export const API_BASE_URL = 
  import.meta.env.PROD 
    ? 'https://your-backend-url.onrender.com'
    : 'http://localhost:3000';
```

Use in API calls:

```typescript
const response = await fetch(`${API_BASE_URL}/api/convert`, {
  method: 'POST',
  body: formData,
});
```

---

## Important Limitations on Render

### Free Plan Limits

| Resource | Limit |
|----------|-------|
| **Compute** | 0.5 CPU |
| **Memory** | 512 MB |
| **Requests** | Limited |
| **Cold Starts** | 15 minutes inactivity = pause |
| **Sleep** | Auto-pause after 15 min inactivity |
| **Bandwidth** | Limited |

### What You CAN'T Do on Render Free

❌ Install system packages (ImageMagick, LibreOffice)
❌ Run heavy computations
❌ Support concurrent users
❌ Use real-time features

### What You CAN Do

✅ Small file conversions
✅ Use ConvertAPI/CloudConvert/Zamzar
✅ Store conversion history
✅ Serve static frontend

---

## Recommended Setup for Render

### Best Approach: Use Paid APIs

Since Render free tier can't run ImageMagick/LibreOffice, use external APIs:

```env
CONVERSION_SERVICE=cloudconvert
# or
CONVERSION_SERVICE=zamzar
# or
CONVERSION_SERVICE=convertapi
```

### Upgrade to Starter Plan

For better performance:
- **Cost:** $7/month per service
- **Benefits:** 
  - No cold starts
  - 1 GB RAM
  - Faster processing

```yaml
plan: starter  # instead of: free
```

---

## Deployment Workflow

```
1. Push to GitHub
         ↓
2. Render detects changes
         ↓
3. Render builds project
   - npm install
   - npm run build
         ↓
4. Render deploys services
   - Backend service
   - Frontend service
   - Database connected
         ↓
5. Services online
   - Backend: https://your-backend.onrender.com
   - Frontend: https://your-frontend.onrender.com
```

---

## Deployment Checklist

- [ ] `render.yaml` created in root
- [ ] Backend `server.js` has `PORT` configuration
- [ ] `package.json` scripts are correct
- [ ] `.env` is in `.gitignore`
- [ ] Repository pushed to GitHub
- [ ] Render account created
- [ ] ConvertAPI key obtained
- [ ] MongoDB Atlas cluster created
- [ ] Blueprint deployed OR manual services created
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Frontend API endpoints updated
- [ ] Test deployment

---

## Troubleshooting

### Issue: Build Fails

**Error:** `npm ERR! code ENOENT`

**Solution:**
```yaml
buildCommand: cd backend && npm install && cd ..
```

### Issue: CORS Errors in Frontend

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
1. Check CORS_ORIGIN env variable
2. Update backend CORS config
3. Verify frontend API URL

```javascript
// In backend/server.js
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
```

### Issue: Database Connection Failed

**Error:** `MongoNetworkError`

**Solution:**
1. Check MongoDB URI is correct
2. Whitelist Render IP in MongoDB Atlas:
   - Go to MongoDB Atlas
   - Click "Network Access"
   - Add IP: `0.0.0.0/0` (allows all)
3. Test connection locally first

### Issue: Service Won't Start

**Error:** `Error: listen EADDRINUSE`

**Solution:**
```javascript
// In backend/server.js
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Issue: Cold Starts Taking Too Long

**Solution:**
- Upgrade to Starter plan ($7/month)
- Or accept 15-second cold start delay

### Issue: File Uploads Failing

**Problem:** Render resets file system on redeploy

**Solution 1:** Use Cloud Storage
```javascript
// Store uploads in AWS S3 or similar
const s3 = new AWS.S3();
await s3.upload({Bucket: 'my-bucket', Key: 'file.pdf'}).promise();
```

**Solution 2:** Use database for small files
```javascript
const conversionSchema = new Schema({
  file: Buffer,  // Store small files
  filename: String,
});
```

---

## Monitoring & Maintenance

### Check Logs

1. Go to Render Dashboard
2. Click your service
3. Click **"Logs"** tab
4. View real-time logs

### Monitor Performance

1. Click **"Metrics"** tab
2. Check:
   - CPU usage
   - Memory usage
   - Requests
   - Response times

### Set Up Alerts

1. Click **"Settings"** → **"Alerts"**
2. Configure email notifications
3. Set thresholds

---

## Costs & Pricing

### Free Plan
- **Cost:** Free
- **Limitations:** Cold starts, auto-pause, limited resources
- **Best for:** Development, testing

### Starter Plan
- **Cost:** $7/month per service
- **Features:** No cold starts, 1GB RAM, priority support
- **Best for:** Small production apps

### Standard Plan
- **Cost:** $12/month per service
- **Features:** 2GB RAM, auto-scaling, priority support
- **Best for:** Production apps with traffic

### Estimate Your Costs

| Component | Plan | Cost |
|-----------|------|------|
| Backend | Starter | $7/month |
| Frontend | Free | Free |
| Database | Free (MongoDB Atlas) | Free |
| **Total** | - | **~$7/month** |

---

## Next Steps

1. ✅ Create `render.yaml` in project root
2. ✅ Update environment variables
3. ✅ Push to GitHub
4. ✅ Deploy using Render Blueprint
5. ✅ Test all features
6. ✅ Monitor logs and performance
7. ✅ Set up error alerts

---

## Additional Resources

- **Render Docs:** https://render.com/docs
- **Render GitHub Integration:** https://render.com/docs/github
- **Render Environment Variables:** https://render.com/docs/environment-variables
- **Render Troubleshooting:** https://render.com/docs/troubleshooting

---

## Quick Reference

### Deploy Backend Only

```yaml
services:
  - type: web
    name: file-converter-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
```

### Deploy Frontend Only

```yaml
services:
  - type: web
    name: file-converter-frontend
    env: static
    buildCommand: npm run build
    staticPublishPath: dist
```

### Redeploy Manually

1. Make changes locally
2. Push to GitHub: `git push origin main`
3. Render automatically redeploys
4. Check logs for errors

---

**Happy Hosting! 🚀**

For questions, check Render documentation or open an issue on GitHub.
