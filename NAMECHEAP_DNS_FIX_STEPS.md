# Namecheap DNS Fix for guildof1.com - Step by Step

## 🎯 Your DNS Provider: **Namecheap**

Your domain uses Namecheap DNS servers:
- `dns1.registrar-servers.com`
- `dns2.registrar-servers.com`

## 📋 Step-by-Step Instructions

### Step 1: Log Into Namecheap

1. Go to: https://www.namecheap.com
2. Click "Sign In" (top right)
3. Enter your credentials

### Step 2: Navigate to DNS Management

1. Click "Domain List" (left sidebar)
2. Find `guildof1.com` in your list
3. Click "Manage" button next to it
4. Click "Advanced DNS" tab

### Step 3: Identify the Problem Record

You'll see a list of DNS records. Find this ONE record to DELETE:

```
Type: A Record
Host: @ (or blank)
Value: 75.2.60.5
TTL: Automatic (or 3600)

[🗑️ Delete] ← Click the trash icon
```

**This is your old AWS server causing the SSL error!**

### Step 4: Delete the Old Record

1. Find the record with value `75.2.60.5`
2. Click the trash/delete icon (🗑️) on the right side
3. Confirm deletion if prompted

### Step 5: Verify Cloud Run Records Exist

Make sure you have these 4 A Records (if missing, add them):

```
Type: A Record
Host: @
Value: 216.239.32.21
TTL: Automatic

Type: A Record
Host: @
Value: 216.239.34.21
TTL: Automatic

Type: A Record
Host: @
Value: 216.239.36.21
TTL: Automatic

Type: A Record
Host: @
Value: 216.239.38.21
TTL: Automatic
```

**To add a missing record:**
1. Click "+ ADD NEW RECORD" button
2. Select "A Record" from Type dropdown
3. Host: `@`
4. Value: (one of the IPs above)
5. TTL: Automatic
6. Click the green checkmark (✓) to save

### Step 6: Add AAAA Records (IPv6)

If you don't have these, add them:

```
Type: AAAA Record
Host: @
Value: 2001:4860:4802:32::15
TTL: Automatic

Type: AAAA Record
Host: @
Value: 2001:4860:4802:34::15
TTL: Automatic

Type: AAAA Record
Host: @
Value: 2001:4860:4802:36::15
TTL: Automatic

Type: AAAA Record
Host: @
Value: 2001:4860:4802:38::15
TTL: Automatic
```

**To add AAAA records:**
1. Click "+ ADD NEW RECORD"
2. Select "AAAA Record" from Type dropdown
3. Host: `@`
4. Value: (one of the IPv6 addresses above)
5. TTL: Automatic
6. Click the green checkmark (✓) to save
7. Repeat for all 4 AAAA records

### Step 7: Save All Changes

Namecheap auto-saves, but make sure you see:
- Green checkmarks next to all records
- "Changes saved successfully" message (if shown)

### Step 8: Wait for DNS Propagation

**Timeline:**
- 0-5 minutes: Namecheap processes changes
- 5-15 minutes: DNS propagates globally
- 15-30 minutes: All browsers see new DNS

**While waiting, your app is accessible at:**
```
https://guild-ai-api-7addhhtmoa-uc.a.run.app
```

## ✅ Verification (After 15 Minutes)

### Test 1: Check DNS on Your Computer

```bash
dig guildof1.com A +short
```

**Expected output (NO 75.2.60.5):**
```
216.239.36.21
216.239.32.21
216.239.34.21
216.239.38.21
```

### Test 2: Clear Chrome HSTS Cache

1. Open Chrome
2. Navigate to: `chrome://net-internals/#hsts`
3. Scroll to "Delete domain security policies"
4. Enter: `guildof1.com`
5. Click "Delete"
6. Under "Query HSTS/PKP domain", enter: `guildof1.com`
7. Should say "Not found" ✅
8. Close and reopen Chrome

### Test 3: Try Your Site

**Option A: Incognito Mode (Easiest)**
1. Open Incognito window: `Cmd+Shift+N` (Mac) or `Ctrl+Shift+N` (Windows)
2. Go to: `https://guildof1.com`
3. Should load with green padlock ✅

**Option B: Regular Browser (After HSTS cache clear)**
1. Go to: `https://guildof1.com`
2. Should load with green padlock ✅

## 🎯 Expected Final Result

✅ **Site loads:** `https://guildof1.com`  
✅ **Green padlock** in address bar  
✅ **Valid SSL certificate** from Google  
✅ **No security warnings**  
✅ **All content loads** properly  

## 📊 Your Current DNS Records

### ❌ Current (WRONG - has old server):
```
A Records:
├─ 216.239.32.21 ✅
├─ 216.239.34.21 ✅
├─ 216.239.36.21 ✅
├─ 216.239.38.21 ✅
└─ 75.2.60.5      ❌ ← DELETE THIS!
```

### ✅ Correct (GOAL):
```
A Records:
├─ 216.239.32.21 ✅
├─ 216.239.34.21 ✅
├─ 216.239.36.21 ✅
└─ 216.239.38.21 ✅

AAAA Records:
├─ 2001:4860:4802:32::15 ✅
├─ 2001:4860:4802:34::15 ✅
├─ 2001:4860:4802:36::15 ✅
└─ 2001:4860:4802:38::15 ✅
```

## 🚨 If You Can't Find the Old Record

If you don't see the `75.2.60.5` record in Namecheap:

1. **Check for wildcard records** (`*` in Host field)
2. **Check subdomains** (www, api, etc.)
3. **Screenshot your DNS page** and share it
4. **The record might already be deleted** - just wait 15 min and test

## 💡 Pro Tips

1. **Namecheap auto-saves** - no "Save" button needed
2. **Use Automatic TTL** - easier to manage
3. **Keep both A and AAAA records** - better performance
4. **Don't delete ALL records** - only the 75.2.60.5 one
5. **Clear browser cache** after DNS fix

## 📞 Need Help?

If you're stuck, Namecheap support can help:
- **Live Chat:** https://www.namecheap.com/support/live-chat/
- **Support Ticket:** https://www.namecheap.com/support/

Tell them: *"I need to remove the A record pointing to 75.2.60.5 for guildof1.com and ensure only Google Cloud Run IPs remain"*

## 🎉 Summary

**What you're doing:** Removing old AWS server IP from DNS  
**Why:** It has an invalid SSL certificate causing HSTS errors  
**How long:** 15-30 minutes after DNS change  
**Result:** HTTPS works perfectly with green padlock ✅

**Your Cloud Run deployment is working perfectly. This is just a DNS cleanup!** 🚀

