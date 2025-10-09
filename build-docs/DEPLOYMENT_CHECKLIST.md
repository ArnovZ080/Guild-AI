# Guild-AI Cloud Run Deployment Checklist

## ✅ Code Changes Completed

All necessary code modifications have been implemented to make Guild-AI Cloud Run ready.

### 1. Database Connection (Cloud SQL)
- [x] **File:** `api_server/src/database.py`
- [x] Added Cloud SQL Proxy detection via `CLOUDSQL_CONNECTION_NAME`
- [x] Implemented Secret Manager integration for password retrieval
- [x] Maintained backward compatibility with local Docker

### 2. LLM Provider (Vertex AI)
- [x] **File:** `guild/src/core/llm_client.py`
- [x] Added `VertexAIProvider` class
- [x] Updated `LlmClient` to support `vertex_ai` provider
- [x] Modified factory function to check `LLM_PROVIDER` env var
- [x] Integrated with existing `VertexAIClient`

### 3. Redis/Memorystore
- [x] **File:** `api_server/src/celery_app.py`
- [x] Updated broker and result backend to use env vars
- [x] Added support for Memorystore IP configuration
- [x] Maintained backward compatibility for local development

### 4. Build Configuration
- [x] **File:** `cloudbuild.yaml` (NEW)
- [x] Created automated CI/CD pipeline
- [x] Configured Docker build and push
- [x] Set up Cloud Run deployment with all env vars
- [x] Added Cloud SQL connection configuration

### 5. Dependencies
- [x] **File:** `api_server/requirements.txt`
- [x] Added `google-cloud-secret-manager>=2.16.0`
- [x] Added `google-cloud-aiplatform>=1.35.0`
- [x] Added `vertexai>=1.0.0`

## 🚀 Ready to Deploy

The codebase is now ready for Cloud Run deployment. Use one of the following methods:

### Method 1: Cloud Build (Recommended)
```bash
gcloud builds submit --config=cloudbuild.yaml .
```

### Method 2: Manual Deployment
```bash
# Build
docker build -t gcr.io/guild-ai-080/guild-ai:latest -f ./api_server/Dockerfile .

# Push
docker push gcr.io/guild-ai-080/guild-ai:latest

# Deploy
gcloud run deploy guild-ai-api \
  --image gcr.io/guild-ai-080/guild-ai:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 5000 \
  --memory 2Gi \
  --cpu 2 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=guild-ai-080,CLOUDSQL_CONNECTION_NAME=guild-ai-080:us-central1:guild-ai-sql,POSTGRES_USER=postgres,POSTGRES_DB=workflow_db,DB_SECRET_NAME=db-root-password,REDIS_HOST=10.87.64.4,REDIS_PORT=6379,LLM_PROVIDER=vertex_ai,VERTEX_AI_LOCATION=us-central1,VERTEX_AI_MODEL=gemini-pro" \
  --add-cloudsql-instances guild-ai-080:us-central1:guild-ai-sql \
  --service-account guild-ai-cloud-run-sa@guild-ai-080.iam.gserviceaccount.com
```

## 📋 Required Environment Variables

### For Cloud Run:
```
GOOGLE_CLOUD_PROJECT=guild-ai-080
CLOUDSQL_CONNECTION_NAME=guild-ai-080:us-central1:guild-ai-sql
POSTGRES_USER=postgres
POSTGRES_DB=workflow_db
DB_SECRET_NAME=db-root-password
REDIS_HOST=10.87.64.4
REDIS_PORT=6379
LLM_PROVIDER=vertex_ai
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-pro
FASTAPI_APP_ENV=production
```

### For Local Development:
```
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=workflow_db
REDIS_HOST=redis
REDIS_PORT=6379
LLM_PROVIDER=ollama
OLLAMA_HOST=http://ollama:11434
```

## 🔍 Post-Deployment Verification

After deployment, verify:

1. **Service is running:**
   ```bash
   gcloud run services describe guild-ai-api --region us-central1
   ```

2. **Health check passes:**
   ```bash
   SERVICE_URL=$(gcloud run services describe guild-ai-api --region us-central1 --format="value(status.url)")
   curl $SERVICE_URL/health
   ```

3. **Database connectivity:**
   ```bash
   gcloud run logs read guild-ai-api --region us-central1 --limit 20
   ```

4. **Check for errors:**
   ```bash
   gcloud run logs read guild-ai-api --region us-central1 --limit 100 | grep -i error
   ```

## 📊 Key Implementation Details

### Database Connection Logic
```python
if CLOUDSQL_CONNECTION_NAME is set:
    # Cloud Run: Use Unix socket
    host = f"/cloudsql/{CLOUDSQL_CONNECTION_NAME}"
    password = get_from_secret_manager()
else:
    # Local: Standard connection
    host = POSTGRES_HOST
    password = POSTGRES_PASSWORD
```

### LLM Provider Selection
```python
Priority:
1. LLM_PROVIDER env var (explicit)
2. TOGETHER_API_KEY (if set)
3. Ollama (fallback)
```

### Redis Configuration
```python
broker_url = os.getenv(
    'CELERY_BROKER_URL',
    f"redis://{REDIS_HOST}:{REDIS_PORT}/0"
)
```

## ⚠️ Important Notes

1. **Secret Manager:** Ensure `db-root-password` secret exists in Secret Manager
2. **Service Account:** Verify `guild-ai-cloud-run-sa` has required permissions:
   - `roles/cloudsql.client`
   - `roles/secretmanager.secretAccessor`
   - `roles/aiplatform.user`
3. **VPC Network:** Memorystore must be in same VPC as Cloud Run
4. **Vertex AI:** Ensure Vertex AI API is enabled in the project

## 🎯 Next Steps

1. **Test locally first:**
   ```bash
   docker-compose up -d
   curl http://localhost:5000/health
   ```

2. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "feat: Cloud Run implementation with Cloud SQL, Vertex AI, and Memorystore"
   git push origin main
   ```

3. **Deploy to Cloud Run:**
   ```bash
   gcloud builds submit --config=cloudbuild.yaml .
   ```

4. **Monitor deployment:**
   ```bash
   gcloud run logs tail guild-ai-api --region us-central1
   ```

## 📚 Documentation

For detailed information, see:
- [`CLOUD_RUN_IMPLEMENTATION.md`](./CLOUD_RUN_IMPLEMENTATION.md) - Full implementation guide
- [`GOOGLE_CLOUD_MIGRATION_GUIDE.md`](./GOOGLE_CLOUD_MIGRATION_GUIDE.md) - Infrastructure setup

---

**Status:** ✅ Ready for Deployment  
**Last Updated:** October 8, 2025  
**Implementation:** Complete

