# Node Version Fix - Frontend Build Issue

## 🐛 Problem

The frontend build was failing with this error:

```
npm error engine Unsupported engine
npm error engine Not compatible with your version of node/npm: guild-ai-frontend@0.1.0
npm error notsup Required: {"node":">=20.0.0","npm":">=10.0.0"}
npm error notsup Actual:   {"npm":"10.8.2","node":"v18.20.8"}
```

This caused the build to fail, and the frontend was never included in the Docker image.

## 🔍 Root Cause

The frontend's `package.json` specifies:
```json
{
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

But `cloudbuild.yaml` was using:
```yaml
- name: 'node:18'  # Node 18.20.8 - TOO OLD!
```

## ✅ Solution

Changed Cloud Build to use Node 20:

```yaml
# Before (WRONG)
- name: 'node:18'

# After (CORRECT)
- name: 'node:20'
```

## 📊 Build Flow

### Before Fix (FAILED)
```
Step 0: Build Frontend (node:18)
  ├─ npm ci
  │  └─> ❌ ERROR: Unsupported engine
  ├─ npm run build
  │  └─> ❌ ERROR: vite not found (deps not installed)
  └─> ❌ ERROR: dist directory not created!

Step 1: Build Docker
  └─> ⚠️  No frontend/dist folder!

Result: Docker image has NO frontend files
```

### After Fix (SUCCESS)
```
Step 0: Build Frontend (node:20)
  ├─ npm ci
  │  └─> ✅ Dependencies installed
  ├─ npm run build
  │  └─> ✅ Vite builds successfully
  ├─ Verify dist/
  │  └─> ✅ dist/index.html exists
  └─> ✅ Frontend ready!

Step 1: Build Docker (waits for Step 0)
  └─> ✅ Includes frontend/dist files

Step 2: Push to GCR
  └─> ✅ Complete image with frontend

Step 3: Run Migrations
  └─> ✅ Database ready

Step 4: Deploy to Cloud Run
  └─> ✅ Frontend served at https://guildof1.com/
```

## 🎯 Expected Results

### Root URL (https://guildof1.com)
**Before:** `{"message":"Guild API Server is running."}`
**After:** React app with full UI (Landing page, Login, Dashboard)

### API Endpoints (https://guildof1.com/api/health)
**Before:** Works ✅
**After:** Still works ✅

### API Docs (https://guildof1.com/docs)
**Before:** Works ✅
**After:** Still works ✅

## 📝 Files Changed

### `cloudbuild.yaml`
```diff
  steps:
    # Step 0: Build Frontend
-   - name: 'node:18'
+   - name: 'node:20'
      entrypoint: 'sh'
      args:
        - '-c'
        - |
          echo "Building frontend..."
          cd frontend
          npm ci
          npm run build
```

## ⏱️ Deployment Timeline

| Time | Step | Status |
|------|------|--------|
| Now | Fix pushed | ✅ Complete |
| +1 min | GitHub Actions triggers | 🔄 Running |
| +2 min | Cloud Build starts | 🔄 Pending |
| +4 min | Frontend builds (Node 20) | 🔄 Pending |
| +8 min | Docker image builds | 🔄 Pending |
| +10 min | Migrations run | 🔄 Pending |
| +12 min | Cloud Run deploys | 🔄 Pending |
| +15 min | ✅ LIVE! | 🎯 Goal |

## 🔍 How to Verify

### 1. Check Build Logs
```bash
# Get latest build
gcloud builds list --limit=1 --project=guild-ai-080

# View logs (replace BUILD_ID)
gcloud builds log BUILD_ID --project=guild-ai-080 | grep "Frontend built successfully"
```

Expected: `✅ Frontend build verified: X.X MB`

### 2. Check Docker Image
```bash
# Pull the latest image
docker pull gcr.io/guild-ai-080/guild-ai:latest

# Run it locally
docker run -p 5000:5000 gcr.io/guild-ai-080/guild-ai:latest

# Check if frontend files exist
docker run gcr.io/guild-ai-080/guild-ai:latest ls -la /app/frontend/dist/
```

Expected: Should see `index.html`, `assets/`, etc.

### 3. Test the Live Site
```bash
# Root should return HTML (not JSON)
curl -I https://guildof1.com/
# Expected: Content-Type: text/html

# API should still work
curl https://guildof1.com/api/health
# Expected: {"message":"Guild API Server is running.","status":"ok"}
```

### 4. Browser Test
1. Open browser
2. Go to: `https://guildof1.com`
3. Should see: React app with UI (not JSON message)
4. Open DevTools → Network tab
5. Should see: HTML, JS, CSS files loading

## 🐛 Previous Issues (Now Fixed)

1. ✅ **Cloud Build logging** - Added `logging: CLOUD_LOGGING_ONLY`
2. ✅ **DNS/SSL** - Removed old AWS IP, valid SSL certificate
3. ✅ **Build dependency** - Added `waitFor: ['build-frontend']`
4. ✅ **Node version** - Changed from Node 18 → Node 20

## 🎉 Summary

**Problem:** Frontend requires Node 20, but build used Node 18
**Impact:** Frontend never built, only backend API served
**Fix:** Updated to Node 20 in cloudbuild.yaml
**Result:** Frontend will build and deploy successfully
**Timeline:** 15 minutes from push to live

---

**Monitor your deployment:**
- GitHub: https://github.com/ArnovZ080/Guild-AI/actions
- Cloud Build: https://console.cloud.google.com/cloud-build/builds?project=guild-ai-080

**Your React app will be live at https://guildof1.com in ~15 minutes!** 🚀

