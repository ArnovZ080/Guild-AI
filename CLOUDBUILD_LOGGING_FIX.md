# Cloud Build Logging Fix

## Problem
When using a custom service account with Cloud Build, you must specify logging configuration. Without it, builds fail with:

```
if 'build.service_account' is specified, the build must either 
(a) specify 'build.logs_bucket', 
(b) use the REGIONAL_USER_OWNED_BUCKET build.options.default_logs_bucket_behavior option, or 
(c) use either CLOUD_LOGGING_ONLY / NONE logging options
```

## Solution
Added logging configuration to `cloudbuild.yaml`:

```yaml
options:
  logging: CLOUD_LOGGING_ONLY
  logStreamingOption: STREAM_ON
```

## What This Does
- **`logging: CLOUD_LOGGING_ONLY`**: Sends all build logs to Cloud Logging (not to a separate bucket)
- **`logStreamingOption: STREAM_ON`**: Enables real-time log streaming during builds

## Why This Works
When you use a custom service account in Cloud Build (instead of the default), Google requires explicit logging configuration for security and audit purposes. The `CLOUD_LOGGING_ONLY` option satisfies this requirement by directing logs to Cloud Logging, which is the standard logging service.

## Alternative Solutions

### Option 1: Use Cloud Logging (Current Solution) ✅
```yaml
options:
  logging: CLOUD_LOGGING_ONLY
```
**Pros:** Simple, no bucket setup needed, integrated with Cloud Console
**Cons:** None for most use cases

### Option 2: Use Custom Logs Bucket
```yaml
logsBucket: gs://your-logs-bucket
```
**Pros:** Full control over log storage, can be useful for compliance
**Cons:** Requires creating and managing a GCS bucket

### Option 3: Use Regional User-Owned Bucket
```yaml
options:
  defaultLogsBucketBehavior: REGIONAL_USER_OWNED_BUCKET
```
**Pros:** Automatic bucket creation in your project
**Cons:** More complex, adds cost for bucket storage

## Verification

After this fix, your builds should:
1. ✅ Start successfully (no longer fail immediately)
2. ✅ Show logs in Cloud Console at: `https://console.cloud.google.com/cloud-build/builds/BUILD_ID`
3. ✅ Stream logs in real-time during the build
4. ✅ Deploy successfully to Cloud Run

## Related Files
- `cloudbuild.yaml` - Build configuration (now fixed)
- `.github/workflows/deploy-to-cloud-run.yml` - GitHub Actions workflow (no changes needed)

## Next Steps
1. Commit this fix to the repository
2. Push to GitHub (will trigger the workflow)
3. Monitor the build at: https://console.cloud.google.com/cloud-build/builds?project=guild-ai-080

The build should now complete successfully! 🚀

