# Environment Variables Configuration Guide

This guide provides a complete reference for all environment variables needed to run Guild AI with Firebase authentication and Paystack subscriptions.

## Overview

Guild AI uses two sets of environment variables:
- **Frontend (.env)** - React/Vite application configuration
- **Backend (.env)** - FastAPI server configuration

---

## Frontend Environment Variables

Create a `.env` file in the `/frontend` directory:

### Firebase Configuration (Required)

```bash
# Firebase Web App Configuration
# Get these from Firebase Console > Project Settings > General > Your apps > Web app
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=guild-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=guild-ai
VITE_FIREBASE_STORAGE_BUCKET=guild-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# Optional: Firebase Analytics
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### API Configuration (Required)

```bash
# Backend API URL
# Development
VITE_API_URL=http://localhost:8000

# Production
# VITE_API_URL=https://your-backend-url.run.app
```

### Paystack Configuration (Required)

```bash
# Paystack Public Key
# Development - use test key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx

# Production - use live key
# VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxx
```

### Complete Frontend .env Example

```bash
# ==========================================
# GUILD AI FRONTEND ENVIRONMENT VARIABLES
# ==========================================

# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=guild-ai.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=guild-ai
VITE_FIREBASE_STORAGE_BUCKET=guild-ai.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# API Configuration
VITE_API_URL=http://localhost:8000

# Paystack Configuration (Test Keys)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxx
```

---

## Backend Environment Variables

Create a `.env` file in the `/api_server` directory:

### Google Cloud / Firebase Configuration (Required)

```bash
# Google Cloud Project
GOOGLE_CLOUD_PROJECT=guild-ai

# Firebase Service Account (Development)
# Point to your downloaded service account JSON file
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Note: In production (Cloud Run), this is handled by Application Default Credentials
# and FIREBASE_SERVICE_ACCOUNT_PATH is not needed
```

### Database Configuration (Required)

```bash
# PostgreSQL Database
# Development (Local Docker)
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/guild_db
POSTGRES_DB=guild_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Production (Cloud SQL via Unix socket)
# DATABASE_URL=postgresql://postgres:password@/guild_db?host=/cloudsql/project:region:instance
# CLOUDSQL_CONNECTION_NAME=project:region:instance
# DB_SECRET_NAME=db-password
```

### Paystack Configuration (Required)

```bash
# Paystack API Keys
# Development - use test keys
PAYSTACK_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_TEST_KEY_FROM_PAYSTACK
PAYSTACK_PUBLIC_KEY=pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY

# Production - use live keys
# PAYSTACK_SECRET_KEY=sk_live_REPLACE_WITH_LIVE_KEY
# PAYSTACK_PUBLIC_KEY=pk_live_REPLACE_WITH_LIVE_KEY
```

### Optional Services

```bash
# Exchange Rate API (Optional - for better ZAR pricing)
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key

# OpenAI API (for AI features)
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Redis Configuration (for caching/queuing)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379/0

# Celery Configuration (for background tasks)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://yourdomain.com

# Application Configuration
FASTAPI_APP_ENV=local  # local, staging, production
FASTAPI_SECRET_KEY=your_secret_key_here_min_32_chars
```

### Complete Backend .env Example

```bash
# ==========================================
# GUILD AI BACKEND ENVIRONMENT VARIABLES
# ==========================================

# Google Cloud / Firebase
GOOGLE_CLOUD_PROJECT=guild-ai
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# Database Configuration
DATABASE_URL=postgresql://postgres:securepassword123@localhost:5432/guild_db
POSTGRES_DB=guild_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=securepassword123
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Paystack Configuration (Test Keys)
PAYSTACK_SECRET_KEY=sk_test_REPLACE_WITH_YOUR_TEST_SECRET_KEY
PAYSTACK_PUBLIC_KEY=pk_test_REPLACE_WITH_YOUR_TEST_PUBLIC_KEY

