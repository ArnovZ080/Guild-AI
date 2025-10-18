# Quick Fix: Orchestrator Falling Back to Automatic Responses

## TL;DR - 3 Steps to Fix

### 1. Set Environment Variables

```bash
export GOOGLE_CLOUD_PROJECT=guild-ai-080
export LLM_PROVIDER=vertex_ai
export VERTEX_AI_MODEL=gemini-1.5-flash
```

### 2. Configure Credentials

```bash
# Option A: Service account key
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json

# OR Option B: Application default credentials
gcloud auth application-default login
```

### 3. Restart Application

```bash
# Docker Compose
docker-compose restart api_server

# Or restart however you run your app
```

## Verify It's Working

Run the diagnostic:
```bash
python scripts/diagnose_orchestrator.py
```

Look for in logs:
```
✅ Vertex AI initialized successfully
✅ Orchestrator initialized successfully
```

## What Was Fixed

1. **Orchestrator now defaults to Vertex AI** instead of local Ollama
2. **Better error messages** when Vertex AI fails to initialize
3. **Proper fallback logic** with clear logging
4. **Async handling fixed** for Gemini API calls

## Before vs After

**Before (Broken):**
```
User: "How is it going?"
Bot: "I'm doing well. How can I help you today?"  ← Generic template
```

**After (Fixed):**
```
User: "How is it going?"
Bot: "Hey! I'm doing great! 😊 How's your business going? I noticed 
     your revenue is up 15% this month - want to talk about scaling 
     strategies?"  ← Smart, contextual, dynamic
```

## Still Not Working?

1. Check `GOOGLE_CLOUD_PROJECT` is set correctly
2. Verify credentials are valid
3. Enable Vertex AI API: `gcloud services enable aiplatform.googleapis.com`
4. Check IAM permissions (need `roles/aiplatform.user`)
5. Run diagnostic tool for detailed analysis

## Full Documentation

- **Complete Guide:** `ORCHESTRATOR_CONFIGURATION.md`
- **Detailed Summary:** `ORCHESTRATOR_FIX_SUMMARY.md`
- **Diagnostic Tool:** `scripts/diagnose_orchestrator.py`

