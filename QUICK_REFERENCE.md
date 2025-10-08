# 🚀 Guild-AI Cloud Run - Quick Reference Card

## 📋 One-Liners

### Deploy to Cloud Run
```bash
gcloud builds submit --config=cloudbuild.yaml .
```

### Get Service URL
```bash
gcloud run services describe guild-ai-api --region us-central1 --format="value(status.url)"
```

### View Logs
```bash
gcloud run logs tail guild-ai-api --region us-central1
```

### Test Health
```bash
curl $(gcloud run services describe guild-ai-api --region us-central1 --format="value(status.url)")/health
```

---

## 🔧 Environment Variables Cheat Sheet

### Cloud Run (Production)
```bash
GOOGLE_CLOUD_PROJECT=guild-ai-080
CLOUDSQL_CONNECTION_NAME=guild-ai-080:us-central1:guild-ai-sql
DB_SECRET_NAME=db-root-password
REDIS_HOST=10.87.64.4
LLM_PROVIDER=vertex_ai
VERTEX_AI_MODEL=gemini-pro
```

### Local (Development)
```bash
POSTGRES_HOST=db
POSTGRES_PASSWORD=password
REDIS_HOST=redis
LLM_PROVIDER=ollama
OLLAMA_HOST=http://ollama:11434
```

---

## 📁 Files Changed

| File | Change |
|------|--------|
| `api_server/src/database.py` | ✅ Cloud SQL Proxy |
| `guild/src/core/llm_client.py` | ✅ Vertex AI |
| `api_server/src/celery_app.py` | ✅ Memorystore |
| `api_server/requirements.txt` | ✅ GCP deps |
| `cloudbuild.yaml` | ✅ NEW - CI/CD |

---

## 🎯 Key Implementation Logic

### Database
```python
if CLOUDSQL_CONNECTION_NAME:
    → Cloud SQL Proxy (Cloud Run)
else:
    → PostgreSQL (Local)
```

### LLM Provider
```python
if LLM_PROVIDER == "vertex_ai":
    → Vertex AI (Cloud Run)
else:
    → Ollama (Local)
```

### Redis
```python
host = REDIS_HOST or "redis"
→ Memorystore IP or Docker service
```

---

## 📚 Documentation

| Doc | Use Case |
|-----|----------|
| `CLOUD_RUN_READY.md` | Start here |
| `DEPLOYMENT_CHECKLIST.md` | Deploy guide |
| `CLOUD_RUN_IMPLEMENTATION.md` | Technical details |
| `IMPLEMENTATION_SUMMARY.md` | Full overview |
| `env.cloudrun.example` | Config template |

---

## ✅ Pre-Deployment Checklist

- [ ] Database password in Secret Manager
- [ ] Service account has required roles
- [ ] Cloud SQL instance running
- [ ] Memorystore instance provisioned
- [ ] Vertex AI API enabled
- [ ] Code committed and pushed

---

## 🔍 Common Commands

### Build & Push
```bash
docker build -t gcr.io/guild-ai-080/guild-ai:latest -f ./api_server/Dockerfile .
docker push gcr.io/guild-ai-080/guild-ai:latest
```

### Deploy
```bash
gcloud run deploy guild-ai-api \
  --image gcr.io/guild-ai-080/guild-ai:latest \
  --region us-central1 \
  --platform managed
```

### Debug
```bash
# Describe service
gcloud run services describe guild-ai-api --region us-central1

# List revisions
gcloud run revisions list --service guild-ai-api --region us-central1

# Stream logs
gcloud run logs tail guild-ai-api --region us-central1 --format=json
```

---

## 🆘 Troubleshooting

### Database connection fails
→ Check `CLOUDSQL_CONNECTION_NAME` and Secret Manager

### LLM errors
→ Verify `LLM_PROVIDER=vertex_ai` and Vertex AI API enabled

### Redis connection issues
→ Confirm `REDIS_HOST=10.87.64.4` and VPC connectivity

### Deployment fails
→ Check Cloud Build logs: `gcloud builds list --limit 5`

---

## 🎉 Success Indicators

✅ `gcloud run services list` shows service  
✅ Health endpoint returns 200  
✅ No errors in logs  
✅ Database queries work  
✅ LLM responses generated  
✅ Celery tasks execute

---

**Quick Start:** `gcloud builds submit --config=cloudbuild.yaml .`

