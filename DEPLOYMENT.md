# Deployment Guide

This guide covers how to deploy MedLearn to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended)
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration

2. **Set Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add the following variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     NODE_ENV=production
     GOOGLE_AI_API_KEY=your_google_ai_key
     COHERE_API_KEY=your_cohere_key
     ```

3. **Deploy**
   - Push to main branch for automatic deployment
   - Or manually trigger deployment from Vercel dashboard

### Option 2: Firebase Hosting
1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**
   ```bash
   firebase login
   firebase init
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

### Option 3: Manual Server Deployment
1. **Prepare Server**
   ```bash
   # Install Node.js 18+
   # Install MongoDB
   # Install PM2 for process management
   npm install -g pm2
   ```

2. **Deploy Application**
   ```bash
   git clone <your-repo>
   cd medlearn
   npm install
   npm run build
   ```

3. **Set Environment Variables**
   ```bash
   export MONGO_URI="your_mongodb_connection_string"
   export NODE_ENV="production"
   export PORT="4000"
   ```

4. **Start Application**
   ```bash
   pm2 start server.js --name medlearn
   pm2 save
   pm2 startup
   ```

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Database
MONGO_URI=mongodb://localhost:27017/medlearn
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/medlearn

# Server
PORT=4000
NODE_ENV=production

# CORS (comma-separated URLs)
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com

# AI Services (optional)
GOOGLE_AI_API_KEY=your_google_ai_key
COHERE_API_KEY=your_cohere_key

# Supabase (if using)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. **MongoDB Atlas (Recommended)**
   - Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a new cluster
   - Get connection string
   - Update `MONGO_URI` in environment variables

2. **Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - Use `mongodb://localhost:27017/medlearn`

## 📋 Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Build process working (`npm run build`)
- [ ] All API endpoints tested
- [ ] CORS origins configured for production domains
- [ ] File upload limits appropriate for production
- [ ] Security headers configured (Helmet)
- [ ] Error handling implemented
- [ ] Logging configured for production

## 🔍 Post-Deployment Verification

1. **Health Check**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **Test Key Features**
   - User registration/login
   - Quiz creation and taking
   - File uploads
   - Admin dashboard access

3. **Monitor Logs**
   - Check application logs for errors
   - Monitor database performance
   - Verify file uploads working

## 🚨 Troubleshooting

### Common Issues

**Build Failures**
- Check Node.js version (requires 18+)
- Verify all dependencies installed
- Check for TypeScript errors

**Database Connection Issues**
- Verify MongoDB URI format
- Check network connectivity
- Ensure database user has proper permissions

**CORS Errors**
- Update CORS origins in server.js
- Check frontend URL matches allowed origins

**File Upload Issues**
- Verify GridFS is working
- Check file size limits
- Ensure uploads directory has proper permissions

### Getting Help
- Check application logs
- Verify environment variables
- Test API endpoints individually
- Check browser console for frontend errors

## 📊 Monitoring

### Recommended Tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, LogRocket
- **Performance**: New Relic, DataDog
- **Database**: MongoDB Atlas monitoring

### Key Metrics to Monitor
- Response times
- Error rates
- Database performance
- File upload success rates
- User authentication success rates
