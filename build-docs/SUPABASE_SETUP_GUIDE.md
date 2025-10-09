# Supabase Setup Guide for Guild AI

This guide will help you set up your Supabase project for the Guild AI subscription system.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `guild-ai` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., `us-east-1` for US users)
5. Click "Create new project"
6. Wait for the project to be created (usually takes 2-3 minutes)

## 2. Configure Authentication

### 2.1 Enable Email Authentication
1. In your Supabase dashboard, go to **Authentication > Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: Toggle ON
   - **Enable email change confirmations**: Toggle ON
   - **Enable password resets**: Toggle ON

### 2.2 Configure Google OAuth (Optional)
1. In **Authentication > Settings**, find **Auth Providers**
2. Enable **Google** provider
3. You'll need Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
4. Copy the **Client ID** and **Client Secret** to Supabase

### 2.3 Configure URL Settings
1. In **Authentication > Settings**, find **URL Configuration**
2. Set **Site URL**: Your frontend URL (e.g., `https://yourdomain.com`)
3. Add **Redirect URLs**:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)

## 3. Set Up Database Tables

### 3.1 Enable Row Level Security (RLS)
Your backend will handle user data, but you can set up RLS for additional security:

```sql
-- Enable RLS on auth.users (if you want to use Supabase's user table)
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to access their own data
CREATE POLICY "Users can view own profile" ON auth.users
  FOR SELECT USING (auth.uid() = id);
```

### 3.2 Create Custom Functions (Optional)
If you want to use Supabase's built-in functions:

```sql
-- Function to handle user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, created_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

## 4. Environment Variables

Add these to your `.env` files:

### Frontend (.env)
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
REACT_APP_API_URL=http://localhost:8000  # or your backend URL

# Paystack Configuration
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
```

### Backend (.env)
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://postgres:your-password@db.your-project-ref.supabase.co:5432/postgres

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key

# Optional: Exchange Rate API
EXCHANGE_RATE_API_KEY=your_api_key  # For more reliable exchange rates
```

## 5. Get Your Supabase Keys

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following:
   - **Project URL**: Use for `SUPABASE_URL`
   - **anon public**: Use for `REACT_APP_SUPABASE_ANON_KEY`
   - **service_role**: Use for `SUPABASE_SERVICE_KEY` (keep this secret!)

## 6. Test the Setup

### 6.1 Test Authentication
1. Start your backend server
2. Start your frontend development server
3. Try to sign up with a test email
4. Check your Supabase dashboard under **Authentication > Users** to see if the user was created

### 6.2 Test Backend Integration
1. Try creating a user profile via the `/auth/create-profile` endpoint
2. Check your backend database to ensure the user was created in your `users` table

## 7. Production Considerations

### 7.1 Security
- Never expose your `service_role` key in frontend code
- Use environment variables for all sensitive data
- Enable email confirmations in production
- Set up proper CORS policies

### 7.2 Email Templates
1. Go to **Authentication > Email Templates**
2. Customize your email templates for:
   - Confirm signup
   - Reset password
   - Magic link
   - Email change

### 7.3 Rate Limiting
Consider implementing rate limiting for authentication endpoints to prevent abuse.

## 8. Troubleshooting

### Common Issues:

1. **"Invalid JWT" errors**
   - Check that your `SUPABASE_SERVICE_KEY` is correct
   - Ensure the key has the right permissions

2. **CORS errors**
   - Add your frontend domain to allowed origins in Supabase settings
   - Check that your API URL is correct

3. **Email not sending**
   - Check your Supabase project settings
   - Verify SMTP configuration if using custom SMTP

4. **User creation fails**
   - Check your backend logs
   - Verify database connection
   - Ensure RLS policies allow the operation

### Getting Help:
- Check Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Join the Supabase Discord community
- Check your Supabase dashboard logs under **Logs**

## 9. Next Steps

Once Supabase is set up:

1. Configure Paystack for payments (see PAYSTACK_SETUP_GUIDE.md)
2. Set up your production database migrations
3. Configure your production environment variables
4. Test the complete authentication and subscription flow
5. Deploy your application

Your Supabase project is now ready to handle authentication for Guild AI! 🚀
