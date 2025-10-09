# Guild-AI Cloud Run Implementation Guide

This document describes the code changes made to make Guild-AI fully compatible with Google Cloud Run.

## ✅ Implementation Summary

All code modifications have been completed to enable Guild-AI to run seamlessly on Google Cloud Run while maintaining backward compatibility with local Docker development.

## 📋 Changes Made

### 1. Database Connection (Cloud SQL Proxy Support)

**File:** `api_server/src/database.py`

**Changes:**
- Added conditional logic to detect Cloud Run environment via `CLOUDSQL_CONNECTION_NAME` environment variable
- Implemented Cloud SQL Proxy Unix socket connection for production
- Integrated Google Cloud Secret Manager for secure password retrieval
- Maintained backward compatibility with local Docker development

**Key Environment Variables:**
- `CLOUDSQL_CONNECTION_NAME`: `guild-ai-080:us-central1:guild-ai-sql`
- `DB_SECRET_NAME`: `db-root-password`
- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID
- `POSTGRES_USER`: `postgres`
- `POSTGRES_DB`: `workflow_db`

**Code Logic:**
```python
if CLOUDSQL_CONNECTION_NAME is set:
    # Cloud Run: Use Unix socket
    host = f"/cloudsql/{CLOUDSQL_CONNECTION_NAME}"
    password = get_from_secret_manager()
else:
    # Local: Use standard host/port
    host = POSTGRES_HOST
    password = POSTGRES_PASSWORD
```

### 2. LLM Provider Switching (Vertex AI Integration)

**File:** `guild/src/core/llm_client.py`

**Changes:**
- Added `VertexAIProvider` class for Google Cloud Vertex AI
- Updated `LlmClient` to support `vertex_ai` provider
- Modified `get_llm_client()` factory to check `LLM_PROVIDER` environment variable
- Integrated with existing `VertexAIClient` for seamless Vertex AI access

**Key Environment Variables:**
- `LLM_PROVIDER`: `vertex_ai` (for Cloud Run) or `ollama` (for local)
- `VERTEX_AI_LOCATION`: `us-central1`
- `VERTEX_AI_MODEL`: `gemini-pro`
- `GOOGLE_CLOUD_PROJECT`: Your GCP project ID

**Provider Priority:**
1. `LLM_PROVIDER` environment variable (explicit choice)
2. Together.ai (if `TOGETHER_API_KEY` is set)
3. Ollama (fallback for local development)

### 3. Redis/Memorystore Configuration

**File:** `api_server/src/celery_app.py`

**Changes:**
- Updated Celery broker and result backend URLs to use environment variables
- Added fallback logic for local Docker development
- Support for Memorystore (managed Redis) on Cloud Run

**Key Environment Variables:**
- `REDIS_HOST`: `10.87.64.4` (Memorystore IP for Cloud Run) or `redis` (for local)
- `REDIS_PORT`: `6379`
- `CELERY_BROKER_URL`: Optional override
- `CELERY_RESULT_BACKEND`: Optional override

**Code Logic:**
```python
broker_url = os.getenv(
    'CELERY_BROKER_URL',
    f"redis://{os.getenv('REDIS_HOST', 'redis')}:{os.getenv('REDIS_PORT', '6379')}/0"
)
```

### 4. Cloud Build Configuration

**File:** `cloudbuild.yaml` (NEW)

**Purpose:** Automates building and deploying Guild-AI to Cloud Run

**Pipeline Steps:**
1. Build Docker image from `api_server/Dockerfile`
2. Push image to Google Container Registry (GCR)
3. Deploy to Cloud Run with all necessary configurations
4. Configure Cloud SQL connection and environment variables

**Key Features:**
- Automated CI/CD pipeline
- Container image versioning (commit SHA + latest tag)
- Cloud SQL Proxy sidecar configuration
- Service account integration
- Environment variable injection
- Autoscaling configuration (1-10 instances)

### 5. Dependencies Update

**File:** `api_server/requirements.txt`

**Added Dependencies:**
```
google-cloud-secret-manager>=2.16.0
google-cloud-aiplatform>=1.35.0
vertexai>=1.0.0
```

**Purpose:**
- `google-cloud-secret-manager`: Secure database password retrieval
- `google-cloud-aiplatform`: Vertex AI platform integration
- `vertexai`: Vertex AI Python SDK for LLM access

