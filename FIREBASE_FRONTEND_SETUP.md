# Firebase Frontend Setup - Quick Start Guide

## ✅ What's Already Done

Your Guild AI frontend is **already configured** for Firebase Authentication! Here's what's already in place:

1. ✅ **Firebase SDK installed** (`firebase: ^10.7.1`)
2. ✅ **Firebase config file** (`frontend/src/config/firebase.js`)
3. ✅ **Auth Context** (`frontend/src/contexts/AuthContext.jsx`)
4. ✅ **Signup Page** using Firebase (`frontend/src/pages/SignupPage.jsx`)
5. ✅ **Login Page** using Firebase
6. ✅ **API Service** now sends Firebase ID tokens to backend

## 🔧 What You Need to Do

### Step 1: Get Your Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **guild-ai-080** (or create one if it doesn't exist)
3. Go to **Project Settings** (gear icon) > **Your apps**
4. Click the **Web app** (`</>` icon) or select existing web app
5. Copy the configuration values

You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "guild-ai-080.firebaseapp.com",
  projectId: "guild-ai-080",
  storageBucket: "guild-ai-080.appspot.com",
  messagingSenderId: "881782424",
  appId: "1:881782424:web:abc123def456"
};
```

### Step 2: Create Frontend Environment File

Create `frontend/.env` with these values:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=guild-ai-080.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=guild-ai-080
VITE_FIREBASE_STORAGE_BUCKET=guild-ai-080.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=881782424
VITE_FIREBASE_APP_ID=1:881782424:web:abc123def456

# API Configuration
VITE_API_URL=https://guild-ai-api-881782424.us-central1.run.app

# Paystack Configuration (when ready)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

**Important:** Replace the Firebase values with your actual values from Firebase Console!

### Step 3: Enable Authentication Methods in Firebase

1. In Firebase Console, go to **Authentication**
2. Click **Get started** (if not already enabled)
3. Go to **Sign-in method** tab
4. Enable these providers:

   **Email/Password:**
   - Click **Email/Password**
   - Toggle **Enable**
   - Click **Save**

   **Google Sign-In:**
   - Click **Google**
   - Toggle **Enable**
   - Set **Project support email**: your-email@gmail.com
   - Click **Save**

### Step 4: Configure Authorized Domains

1. Go to **Authentication > Settings > Authorized domains**
2. Add these domains:
   - `localhost` (already there for development)
   - `guildof1.com` (your production domain)
   - `guild-ai-api-881782424.us-central1.run.app` (Cloud Run URL)
   - Any other domains you're using

### Step 5: Build and Deploy Frontend

```bash
cd frontend
npm run build
```

Then deploy your frontend to your hosting provider (Netlify, Vercel, Firebase Hosting, etc.)

## 🧪 Testing Authentication

### Test Locally (Development):

1. **Start the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test signup:**
   - Go to http://localhost:5173/signup
   - Enter email, password, name
   - Click "Create Account"
   - Should redirect to dashboard

3. **Test login:**
   - Go to http://localhost:5173/login
   - Enter email and password
   - Click "Sign In"
   - Should redirect to dashboard

4. **Check browser console:**
   - You should see: `✅ Firebase initialized successfully`
   - After login: Check Network tab for API calls - they should have `Authorization: Bearer <token>` header

### Test in Production:

1. Deploy your frontend with the `.env` file configured
2. Navigate to https://guildof1.com/signup
3. Create an account
4. Verify you can access the dashboard

## 🔒 Backend Verification (Already Configured)

Your backend is already set up to verify Firebase tokens! The endpoint at `/auth/profile` and other protected routes will:

1. Extract the `Authorization: Bearer <token>` header
2. Verify the Firebase ID token
3. Get the user's Firebase UID
4. Return user profile data

## 📊 What Happens When a User Signs Up:

1. **Frontend:** User fills signup form → Firebase creates auth account
2. **Frontend:** Gets Firebase ID token
3. **Frontend:** Calls `/auth/create-profile` with token in header
4. **Backend:** Verifies token, creates user profile in PostgreSQL
5. **Backend:** Returns profile data
6. **Frontend:** Stores user state, redirects to dashboard
7. **All subsequent API calls** include the Firebase token automatically!

## 🎯 Next Steps

1. **Get Firebase config values** from Firebase Console
2. **Create `frontend/.env`** with the values above
3. **Test locally** with `npm run dev`
4. **Build and deploy** your frontend

## 🆘 Troubleshooting

### "Firebase not configured" warning
- Make sure `frontend/.env` exists with all `VITE_FIREBASE_*` variables
- Restart your dev server after adding .env file

### "Failed to create backend profile"  
- Check that your backend is running and accessible
- Verify `VITE_API_URL` points to the correct backend URL

### Authentication not working
- Check browser console for Firebase errors
- Verify all Firebase environment variables are set correctly
- Make sure you enabled Email/Password auth in Firebase Console

## 📝 Environment Variable Checklist

- [ ] Created `frontend/.env` file
- [ ] Added all 6 `VITE_FIREBASE_*` variables
- [ ] Set `VITE_API_URL` to your backend URL
- [ ] Verified Firebase API key is valid
- [ ] Enabled Email/Password authentication in Firebase Console
- [ ] Added your domain to Authorized domains in Firebase
- [ ] Restarted dev server after adding .env

Once you complete these steps, your authentication will be fully functional! 🚀

