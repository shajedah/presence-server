# Deployment Guide - Render.com

## Quick Deploy (5 minutes)

### Step 1: Prepare Repository

1. **Create a new GitHub repository** (public or private)
   - Go to https://github.com/new
   - Name it: `presence-api` or any name you prefer
   - Don't initialize with README (we already have files)

2. **Push this folder to GitHub:**
   ```bash
   cd presence-server
   git init
   git add .
   git commit -m "Initial presence API server"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/presence-api.git
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. **Sign up/Login to Render:**
   - Go to https://render.com
   - Sign up with GitHub (recommended)

2. **Create New Web Service:**
   - Click **"New +"** button (top right)
   - Select **"Web Service"**

3. **Connect Repository:**
   - Click **"Connect account"** if needed
   - Find and select your `presence-api` repository
   - Click **"Connect"**

4. **Configure Service:**
   ```
   Name:           presence-api
   Region:         Choose closest to your users
   Branch:         main
   Root Directory: (leave empty if repo root is the server folder)
   Runtime:        Node
   Build Command:  npm install
   Start Command:  npm start
   ```

5. **Choose Plan:**
   - **Free tier** is fine for testing (spins down after 15 min inactivity)
   - **Starter ($7/mo)** for always-on service (recommended for production)

6. **Environment Variables (Optional):**
   - Click **"Advanced"**
   - Add any env vars if needed (none required for basic setup)

7. **Create Web Service:**
   - Click **"Create Web Service"**
   - Wait 2-3 minutes for deployment

8. **Get Your URL:**
   - Once deployed, you'll see: `https://presence-api-xxxx.onrender.com`
   - Copy this URL

### Step 3: Update Your Chat App

In your `index.html`, find this line:
```javascript
const PRESENCE_API = "https://your-app.onrender.com/api/presence";
```

Replace with your actual Render URL:
```javascript
const PRESENCE_API = "https://presence-api-xxxx.onrender.com/api/presence";
```

### Step 4: Test the API

Open your browser and visit:
```
https://presence-api-xxxx.onrender.com/
```

You should see:
```json
{
  "name": "Presence API Server",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

Test the health endpoint:
```
https://presence-api-xxxx.onrender.com/health
```

## Troubleshooting

### Issue: "Application failed to respond"
**Solution:** Check Render logs:
1. Go to your service dashboard
2. Click **"Logs"** tab
3. Look for errors in the startup logs

### Issue: "Build failed"
**Solution:** Ensure `package.json` is in the root of your repository.

### Issue: "CORS errors in browser"
**Solution:** The server already has CORS enabled. If issues persist, check browser console for specific error.

### Issue: "Free tier spins down"
**Solution:** 
- Upgrade to Starter plan ($7/mo) for always-on
- Or use a cron job to ping the server every 10 minutes:
  ```bash
  # Add to cron-job.org or similar
  curl https://presence-api-xxxx.onrender.com/health
  ```

## Monitoring

### View Logs
1. Go to Render dashboard
2. Select your service
3. Click **"Logs"** tab
4. See real-time logs of API requests

### Check Uptime
1. Go to **"Metrics"** tab
2. See CPU, memory, and request stats

## Updating the Server

1. Make changes to `server.js`
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update server"
   git push
   ```
3. Render auto-deploys on push (takes 1-2 minutes)

## Custom Domain (Optional)

1. Go to service **"Settings"**
2. Scroll to **"Custom Domain"**
3. Add your domain (e.g., `api.yourdomain.com`)
4. Update DNS records as instructed
5. SSL certificate is auto-generated

## Production Checklist

- [ ] Deployed to Render
- [ ] Updated `index.html` with correct API URL
- [ ] Tested all endpoints
- [ ] Checked logs for errors
- [ ] Upgraded to paid plan (if needed)
- [ ] Set up monitoring/alerts
- [ ] Added custom domain (optional)

## Cost Estimate

- **Free tier:** $0/month (spins down after 15 min inactivity)
- **Starter:** $7/month (always-on, 512MB RAM)
- **Standard:** $25/month (2GB RAM, better performance)

For a 2-person chat app, **Starter plan is recommended**.
