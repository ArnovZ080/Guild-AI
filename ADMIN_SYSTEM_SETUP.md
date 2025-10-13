# Admin System Setup Guide

## 🎯 How the System Identifies Admins

The system uses **THREE methods** to identify admins (in priority order):

### **Method 1: ADMIN_EMAILS Environment Variable** (Highest Priority) ✅ **RECOMMENDED**

Set admin emails in Cloud Run:

```bash
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars ADMIN_EMAILS="your@email.com,partner@email.com"
```

**Pros:**
- ✅ Instant admin access
- ✅ No database changes needed
- ✅ Can't be revoked by other admins
- ✅ Survives database resets
- ✅ Most secure (controlled by infrastructure)

### **Method 2: Database is_admin Flag**

Users can be marked as admin in the database:

```sql
UPDATE users SET is_admin = TRUE, admin_role = 'admin' WHERE email = 'user@email.com';
```

**Pros:**
- ✅ Manageable through admin UI
- ✅ Can delegate admin access
- ✅ Revocable

### **Method 3: First User (Owner)** (Automatic)

The **first user to sign up** is automatically made an admin with role "owner".

**Pros:**
- ✅ No configuration needed
- ✅ Ensures platform always has an admin
- ✅ Perfect for single-owner platforms

---

## 🔒 Admin Access Control

### What Admins Can Do:

1. **Beta Access Management**
   - View all waiting list entries
   - Grant/revoke beta access
   - Add beta testers manually
   - Export waiting list to CSV
   - View statistics

2. **User Management** (Future)
   - View all users
   - Manage subscriptions
   - View usage statistics
   - Handle support requests

3. **Platform Configuration** (Future)
   - System settings
   - Feature flags
   - Integration management

### What Admins See:

- ✅ "Beta Access Management" section in Settings (hidden for non-admins)
- ✅ Admin badge/indicator (optional, can be added)
- ✅ Additional menu items (future)
- ✅ Analytics dashboards (future)

---

## 🚀 Quick Setup (3 Methods)

### **Method 1: Set Your Email as Admin (RECOMMENDED)**

```bash
# Set admin emails (comma-separated for multiple admins)
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars ADMIN_EMAILS="your@email.com"

# For multiple admins:
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars ADMIN_EMAILS="owner@email.com,admin1@email.com,admin2@email.com"
```

**This takes effect immediately (no redeployment needed)!**

### **Method 2: Be the First User**

Simply sign up first! The first user is automatically made an admin.

1. Deploy the platform
2. Be the first to sign up
3. You're automatically admin ✅

### **Method 3: Database Update**

If you already have an account, update the database:

```bash
# Connect to Cloud SQL
gcloud sql connect guild-ai-sql --user=postgres --project=guild-ai-080

# In psql:
UPDATE users SET is_admin = TRUE, admin_role = 'owner' WHERE email = 'your@email.com';
```

---

## 🧪 Testing Admin Access

### Step 1: Set Yourself as Admin

```bash
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars ADMIN_EMAILS="your@email.com"
```

### Step 2: Log Into Guild AI

1. Go to: `https://guildof1.com/login`
2. Log in with your email
3. Go to Settings

### Step 3: Verify Admin Access

You should see:
- ✅ "Beta Access Management" section (visible)
- ✅ Waiting list entries
- ✅ Grant Access buttons
- ✅ Export CSV button
- ✅ Statistics dashboard

### Step 4: Test with Non-Admin

1. Log out
2. Log in with a different account (not in ADMIN_EMAILS)
3. Go to Settings
4. "Beta Access Management" section should be **hidden** ✅

---

## 🎯 Admin Roles (Future Enhancement)

Currently supported roles:
- **owner** - Full access, can't be removed
- **admin** - Full access, can be removed by owner
- **moderator** - Limited access (future)

---

## 📊 How It Works Technically

### Backend Check (`api_server/src/routes/admin_auth.py`):

```python
async def get_current_admin(current_user, db):
    # Priority 1: Check ADMIN_EMAILS env var
    if current_user.email.lower() in ADMIN_EMAILS:
        return current_user
    
    # Priority 2: Check database is_admin flag
    if current_user.is_admin:
        return current_user
    
    # Priority 3: Check if first user (owner)
    first_user = db.query(User).order_by(User.created_at).first()
    if first_user.id == current_user.id:
        return current_user
    
    # Not an admin
    raise HTTPException(403, "Admin access required")
```

### Frontend Check (`frontend/src/components/dashboard/SettingsPage.jsx`):

```javascript
// Check admin status on page load
useEffect(() => {
  const checkAdminStatus = async () => {
    const response = await fetch('/waitlist/is-admin', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setIsAdmin(data.is_admin)
  }
  checkAdminStatus()
}, [])

// Conditionally render admin sections
{isAdmin && (
  <Section title="Beta Access Management">
    <BetaAccessManager />
  </Section>
)}
```

