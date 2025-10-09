# 🌥️ Google Cloud Platform Migration Guide

## Overview

This guide provides complete instructions for migrating Guild-AI from local development to Google Cloud Platform (GCP) with Vertex AI integration. The Growth Opportunities System and all other components are fully compatible with GCP.

---

## ✅ Architecture Compatibility

### **Current System → Google Cloud Mapping**

```
Local Development          →  Google Cloud Production
─────────────────────────────────────────────────────────
FastAPI Backend           →  Cloud Run / App Engine / GKE
React Frontend            →  Cloud Storage + CDN / Cloud Run
SQLite/PostgreSQL (local) →  Cloud SQL (PostgreSQL/MySQL)
Ollama (local LLM)        →  Vertex AI (Gemini Pro)
Local File Storage        →  Cloud Storage
Celery (local Redis)      →  Cloud Tasks / Memorystore
WebSocket                 →  Cloud Run (WebSocket support)
```

---

## 📋 Prerequisites

### **1. Google Cloud Setup**

```bash
# Install Google Cloud SDK
curl https://sdk.cloud.google.com | bash
exec -l $SHELL

# Initialize and authenticate
gcloud init
gcloud auth login
gcloud auth application-default login

# Set your project
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  aiplatform.googleapis.com \
  storage.googleapis.com \
  cloudtasks.googleapis.com \
  compute.googleapis.com \
  cloudbuild.googleapis.com
```

### **2. Install Dependencies**

```bash
# Backend - Add Google Cloud libraries
cd api_server
pip install \
  google-cloud-aiplatform \
  google-cloud-storage \
  google-cloud-sql-connector \
  google-cloud-tasks \
  psycopg2-binary \
  cloud-sql-python-connector

# Update requirements.txt
pip freeze > requirements.txt
```

---

## 🗄️ Database Migration

### **1. Create Cloud SQL Instance**

```bash
# Create PostgreSQL instance
gcloud sql instances create guild-ai-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=YOUR_SECURE_PASSWORD \
  --storage-auto-increase

# Create database
gcloud sql databases create guild_ai --instance=guild-ai-db

# Create user
gcloud sql users create guild_user \
  --instance=guild-ai-db \
  --password=YOUR_USER_PASSWORD
```

### **2. Update Database Connection**

Create `api_server/src/database_cloud.py`:

```python
"""
Cloud SQL database connection for production
"""
import os
import sqlalchemy
from google.cloud.sql.connector import Connector

def get_cloud_sql_engine():
    """Create SQLAlchemy engine for Cloud SQL"""
    
    instance_connection_name = os.environ["INSTANCE_CONNECTION_NAME"]
    db_user = os.environ["DB_USER"]
    db_pass = os.environ["DB_PASS"]
    db_name = os.environ["DB_NAME"]
    
    # Initialize Cloud SQL Python Connector
    connector = Connector()
    
    def getconn():
        conn = connector.connect(
            instance_connection_name,
            "pg8000",
            user=db_user,
            password=db_pass,
            db=db_name
        )
        return conn
    
    # Create SQLAlchemy engine
    engine = sqlalchemy.create_engine(
        "postgresql+pg8000://",
        creator=getconn,
    )
    
    return engine

# Use in database.py
if os.getenv("ENVIRONMENT") == "production":
    from .database_cloud import get_cloud_sql_engine
    engine = get_cloud_sql_engine()
else:
    # Local development
    engine = create_engine(DATABASE_URL)
```

### **3. Migrate Data**

```bash
# Export local database
pg_dump guild_ai > guild_ai_backup.sql

# Import to Cloud SQL
gcloud sql import sql guild-ai-db \
  gs://your-bucket/guild_ai_backup.sql \
  --database=guild_ai

# Or use Cloud SQL Proxy for direct connection
cloud_sql_proxy -instances=$INSTANCE_CONNECTION_NAME=tcp:5432 &
psql -h 127.0.0.1 -U guild_user guild_ai < guild_ai_backup.sql
```

---

## 🤖 Vertex AI Integration

### **1. Configure Vertex AI**

The Growth Opportunities System now supports Vertex AI! The `VertexAIClient` I created provides seamless integration.