## 🚀 Deployment Instructions

### Prerequisites

1. **Google Cloud Project Setup:**
   - Project ID: `guild-ai-080`
   - Cloud SQL instance: `guild-ai-sql`
   - Memorystore instance: `10.87.64.4`
   - Service account: `guild-ai-cloud-run-sa@guild-ai-080.iam.gserviceaccount.com`

2. **Required Permissions:**
   - Cloud Run Admin
   - Cloud SQL Client
   - Secret Manager Secret Accessor
   - Vertex AI User
   - Container Registry Writer

### Deployment Steps

#### Option 1: Using Cloud Build (Recommended)

```bash
# 1. Push code to GitHub
git add .
git commit -m "Cloud Run implementation"
git push origin main

# 2. Connect Cloud Build to GitHub (one-time setup)
gcloud builds triggers create github \
  --repo-name=Guild-AI \
  --repo-owner=<your-github-username> \
  --branch-pattern="^main$" \
  --build-config=cloudbuild.yaml

# 3. Trigger build and deploy
gcloud builds submit --config=cloudbuild.yaml .
```

#### Option 2: Manual Deployment

```bash
# 1. Build the Docker image
docker build -t gcr.io/guild-ai-080/guild-ai:latest -f ./api_server/Dockerfile .

# 2. Push to Container Registry
docker push gcr.io/guild-ai-080/guild-ai:latest

# 3. Deploy to Cloud Run
gcloud run deploy guild-ai-api \
  --image gcr.io/guild-ai-080/guild-ai:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 5000 \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 1 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=guild-ai-080,CLOUDSQL_CONNECTION_NAME=guild-ai-080:us-central1:guild-ai-sql,POSTGRES_USER=postgres,POSTGRES_DB=workflow_db,DB_SECRET_NAME=db-root-password,REDIS_HOST=10.87.64.4,REDIS_PORT=6379,LLM_PROVIDER=vertex_ai,VERTEX_AI_LOCATION=us-central1,VERTEX_AI_MODEL=gemini-pro,FASTAPI_APP_ENV=production" \
  --add-cloudsql-instances guild-ai-080:us-central1:guild-ai-sql \
  --service-account guild-ai-cloud-run-sa@guild-ai-080.iam.gserviceaccount.com
```

## 🔧 Environment Variables Reference

### Cloud Run Production Environment

| Variable | Value | Purpose |
|----------|-------|---------|
| `GOOGLE_CLOUD_PROJECT` | `guild-ai-080` | GCP Project ID |
| `CLOUDSQL_CONNECTION_NAME` | `guild-ai-080:us-central1:guild-ai-sql` | Cloud SQL instance identifier |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_DB` | `workflow_db` | Database name |
| `DB_SECRET_NAME` | `db-root-password` | Secret Manager secret name |
| `REDIS_HOST` | `10.87.64.4` | Memorystore instance IP |
| `REDIS_PORT` | `6379` | Redis port |
| `LLM_PROVIDER` | `vertex_ai` | LLM provider selection |
| `VERTEX_AI_LOCATION` | `us-central1` | Vertex AI region |
| `VERTEX_AI_MODEL` | `gemini-pro` | Vertex AI model |
| `FASTAPI_APP_ENV` | `production` | Application environment |

### Local Docker Development Environment

| Variable | Value | Purpose |
|----------|-------|---------|
| `POSTGRES_HOST` | `db` | Docker service name |
| `POSTGRES_PORT` | `5432` | Standard PostgreSQL port |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `password` | Database password (local only) |
| `POSTGRES_DB` | `workflow_db` | Database name |
| `REDIS_HOST` | `redis` | Docker service name |
| `REDIS_PORT` | `6379` | Redis port |
| `LLM_PROVIDER` | `ollama` | Local LLM provider |
| `OLLAMA_HOST` | `http://ollama:11434` | Ollama service URL |

## 🔐 Security Considerations

### Secret Management
- **Production:** Database password stored in Google Cloud Secret Manager
- **Local:** Database password in environment variables (docker-compose.yml)
- Never commit production secrets to version control

### Service Account Permissions
The Cloud Run service account needs:
- `roles/cloudsql.client` - Cloud SQL access
- `roles/secretmanager.secretAccessor` - Secret Manager access
- `roles/aiplatform.user` - Vertex AI access
- `roles/redis.editor` - Memorystore access (if using IAM)

