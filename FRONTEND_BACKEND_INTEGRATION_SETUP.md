# 🎯 Frontend + Backend Integration - Single Service Deployment

## The Problem

When visiting `https://guildof1.com`, users were seeing:
```json
{"message": "Guild API Server is running."}
```

Instead of the beautiful React frontend.

## The Solution ✅

**Serve frontend static files from the FastAPI backend** - Single Cloud Run service for everything!

---

## What's Been Implemented

### 1. **Backend Serves Frontend** (`api_server/src/main.py`)

```python
# Serve frontend static files (must be last!)
frontend_dist = "/app/frontend/dist"
if os.path.exists(frontend_dist):
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")
```

**How it works:**
- All API routes mounted first (`/auth`, `/subscription`, `/onboarding`, etc.)
- Frontend served at root `/` (catches everything else)
- React Router handles frontend navigation
- API calls go to backend endpoints

### 2. **Frontend Build in CI/CD** (`cloudbuild.yaml`)

```yaml
# Step 0: Build Frontend
- name: 'node:18'
  args:
    - cd frontend
    - npm ci
    - echo "VITE_API_URL=https://guildof1.com" > .env.production
    - npm run build
```

**Output:** `frontend/dist/` folder with compiled React app

### 3. **Docker Image Includes Frontend** (`api_server/Dockerfile`)

```dockerfile
# Copy all project files (including frontend/dist)
COPY . .
```

**Result:** Docker image contains both backend and frontend!

### 4. **Production API URL**

Frontend `.env.production`:
```bash
VITE_API_URL=https://guildof1.com
```

**Important:** API calls go to **same domain**, no CORS issues!

---

## Complete Architecture

```
User visits: https://guildof1.com
                    ↓
            Cloud Run Service
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
   FastAPI Backend        React Frontend
        ↓                       ↓
   API Endpoints           Static Files
   /auth/*                index.html
   /subscription/*        assets/
   /onboarding/*          *.js, *.css
   /orchestrator/*
        ↓
   PostgreSQL
```

**Routing:**
- `/` → `index.html` (React app)
- `/pricing` → `index.html` (React Router handles it)
- `/dashboard` → `index.html` (React Router handles it)
- `/auth/login` → FastAPI backend (API endpoint)
- `/subscription/plans` → FastAPI backend (API endpoint)

---

## Setup Required (One-Time)

### Store Firebase Secrets in Secret Manager

You need to add Firebase config to Google Cloud Secret Manager so the CI/CD can use them:

```bash
# Get your Firebase config from frontend/.env
# Then create secrets:

gcloud secrets create firebase-api-key \
  --data-file=<(echo -n "YOUR_FIREBASE_API_KEY") \
  --project=guild-ai-080

gcloud secrets create firebase-auth-domain \
  --data-file=<(echo -n "guild-ai-080.firebaseapp.com") \
  --project=guild-ai-080

gcloud secrets create firebase-project-id \
  --data-file=<(echo -n "guild-ai-080") \
  --project=guild-ai-080

gcloud secrets create firebase-storage-bucket \
  --data-file=<(echo -n "guild-ai-080.firebasestorage.app") \
  --project=guild-ai-080

gcloud secrets create firebase-messaging-sender-id \
  --data-file=<(echo -n "YOUR_MESSAGING_SENDER_ID") \
  --project=guild-ai-080

gcloud secrets create firebase-app-id \
  --data-file=<(echo -n "YOUR_FIREBASE_APP_ID") \
  --project=guild-ai-080
```

### Grant GitHub Actions Access

```bash
# Allow the GitHub Actions service account to read these secrets
gcloud secrets add-iam-policy-binding firebase-api-key \
  --member="serviceAccount:github-actions-deployer@guild-ai-080.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=guild-ai-080

# Repeat for other secrets...
```

---

## Build Process Flow

### CI/CD Pipeline:

```
1. Code pushed to main branch
   ↓
2. GitHub Actions triggered
   ↓
3. Get secrets from Secret Manager
   ↓
4. Build Frontend:
   - npm ci (install dependencies)
   - Create .env.production with VITE_API_URL=https://guildof1.com
   - npm run build → Creates frontend/dist/
   ↓
5. Build Docker Image:
   - Copies entire project (including frontend/dist)
   - Installs Python dependencies
   ↓
6. Push to Container Registry
   ↓
7. Run Database Migrations
   ↓
8. Deploy to Cloud Run
   ↓
9. Service Live at https://guildof1.com
```