**Environment Variables**:
```bash
export USE_VERTEX_AI=true
export GOOGLE_CLOUD_PROJECT="your-project-id"
export VERTEX_AI_LOCATION="us-central1"
export VERTEX_AI_MODEL="gemini-pro"
```

### **2. Available Models**

**Gemini Models** (Recommended):
- `gemini-pro` - Best for reasoning, analysis, growth opportunities (RECOMMENDED)
- `gemini-pro-vision` - For image analysis
- `gemini-ultra` - Most capable (when available)

**PaLM 2 Models**:
- `text-bison@002` - General text generation
- `chat-bison@002` - Conversational AI
- `code-bison@002` - Code generation

### **3. Update All Agents**

The Growth Opportunity Agent already supports Vertex AI. Update other agents similarly:

```python
# In any agent file
import os
from guild.src.core.vertex_ai_client import VertexAIClientFactory

use_vertex = os.getenv("USE_VERTEX_AI", "false").lower() == "true"

if use_vertex:
    client = VertexAIClientFactory.create_client(model_name="gemini-pro")
else:
    # Local Ollama
    from guild.src.models.llm import Llm
    client = LlmClient(Llm(provider="ollama", model="llama2"))

# Same interface for both
response = await client.chat(prompt)
```

### **4. Cost Optimization**

**Vertex AI Pricing** (as of 2024):
- Gemini Pro: ~$0.0005 per 1K characters (input), ~$0.0015 per 1K characters (output)
- Text-Bison: ~$0.0005 per 1K characters

**Optimization Strategies**:
```python
# Cache opportunities for 24 hours
OPPORTUNITY_CACHE_HOURS = 24

# Use smaller models for simple tasks
if task_complexity == "low":
    client = VertexAIClientFactory.create_client(model_name="text-bison@002")
else:
    client = VertexAIClientFactory.create_client(model_name="gemini-pro")

# Batch requests when possible
opportunities = await analyze_growth_opportunities_batch(business_data)
```

---

## 🚀 Backend Deployment

### **Option A: Cloud Run (Recommended)**

**Dockerfile** (create in `api_server/`):

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY src/ ./src/
COPY alembic/ ./alembic/
COPY alembic.ini .

# Run migrations and start server
CMD alembic upgrade head && \
    uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

**Deploy**:
```bash
cd api_server

# Build and deploy
gcloud run deploy guild-ai-api \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars="ENVIRONMENT=production,USE_VERTEX_AI=true" \
  --set-secrets="DB_PASS=DB_PASSWORD:latest,INSTANCE_CONNECTION_NAME=INSTANCE_NAME:latest" \
  --add-cloudsql-instances=$INSTANCE_CONNECTION_NAME \
  --min-instances=1 \
  --max-instances=10 \
  --memory=2Gi \
  --cpu=2 \
  --timeout=3600

# Get URL
gcloud run services describe guild-ai-api --region us-central1 --format='value(status.url)'
```

### **Option B: App Engine**

**app.yaml**:
```yaml
runtime: python311
entrypoint: gunicorn -w 4 -k uvicorn.workers.UvicornWorker src.main:app

env_variables:
  ENVIRONMENT: 'production'
  USE_VERTEX_AI: 'true'

automatic_scaling:
  target_cpu_utilization: 0.65
  min_instances: 1
  max_instances: 10

resources:
  cpu: 2
  memory_gb: 2
  disk_size_gb: 10
```

**Deploy**:
```bash
gcloud app deploy
```

---

## 🎨 Frontend Deployment

### **Option A: Cloud Storage + CDN (Recommended for Static)**

```bash
cd frontend

# Build production bundle
npm run build

# Create bucket
gsutil mb gs://$PROJECT_ID-frontend

# Enable website configuration
gsutil web set -m index.html -e index.html gs://$PROJECT_ID-frontend

# Upload build
gsutil -m cp -r dist/* gs://$PROJECT_ID-frontend/

# Make public
gsutil iam ch allUsers:objectViewer gs://$PROJECT_ID-frontend

# Set up Cloud CDN (optional)
gcloud compute backend-buckets create frontend-backend \
  --gcs-bucket-name=$PROJECT_ID-frontend \
  --enable-cdn
```

### **Option B: Cloud Run (For SSR or Dynamic)**

