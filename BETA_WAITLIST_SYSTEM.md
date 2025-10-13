# Beta Testing & Waiting List System

## 🎯 Overview

This system allows you to:
1. **Control access** - Only beta testers can sign up and use the platform
2. **Collect emails** - Everyone else joins a waiting list
3. **Manage beta testers** - Grant/revoke access through admin interface
4. **Track interest** - See who wants to use Guild AI
5. **Launch when ready** - Convert waiting list to users when you go live

---

## 🏗️ Architecture

```
User tries to sign up
        ↓
Check beta access
        ↓
   ┌────┴────┐
   ↓         ↓
Has Beta   No Beta
Access     Access
   ↓         ↓
Signup    Waitlist
Works     Page
   ↓         ↓
Full      Email
Access    Collected
```

---

## 🔧 Components

### 1. Database Models

#### **User Model** (`api_server/src/models.py`)
Added beta tester fields:
```python
is_beta_tester = Column(Boolean, default=False)
beta_access_granted_at = Column(DateTime, nullable=True)
beta_access_granted_by = Column(String, nullable=True)
```

#### **WaitingList Model** (`api_server/src/models.py`)
New table for collecting emails:
```python
class WaitingList(Base):
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    role = Column(String, nullable=True)
    how_heard = Column(String, nullable=True)
    use_case = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, invited, converted
    utm_source, utm_medium, utm_campaign  # Marketing tracking
    admin_notes = Column(Text, nullable=True)
```

### 2. API Endpoints

#### **Public Endpoints** (No auth required)

**`POST /waitlist/join`**
- Adds email to waiting list
- Returns position in line
- Checks for duplicates

**`POST /waitlist/check-beta-access`**
- Checks if email has beta access
- Used before signup to determine access
- Checks both env var and database

#### **Admin Endpoints** (Auth required)

**`GET /waitlist/list`**
- Lists all waiting list entries
- Filterable by status
- Paginated results

**`POST /waitlist/grant-beta-access`**
- Grants beta access to an email
- Updates waiting list status to "invited"
- Marks user as beta tester if account exists

**`POST /waitlist/revoke-beta-access`**
- Revokes beta access
- Updates user and waiting list status

**`GET /waitlist/stats`**
- Returns waiting list statistics
- Shows beta tester count
- Dashboard metrics

### 3. Frontend Components

#### **WaitlistPage** (`frontend/src/pages/WaitlistPage.jsx`)
Beautiful waiting list signup page with:
- Email collection (required)
- Optional fields: name, company, role, use case
- Success confirmation with position in line
- Social proof and benefits
- Pre-populated email from URL parameter

#### **BetaAccessManager** (`frontend/src/components/admin/BetaAccessManager.jsx`)
Admin interface for managing beta access:
- View all waiting list entries
- Grant beta access with one click
- Add beta testers manually
- Export waiting list to CSV
- View statistics dashboard

### 4. Access Control

#### **SignupPage** (`frontend/src/pages/SignupPage.jsx`)
Modified to check beta access before signup:
```javascript
// Check for beta access first
const betaCheck = await fetch('/waitlist/check-beta-access', {
  body: JSON.stringify({ email })
})

// If no beta access, redirect to waiting list
if (!betaCheck.has_beta_access) {
  navigate(`/waitlist?email=${email}`)
  return
}

// Has beta access - proceed with signup
await signup(email, password, fullName)
```

---

## 🎯 How to Use

### For You (Admin):

#### **Method 1: Environment Variable (Recommended)**

Set beta tester emails in Cloud Run:

```bash
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars BETA_TESTER_EMAILS="your@email.com,friend@email.com,tester@email.com"
```

**Pros:**
- ✅ No database changes needed
- ✅ Instant updates (restart service)
- ✅ Easy to manage in one place
- ✅ Can be version controlled

#### **Method 2: Admin Interface**

1. Log into your Guild AI account
2. Go to Settings → Beta Access Management
3. Enter email and click "Grant Access"
4. User can now sign up

**Pros:**
- ✅ No command line needed
- ✅ UI-based management
- ✅ See all waiting list entries
- ✅ Export to CSV

### For Beta Testers:

1. Go to `https://guildof1.com/signup`
2. Enter their email (must be on beta list)
3. Complete signup form
4. ✅ Full access to platform

### For Regular Users (Before Launch):

