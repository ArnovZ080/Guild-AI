# 🔍 Check Cloud Run Deployment Logs

## View the Latest Failure Logs

Run this command to see what's actually happening in the container:

```bash
gcloud run revisions describe guild-ai-api-00007-6f9 \
  --region=us-central1 \
  --format="get(status.conditions)"
```

## Get Detailed Logs

```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=guild-ai-api AND resource.labels.revision_name=guild-ai-api-00007-6f9" \
  --limit=100 \
  --project=guild-ai-080 \
  --format=json
```

## Or view in console:

Click this URL (from the error):
https://console.cloud.google.com/logs/viewer?project=guild-ai-080&resource=cloud_run_revision/service_name/guild-ai-api/revision_name/guild-ai-api-00007-6f9

## What to Look For

In the logs, check for:
1. ✅ "🚀 Guild-AI API Server - Waiting for dependencies..." - Entrypoint started
2. ✅ "✅ Redis is ready" - VPC Connector working
3. ✅ "🚀 Starting FastAPI server..." - App starting
4. ❌ Any Python errors or exceptions
5. ❌ "Redis connection failed" - VPC issue
6. ❌ Database connection errors

## Common Issues

### If you see: "Redis connection failed after 30 seconds"
→ VPC Connector not working properly. Increase timeout in entrypoint.sh or verify Memorystore IP

### If you see: Database connection errors
→ Check django_settings.py is using POSTGRES_PASSWORD correctly

### If you see: Port binding errors
→ Check uvicorn command in entrypoint.sh

### If you see: Module import errors
→ Check that all dependencies are in requirements.txt

---

## 🔧 Quick Diagnostic Test

Try deploying WITHOUT the entrypoint script to isolate the issue:

### Temporarily Remove Entrypoint

Edit `api_server/Dockerfile` and change:
```dockerfile
# Comment out ENTRYPOINT line
# ENTRYPOINT ["/app/api_server/entrypoint.sh"]

# Add direct CMD
CMD ["uvicorn", "api_server.src.main:app", "--host", "0.0.0.0", "--port", "5000"]
```

Then deploy again to see if the app at least starts (even if Redis fails later).

This helps us determine if the issue is:
- A) The entrypoint script itself
- B) The application code having other issues

---

## 📊 Check What the Logs Show

**Please run the logging command above and share what errors you see in the logs.**

That will tell us exactly what's failing during container startup.

