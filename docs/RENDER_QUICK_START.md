# 🚀 Render Quick Start (5 Minutes)

Get your file converter running on Render in minutes!

---

## The Fastest Path

### Step 1: Get Your Secrets Ready

Before starting, gather these:

```
✅ ConvertAPI Key (from https://convertapi.com)
✅ MongoDB URI (from https://mongodb.com/cloud/atlas)
✅ GitHub Repository URL
```

### Step 2: Add `render.yaml` to Root

Copy this to `render.yaml` in your project root:

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
      - key: CONVERTAPI_API_KEY
        sync: false

  - type: web
    name: file-converter-frontend
    env: static
    region: oregon
    plan: free
    buildCommand: npm run build
    staticPublishPath: dist
```

### Step 3: Push to GitHub

```powershell
git add render.yaml
git commit -m "Add Render deployment config"
git push origin main
```

### Step 4: Deploy on Render

1. Go to https://render.com/dashboard
2. Click **"New"** → **"Blueprint"**
3. Select your repository
4. Click **"Create Blueprint"**
5. Add your secrets:
   - `CONVERTAPI_API_KEY`: Your key
   - `MONGODB_URI`: Your connection string
6. Click **"Deploy"**

### Step 5: Wait & Access

- **Backend:** https://your-backend-name.onrender.com
- **Frontend:** https://your-frontend-name.onrender.com

✅ **Done!** Your converter is live!

---

## Environment Variables Needed

### Backend Variables

```
CONVERTAPI_API_KEY=your_key_here
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-frontend.onrender.com
```

### How to Get Each

**ConvertAPI Key:**
- Sign up at https://convertapi.com (free plan)
- Get key from Dashboard
- ~100 free conversions/month

**MongoDB URI:**
- Sign up at https://mongodb.com/cloud/atlas
- Create free cluster
- Click "Connect"
- Copy connection string
- Replace `<password>` with your password

---

## After Deployment

### Test Your Deployment

```bash
# Test backend
curl https://your-backend.onrender.com/api/health

# Test frontend
# Open in browser: https://your-frontend.onrender.com
```

### Update Frontend API URL

Create `src/config.ts`:

```typescript
export const API_BASE_URL = 
  import.meta.env.PROD 
    ? 'https://your-backend.onrender.com'
    : 'http://localhost:3000';
```

Use it:

```typescript
import { API_BASE_URL } from '@/config';

fetch(`${API_BASE_URL}/api/convert`, {...})
```

---

## Common Issues

| Issue | Fix |
|-------|-----|
| **CORS Error** | Add frontend URL to `CORS_ORIGIN` env var |
| **DB Connection Failed** | Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access |
| **Build Fails** | Check `buildCommand` path in `render.yaml` |
| **Service Won't Start** | Check logs: Dashboard → Service → Logs tab |
| **Cold Starts** | Normal on free plan, upgrade to Starter for always-on |

---

## Upgrade to Starter (Optional)

For production use ($7/month):

```yaml
plan: starter
```

**Benefits:**
- ✅ No cold starts
- ✅ 1 GB RAM (vs 512 MB)
- ✅ Always running
- ✅ Better performance

---

## Auto-Deploy from GitHub

After first deployment, Render auto-deploys when you push:

```powershell
# Make changes
git add .
git commit -m "Your message"
git push origin main
# Render automatically redeploys!
```

---

## Delete & Redeploy

If something breaks:

1. Go to Render Dashboard
2. Select service
3. Click **Settings** → **Delete Service**
4. Create new Blueprint (steps above)

---

**Need More Help?**
- Read: `RENDER_DEPLOYMENT_GUIDE.md` (full guide)
- Visit: https://render.com/docs