## 🧪 Testing the Implementation

### Local Testing (Docker)

```bash
# 1. Start local services
docker-compose up -d

# 2. Test database connection
curl http://localhost:5000/health

# 3. Test LLM with Ollama
# Set LLM_PROVIDER=ollama in docker-compose.yml
```

### Cloud Run Testing

```bash
# 1. Get Cloud Run service URL
gcloud run services describe guild-ai-api --region us-central1 --format="value(status.url)"

# 2. Test health endpoint
curl https://guild-ai-api-xxxxx.run.app/health

# 3. Test database connectivity
# Check Cloud Run logs
gcloud run logs read guild-ai-api --region us-central1
```

## 📊 Monitoring and Logs

### View Logs

```bash
# Cloud Run logs
gcloud run logs read guild-ai-api --region us-central1 --limit 100

# Cloud SQL logs
gcloud sql operations list --instance guild-ai-sql

# Cloud Build logs
gcloud builds list --limit 10
```

### Key Metrics to Monitor

- **Cloud Run:**
  - Request count
  - Request latency
  - Container instance count
  - Memory usage
  - CPU utilization

- **Cloud SQL:**
  - Connection count
  - Query performance
  - Storage usage

- **Memorystore:**
  - Hit/miss ratio
  - Connections
  - Memory usage

## 🐛 Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to Cloud SQL
```
Error: could not connect to server: No such file or directory
```

**Solution:**
1. Verify `CLOUDSQL_CONNECTION_NAME` is correct
2. Check Cloud Run service account has `cloudsql.client` role
3. Ensure Cloud SQL instance is running
4. Verify Secret Manager secret exists and is accessible

### LLM Provider Issues

**Problem:** Vertex AI authentication fails
```
Error: Google Cloud project ID must be provided
```

**Solution:**
1. Verify `GOOGLE_CLOUD_PROJECT` environment variable is set
2. Check service account has `aiplatform.user` role
3. Ensure Vertex AI API is enabled in GCP project
4. Verify `LLM_PROVIDER` is set to `vertex_ai`

### Redis Connection Issues

**Problem:** Cannot connect to Memorystore
```
Error: Connection refused
```

**Solution:**
1. Verify `REDIS_HOST` IP address is correct
2. Check VPC network connectivity
3. Ensure Memorystore instance is in same VPC as Cloud Run
4. Verify Memorystore instance is running

## 🔄 Rollback Procedure

If deployment fails:

```bash
# 1. List previous revisions
gcloud run revisions list --service guild-ai-api --region us-central1

# 2. Roll back to previous revision
gcloud run services update-traffic guild-ai-api \
  --to-revisions=<PREVIOUS_REVISION>=100 \
  --region us-central1
```

## 📝 Next Steps

1. **Configure CI/CD:**
   - Set up GitHub Actions or Cloud Build triggers
   - Add automated testing before deployment
   - Configure staging environment

2. **Optimize Performance:**
   - Fine-tune Cloud Run instance sizes
   - Configure Cloud SQL connection pooling
   - Optimize Redis caching strategy

3. **Enhance Security:**
   - Enable VPC Service Controls
   - Configure Cloud Armor for DDoS protection
   - Implement API authentication

4. **Set Up Monitoring:**
   - Configure Cloud Monitoring alerts
   - Set up log-based metrics
   - Create custom dashboards

## ✅ Implementation Checklist

- [x] Database connection supports Cloud SQL Proxy
- [x] LLM client supports Vertex AI provider switching
- [x] Redis/Celery supports Memorystore configuration
- [x] Cloud Build configuration created
- [x] Dependencies updated for GCP services
- [x] Environment variables documented
- [x] Deployment instructions provided
- [ ] Test deployment to Cloud Run (pending)
- [ ] Verify all services work in production (pending)
- [ ] Set up monitoring and alerting (pending)

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud SQL Proxy Documentation](https://cloud.google.com/sql/docs/postgres/sql-proxy)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
- [Memorystore for Redis Documentation](https://cloud.google.com/memorystore/docs/redis)

---

**Implementation Date:** October 8, 2025  
**Guild-AI Version:** Cloud Run Ready  
**GCP Project:** guild-ai-080

