# Guild AI Authentication & Landing Page Integration Checklist

This checklist will help you complete the integration of the Firebase authentication system and landing page into your Guild AI application.

## 📋 Pre-Integration Checklist

### Required Services Setup

- [ ] **Firebase Project Created**
  - [ ] Project created in Firebase Console
  - [ ] Web app registered
  - [ ] Firebase configuration copied
  - [ ] Service account key downloaded (for backend)
  
- [ ] **Paystack Account Setup**
  - [ ] Account created and verified
  - [ ] Test API keys obtained
  - [ ] Subscription plans created in Paystack dashboard
  - [ ] Live API keys obtained (for production)

- [ ] **Database Ready**
  - [ ] PostgreSQL database created
  - [ ] Connection string configured
  - [ ] Migrations run (user tables exist)

---

## 🔧 Installation Steps

### 1. Install Frontend Dependencies

```bash
cd frontend
npm install firebase
# or
yarn add firebase
```

### 2. Install Backend Dependencies

```bash
cd api_server
pip install firebase-admin
```

### 3. Configure Environment Variables

#### Frontend (.env)
Create `/frontend/.env`:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:8000
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_key
```

#### Backend (.env)
Create `/api_server/.env`:
```bash
GOOGLE_CLOUD_PROJECT=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
DATABASE_URL=postgresql://user:pass@localhost:5432/guild_db
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 4. Add Firebase Service Account (Backend)

Place your `firebase-service-account.json` in the `/api_server` directory:
- Download from Firebase Console > Project Settings > Service Accounts
- **DO NOT commit this file to git**
- Add to `.gitignore` if not already there

---

## 🚀 Deployment Steps

### 1. Update Backend Routes

The feature branch includes a new auth route file:
- `api_server/src/routes/auth_firebase.py` - New Firebase authentication
- Old: `api_server/src/routes/auth.py` - Supabase authentication (for reference)

Update `/api_server/src/main.py` to use the new Firebase auth:

```python
# Replace this line:
from .routes import auth

# With:
from .routes import auth_firebase as auth

# Or update the import at the top:
from .routes import auth_firebase

# And update the router inclusion:
app.include_router(auth_firebase.router)
```

### 2. Database Migration (Optional)

If you want to rename the column from `supabase_id` to `firebase_uid`:

```sql
-- Optional: Rename column for clarity
ALTER TABLE users RENAME COLUMN supabase_id TO firebase_uid;
```

If you keep it as `supabase_id`, it will still work - the Firebase UID will just be stored in that column.

### 3. Frontend Routing

The updated `App.jsx` includes:
- Landing page as home route
- Public-only routes (login/signup redirect to dashboard if logged in)
- Protected routes (require authentication)
- Legal pages

**No additional changes needed** - the updated App.jsx is already in place.

### 4. Add Paystack Script

Add Paystack inline script to `/frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <!-- ... existing head content ... -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
    
    <!-- Paystack Inline Script -->
    <script src="https://js.paystack.co/v1/inline.js"></script>
  </body>
</html>
```

---

## ✅ Testing Checklist

### Frontend Tests

- [ ] **Landing Page**
  - [ ] Page loads without errors
  - [ ] All sections render correctly
  - [ ] "Get Started" buttons navigate to signup
  - [ ] "Login" button navigates to login page
  - [ ] Legal links work (Privacy, Terms, Refund)

- [ ] **Signup Flow**
  - [ ] Can access signup page
  - [ ] Form validation works
  - [ ] Email/password signup creates Firebase user
  - [ ] Google OAuth signup works
  - [ ] Plan selection from URL parameter works
  - [ ] Redirects to subscription page after signup
  - [ ] Backend profile is created

- [ ] **Login Flow**
  - [ ] Can access login page
  - [ ] Email/password login works
  - [ ] Google OAuth login works
  - [ ] Redirects to dashboard after login
  - [ ] "Forgot password" link works
  - [ ] Already logged-in users redirect to dashboard

- [ ] **Subscription Flow**
  - [ ] Subscription page loads plans from API
  - [ ] Can select different plans
  - [ ] Paystack popup opens for paid plans
  - [ ] Payment verification works
  - [ ] Free plan signup works
  - [ ] Redirects to dashboard after successful payment
  - [ ] Trial period applies correctly

- [ ] **Protected Routes**
  - [ ] Unauthenticated users redirect to login
  - [ ] Authenticated users can access dashboard
  - [ ] Logout works correctly
  - [ ] Session persists on page refresh

### Backend Tests

- [ ] **Authentication Endpoints**
  - [ ] `POST /auth/create-profile` creates user
  - [ ] `GET /auth/profile` returns user profile
  - [ ] `POST /auth/update-login` updates last login
  - [ ] `GET /auth/usage` returns usage statistics
  - [ ] Token verification works correctly

- [ ] **Subscription Endpoints**
  - [ ] `GET /subscription/plans` returns plans with ZAR pricing
  - [ ] `POST /subscription/initialize` creates Paystack transaction
  - [ ] `POST /subscription/verify` verifies payment
  - [ ] `GET /subscription/info` returns subscription info
  - [ ] `POST /subscription/webhook` handles Paystack webhooks