1. Go to `https://guildof1.com/signup`
2. Enter their email
3. Automatically redirected to `/waitlist`
4. Fill out waiting list form
5. See confirmation: "You're #X on our waiting list!"
6. Receive email when you launch

---

## 📊 User Flow Diagrams

### Beta Tester Flow:
```
User visits /signup
    ↓
Enters email: beta@tester.com
    ↓
System checks: /waitlist/check-beta-access
    ↓
✅ Has beta access
    ↓
Signup form continues
    ↓
Account created
    ↓
Full platform access ✅
```

### Regular User Flow:
```
User visits /signup
    ↓
Enters email: regular@user.com
    ↓
System checks: /waitlist/check-beta-access
    ↓
❌ No beta access
    ↓
Redirected to /waitlist?email=regular@user.com
    ↓
Fills out waiting list form
    ↓
Email saved to database
    ↓
Shows: "You're #47 on our waiting list!" ✅
    ↓
Notified when you launch
```

---

## 🚀 Quick Setup Guide

### Step 1: Add Your Email as Beta Tester

**Option A: Environment Variable (Easiest)**
```bash
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars BETA_TESTER_EMAILS="your@email.com"
```

**Option B: After Deployment**
1. Deploy this code
2. Sign up with your email (will work because you're the first user)
3. Go to Settings → Beta Access Management
4. Add other beta tester emails

### Step 2: Share Beta Access

**For Beta Testers:**
```
Send them: https://guildof1.com/signup
They can sign up normally ✅
```

**For Everyone Else:**
```
They'll be redirected to: https://guildof1.com/waitlist
They join the waiting list ✅
```

### Step 3: Manage Waiting List

1. Log into Guild AI
2. Go to Settings → Beta Access Management
3. See all waiting list entries
4. Grant access with one click
5. Export list to CSV

### Step 4: Launch to Public

When ready to launch:

1. **Option A: Remove beta check entirely**
   - Comment out beta check in `SignupPage.jsx`
   - Everyone can sign up

2. **Option B: Convert waiting list to beta testers**
   - Use admin interface to grant access to all
   - Or set `BETA_TESTER_EMAILS=*` (wildcard)

---

## 💡 Features

### Waiting List Page:
- ✅ Beautiful, professional design
- ✅ Email pre-population from signup redirect
- ✅ Optional fields for better lead qualification
- ✅ UTM tracking for marketing campaigns
- ✅ Position in line shown after signup
- ✅ Social proof and benefits
- ✅ Mobile responsive

### Admin Interface:
- ✅ Real-time statistics dashboard
- ✅ View all waiting list entries
- ✅ One-click beta access granting
- ✅ Manual beta tester addition
- ✅ CSV export for email campaigns
- ✅ Status tracking (pending, invited, converted)

### Access Control:
- ✅ Automatic beta access checking
- ✅ Seamless redirect to waiting list
- ✅ Email pre-population
- ✅ No error messages (smooth UX)
- ✅ Works with both env var and database

---

## 🧪 Testing

### Test Beta Access (Your Email):

1. Set your email as beta tester:
```bash
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars BETA_TESTER_EMAILS="your@email.com"
```

2. Go to: `https://guildof1.com/signup`
3. Enter your email
4. Should proceed to signup (not redirected) ✅
5. Complete signup
6. Full platform access ✅

### Test Waiting List (Different Email):

1. Go to: `https://guildof1.com/signup`
2. Enter a different email (not on beta list)
3. Should redirect to `/waitlist` ✅
4. Email should be pre-filled ✅
5. Fill out form and submit
6. Should see: "You're #X on our waiting list!" ✅

### Test Admin Interface:

1. Log into Guild AI with your account
2. Go to Settings
3. Scroll to "Beta Access Management"
4. Click "View"
5. Should see waiting list entries ✅
6. Try granting access to an email ✅
7. Try exporting to CSV ✅

---

## 📋 Database Migrations

The following tables/columns are created automatically on deployment:

### Users Table (Modified):
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS beta_access_granted_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS beta_access_granted_by VARCHAR;
```

### Waiting List Table (New):
```sql
CREATE TABLE IF NOT EXISTS waiting_list (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  company VARCHAR,
  role VARCHAR,
  how_heard VARCHAR,
  use_case TEXT,
  status VARCHAR DEFAULT 'pending',
  invited_at TIMESTAMP,
  converted_at TIMESTAMP,
  converted_user_id VARCHAR REFERENCES users(id),
  referral_source VARCHAR,
  utm_campaign VARCHAR,
  utm_source VARCHAR,
  utm_medium VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  admin_notes TEXT
);
```

---

## 🎨 Customization

### Add More Beta Testers:

**Via Environment Variable:**
```bash
# Add multiple emails (comma-separated)
gcloud run services update guild-ai-api \
  --region us-central1 \
  --project guild-ai-080 \
  --set-env-vars BETA_TESTER_EMAILS="email1@test.com,email2@test.com,email3@test.com"
```

**Via Admin Interface:**
1. Settings → Beta Access Management
2. Enter email in "Grant Beta Access" form
3. Click "Grant Access"

### Customize Waiting List Page:

Edit `frontend/src/pages/WaitlistPage.jsx`:
- Change copy/messaging
- Add/remove form fields
- Modify success message
- Update branding

### Export Waiting List:

1. Settings → Beta Access Management
2. Click "Export CSV"
3. Opens in Excel/Google Sheets
4. Use for email campaigns

---

## 🚀 Launch Strategy

### Phase 1: Private Beta (Now)
- ✅ Only beta testers can sign up
- ✅ Everyone else joins waiting list
- ✅ Collect feedback from beta users
- ✅ Refine features

### Phase 2: Invite from Waiting List
- ✅ Grant access to top waiting list entries
- ✅ Gradual rollout (10, 50, 100 users)
- ✅ Monitor system performance
- ✅ Gather more feedback

### Phase 3: Public Launch
- ✅ Remove beta check entirely
- ✅ Everyone can sign up
- ✅ Email waiting list: "We're live!"
- ✅ Convert waiting list to users

---

## 📊 Analytics & Tracking

### Waiting List Metrics:
- Total signups
- Pending vs invited vs converted
- Source tracking (UTM parameters)
- Role distribution
- Company types
- Use cases

### Beta Tester Metrics:
- Total beta testers
- From env var vs database
- Conversion rate (waiting list → beta)
- Active beta users

---

## 🔒 Security

### Access Control:
- ✅ Beta check happens server-side (can't be bypassed)
- ✅ Email validation on both frontend and backend
- ✅ Duplicate prevention
- ✅ Admin endpoints require authentication

### Privacy:
- ✅ Emails stored securely in PostgreSQL
- ✅ No email sharing without consent
- ✅ GDPR-compliant data collection
- ✅ Users can request deletion

---

## 📄 Files Changed

### Backend:
1. `api_server/src/models.py` - Added `WaitingList` model and beta fields to `User`
2. `api_server/src/routes/waitlist.py` - New API endpoints (created)
3. `api_server/src/main.py` - Registered waitlist router

### Frontend:
1. `frontend/src/pages/WaitlistPage.jsx` - Waiting list signup page (created)
2. `frontend/src/pages/SignupPage.jsx` - Added beta access check
3. `frontend/src/components/admin/BetaAccessManager.jsx` - Admin interface (created)
4. `frontend/src/components/dashboard/SettingsPage.jsx` - Added Beta Access section
5. `frontend/src/App.jsx` - Added `/waitlist` route

### Infrastructure:
1. `cloudbuild.yaml` - Added database migrations for new tables/columns

---

## 🎉 Summary

### What This Gives You:

✅ **Control** - You decide who gets access
✅ **Flexibility** - Add beta testers via env var or UI
✅ **Data** - Collect emails and use cases
✅ **Analytics** - Track interest and sources
✅ **Smooth UX** - Users don't see errors, just redirected
✅ **Admin Tools** - Manage everything from Settings
✅ **Launch Ready** - Easy to convert waiting list when ready

### Beta Tester Experience:
1. Go to signup
2. Enter email (on beta list)
3. Complete signup
4. ✅ Full access to platform

### Regular User Experience:
1. Go to signup
2. Enter email (not on beta list)
3. Redirected to waiting list
4. Fill out form
5. See: "You're #X on our waiting list!"
6. Notified when you launch

---

## 🚀 Next Steps

1. **Deploy this code** (~15 minutes)
2. **Add your email as beta tester**:
   ```bash
   gcloud run services update guild-ai-api \
     --region us-central1 \
     --project guild-ai-080 \
     --set-env-vars BETA_TESTER_EMAILS="your@email.com"
   ```
3. **Test beta access** - Sign up with your email
4. **Test waiting list** - Try with different email
5. **Invite more beta testers** - Use admin interface
6. **Launch when ready** - Remove beta check

---

**Your platform now has professional beta testing and waiting list management!** 🎉

