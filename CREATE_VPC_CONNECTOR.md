# 🔌 Create VPC Connector for Cloud Run

## 🎯 The Issue

Your Cloud Run deployment is failing with:
```
VPC connector projects/guild-ai-080/locations/us-central1/connectors/guild-ai-vpc-connector does not exist, 
or Cloud Run does not have permission to use it.
```

## 📋 What You Need to Do

The VPC Connector is infrastructure that allows Cloud Run (serverless) to access resources in your VPC network, specifically:
- **Memorystore (Redis)** at 10.87.64.4
- **Cloud SQL** via private IP (optional but recommended)

This is a **one-time setup** that takes 5-10 minutes.

---

## Step 1: Create the VPC Connector

Run this command to create the VPC Connector:

```bash
gcloud compute networks vpc-access connectors create guild-ai-vpc-connector \
  --region=us-central1 \
  --network=default \
  --range="10.8.0.0/28" \
  --min-instances=2 \
  --max-instances=10 \
  --machine-type=e2-micro
```

### 📝 Parameters Explained

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `--region` | `us-central1` | Same region as Cloud Run service |
| `--network` | `default` | Your VPC network name |
| `--range` | `10.8.0.0/28` | IP range for connector (16 IPs) |
| `--min-instances` | `2` | Minimum connector instances |
| `--max-instances` | `10` | Maximum for scaling |
| `--machine-type` | `e2-micro` | Small, cost-effective |

### ⚠️ Important Notes

1. **IP Range:** The `10.8.0.0/28` range must:
   - NOT overlap with existing subnet ranges
   - Be within the `10.0.0.0/8` private range
   - Provide at least 16 IP addresses (/28 = 16 IPs)

2. **If you get an error about range overlap:**
   - Try `10.8.1.0/28`
   - Or `10.9.0.0/28`
   - Or check your VPC subnets and use an unused range

3. **Network Name:** If your VPC network isn't called `default`:
   - Find your network name: `gcloud compute networks list`
   - Update the `--network` parameter

### ⏱️ Wait Time

**This takes 5-10 minutes.** You'll see:
```
Creating VPC Access connector...done.
```

To check status:
```bash
gcloud compute networks vpc-access connectors describe guild-ai-vpc-connector \
  --region=us-central1
```

Wait until `state: READY` appears.

---

## Step 2: Grant Permissions to Service Account

Once the connector is created, grant your Cloud Run service account permission to use it:

```bash
gcloud projects add-iam-policy-binding guild-ai-080 \
  --member="serviceAccount:guild-ai-cloud-run-sa@guild-ai-080.iam.gserviceaccount.com" \
  --role="roles/vpcaccess.user"
```

### Verify Permissions

Check that the permission was added:

```bash
gcloud projects get-iam-policy guild-ai-080 \
  --flatten="bindings[].members" \
  --filter="bindings.members:guild-ai-cloud-run-sa@guild-ai-080.iam.gserviceaccount.com"
```

You should see `roles/vpcaccess.user` in the output.

---

## Step 3: Deploy Again

Once the VPC Connector is `READY` and permissions are granted, run the deployment:

```bash
DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-root-password --project=guild-ai-080) && \
gcloud builds submit --config=cloudbuild.yaml . \
  --substitutions=_DB_PASSWORD="$DB_PASSWORD"
```

---

## 🔍 Verification Commands

### Check if VPC Connector exists:
```bash
gcloud compute networks vpc-access connectors list --region=us-central1
```

### Check connector status:
```bash
gcloud compute networks vpc-access connectors describe guild-ai-vpc-connector \
  --region=us-central1 \
  --format="get(state)"
```

Should return: `READY`

### Check service account permissions:
```bash
gcloud projects get-iam-policy guild-ai-080 \
  --flatten="bindings[].members" \
  --filter="bindings.role:roles/vpcaccess.user"
```

Should include your service account.

---

## 🆘 Troubleshooting

### Error: "IP range overlaps with existing subnet"

Try a different range:
```bash
# Try these alternatives:
--range="10.8.1.0/28"
--range="10.9.0.0/28"
--range="10.10.0.0/28"
```

### Error: "Network 'default' not found"

List your networks:
```bash
gcloud compute networks list
```

Update the `--network` parameter with your actual network name.

### Check what ranges are already used:
```bash
gcloud compute networks subnets list --network=default
```

Choose a range that doesn't overlap with any listed subnet.

---

## 📊 Expected Timeline

1. **Run create command:** 30 seconds
2. **VPC Connector creation:** 5-10 minutes ⏱️
3. **Grant permissions:** 10 seconds
4. **Deploy to Cloud Run:** 5-10 minutes
5. **Total:** ~15-20 minutes

---

## ✅ After VPC Connector is Ready

Once you see the connector is `READY`, your deployment will succeed because:

- ✅ Cloud Run can access Redis (10.87.64.4) via VPC
- ✅ Entrypoint script can connect to Redis
- ✅ Application can start successfully
- ✅ Health checks pass
- ✅ Service goes live

---

## 🚀 Quick Start Commands

Copy and paste these in order:

```bash
# 1. Create VPC Connector (wait 5-10 minutes)
gcloud compute networks vpc-access connectors create guild-ai-vpc-connector \
  --region=us-central1 \
  --network=default \
  --range="10.8.0.0/28" \
  --min-instances=2 \
  --max-instances=10 \
  --machine-type=e2-micro

# 2. Wait for READY status
gcloud compute networks vpc-access connectors describe guild-ai-vpc-connector \
  --region=us-central1 \
  --format="get(state)"

# 3. Grant permissions
gcloud projects add-iam-policy-binding guild-ai-080 \
  --member="serviceAccount:guild-ai-cloud-run-sa@guild-ai-080.iam.gserviceaccount.com" \
  --role="roles/vpcaccess.user"

# 4. Deploy to Cloud Run
DB_PASSWORD=$(gcloud secrets versions access latest --secret=db-root-password --project=guild-ai-080) && \
gcloud builds submit --config=cloudbuild.yaml . \
  --substitutions=_DB_PASSWORD="$DB_PASSWORD"
```

**Run these commands now!** The VPC Connector is the final missing piece.

