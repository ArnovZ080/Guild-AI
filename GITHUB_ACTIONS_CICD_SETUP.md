# GitHub Actions CI/CD Setup for Guild AI

## 🚀 Automatic Deployment on Every Push

Instead of manually running `gcloud builds submit` every time, set up GitHub Actions to **automatically deploy** whenever you push to the `main` branch.

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Run the Setup Script

```bash
cd /Users/arnovanzyl/Dropbox/Mac\ \(2\)/Documents/GitHub/Guild-AI
./setup-github-actions-ci-cd.sh
```

This script will:
- ✅ Enable required Google Cloud APIs
- ✅ Create a service account for GitHub Actions
- ✅ Grant necessary permissions (Cloud Run, Cloud Build, Secret Manager)
- ✅ Set up Workload Identity Federation
- ✅ Output the values you need for GitHub secrets

### Step 2: Add Secrets to GitHub

The script will output two values. Add them to your GitHub repository:

1. Go to: https://github.com/ArnovZ080/Guild-AI/settings/secrets/actions

2. Click **"New repository secret"**

3. Add these two secrets:

   **Secret 1:**
   - Name: `WIF_PROVIDER`
   - Value: `projects/[NUMBER]/locations/global/workloadIdentityPools/github-actions-pool/providers/github-provider`

   **Secret 2:**
   - Name: `WIF_SERVICE_ACCOUNT`
   - Value: `github-actions-deployer@guild-ai-080.iam.gserviceaccount.com`

### Step 3: Test the Workflow

1. Make any small change to your code
2. Commit and push to main:
   ```bash
   git add .
   git commit -m "Test: Trigger CI/CD deployment"
   git push origin main
   ```

3. Watch the deployment:
   - Go to: https://github.com/ArnovZ080/Guild-AI/actions
   - You'll see the workflow running
   - Click on it to see live logs

4. After ~15-20 minutes, your changes will be live!

---

## ✨ Benefits

### Before (Manual Deployment):
```bash
# You had to run this every time:
DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-root-password --project=guild-ai-080) && \
gcloud builds submit --config=cloudbuild.yaml . \
  --substitutions=_DB_PASSWORD="$DB_PASSWORD"
```

### After (Automatic Deployment):
```bash
# Just commit and push:
git add .
git commit -m "Feature: Add new feature"
git push origin main

# ✨ Deployment happens automatically!
```

---

## 🔒 Security Features

### Keyless Authentication
- ✅ **No API keys stored in GitHub** - Uses Workload Identity Federation
- ✅ **Short-lived tokens** - GitHub gets temporary credentials
- ✅ **Limited scope** - Service account has only needed permissions
- ✅ **Audit trail** - All deployments logged in Google Cloud

### Access Control
- ✅ Only pushes to `main` branch trigger deployment
- ✅ Can be manually triggered from GitHub Actions UI
- ✅ Secrets are encrypted in GitHub
- ✅ Service account can't be used outside GitHub Actions

---

## 📊 Workflow Details

### What Happens on Each Push:

1. **GitHub detects push** to main branch
2. **GitHub Action starts** on Ubuntu VM
3. **Authenticates to Google Cloud** using Workload Identity
4. **Gets DB password** from Secret Manager
5. **Runs Cloud Build** with your `cloudbuild.yaml`
6. **Cloud Build:**
   - Builds Docker image
   - Pushes to Container Registry
   - Runs database migrations
   - Deploys to Cloud Run
7. **Service goes live** automatically!

### Deployment Time:
- **Full deployment:** ~15-20 minutes
- **If no dependency changes:** ~10-12 minutes
- **Container startup:** ~5-10 seconds

---

## 🎯 Current Setup Status

✅ **Workflow created:** `.github/workflows/deploy-to-cloud-run.yml`  
✅ **Setup script created:** `setup-github-actions-ci-cd.sh`  
⏳ **Waiting for:** You to run the setup script and add GitHub secrets

---

## 🛠️ Customization Options

### Deploy on Pull Request (Optional)

Add to `.github/workflows/deploy-to-cloud-run.yml`:

```yaml
on:
  push:
    branches:
      - main
  pull_request:  # Add this
    branches:
      - main
```

### Deploy to Staging First (Optional)

Create a separate workflow for staging:

```yaml
# .github/workflows/deploy-to-staging.yml
on:
  push:
    branches:
      - develop

env:
  SERVICE_NAME: guild-ai-api-staging
```

### Only Deploy Backend Changes

Add path filters:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - 'api_server/**'
      - 'guild/**'
      - 'cloudbuild.yaml'
```

---

## 🧪 Testing Without Deployment

If you want to test changes **without triggering deployment:**

1. **Push to a different branch:**
   ```bash
   git checkout -b feature/my-feature
   git push origin feature/my-feature
   ```

2. **Skip CI with commit message:**
   ```bash
   git commit -m "WIP: Work in progress [skip ci]"
   ```

---

## 🆘 Troubleshooting

### "Permission denied" errors
→ Make sure you ran `setup-github-actions-ci-cd.sh`  
→ Verify service account has necessary roles  
→ Check that secrets are added to GitHub correctly

### "Workload Identity Pool not found"
→ Wait a few minutes after running setup script  
→ Verify pool was created: `gcloud iam workload-identity-pools list --location=global`

### Workflow not triggering
→ Check `.github/workflows` directory exists  
→ Verify you pushed to `main` branch  
→ Check GitHub Actions tab for error messages

### Build fails
→ Check GitHub Actions logs for detailed error  
→ Verify cloudbuild.yaml is valid  
→ Check that all secrets exist in Secret Manager

---

## 📈 Next Steps After Setup

1. ✅ Run `./setup-github-actions-ci-cd.sh`
2. ✅ Add the two secrets to GitHub
3. ✅ Push any change to test
4. ✅ Watch it deploy automatically!
5. ✅ **Never manually deploy again** (unless you want to)

---

## 💡 Pro Tips

### Faster Deployments
- Frontend changes don't need backend deployment - deploy frontend separately
- Use branch protection to require reviews before merging to main
- Set up staging environment for testing before production

### Cost Optimization
- GitHub Actions gives 2,000 minutes/month free for public repos
- Private repos get 3,000 minutes/month with paid plans
- Each deployment uses ~15-20 minutes

### Monitoring
- Enable GitHub Actions notifications in your settings
- Set up Slack/Discord webhooks for deployment status
- Monitor Cloud Build history in Google Cloud Console

---

**Your CI/CD pipeline is ready to go!** Just run the setup script and add the secrets. 🚀

