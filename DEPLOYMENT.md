# Deployment Guide

This guide will walk you through deploying the Goal Tracker app to Vercel (frontend) and Render (backend, if needed).

## Prerequisites

- GitHub account with your code repository
- Supabase project set up (see README.md)
- Vercel account (free tier works)
- Render account (free tier works, if using backend)

## Step 1: Supabase Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready (takes a few minutes)

2. **Run Database Schema**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `supabase/schema.sql`
   - Click "Run" to execute

3. **Create Storage Bucket**
   - Go to Storage in Supabase dashboard
   - Create a new bucket named `vision-board`
   - Set it to **Public**
   - See `supabase/storage-setup.md` for detailed instructions

4. **Get API Credentials**
   - Go to Settings > API
   - Copy your:
     - Project URL
     - `anon` `public` key

## Step 2: Deploy Frontend to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." > "Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

## Step 3: Deploy Backend to Render (Optional)

**Note**: For this app, Supabase handles most backend functionality. You only need Render if you want to add custom API endpoints or server-side processing.

### If You Need a Backend:

1. **Create Web Service on Render**
   - Go to [render.com](https://render.com)
   - Click "New +" > "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - Name: `goal-tracker-backend` (or your choice)
   - Environment: **Node**
   - Build Command: `npm install`
   - Start Command: `node server.js` (you'll need to create this)
   - Plan: Free (or paid)

3. **Add Environment Variables**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Any other variables your backend needs

4. **Create server.js** (if needed)
   ```javascript
   // Example Express server for Render
   const express = require('express');
   const app = express();
   const PORT = process.env.PORT || 3001;

   app.use(express.json());

   // Your API routes here
   app.get('/api/health', (req, res) => {
     res.json({ status: 'ok' });
   });

   app.listen(PORT, () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

## Step 4: Configure CORS (if using separate backend)

If you deploy a backend on Render and need to call it from Vercel:

1. **In your backend**, add CORS middleware:
   ```javascript
   const cors = require('cors');
   app.use(cors({
     origin: 'https://your-vercel-app.vercel.app'
   }));
   ```

2. **Update frontend** to call your Render backend URL instead of Supabase directly (if needed)

## Step 5: Post-Deployment Checklist

- [ ] Test authentication (sign up/sign in)
- [ ] Create a test goal
- [ ] Add milestones to the goal
- [ ] Mark milestones as complete
- [ ] Test calendar view
- [ ] Upload an image to vision board
- [ ] Verify all pages load correctly
- [ ] Check mobile responsiveness

## Troubleshooting

### Vercel Deployment Issues

**Build Fails**
- Check that all dependencies are in `package.json`
- Verify TypeScript errors: `npm run build` locally
- Check Vercel build logs for specific errors

**Environment Variables Not Working**
- Ensure variables start with `NEXT_PUBLIC_` for client-side access
- Redeploy after adding environment variables
- Check Vercel dashboard > Settings > Environment Variables

**404 Errors**
- Verify Next.js routing is correct
- Check that pages are in the `app/` directory
- Ensure file names match route structure

### Supabase Issues

**Authentication Not Working**
- Verify Supabase URL and keys are correct
- Check Supabase Auth settings
- Ensure email confirmation is configured (or disabled for testing)

**Database Errors**
- Verify schema.sql was run successfully
- Check RLS policies are set correctly
- Review Supabase logs for errors

**Storage Issues**
- Ensure `vision-board` bucket exists and is public
- Check storage policies if uploads fail
- Verify file size limits

### Render Issues

**Service Won't Start**
- Check start command is correct
- Verify PORT environment variable
- Review Render logs for errors

**API Not Accessible**
- Check service is running (not sleeping on free tier)
- Verify CORS is configured
- Check firewall/security settings

## Continuous Deployment

Both Vercel and Render support automatic deployments:

- **Vercel**: Automatically deploys on push to main branch
- **Render**: Can be configured to auto-deploy from GitHub

## Custom Domain (Optional)

### Vercel
1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render
1. Go to Service Settings > Custom Domains
2. Add your domain
3. Configure DNS records

## Monitoring

- **Vercel**: Built-in analytics and monitoring
- **Render**: Built-in logs and metrics
- **Supabase**: Dashboard with logs and metrics

## Support

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
