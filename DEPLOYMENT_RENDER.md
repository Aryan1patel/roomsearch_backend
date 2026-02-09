# Deploying RoomSearch Backend to Render

This guide will walk you through deploying your RoomSearch backend to Render.

## Prerequisites

1. A GitHub account
2. A Render account (sign up at [render.com](https://render.com))
3. A MongoDB Atlas account (free tier available at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas))

## Step 1: Set Up MongoDB Atlas (Free Cloud Database)

Since Render's free tier doesn't include a database, we'll use MongoDB Atlas:

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. **Sign up or log in**
3. **Create a new cluster:**
   - Click "Build a Database"
   - Choose "M0 FREE" tier
   - Select a cloud provider and region (choose one close to your users)
   - Click "Create Cluster"

4. **Create a database user:**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and password (save these!)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

5. **Whitelist IP addresses:**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

6. **Get your connection string:**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://username:password@cluster.mongodb.net/roomsearch?retryWrites=true&w=majority`

## Step 2: Push Your Code to GitHub

1. **Initialize git repository** (if not already done):
   ```bash
   cd /Users/aryanpatel/Documents/AndroidStudioProjects/RoomSearch/backend
   git init
   ```

2. **Add files to git:**
   ```bash
   git add .
   git commit -m "Initial commit - RoomSearch backend"
   ```

3. **Create a new repository on GitHub:**
   - Go to [github.com](https://github.com)
   - Click "+" → "New repository"
   - Name it "roomsearch-backend"
   - Don't initialize with README (we already have code)
   - Click "Create repository"

4. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/roomsearch-backend.git
   git branch -M main
   git push -u origin main
   ```

## Step 3: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Go to [Render Dashboard](https://dashboard.render.com/)**

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository:**
   - Click "Connect account" if not already connected
   - Find and select your "roomsearch-backend" repository

4. **Configure the service:**
   - **Name:** `roomsearch-backend` (or any name you prefer)
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `backend` if you pushed the whole project)
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** `Free`

5. **Add Environment Variables:**
   Click "Advanced" → "Add Environment Variable":
   
   - **Key:** `MONGODB_URI`
     **Value:** Your MongoDB Atlas connection string from Step 1
     
   - **Key:** `NODE_ENV`
     **Value:** `production`
     
   - **Key:** `PORT`
     **Value:** `5000`

6. **Click "Create Web Service"**

7. **Wait for deployment** (takes 2-5 minutes)
   - You'll see build logs
   - Once complete, you'll get a URL like: `https://roomsearch-backend.onrender.com`

### Option B: Using render.yaml (Infrastructure as Code)

If you want to use the `render.yaml` file:

1. Make sure `render.yaml` is in your repository root
2. Go to Render Dashboard
3. Click "New +" → "Blueprint"
4. Connect your repository
5. Render will automatically detect the `render.yaml` file
6. Add the `MONGODB_URI` environment variable in the dashboard
7. Click "Apply"

## Step 4: Verify Deployment

1. **Check the deployment URL:**
   - Your service URL will be like: `https://roomsearch-backend.onrender.com`
   
2. **Test the health endpoint:**
   ```bash
   curl https://roomsearch-backend.onrender.com/health
   ```
   
   Or open in browser: `https://roomsearch-backend.onrender.com/health`

3. **Test creating a user:**
   ```bash
   curl -X POST https://roomsearch-backend.onrender.com/api/users \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@bu.edu",
       "name": "Test User",
       "phoneNo": "1234567890",
       "currentHostelBlock": "c1",
       "currentFloor": "3",
       "desiredHostelBlock": "c2",
       "desiredFloor": "5"
     }'
   ```

4. **Get all users:**
   ```bash
   curl https://roomsearch-backend.onrender.com/api/users
   ```

## Step 5: Update Your Android App

Update the `BASE_URL` in your Android app's `RetrofitInstance.kt`:

```kotlin
package com.example.roomsearch.data

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object RetrofitInstance {
    // Update this with your Render URL
    private const val BASE_URL = "https://roomsearch-backend.onrender.com/"

    private val logging = HttpLoggingInterceptor().apply {
        setLevel(HttpLoggingInterceptor.Level.BODY)
    }

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor(logging)
        .build()

    val api: ApiInterface by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiInterface::class.java)
    }
}
```

## Important Notes

### Free Tier Limitations

- **Render Free Tier:**
  - Service spins down after 15 minutes of inactivity
  - First request after spin-down takes 30-60 seconds (cold start)
  - 750 hours/month of runtime
  - Automatic HTTPS

- **MongoDB Atlas Free Tier:**
  - 512 MB storage
  - Shared RAM
  - No backups
  - Perfect for development/small projects

### Handling Cold Starts

The free tier spins down after inactivity. To handle this in your Android app:

1. **Show a loading indicator** for the first request
2. **Add retry logic** for timeouts
3. **Consider a "wake-up" endpoint** that you ping periodically

Example in your ViewModel:
```kotlin
private suspend fun wakeUpServer() {
    try {
        repository.healthCheck()
    } catch (e: Exception) {
        // Server is waking up, retry after delay
        delay(2000)
    }
}
```

### Monitoring Your Deployment

1. **View Logs:**
   - Go to your service in Render Dashboard
   - Click "Logs" tab
   - See real-time server logs

2. **Check Metrics:**
   - Click "Metrics" tab
   - See CPU, memory usage, request counts

3. **Set up Notifications:**
   - Go to service settings
   - Add notification email for deployment failures

## Troubleshooting

### "Application failed to respond" error
- Check logs in Render dashboard
- Verify MongoDB connection string is correct
- Ensure PORT environment variable is set

### "Cannot connect to database" error
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check MongoDB connection string format
- Ensure database user has correct permissions

### Slow first request
- This is normal for free tier (cold start)
- Consider upgrading to paid tier for always-on service
- Or implement wake-up logic in your app

### CORS errors
- The backend already has CORS enabled
- If issues persist, check browser console for specific errors

## Upgrading to Paid Tier

If you need better performance:

1. **Render Starter Plan ($7/month):**
   - Always-on (no cold starts)
   - More resources
   - Better for production

2. **MongoDB Atlas Shared Tier ($9/month):**
   - More storage
   - Backups
   - Better performance

## Custom Domain (Optional)

To use a custom domain:

1. Go to your service settings in Render
2. Click "Custom Domain"
3. Add your domain
4. Update DNS records as instructed
5. Render provides free SSL certificate

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Update Android app with production URL
3. ✅ Test all endpoints
4. Consider adding:
   - User authentication (JWT)
   - Rate limiting
   - Request validation
   - Logging service (e.g., LogRocket, Sentry)
   - Analytics

## Support

- **Render Docs:** [render.com/docs](https://render.com/docs)
- **MongoDB Atlas Docs:** [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **Render Community:** [community.render.com](https://community.render.com)

Happy deploying! 🚀
