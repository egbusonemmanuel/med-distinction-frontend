# Vercel Deployment Troubleshooting

## Common Vercel Build Issues and Solutions

### 1. Vite Build Errors

**Error**: `Command "npm install" exited with 1`
**Cause**: Usually related to minification or chunk splitting issues

**Solutions**:
1. **Use the simple configuration**:
   ```bash
   # Temporarily rename the config
   mv vite.config.js vite.config.complex.js
   mv vite.config.simple.js vite.config.js
   ```

2. **Check Node.js version**:
   - Ensure your project uses Node.js 18+ (set in package.json)
   - Vercel should auto-detect this

3. **Clear build cache**:
   - In Vercel dashboard, go to your project
   - Settings > Functions > Clear Build Cache
   - Redeploy

### 2. Memory Issues During Build

**Error**: `JavaScript heap out of memory`

**Solutions**:
1. **Increase Node.js memory limit**:
   ```json
   // In package.json
   {
     "scripts": {
       "build": "node --max-old-space-size=4096 node_modules/vite/bin/vite.js build"
     }
   }
   ```

2. **Use simpler build configuration**:
   - Remove complex manual chunking
   - Use default Vite settings

### 3. Environment Variables Issues

**Error**: Build succeeds but runtime errors

**Solutions**:
1. **Check environment variables in Vercel**:
   - Go to Project Settings > Environment Variables
   - Ensure all required variables are set
   - Check for typos in variable names

2. **Required variables for MedLearn**:
   ```
   MONGO_URI=your_mongodb_connection_string
   NODE_ENV=production
   CORS_ORIGINS=https://your-domain.vercel.app
   ```

### 4. API Routes Not Working

**Error**: 404 on API endpoints

**Solutions**:
1. **Check vercel.json routing**:
   ```json
   {
     "routes": [
       { "src": "/api/(.*)", "dest": "server.js" },
       { "src": "/(.*)", "dest": "/dist/$1" }
     ]
   }
   ```

2. **Verify server.js exports**:
   - Ensure server.js is properly configured
   - Check that routes are properly defined

### 5. Static Files Not Loading

**Error**: 404 on CSS/JS files

**Solutions**:
1. **Check build output**:
   - Ensure `dist` folder is created
   - Verify files exist in `dist/assets/`

2. **Update vercel.json**:
   ```json
   {
     "builds": [
       { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
     ]
   }
   ```

## Quick Fixes

### Option 1: Use Simple Configuration
```bash
# Backup current config
cp vite.config.js vite.config.backup.js

# Use simple config
cp vite.config.simple.js vite.config.js

# Commit and push
git add .
git commit -m "Use simple Vite config for Vercel"
git push
```

### Option 2: Disable Chunk Splitting
```javascript
// In vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

### Option 3: Use Default Vite Settings
```javascript
// Minimal vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()]
})
```

## Debugging Steps

1. **Check build logs**:
   - Go to Vercel dashboard
   - Click on failed deployment
   - Check "Build Logs" tab

2. **Test locally**:
   ```bash
   npm run build
   npm run preview
   ```

3. **Check dependencies**:
   ```bash
   npm audit
   npm outdated
   ```

4. **Verify environment**:
   ```bash
   node --version  # Should be 18+
   npm --version
   ```

## Alternative Deployment Options

If Vercel continues to have issues:

1. **Netlify**:
   - Similar to Vercel
   - Often more forgiving with build configurations

2. **Railway**:
   - Good for full-stack apps
   - Handles both frontend and backend

3. **Render**:
   - Free tier available
   - Good for Node.js apps

4. **Firebase Hosting**:
   - Use the firebase.json configuration
   - Deploy with `firebase deploy`

## Getting Help

1. **Check Vercel documentation**: https://vercel.com/docs
2. **Vite documentation**: https://vitejs.dev/guide/
3. **Community forums**: Vercel Discord, Stack Overflow
4. **Project issues**: Check if others have similar problems

## Emergency Rollback

If deployment is completely broken:

1. **Revert to working commit**:
   ```bash
   git log --oneline
   git checkout <working-commit-hash>
   git push --force
   ```

2. **Use simple configuration**:
   ```bash
   # Replace vite.config.js with minimal version
   echo 'import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()]
})' > vite.config.js
   ```