# Optional: Exchange Rate API
EXCHANGE_RATE_API_KEY=your_api_key_here

# OpenAI API
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/1

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Application
FASTAPI_APP_ENV=local
FASTAPI_SECRET_KEY=change_this_to_a_random_secret_key_min_32_chars
```

---

## Production Deployment

### Google Cloud Run

For production deployment on Cloud Run, use environment variables and Secret Manager:

```yaml
# In your cloudbuild.yaml or Cloud Run configuration
env_variables:
  - GOOGLE_CLOUD_PROJECT=guild-ai
  - DATABASE_URL=postgresql://...
  - ALLOWED_ORIGINS=https://yourdomain.com
  
secrets:
  - FIREBASE_SERVICE_ACCOUNT:latest  # From Secret Manager
  - PAYSTACK_SECRET_KEY:latest
  - OPENAI_API_KEY:latest
  - DB_PASSWORD:latest
```

### Setting Secrets in Cloud Run

```bash
# Create secrets in Secret Manager
gcloud secrets create firebase-service-account --data-file=firebase-service-account.json
gcloud secrets create paystack-secret-key --data-file=-  # paste key when prompted
gcloud secrets create openai-api-key --data-file=-

# Grant access to Cloud Run service account
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT@PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Environment Variable Priority

### Frontend (Vite)
1. `.env.production` (production build)
2. `.env.local` (local override, not committed)
3. `.env` (default)

### Backend (Python/FastAPI)
1. Environment variables set in shell/system
2. `.env.production` or `.env.local` (if using python-dotenv)
3. `.env` (default)

---

## Security Best Practices

### DO NOT:
- ❌ Commit `.env` files to git
- ❌ Share API keys in public repositories
- ❌ Use production keys in development
- ❌ Expose service account keys in frontend code

### DO:
- ✅ Add `.env` to `.gitignore`
- ✅ Use separate keys for development and production
- ✅ Rotate keys regularly
- ✅ Use Secret Manager for production secrets
- ✅ Limit key permissions to minimum required
- ✅ Monitor key usage for suspicious activity

---

## Verification Checklist

### Frontend
- [ ] Firebase config keys are set
- [ ] API URL points to backend
- [ ] Paystack public key is set
- [ ] All keys use `VITE_` prefix for Vite

### Backend
- [ ] Firebase/Google Cloud project is configured
- [ ] Database connection string is correct
- [ ] Paystack secret key is set
- [ ] CORS origins include frontend URL
- [ ] Service account file exists (dev) or secrets configured (prod)

---

## Troubleshooting

### "Firebase not initialized"
- Check that all `VITE_FIREBASE_*` variables are set
- Verify the API key and project ID are correct
- Ensure variables are prefixed with `VITE_`

### "Invalid token" errors
- Verify `FIREBASE_SERVICE_ACCOUNT_PATH` is correct
- Check that service account has Firebase Admin permissions
- In production, ensure Application Default Credentials are working

### "Paystack initialization failed"
- Check that `VITE_PAYSTACK_PUBLIC_KEY` is set in frontend
- Verify `PAYSTACK_SECRET_KEY` is set in backend
- Ensure you're using the correct keys for your environment (test vs live)

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS` in backend
- Check that both frontend and backend URLs use the same protocol (http/https)

---

## Getting API Keys

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to Project Settings > General
4. Scroll to "Your apps" and select or create a Web app
5. Copy the configuration values

### Paystack
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Go to Settings > API Keys & Webhooks
3. Copy your test or live keys

### Exchange Rate API (Optional)
- [ExchangeRate-API](https://www.exchangerate-api.com/) - Free tier available
- [Fixer.io](https://fixer.io/) - Requires registration

---

## Next Steps

1. Copy the example `.env` files to your frontend and backend directories
2. Fill in your actual API keys and configuration
3. Verify all services are accessible with test requests
4. Set up Secret Manager for production deployment
5. Deploy to Cloud Run with environment variables configured

Your environment is now ready for development and production! 🚀

