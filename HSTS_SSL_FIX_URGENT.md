# 🚨 URGENT: HSTS SSL Certificate Fix for guildof1.com

## ✅ Diagnosis Complete

### Problem Found
Your DNS has **MIXED records** pointing to two different servers:

**Current DNS A records:**
```
216.239.36.21  ← Google Cloud Run (CORRECT) ✅
216.239.32.21  ← Google Cloud Run (CORRECT) ✅
216.239.34.21  ← Google Cloud Run (CORRECT) ✅
216.239.38.21  ← Google Cloud Run (CORRECT) ✅
75.2.60.5      ← OLD SERVER (WRONG) ❌ <- THIS IS THE PROBLEM
```

**What's happening:**
1. Chrome tries to connect to `guildof1.com`
2. DNS randomly returns one of the IP addresses
3. Sometimes it gets `75.2.60.5` (your old server with invalid/expired SSL certificate)
4. Chrome sees invalid certificate and blocks the connection due to HSTS
5. Because your domain previously had HSTS enabled, Chrome refuses to proceed

### SSL Certificate Status
✅ **Cloud Run SSL is ACTIVE and working!**
```
status:
  conditions:
  - type: CertificateProvisioned
    status: 'True'
  - type: Ready
    status: 'True'
```

## 🔧 IMMEDIATE FIX REQUIRED

### Go to your DNS provider (GoDaddy, Namecheap, Cloudflare, etc.)

### Step 1: Remove the Incorrect A Record

**Find and DELETE this A record:**
```
Type: A
Name: @ (or guildof1.com)
Value: 75.2.60.5  ← DELETE THIS ONE
```

### Step 2: Verify Only Cloud Run IPs Remain

**Keep ONLY these 4 A records:**
```
Type: A
Name: @ (or guildof1.com)
Value: 216.239.32.21
       216.239.34.21
       216.239.36.21
       216.239.38.21
```

### Step 3: Add AAAA Records (if missing)

**Also ensure you have these IPv6 records:**
```
Type: AAAA
Name: @ (or guildof1.com)
Value: 2001:4860:4802:32::15
       2001:4860:4802:34::15
       2001:4860:4802:36::15
       2001:4860:4802:38::15
```

## ⏱️ Timeline After DNS Fix

| Time | What Happens |
|------|--------------|
| **0-5 min** | DNS changes save at registrar |
| **5-15 min** | DNS propagates globally |
| **15-30 min** | Browser can access site with valid SSL |

## 🧪 How to Test

### 1. Verify DNS is Fixed (after 15 minutes)

```bash
# Should show ONLY the 4 Cloud Run IPs (no 75.2.60.5)
dig guildof1.com A +short
```

Expected output:
```
216.239.36.21
216.239.32.21
216.239.34.21
216.239.38.21
```

### 2. Test SSL Certificate

```bash
# Test the certificate
curl -v https://guildof1.com 2>&1 | grep "CN="
```

Should show: `CN=guildof1.com` (valid certificate)

### 3. Clear Chrome HSTS Cache (IMPORTANT!)

Even after DNS is fixed, Chrome may still block due to cached HSTS. Clear it:

**On Chrome:**
1. Navigate to: `chrome://net-internals/#hsts`
2. Under "Delete domain security policies"
3. Enter: `guildof1.com`
4. Click "Delete"
5. Under "Query HSTS/PKP domain"
6. Enter: `guildof1.com`
7. Should say "Not found" (good!)
8. Close and reopen Chrome
9. Try `https://guildof1.com` again

**Alternative: Use Incognito Mode**
- Open new Incognito window (Cmd+Shift+N on Mac, Ctrl+Shift+N on Windows)
- Navigate to `https://guildof1.com`
- Should work immediately once DNS is fixed

## 🔍 What Was the Old Server?

To identify what `75.2.60.5` is:

```bash
# Reverse DNS lookup
dig -x 75.2.60.5
```

This is likely:
- An old hosting provider (GoDaddy, Bluehost, etc.)
- A previous Cloud Run instance
- A parking page
- An expired SSL certificate

## 📋 Quick Action Checklist

- [ ] Log into DNS provider (GoDaddy/Namecheap/Cloudflare/etc.)
- [ ] Find DNS management page for `guildof1.com`
- [ ] Delete A record pointing to `75.2.60.5`
- [ ] Verify 4 Cloud Run A records exist (216.239.x.x)
- [ ] Add 4 AAAA records if missing (2001:4860:x)
- [ ] Save DNS changes
- [ ] Wait 15 minutes for propagation
- [ ] Clear Chrome HSTS cache at `chrome://net-internals/#hsts`
- [ ] Test in Incognito mode: `https://guildof1.com`

## 🎯 Expected Result

After DNS fix + HSTS cache clear:

✅ `https://guildof1.com` loads successfully  
✅ Green padlock in browser  
✅ Valid SSL certificate from Google  
✅ No security warnings  
✅ Site fully accessible  

## 🚨 If Still Not Working After 30 Minutes

### Check DNS Propagation Globally

```bash
# Use online tool to check worldwide
# https://www.whatsmydns.net/#A/guildof1.com
```

Should show ONLY Cloud Run IPs (no 75.2.60.5)

### Force DNS Refresh on Your Computer

**Mac:**
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

**Windows:**
```cmd
ipconfig /flushdns
```

**Linux:**
```bash
sudo systemd-resolve --flush-caches
```

### Use Alternative DNS to Test

```bash
# Test with Google DNS
dig @8.8.8.8 guildof1.com A +short

# Test with Cloudflare DNS
dig @1.1.1.1 guildof1.com A +short
```

## 📞 Need Help?

If you're not sure which DNS provider you're using:

1. **Check domain registrar**: Where did you buy `guildof1.com`?
2. **Check nameservers**:
   ```bash
   dig guildof1.com NS
   ```
   This will show which DNS service is authoritative

Common providers:
- **GoDaddy**: DNS Manager in domain dashboard
- **Namecheap**: Advanced DNS tab
- **Cloudflare**: DNS app → guildof1.com
- **Google Domains**: DNS settings
- **AWS Route53**: Hosted zones

## 🎉 Summary

**The Problem:** Old server IP (75.2.60.5) with invalid SSL is mixed in your DNS

**The Fix:** Delete the old A record, keep only Cloud Run IPs

**The Result:** HTTPS will work perfectly once DNS updates (15-30 min)

**Meanwhile:** Access your app at the Cloud Run URL:
```
https://guild-ai-api-7addhhtmoa-uc.a.run.app
```
This URL works NOW with valid SSL! ✅

---

**Your Cloud Run deployment is working perfectly. The only issue is the mixed DNS records pointing to an old server.** Once you remove that old IP from DNS, everything will work! 🚀

