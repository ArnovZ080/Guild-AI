# Orchestrator Configuration Guide

## Overview

The Guild-AI Orchestrator is the intelligent CEO-level agent that manages all other agents and provides smart, conversational responses. It's designed to act like a Fortune 500 CEO providing strategic business guidance.

## Current Issue: Falling Back to Automatic Responses

If your orchestrator is falling back to automatic responses instead of using Gemini's intelligence, it's likely due to one of these configuration issues:

## Required Configuration

### 1. Environment Variables

The orchestrator requires these environment variables to connect to Vertex AI/Gemini:

```bash
# Google Cloud Project Configuration
GOOGLE_CLOUD_PROJECT=your-project-id  # e.g., "guild-ai-080"

# Vertex AI Configuration
VERTEX_AI_LOCATION=us-central1  # or your preferred region
VERTEX_AI_MODEL=gemini-1.5-flash  # or gemini-1.5-pro for higher quality

# LLM Provider Selection
LLM_PROVIDER=vertex_ai  # Use vertex_ai for production, ollama for local dev
```

### 2. Google Cloud Authentication

The orchestrator needs valid Google Cloud credentials to access Vertex AI:

#### Option A: Service Account Key (Recommended for Production)

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

#### Option B: Application Default Credentials (For Development)

```bash
gcloud auth application-default login
```

#### Option C: Cloud Run/GKE (Automatic)

When running on Google Cloud infrastructure, credentials are automatically provided via the service account attached to the instance.

### 3. Verify Configuration

To verify your configuration is correct, check the logs when the orchestrator initializes:

**Success:**
```
✅ Vertex AI initialized successfully: guild-ai-080 in us-central1
Initializing Orchestrator with provider=vertex_ai, model=gemini-1.5-flash
Orchestrator LLM client initialized successfully
```

**Failure:**
```
❌ Failed to initialize Vertex AI: [error message]
Make sure GOOGLE_CLOUD_PROJECT is set and credentials are configured
```

## Troubleshooting

### Issue 1: "Vertex AI not initialized" errors

**Symptoms:** Orchestrator returns empty responses or generic fallback messages

**Solution:**
1. Check that `GOOGLE_CLOUD_PROJECT` is set correctly
2. Verify Google Cloud credentials are configured
3. Ensure the service account has Vertex AI permissions:
   - `roles/aiplatform.user`
   - `roles/ml.developer`

### Issue 2: "Permission denied" errors

**Symptoms:** Initialization fails with permission errors

**Solution:**
1. Verify your service account has the required IAM roles
2. Enable the Vertex AI API in your Google Cloud project:
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```

### Issue 3: Falling back to Ollama

**Symptoms:** Logs show "Falling back to ollama provider"

**Solution:**
1. This happens when Vertex AI initialization fails
2. Check the error message in the logs
3. Fix the Vertex AI configuration
4. Restart the service

### Issue 4: Generic/Template Responses

**Symptoms:** Orchestrator gives pre-programmed responses instead of dynamic, intelligent answers

**Solution:**
1. Verify `LLM_PROVIDER=vertex_ai` is set
2. Check that Gemini is actually being used (look for model name in logs)
3. Ensure the `gemini_provider` is initialized successfully
4. Check API quotas in Google Cloud Console

## Testing the Configuration

### 1. Check Environment Variables

```bash
echo $GOOGLE_CLOUD_PROJECT
echo $VERTEX_AI_LOCATION
echo $VERTEX_AI_MODEL
echo $LLM_PROVIDER
```

### 2. Test Vertex AI Connection

```python
from guild.src.core.vertex_ai_client import VertexAIClient

client = VertexAIClient()
response = await client.chat("Hello, how are you?")
print(response)
```

### 3. Test Orchestrator

```python
from guild.src.core.orchestrator import Orchestrator
from guild.src.models.user_input import UserInput

user_input = UserInput(objective="Create a content strategy for my business")
orchestrator = Orchestrator(user_input)
workflow = await orchestrator.generate_workflow()
print(workflow)
```

## Configuration Files

### Docker/Docker Compose

Add to your `docker-compose.yml`:

```yaml
services:
  api_server:
    environment:
      - GOOGLE_CLOUD_PROJECT=guild-ai-080
      - VERTEX_AI_LOCATION=us-central1
      - VERTEX_AI_MODEL=gemini-1.5-flash
      - LLM_PROVIDER=vertex_ai
      - GOOGLE_APPLICATION_CREDENTIALS=/app/credentials/service-account.json
    volumes:
      - ./credentials:/app/credentials
```

### Kubernetes

Create a secret for the service account:

```bash
kubectl create secret generic gcp-credentials \
  --from-file=key.json=/path/to/service-account-key.json
```

Add to your deployment:

```yaml
env:
  - name: GOOGLE_CLOUD_PROJECT
    value: "guild-ai-080"
  - name: VERTEX_AI_LOCATION
    value: "us-central1"
  - name: VERTEX_AI_MODEL
    value: "gemini-1.5-flash"
  - name: LLM_PROVIDER
    value: "vertex_ai"
  - name: GOOGLE_APPLICATION_CREDENTIALS
    value: "/var/secrets/google/key.json"
volumeMounts:
  - name: gcp-credentials
    mountPath: /var/secrets/google
volumes:
  - name: gcp-credentials
    secret:
      secretName: gcp-credentials
```

### Cloud Run

Set environment variables in Cloud Run:

```bash
gcloud run services update guild-api \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=guild-ai-080,VERTEX_AI_LOCATION=us-central1,VERTEX_AI_MODEL=gemini-1.5-flash,LLM_PROVIDER=vertex_ai"
```

## Model Selection

### gemini-1.5-flash (Recommended)
- **Best for:** Most use cases, fast responses, cost-effective
- **Cost:** ~$0.075 per 1M input tokens, ~$0.30 per 1M output tokens
- **Speed:** Very fast (~1-2 seconds)
- **Quality:** Excellent for business conversations

### gemini-1.5-pro
- **Best for:** Complex reasoning, detailed analysis, critical decisions
- **Cost:** ~$3.50 per 1M input tokens, ~$10.50 per 1M output tokens
- **Speed:** Moderate (~2-4 seconds)
- **Quality:** Highest quality, best reasoning

### gemini-pro (Legacy)
- **Best for:** Backward compatibility
- **Note:** Use 1.5 models instead

## Cost Optimization

1. **Use Flash for most interactions:** Set `VERTEX_AI_MODEL=gemini-1.5-flash`
2. **Reserve Pro for complex tasks:** Only use Pro when needed
3. **Monitor usage:** Check Google Cloud Console for API usage
4. **Set quotas:** Configure quotas to prevent unexpected costs

## Monitoring

### Check Orchestrator Health

```bash
curl http://localhost:8000/api/orchestrator/system/capabilities
```

### View Logs

```bash
# Docker
docker logs guild-api-server

# Kubernetes
kubectl logs -f deployment/guild-api

# Cloud Run
gcloud run logs read guild-api --limit=50
```

## Support

If you're still experiencing issues:

1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Test the Vertex AI connection independently
4. Ensure your Google Cloud project has the Vertex AI API enabled
5. Verify IAM permissions for your service account

## Summary

The orchestrator requires:
1. ✅ `GOOGLE_CLOUD_PROJECT` environment variable
2. ✅ `LLM_PROVIDER=vertex_ai` environment variable
3. ✅ Valid Google Cloud credentials
4. ✅ Vertex AI API enabled
5. ✅ Proper IAM permissions

Once configured correctly, the orchestrator will provide intelligent, dynamic responses powered by Gemini instead of falling back to automatic responses.

