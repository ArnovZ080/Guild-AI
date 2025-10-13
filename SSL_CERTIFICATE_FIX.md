# SSL Certificate Fix for guildof1.com

## Problem
When accessing `guildof1.com`, you see:
```
Your connection is not private
net::ERR_CERT_COMMON_NAME_INVALID
```

This means the custom domain is pointing to Cloud Run, but SSL/TLS is not properly configured.

## Root Cause
Cloud Run provides automatic HTTPS, but only for the default `*.run.app` URLs. For custom domains like `guildof1.com`, you need to:
1. Map the domain to Cloud Run
2. Verify domain ownership
3. Wait for Google to provision an SSL certificate (automatic, but takes time)

## Solution: Configure Custom Domain with SSL

### Step 1: Map Custom Domain to Cloud Run

Run this command to add your custom domain:

```bash
gcloud run domain-mappings create \
  --service guild-ai-api \
  --domain guildof1.com \
  --region us-central1 \
  --project guild-ai-080
```

This will:
- Create a domain mapping
- Provide DNS records you need to configure
- Automatically provision an SSL certificate (takes 15-60 minutes)

### Step 2: Get DNS Records

After running the command above, you'll get DNS records like:

```
Please add the following DNS records to your domain:

Type: A
Name: guildof1.com (or @)
Value: 216.239.32.21
       216.239.34.21
       216.239.36.21
       216.239.38.21

Type: AAAA
Name: guildof1.com (or @)
Value: 2001:4860:4802:32::15
       2001:4860:4802:34::15
       2001:4860:4802:36::15
       2001:4860:4802:38::15
```

### Step 3: Configure DNS (in your domain registrar)

Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.) and:

1. **Remove existing DNS records** for `guildof1.com` that point elsewhere
2. **Add the A records** provided by Cloud Run
3. **Add the AAAA records** (IPv6) provided by Cloud Run
4. **For www subdomain**, add a CNAME record:
   ```
   Type: CNAME
   Name: www
   Value: guildof1.com
   ```

### Step 4: Verify DNS Propagation

Wait 5-15 minutes for DNS to propagate, then check:

```bash
# Check A records
dig guildof1.com A

# Check AAAA records
dig guildof1.com AAAA

# Or use online tool
# https://www.whatsmydns.net/#A/guildof1.com
```

### Step 5: Wait for SSL Certificate Provisioning

Google will automatically provision a **free managed SSL certificate** for your domain. This takes:
- **15-60 minutes** typically
- Up to **24 hours** in rare cases

You can check the status:

```bash
gcloud run domain-mappings describe guildof1.com \
  --region us-central1 \
  --platform managed \
  --project guild-ai-080
```

Look for `certificateStatus: ACTIVE`

## Alternative: Quick Access via Cloud Run URL

While waiting for SSL to provision, you can access your app via the default Cloud Run URL:

```
https://guild-ai-api-881782424.us-central1.run.app
```

This URL has SSL automatically configured and works immediately.

## Verification

Once SSL is provisioned, test:

1. **HTTP (should redirect to HTTPS)**:
   ```bash
   curl -I http://guildof1.com
   # Should return 301 or 302 redirect to https://
   ```

2. **HTTPS (should work with valid certificate)**:
   ```bash
   curl -I https://guildof1.com
   # Should return 200 OK with valid SSL
   ```

3. **Browser**: Navigate to `https://guildof1.com`
   - Should show your app
   - No security warnings
   - Green padlock in address bar

## Troubleshooting

### Issue: "Domain mapping already exists"
```bash
# Delete existing mapping
gcloud run domain-mappings delete guildof1.com \
  --region us-central1 \
  --platform managed \
  --project guild-ai-080

# Then recreate it
gcloud run domain-mappings create ...
```

### Issue: "DNS not propagated after hours"
- Check DNS records are correct (no typos)
- Check for conflicting records (remove old A/AAAA records)
- Try flushing DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

### Issue: "SSL still not provisioning after 24 hours"
```bash
# Check domain mapping status
gcloud run domain-mappings describe guildof1.com \
  --region us-central1 \
  --project guild-ai-080

# If stuck, delete and recreate
gcloud run domain-mappings delete guildof1.com --region us-central1 --project guild-ai-080
gcloud run domain-mappings create --service guild-ai-api --domain guildof1.com --region us-central1 --project guild-ai-080
```

## Best Practices

### 1. Use Both guildof1.com and www.guildof1.com

Map both:
```bash
# Main domain
gcloud run domain-mappings create --service guild-ai-api --domain guildof1.com --region us-central1 --project guild-ai-080

# WWW subdomain
gcloud run domain-mappings create --service guild-ai-api --domain www.guildof1.com --region us-central1 --project guild-ai-080
```

### 2. Enable HTTPS Redirect (automatic with Cloud Run)
Cloud Run automatically redirects HTTP → HTTPS, no configuration needed.

### 3. Update Frontend API URL
Once SSL is active, ensure your frontend `.env` has:
```
VITE_API_URL=https://guildof1.com
```

### 4. Test SSL Certificate
```bash
# Check certificate details
openssl s_client -connect guildof1.com:443 -servername guildof1.com

# Or use online tool
# https://www.ssllabs.com/ssltest/analyze.html?d=guildof1.com
```

## Expected Timeline

| Step | Time |
|------|------|
| Create domain mapping | < 1 minute |
| DNS propagation | 5-60 minutes |
| SSL certificate provisioning | 15-60 minutes |
| **Total** | **20-120 minutes** |

## Current Status Check

Run these commands to see current state:

```bash
# List all domain mappings
gcloud run domain-mappings list --region us-central1 --project guild-ai-080

# Check specific domain
gcloud run domain-mappings describe guildof1.com --region us-central1 --project guild-ai-080

# Check service URL
gcloud run services describe guild-ai-api --region us-central1 --project guild-ai-080 --format="value(status.url)"
```

## Summary

**Quick Steps:**
1. Run `gcloud run domain-mappings create` command
2. Get DNS records from the output
3. Configure DNS at your domain registrar
4. Wait 15-60 minutes for SSL to provision
5. Access `https://guildof1.com` with valid SSL ✅

**In the meantime:**
- Access via Cloud Run URL: `https://guild-ai-api-881782424.us-central1.run.app`
- This URL works immediately with valid SSL

Let me know once you've added the DNS records, and I can help verify the setup! 🚀