**Dockerfile** (create in `frontend/`):

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf**:
```nginx
server {
    listen 8080;
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
}
```

**Deploy**:
```bash
cd frontend

gcloud run deploy guild-ai-frontend \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port=8080
```

---

## 📦 Celery / Background Tasks

### **Option A: Cloud Tasks (Recommended)**

Replace Celery with Cloud Tasks:

```python
# api_server/src/cloud_tasks.py
from google.cloud import tasks_v2
import json

def create_task(queue_name: str, task_data: dict):
    """Create a Cloud Task"""
    client = tasks_v2.CloudTasksClient()
    
    project = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("CLOUD_TASKS_LOCATION", "us-central1")
    
    parent = client.queue_path(project, location, queue_name)
    
    task = {
        'app_engine_http_request': {
            'http_method': tasks_v2.HttpMethod.POST,
            'relative_uri': '/tasks/execute',
            'body': json.dumps(task_data).encode()
        }
    }
    
    response = client.create_task(request={'parent': parent, 'task': task})
    return response.name

# Usage in routes
from .cloud_tasks import create_task

@router.post("/{opportunity_id}/accept")
async def accept_opportunity(...):
    # ... create workflow ...
    
    # Instead of Celery delay()
    create_task("workflow-queue", {
        "workflow_id": workflow_id,
        "action": "execute"
    })
```

### **Option B: Cloud Run Jobs**

```bash
# Create job
gcloud run jobs create workflow-executor \
  --image gcr.io/$PROJECT_ID/workflow-executor \
  --region us-central1 \
  --tasks 10 \
  --max-retries 3
  
# Execute job
gcloud run jobs execute workflow-executor
```

---

## 🔐 Security & Secrets

### **1. Secret Manager**

```bash
# Store secrets
echo -n "your-db-password" | gcloud secrets create DB_PASSWORD --data-file=-
echo -n "project:region:instance" | gcloud secrets create INSTANCE_NAME --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding DB_PASSWORD \
  --member=serviceAccount:YOUR-SERVICE-ACCOUNT@$PROJECT_ID.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

### **2. Environment Variables**

Create `.env.production`:

```bash
# Google Cloud
ENVIRONMENT=production
GOOGLE_CLOUD_PROJECT=your-project-id
CLOUD_TASKS_LOCATION=us-central1

# Vertex AI
USE_VERTEX_AI=true
VERTEX_AI_LOCATION=us-central1
VERTEX_AI_MODEL=gemini-pro

# Database (use secrets in production)
INSTANCE_CONNECTION_NAME=project:region:instance
DB_USER=guild_user
DB_NAME=guild_ai

# API Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 📊 Monitoring & Logging

### **1. Cloud Logging**

All logs automatically go to Cloud Logging when running on GCP.

**View logs**:
```bash
# Real-time logs
gcloud run services logs tail guild-ai-api --region us-central1

# Filter logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=guild-ai-api" --limit 50
```

### **2. Cloud Monitoring**

Set up alerts:

```bash
# Create alert for high error rate
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s
```

### **3. Application Insights**

Add to your code:

```python
from google.cloud import logging as cloud_logging

# Initialize client
logging_client = cloud_logging.Client()
logging_client.setup_logging()

# Use standard Python logging
import logging
logger = logging.getLogger(__name__)

# Logs will appear in Cloud Logging
logger.info("Growth opportunity generated", extra={
    "opportunity_id": opp.id,
    "confidence": opp.confidence_score,
    "category": opp.category
})
```

---

## 💰 Cost Estimation

### **Monthly Cost Breakdown (Small Scale)**

```
Service                         Cost
─────────────────────────────────────────
Cloud Run (Backend)            $10-50
Cloud SQL (db-f1-micro)        $7-15
Cloud Storage (Frontend)       $1-5
Vertex AI (Gemini Pro)         $20-100*
Cloud Tasks                    $0-5
Cloud Logging                  $0-10
Cloud Monitoring               $0-5
───────────────────────────────────────────
Total                          $38-190/month

* Vertex AI cost depends on usage volume
```

### **Cost Optimization Tips**

1. **Vertex AI**:
   - Cache opportunity analysis (24 hours)
   - Use batch processing
   - Consider cheaper models for simple tasks

