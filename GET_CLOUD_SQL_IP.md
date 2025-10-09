# Get Cloud SQL Public IP Address

## Quick Command

Run this command to get your Cloud SQL public IP:

```bash
gcloud sql instances describe guild-ai-sql \
  --project=guild-ai-080 \
  --format="get(ipAddresses[0].ipAddress)"
```

## Alternative: Use GCP Console

1. Go to: https://console.cloud.google.com/sql/instances
2. Click on `guild-ai-sql`
3. Look for **Public IP address** in the **Connect to this instance** section
4. Copy the IP address (format: xxx.xxx.xxx.xxx)

## Update cloudbuild.yaml

Once you have the IP address, update line in `cloudbuild.yaml`:

**Find this line:**
```yaml
- 'CLOUDSQL_PUBLIC_IP=YOUR_CLOUD_SQL_PUBLIC_IP'  # Get from: gcloud sql instances describe guild-ai-sql --format='get(ipAddresses[0].ipAddress)'
```

**Replace with:**
```yaml
- 'CLOUDSQL_PUBLIC_IP=<YOUR_ACTUAL_IP_HERE>'
```

For example:
```yaml
- 'CLOUDSQL_PUBLIC_IP=34.118.200.10'
```

## Why This Is Needed

- **Cloud Build (migrations)**: Cannot access Unix socket `/cloudsql/...`, needs public IP
- **Cloud Run (deployment)**: Uses Unix socket for secure, direct connection

The Django settings now automatically:
- Use **public IP** when `CLOUDSQL_PUBLIC_IP` is set (during migrations)
- Use **Unix socket** when deployed to Cloud Run (more secure)