### Integration Tests

- [ ] **Complete User Journey**
  1. [ ] Land on homepage
  2. [ ] Click "Get Started" for a paid plan
  3. [ ] Sign up with email/password
  4. [ ] Redirected to subscription page with plan selected
  5. [ ] Complete payment with test card
  6. [ ] Redirected to dashboard
  7. [ ] User profile shows correct subscription tier
  8. [ ] Credits are allocated correctly

- [ ] **Google OAuth Journey**
  1. [ ] Click "Sign up with Google"
  2. [ ] Complete Google OAuth flow
  3. [ ] Profile created in backend
  4. [ ] Subscription page loads
  5. [ ] Can complete subscription

---

## 🔍 Verification Commands

### Check Firebase Connection
```bash
# Frontend - open browser console
# Look for: "Firebase initialized successfully"

# Backend - in Python shell
from firebase_admin import auth
users = auth.list_users()
print(f"Firebase connected: {len(users.users)} users")
```

### Check Database Connection
```bash
# Backend
python -c "from api_server.src.database import engine; print('DB connected') if engine else print('Failed')"
```

### Check Paystack Integration
```bash
# Test API call
curl -X GET https://api.paystack.co/transaction/verify/test_ref \
  -H "Authorization: Bearer YOUR_SECRET_KEY"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Firebase App not initialized"
**Solution:** 
- Check `VITE_FIREBASE_*` variables are set in frontend `.env`
- Ensure variables have `VITE_` prefix for Vite
- Restart dev server after changing `.env`

### Issue: "Invalid Firebase token"
**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_PATH` points to correct file
- Check file has proper permissions
- Ensure service account has Firebase Admin role

### Issue: "CORS Error"
**Solution:**
- Add frontend URL to `ALLOWED_ORIGINS` in backend `.env`
- Restart backend server
- Check both URLs use same protocol (http/https)

### Issue: "Paystack popup not showing"
**Solution:**
- Verify `VITE_PAYSTACK_PUBLIC_KEY` is set
- Check Paystack script is loaded in `index.html`
- Open browser console for errors
- Verify you're using the correct key (test vs live)

### Issue: "Payment succeeds but subscription not activated"
**Solution:**
- Check webhook URL is configured in Paystack dashboard
- Verify webhook signature validation
- Check backend logs for webhook processing errors
- Ensure plan codes match between Paystack and backend

---

## 📊 Monitoring & Logs

### Frontend Logs
- Open browser DevTools > Console
- Look for Firebase auth events
- Check Network tab for API calls

### Backend Logs
```bash
# Development
tail -f api_server/logs/app.log

# Production (Cloud Run)
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 50 \
  --format json
```

### Firebase Logs
- Firebase Console > Authentication > Users
- Check for new user registrations
- Monitor sign-in methods usage

### Paystack Logs
- Paystack Dashboard > Transactions
- Check payment status
- Review webhook delivery logs

---

## 🎯 Launch Checklist

### Pre-Launch

- [ ] All tests passing
- [ ] Environment variables configured for production
- [ ] Firebase live keys configured
- [ ] Paystack live keys configured
- [ ] Webhooks configured with production URLs
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Error monitoring setup (Sentry, etc.)

### Launch Day

- [ ] Deploy backend to Cloud Run
- [ ] Deploy frontend to hosting
- [ ] Update DNS records
- [ ] Test complete user flow on production
- [ ] Monitor logs for errors
- [ ] Test payment with real card (small amount)
- [ ] Verify webhook delivery

### Post-Launch

- [ ] Monitor user signups
- [ ] Check payment success rate
- [ ] Review error logs daily
- [ ] Set up alerts for critical errors
- [ ] Document any issues encountered
- [ ] Plan for optimizations

---

## 📚 Documentation References

- [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md) - Complete Firebase setup
- [PAYSTACK_SETUP_GUIDE.md](./PAYSTACK_SETUP_GUIDE.md) - Paystack configuration
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - All environment variables
- [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) - Original Supabase setup (for reference)

---

## 🎉 Success Criteria

Your integration is complete when:

✅ Users can sign up from the landing page  
✅ Authentication works with both email/password and Google  
✅ Paystack payments process successfully  
✅ Subscriptions are activated after payment  
✅ Users can access the dashboard after onboarding  
✅ Protected routes work correctly  
✅ All tests pass  
✅ No critical errors in logs  

**Congratulations! Your Guild AI authentication system is live!** 🚀

---

## 🆘 Support

If you encounter issues:

1. Check this checklist for common solutions
2. Review the setup guides in the documentation folder
3. Check Firebase/Paystack documentation
4. Review backend logs for detailed error messages
5. Test with incognito/private browser to rule out cache issues

---

**Version:** 1.0  
**Last Updated:** October 2025  
**Branch:** `feature/firebase-auth-landing-page`