---

## 🔐 Security Features

### Admin Endpoint Protection:

All admin endpoints require authentication:
- ✅ `/waitlist/list` - Requires `get_current_admin`
- ✅ `/waitlist/grant-beta-access` - Requires `get_current_admin`
- ✅ `/waitlist/revoke-beta-access` - Requires `get_current_admin`
- ✅ `/waitlist/stats` - Requires `get_current_admin`

### Frontend Protection:

- ✅ Admin sections hidden for non-admins
- ✅ API calls fail with 403 if not admin
- ✅ No way to bypass (server-side validation)

### Audit Trail:

- ✅ `beta_access_granted_by` tracks who granted access
- ✅ `admin_granted_at` tracks when admin access was given
- ✅ All actions logged (future enhancement)

---

## 📋 Complete Setup Checklist

### For Platform Owner:

- [ ] Deploy the platform (current build)
- [ ] Set your email as admin:
  ```bash
  gcloud run services update guild-ai-api \
    --region us-central1 \
    --project guild-ai-080 \
    --set-env-vars ADMIN_EMAILS="your@email.com"
  ```
- [ ] Set beta tester emails:
  ```bash
  gcloud run services update guild-ai-api \
    --region us-central1 \
    --project guild-ai-080 \
    --update-env-vars BETA_TESTER_EMAILS="your@email.com,beta1@email.com,beta2@email.com"
  ```
- [ ] Sign up with your email
- [ ] Verify you see "Beta Access Management" in Settings
- [ ] Test granting beta access to a waiting list entry

### For Additional Admins:

**Option A: Add to ADMIN_EMAILS (Recommended)**
```bash
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars ADMIN_EMAILS="owner@email.com,admin1@email.com,admin2@email.com"
```

**Option B: Database Update**
```sql
UPDATE users SET is_admin = TRUE, admin_role = 'admin' WHERE email = 'newadmin@email.com';
```

---

## 🎨 Customization

### Add Admin Badge to UI:

In `SettingsPage.jsx`, add an admin indicator:

```javascript
{isAdmin && (
  <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
    ✨ Admin
  </div>
)}
```

### Add More Admin Features:

Create new admin-only sections:

```javascript
{isAdmin && (
  <Section title="User Management">
    <UserManagementInterface />
  </Section>
)}

{isAdmin && (
  <Section title="Platform Analytics">
    <AdminAnalytics />
  </Section>
)}
```

---

## 🔄 Combined Setup Command

Set both admin and beta tester emails at once:

```bash
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars ADMIN_EMAILS="your@email.com" \
  --update-env-vars BETA_TESTER_EMAILS="your@email.com,beta1@email.com,beta2@email.com"
```

**Note:** Your email should be in BOTH lists:
- `ADMIN_EMAILS` - So you can manage the platform
- `BETA_TESTER_EMAILS` - So you can sign up and test

---

## 🎯 Summary

### Three Ways to Be Admin:

1. **ADMIN_EMAILS env var** ✅ **RECOMMENDED**
   - Most secure
   - Infrastructure-level control
   - Can't be revoked by other admins

2. **Database is_admin flag**
   - Manageable through UI
   - Can be delegated
   - Revocable

3. **First user (automatic)**
   - No setup needed
   - Owner by default
   - Perfect for solo founders

### What Admins Can Do:

✅ View waiting list
✅ Grant/revoke beta access
✅ Add beta testers manually
✅ Export waiting list
✅ View statistics
✅ Manage platform (future features)

### Security:

✅ Server-side validation
✅ 403 error if not admin
✅ Hidden UI for non-admins
✅ Audit trail of admin actions

---

## 🚀 Quick Start

**After deployment:**

```bash
# 1. Set yourself as admin
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars ADMIN_EMAILS="your@email.com" \
  --update-env-vars BETA_TESTER_EMAILS="your@email.com,friend@email.com"

# 2. Sign up at https://guildof1.com/signup
# 3. Log in and go to Settings
# 4. See "Beta Access Management" section ✅
# 5. Start managing your platform!
```

**That's it! You're the admin!** 🎉

---

## 📄 Files Created/Modified

- `api_server/src/models.py` - Added `is_admin`, `admin_role`, `admin_granted_at` columns
- `api_server/src/routes/admin_auth.py` - Admin authentication helpers (created)
- `api_server/src/routes/waitlist.py` - Updated to require admin for sensitive endpoints
- `frontend/src/components/dashboard/SettingsPage.jsx` - Conditional admin section rendering
- `cloudbuild.yaml` - Added admin column migrations

---

**Your admin system is complete and secure!** 🔒✨

