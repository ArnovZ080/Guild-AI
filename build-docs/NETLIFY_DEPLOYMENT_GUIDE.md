# Netlify Deployment Guide for Guild-AI

## 🚀 Quick Deployment Steps

### 1. Frontend Deployment (Netlify)

Your frontend is now ready for Netlify deployment! Here's what you need to do:

#### Option A: Connect GitHub Repository
1. Go to [Netlify](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `Guild-AI` repository
5. Configure build settings:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/build`
   - **Base directory**: `frontend`

#### Option B: Manual Deploy
1. Go to [Netlify](https://netlify.com)
2. Drag and drop the `frontend/build` folder to the deploy area

### 2. Environment Variables

In your Netlify dashboard, add these environment variables:

```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
```

Replace `your-backend-url.herokuapp.com` with your actual backend URL.

### 3. Backend Deployment

For the backend, you'll need to deploy it to a service like:
- **Heroku** (recommended)
- **Railway**
- **Render**
- **DigitalOcean App Platform**

#### Heroku Deployment Steps:
1. Create a new Heroku app
2. Connect your GitHub repository
3. Set buildpack to Python
4. Add environment variables:
   ```
   POSTGRES_HOST=your-postgres-host
   POSTGRES_PORT=5432
   POSTGRES_USER=your-postgres-user
   POSTGRES_PASSWORD=your-postgres-password
   POSTGRES_DB=workflow_db
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   ```
5. Deploy from main branch

### 4. Database Setup

You'll need to set up:
- **PostgreSQL database** (Heroku Postgres, Railway, or Supabase)
- **Redis instance** (Heroku Redis, Railway, or Upstash)
- **Qdrant vector database** (Qdrant Cloud or self-hosted)

### 5. Update Frontend API URL

Once your backend is deployed, update the `REACT_APP_API_URL` environment variable in Netlify to point to your actual backend URL.

## 🔧 Current Status

✅ **Frontend**: Ready for Netlify deployment
✅ **Backend**: Ready for Heroku/Railway deployment  
✅ **Docker**: Fully functional locally
✅ **Agents**: All enabled and working
✅ **API**: Fully functional with real agent interactions

## 📱 Testing Your Deployment

After deployment, test these endpoints:

1. **Frontend**: Your Netlify URL
2. **Backend Health**: `https://your-backend-url.herokuapp.com/health`
3. **Agent Status**: `https://your-backend-url.herokuapp.com/agents/status`
4. **API Docs**: `https://your-backend-url.herokuapp.com/docs`

## 🎯 Next Steps

1. Deploy backend to Heroku/Railway
2. Set up PostgreSQL and Redis databases
3. Update Netlify environment variables
4. Test the full application
5. Set up custom domain (optional)

## 🆘 Troubleshooting

### Frontend Issues:
- Make sure `REACT_APP_API_URL` is set correctly
- Check browser console for CORS errors
- Verify build directory is `frontend/build`

### Backend Issues:
- Check environment variables are set
- Verify database connections
- Check Heroku logs for errors

### API Issues:
- Ensure CORS is configured for your frontend domain
- Check that all required environment variables are set
- Verify agent imports are working

## 📞 Support

If you encounter any issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set
3. Test the API endpoints directly
4. Check the browser console for frontend errors

Your Guild-AI system is now ready for production deployment! 🚀