---

## File Structure in Docker Image

```
/app/
├── api_server/
│   ├── src/
│   │   ├── main.py (serves frontend + API)
│   │   ├── routes/
│   │   └── ...
│   └── requirements.txt
├── frontend/
│   └── dist/  ← Built frontend
│       ├── index.html
│       ├── assets/
│       │   ├── index-abc123.js
│       │   └── index-def456.css
│       └── ...
└── guild/
    └── src/
        └── agents/
```

---

## Testing

### Local Testing (Before Deployment):

```bash
# Build frontend locally
cd frontend
npm run build

# Run backend (it will serve frontend)
cd ../api_server
uvicorn src.main:app --reload

# Visit http://localhost:8000
# Should see React app, not JSON response!
```

### Production Testing (After Deployment):

```bash
# Visit your domain
curl https://guildof1.com

# Should return HTML, not JSON:
# <!doctype html>
# <html lang="en">
# ...

# API endpoints still work:
curl https://guildof1.com/health
# {"status": "ok"}

curl https://guildof1.com/api/health
# {"message": "Guild API Server is running.", "status": "ok"}
```

---

## Troubleshooting

### Issue: Still seeing JSON response at root

**Check:**
1. Frontend dist folder exists in Docker image
2. Backend main.py has StaticFiles mount
3. Mount is at the END of the file (after all API routes)

**Fix:**
```python
# Ensure this is LAST in main.py
app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend")
```

### Issue: 404 errors for frontend routes

**Cause:** React Router routes not being handled

**Fix:** `html=True` in StaticFiles mount (already done!)
- This serves `index.html` for all non-file requests
- React Router then handles the routing

### Issue: API calls returning HTML instead of JSON

**Cause:** Frontend mount catching API routes

**Fix:** Ensure all API routes are registered BEFORE the StaticFiles mount

---

## Environment Variables Summary

### Development (frontend/.env):
```bash
VITE_API_URL=http://localhost:8000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Production (created by cloudbuild.yaml):
```bash
VITE_API_URL=https://guildof1.com  ← Same domain!
VITE_FIREBASE_API_KEY=... (from Secret Manager)
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Benefits of Single Service Deployment

### ✅ **Simpler Architecture:**
- One Cloud Run service (not two)
- No load balancer needed
- Easier to manage

### ✅ **No CORS Issues:**
- Frontend and API on same domain
- No cross-origin requests
- Simpler security

### ✅ **Lower Cost:**
- One service = one bill
- No load balancer costs
- No Firebase Hosting costs

### ✅ **Faster:**
- No extra network hop
- Frontend and API co-located
- Better performance

---

## Next Steps

### Before First Deployment with Frontend:

1. **Add Firebase secrets to Secret Manager:**
   ```bash
   # Run the gcloud secrets create commands above
   # Use your actual Firebase values from frontend/.env
   ```

2. **Grant GitHub Actions access:**
   ```bash
   # Run the gcloud secrets add-iam-policy-binding commands
   ```

3. **Push to trigger deployment:**
   ```bash
   git push origin main
   ```

4. **Wait for deployment** (~20 minutes)

5. **Test:**
   ```bash
   curl https://guildof1.com
   # Should return HTML!
   
   # Visit in browser
   open https://guildof1.com
   # Should see your beautiful React app!
   ```

---

## Manual Deployment Command

If you want to deploy manually instead of CI/CD:

```bash
# Build frontend first
cd frontend
npm ci
echo "VITE_API_URL=https://guildof1.com" > .env.production
# Add Firebase vars to .env.production
npm run build

# Deploy with Cloud Build
cd ..
DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-root-password --project=guild-ai-080)
FIREBASE_API_KEY=$(gcloud secrets versions access latest --secret=firebase-api-key --project=guild-ai-080)

gcloud builds submit --config=cloudbuild.yaml . \
  --substitutions=_DB_PASSWORD="$DB_PASSWORD",_FIREBASE_API_KEY="$FIREBASE_API_KEY",... \
  --project=guild-ai-080
```

---

**Your platform is now a unified, production-ready application!** 🎉

After deployment, `https://guildof1.com` will serve your React frontend, and all `/auth/*`, `/subscription/*` etc. routes will go to the FastAPI backend automatically.

