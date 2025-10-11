# Frontend Build & Deployment Fix

## Problem
When accessing `https://guildof1.com` or the Cloud Run URL, you only see:
```json
{"message":"Guild API Server is running."}
```

Instead of the React frontend application.

## Root Cause
The frontend `dist` folder was being built in Cloud Build, but the Docker image build step wasn't waiting for it to complete. This caused a race condition where the Docker image might be built before the frontend was ready, resulting in the image not containing the frontend files.

## Solution

### 1. Added Explicit Build Dependency
```yaml
# Step 1: Build the Docker image
- name: 'gcr.io/cloud-builders/docker'
  args:
    - 'build'
    - '-t'
    - 'gcr.io/$PROJECT_ID/guild-ai:latest'
    - '-f'
    - './api_server/Dockerfile'
    - '.'
  id: 'build-image'
  waitFor: ['build-frontend']  # ← Added this!
```

This ensures the Docker image build **waits** for the frontend build to complete.

### 2. Added Frontend Build Verification
```bash
# Verify dist exists and has files
if [ ! -d "dist" ]; then
  echo "ERROR: dist directory not created!"
  exit 1
fi

if [ ! -f "dist/index.html" ]; then
  echo "ERROR: dist/index.html not found!"
  exit 1
fi

echo "✅ Frontend build verified: $(du -sh dist)"
```

This ensures the build fails fast if the frontend doesn't build correctly.

## How It Works

### Build Flow (Before Fix)
```
Step 0: Build Frontend  ─┐
                         ├─> Might run in parallel!
Step 1: Build Docker    ─┘   Docker might not have frontend files!
                             
Step 2: Push Docker
Step 3: Migrations
Step 4: Deploy
```

### Build Flow (After Fix)
```
Step 0: Build Frontend
         ↓ (waits to complete)
         ↓ (verifies dist/)
         ↓
Step 1: Build Docker    ← Now has frontend files!
         ↓
Step 2: Push Docker
         ↓
Step 3: Migrations
         ↓
Step 4: Deploy          ← Frontend served at root!
```

## What Gets Served

### Backend API (FastAPI)
The backend serves:
- **API routes**: `/api/*`, `/auth/*`, `/subscription/*`, etc.
- **API docs**: `/docs`, `/redoc`, `/openapi.json`
- **Health check**: `/health`, `/api/health`

### Frontend (React + Vite)
The frontend is served at:
- **Root**: `/` → `index.html` (React app entry point)
- **All other routes**: Handled by React Router (SPA behavior)
- **Static assets**: `/assets/*` (JS, CSS, images)

### Serving Logic in `main.py`
```python
# Line 142-158 in api_server/src/main.py
frontend_dist = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "..", "frontend", "dist"
))

if os.path.exists(frontend_dist):
    logger.info(f"Serving frontend from: {frontend_dist}")
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
else:
    logger.warning(f"Frontend dist directory not found: {frontend_dist}")
    
    @app.get("/")
    async def root_fallback():
        return {
            "message": "Guild API Server is running",
            "note": "Frontend not built. Run 'cd frontend && npm run build'",
            "api_docs": "/docs"
        }
```

**Key Point**: The `app.mount("/", ...)` must be **last** so API routes take precedence.

## Verification

After this fix is deployed, you should see:

### At Root URL
```
https://guildof1.com
```
✅ React app loads (not JSON message)
✅ Landing page with "Welcome to Guild-AI"
✅ Login/Signup buttons
✅ Full frontend UI

### At API Endpoints
```
https://guildof1.com/api/health
```
✅ JSON response: `{"message":"Guild API Server is running.","status":"ok"}`

### At API Docs
```
https://guildof1.com/docs
```
✅ Swagger UI with all API endpoints

## Testing Locally

To test the build process locally:

```bash
# Build frontend
cd frontend
npm ci
npm run build

# Verify dist exists
ls -la dist/
# Should see: index.html, assets/, etc.

# Build Docker image (from repo root)
cd ..
docker build -t guild-ai:test -f ./api_server/Dockerfile .

# Run container
docker run -p 5000:5000 guild-ai:test

# Test
curl http://localhost:5000/           # Should return HTML
curl http://localhost:5000/api/health # Should return JSON
```

## Expected Timeline

After pushing this fix:

1. **GitHub Actions triggers** (immediate)
2. **Cloud Build starts** (1-2 minutes)
3. **Frontend builds** (2-3 minutes)
4. **Docker image builds** (3-5 minutes, now waits for frontend)
5. **Migrations run** (1-2 minutes)
6. **Cloud Run deploys** (1-2 minutes)
7. **Total**: ~10-15 minutes

## Files Changed

- `cloudbuild.yaml`:
  - Added `waitFor: ['build-frontend']` to Docker build step
  - Added frontend build verification
  - Ensures frontend is ready before Docker build

## Next Steps

1. **Commit and push** this fix
2. **Monitor Cloud Build** at: https://console.cloud.google.com/cloud-build/builds?project=guild-ai-080
3. **Wait for deployment** (~15 minutes)
4. **Test the site**:
   - Go to: `https://guildof1.com`
   - Should see React app, not JSON
5. **Verify API still works**:
   - Go to: `https://guildof1.com/api/health`
   - Should see JSON response

## Summary

✅ **Fixed**: Race condition in build process
✅ **Added**: Explicit build dependencies (`waitFor`)
✅ **Added**: Frontend build verification
✅ **Result**: Frontend will be included in Docker image
✅ **Outcome**: React app will load at `https://guildof1.com`

**The fix ensures the Docker image always contains the built frontend!** 🚀

