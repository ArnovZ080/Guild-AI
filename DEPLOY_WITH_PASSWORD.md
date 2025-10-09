# 🚀 Deploy to Cloud Run with Database Password

## Problem
The migration step cannot access Secret Manager during Cloud Build, so we need to pass the database password directly via a substitution variable.

## ✅ Solution: Use Build Substitutions

The `cloudbuild.yaml` has been updated to accept a `_DB_PASSWORD` substitution variable.

## 📋 Step-by-Step Deployment

### Step 1: Get Your Database Password

Run this command to retrieve the password from Secret Manager:

```bash
gcloud secrets versions access latest \
  --secret=db-root-password \
  --project=guild-ai-080
```

**Copy the password that is displayed.**

### Step 2: Deploy with the Password

Run the deployment command with the password as a substitution:

```bash
gcloud builds submit --config=cloudbuild.yaml . \
  --substitutions=_DB_PASSWORD="YOUR_PASSWORD_HERE"
```

**Replace `YOUR_PASSWORD_HERE` with the actual password from Step 1.**

### Alternative: One-Line Command

You can combine both steps into one command:

```bash
DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-root-password --project=guild-ai-080) && \
gcloud builds submit --config=cloudbuild.yaml . \
  --substitutions=_DB_PASSWORD="$DB_PASSWORD"
```

## 📝 What This Does

The `cloudbuild.yaml` now includes:
```yaml
- 'POSTGRES_PASSWORD=${_DB_PASSWORD}'
```

When you run the build with `--substitutions=_DB_PASSWORD="..."`, Cloud Build replaces `${_DB_PASSWORD}` with your actual password before running the migration step.

## ✅ Expected Behavior

Once deployed successfully, the build will:
1. ✅ Build the Docker image
2. ✅ Push to Google Container Registry
3. ✅ Run database migrations using the password (connects to 35.223.123.143)
4. ✅ Deploy to Cloud Run (uses Unix socket for secure connection)

## 🔒 Security Note

- The password is passed as a build argument
- It's not stored in the cloudbuild.yaml file
- Cloud Build logs may contain the substitution variable name but not the value
- Once deployed, Cloud Run uses the Unix socket (no password needed)

## 🆘 If It Still Fails

If the migration step still fails with password errors:

1. **Verify Cloud SQL allows connections from Cloud Build:**
   - Go to Cloud SQL console
   - Check "Connections" tab
   - Ensure "Public IP" is enabled
   - Add `0.0.0.0/0` to authorized networks (temporarily for testing)

2. **Check the postgres user has no SSL requirement:**
   - Go to Cloud SQL → Users
   - Click on `postgres` user
   - Ensure SSL is NOT required

3. **Verify the password is correct:**
   ```bash
   # Test connection from local machine
   PGPASSWORD=$(gcloud secrets versions access latest --secret=db-root-password --project=guild-ai-080) \
   psql -h 35.223.123.143 -U postgres -d workflow_db
   ```

## 📞 Next Steps

After successful deployment, you can:
1. View your deployed service:
   ```bash
   gcloud run services describe guild-ai-api --region us-central1
   ```

2. Get the service URL:
   ```bash
   gcloud run services describe guild-ai-api --region us-central1 --format="value(status.url)"
   ```

3. Test the deployed application:
   ```bash
   curl https://[YOUR-SERVICE-URL]/health
   ```