2. **Cloud Run**:
   - Set min-instances=0 for dev
   - Use min-instances=1 for production (avoid cold starts)
   - Configure appropriate memory/CPU

3. **Cloud SQL**:
   - Use f1-micro for dev ($7/mo)
   - Scale to db-g1-small for production ($25/mo)
   - Enable automatic backups

4. **Storage**:
   - Use lifecycle policies
   - Compress assets
   - Use CDN caching

---

## 🧪 Testing in Production

### **1. Deploy to Staging First**

```bash
# Create staging service
gcloud run deploy guild-ai-api-staging \
  --source . \
  --region us-central1 \
  --set-env-vars="ENVIRONMENT=staging,USE_VERTEX_AI=true"

# Test thoroughly
curl https://guild-ai-api-staging-xxx.run.app/health
```

### **2. Gradual Rollout**

```bash
# Deploy new revision with traffic split
gcloud run deploy guild-ai-api \
  --source . \
  --no-traffic  # Deploy without sending traffic

# Send 10% traffic to new revision
gcloud run services update-traffic guild-ai-api \
  --to-revisions=NEW_REVISION=10

# If good, send 100%
gcloud run services update-traffic guild-ai-api \
  --to-latest
```

---

## 🔄 CI/CD Pipeline

### **GitHub Actions**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Google Cloud

on:
  push:
    branches: [main]

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: us-central1

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - id: 'auth'
        uses: 'google-github-actions/auth@v1'
        with:
          credentials_json: '${{ secrets.GCP_SA_KEY }}'
      
      - name: Deploy Backend
        run: |
          cd api_server
          gcloud run deploy guild-ai-api \
            --source . \
            --region $REGION \
            --project $PROJECT_ID
      
      - name: Deploy Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          gsutil -m rsync -r -d dist gs://$PROJECT_ID-frontend
```

---

## ✅ Post-Migration Checklist

- [ ] Cloud SQL instance created and accessible
- [ ] Database migrated and schema up-to-date
- [ ] Vertex AI API enabled and tested
- [ ] Backend deployed to Cloud Run
- [ ] Frontend deployed to Cloud Storage/Run
- [ ] Environment variables configured
- [ ] Secrets stored in Secret Manager
- [ ] Cloud Tasks/Celery configured
- [ ] Monitoring and logging set up
- [ ] Custom domain configured (if needed)
- [ ] SSL certificates configured
- [ ] Backup strategy implemented
- [ ] Cost alerts configured
- [ ] Documentation updated
- [ ] Team trained on GCP tools

---

## 🆘 Troubleshooting

### **Issue: Vertex AI Authentication Error**

```bash
# Ensure application default credentials are set
gcloud auth application-default login

# Check service account has Vertex AI permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:YOUR-SA@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"
```

### **Issue: Cloud SQL Connection Failed**

```bash
# Test connection with Cloud SQL Proxy
cloud_sql_proxy -instances=$INSTANCE_CONNECTION_NAME=tcp:5432

# Check Cloud Run has Cloud SQL access
gcloud run services update guild-ai-api \
  --add-cloudsql-instances=$INSTANCE_CONNECTION_NAME
```

### **Issue: High Latency**

- Enable Cloud CDN for frontend
- Use Cloud Run min-instances=1 to avoid cold starts
- Optimize Vertex AI prompts (shorter = faster)
- Add caching layer (Memorystore)

---

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Cloud SQL Best Practices](https://cloud.google.com/sql/docs/postgres/best-practices)
- [Google Cloud Pricing Calculator](https://cloud.google.com/products/calculator)

---

## 🎯 Summary

✅ **Your Growth Opportunities System is 100% compatible with Google Cloud**

**Key Benefits**:
1. **Seamless Migration**: Change environment variables and redeploy
2. **Better Performance**: Vertex AI is more capable than local Ollama
3. **Scalability**: Auto-scales from 0 to thousands of requests
4. **Reliability**: Managed services with 99.95% uptime SLA
5. **Cost-Effective**: Pay only for what you use

The system architecture was designed with cloud deployment in mind, so migration is straightforward. The `VertexAIClient` I created provides a drop-in replacement for local LLM calls with the same interface.

Happy deploying! 🚀

