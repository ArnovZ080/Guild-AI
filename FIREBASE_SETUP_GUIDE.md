# Firebase Authentication Setup Guide for Guild AI

This guide will help you set up Firebase Authentication (Google Cloud's authentication service) to replace Supabase.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select existing Google Cloud project
3. Project name: `guild-ai` (or your existing GCP project name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

### 2.1 Enable Authentication Methods
1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable the following providers:

#### Email/Password
- Click **Email/Password**
- Toggle **Enable**
- Toggle **Email link (passwordless sign-in)** if desired
- Click **Save**

#### Google Sign-In
- Click **Google**
- Toggle **Enable**
- Set **Project public-facing name**: Guild AI
- Set **Project support email**: your-email@example.com
- Click **Save**

### 2.2 Configure Authorized Domains
1. Go to **Authentication > Settings > Authorized domains**
2. Add your domains:
   - `localhost` (already included for development)
   - `yourdomain.com` (your production domain)
   - `your-cloud-run-url.run.app` (if using Cloud Run)

## 3. Get Firebase Configuration

### 3.1 Web App Configuration (Frontend)
1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > Web (</>) icon
4. Register app:
   - **App nickname**: Guild AI Web
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"
5. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "guild-ai.firebaseapp.com",
  projectId: "guild-ai",
  storageBucket: "guild-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3.2 Service Account (Backend)
1. Go to **Project Settings > Service accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Save it securely (DO NOT commit to git)
5. For local development: Save as `firebase-service-account.json` in your project root
6. For production: Use Google Cloud Secret Manager

## 4. Environment Variables

### Frontend (.env)
```bash
# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIza...
REACT_APP_FIREBASE_AUTH_DOMAIN=guild-ai.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=guild-ai
REACT_APP_FIREBASE_STORAGE_BUCKET=guild-ai.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123

# API Configuration
REACT_APP_API_URL=http://localhost:8000  # or your backend URL

# Paystack Configuration
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### Backend (.env)
```bash
# Firebase Configuration
GOOGLE_CLOUD_PROJECT=guild-ai
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json  # Local only

# Database Configuration
DATABASE_URL=postgresql://postgres:your-password@localhost:5432/guild_db

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# Optional: Exchange Rate API
EXCHANGE_RATE_API_KEY=your_api_key
```

## 5. Install Dependencies

### Frontend
```bash
cd frontend
npm install firebase
```

### Backend
```bash
cd api_server
pip install firebase-admin
```

## 6. Production Deployment (Google Cloud)

### 6.1 Using Application Default Credentials
For production on Cloud Run or GKE:

1. Ensure your service account has the necessary permissions:
   ```bash
   gcloud projects add-iam-policy-binding guild-ai \
     --member="serviceAccount:your-service-account@guild-ai.iam.gserviceaccount.com" \
     --role="roles/firebase.admin"
   ```

2. The backend will automatically use Application Default Credentials

### 6.2 Using Secret Manager (Recommended)
Store the service account key in Secret Manager:

```bash
# Create secret
gcloud secrets create firebase-service-account \
  --data-file=firebase-service-account.json \
  --project=guild-ai

# Grant access to your Cloud Run service account
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:your-service-account@guild-ai.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor" \
  --project=guild-ai
```

Then update your Cloud Run service to mount the secret.

## 7. Migration from Supabase

### 7.1 Database Migration
Your database schema doesn't need to change. We're just replacing the authentication provider.

The `users` table column `supabase_id` will now store Firebase UIDs instead.

You can optionally rename it:
```sql
ALTER TABLE users RENAME COLUMN supabase_id TO firebase_uid;
```

### 7.2 User Migration (if you have existing users)
If you have existing users in Supabase, you'll need to migrate them:

1. Export users from Supabase
2. Use Firebase Admin SDK to import users:

```python
from firebase_admin import auth

# Import users
users_to_import = [
    auth.ImportUserRecord(
        uid='firebase_uid',
        email='user@example.com',
        password_hash=b'...',  # From Supabase export
        password_salt=b'...'
    )
]

result = auth.import_users(users_to_import)
```

## 8. Test the Setup

### 8.1 Test Frontend Authentication
1. Start your frontend development server
2. Try to sign up with a test email
3. Check Firebase Console under **Authentication > Users** to see if the user was created

### 8.2 Test Backend Integration
1. Get a Firebase ID token from the frontend
2. Make an API call to `/auth/profile` with the token in the Authorization header
3. Verify the user profile is returned

Example:
```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  http://localhost:8000/auth/profile
```

## 9. Security Best Practices

### 9.1 Frontend Security
- Never expose service account keys in frontend code
- Use environment variables for all configuration
- Enable App Check to prevent abuse
- Set up reCAPTCHA for sign-up forms

### 9.2 Backend Security
- Never commit service account keys to git
- Use Secret Manager for production
- Implement rate limiting for auth endpoints
- Set up proper CORS policies
- Enable audit logging

### 9.3 Firebase Security Rules
If using Firestore or Storage:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 10. Monitoring and Logging

### 10.1 Enable Firebase Authentication Monitoring
1. Go to **Authentication > Usage** tab
2. Monitor sign-up rates, sign-in rates, and active users

### 10.2 Enable Cloud Logging
```bash
gcloud logging read "resource.type=firebase_auth" \
  --limit 50 \
  --format json
```

## 11. Troubleshooting

### Common Issues:

1. **"Firebase App not initialized" errors**
   - Check that Firebase is initialized before any auth calls
   - Verify your Firebase configuration is correct

2. **"Invalid token" errors**
   - Ensure the ID token is being sent correctly
   - Check that the token hasn't expired (tokens expire after 1 hour)
   - Verify the project ID matches

3. **CORS errors**
   - Add your frontend domain to authorized domains in Firebase Console
   - Check that your API CORS settings allow your frontend origin

4. **"Service account not found"**
   - Verify the service account file path is correct
   - Check file permissions
   - For Cloud Run, ensure the secret is properly mounted

5. **Rate limiting errors**
   - Firebase has rate limits on authentication requests
   - Implement exponential backoff for retries
   - Consider enabling App Check to get higher quotas

### Getting Help:
- Firebase documentation: [firebase.google.com/docs](https://firebase.google.com/docs)
- Firebase support: [firebase.google.com/support](https://firebase.google.com/support)
- Stack Overflow: Tag your questions with `firebase` and `firebase-authentication`

## 12. Next Steps

Once Firebase is set up:

1. Update your backend to use the new Firebase auth routes
2. Update your frontend to use Firebase SDK
3. Configure Paystack for payments (see PAYSTACK_SETUP_GUIDE.md)
4. Test the complete authentication and subscription flow
5. Deploy to production

Your Firebase Authentication is now ready for Guild AI! 🚀

## 13. Cost Considerations

Firebase Authentication pricing:
- **Free tier**: 50,000 monthly active users
- **Paid tier** (Blaze plan): $0.0055 per verification beyond free tier
- Phone authentication: Additional costs apply

For most applications, Firebase Authentication is free or very low cost.

## 14. Advanced Features

### Multi-Factor Authentication (MFA)
Enable MFA for enhanced security:
1. Go to **Authentication > Sign-in method**
2. Click **Advanced > Multi-factor authentication**
3. Enable MFA
4. Configure enforcement policy

### Custom Claims
Add custom claims to user tokens for role-based access:
```python
from firebase_admin import auth

auth.set_custom_user_claims(uid, {
    'subscription_tier': 'professional',
    'admin': False
})
```

### Email Templates
Customize authentication emails:
1. Go to **Authentication > Templates**
2. Customize email templates for:
   - Email verification
   - Password reset
   - Email change
   - SMS verification

Your Firebase setup is complete and production-ready! 🎉

