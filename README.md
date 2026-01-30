# Goal Tracker App

A modern goal tracking application built with Next.js, Supabase, and deployed on Vercel with backend on Render.

## Features

- 🎯 Create and manage goals with milestones
- 📅 Calendar view for goal tracking
- 🖼️ Vision board for visual inspiration
- 👥 Accountability partner support
- 📊 Progress tracking with visual indicators
- 🔐 Secure authentication with Supabase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (Frontend), Render (Backend - if needed)

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- Vercel account (for deployment)
- Render account (for backend, if needed)

## Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Goaltracker_sat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase/schema.sql`
   - Create a storage bucket named `vision-board` with public access
   - Go to Settings > API and copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Supabase Setup

### 1. Database Schema

Run the SQL script in `supabase/schema.sql` in your Supabase SQL Editor. This will create:
- `profiles` table (extends auth.users)
- `goals` table
- `milestones` table
- `vision_board_images` table
- Row Level Security (RLS) policies
- Trigger for automatic profile creation

### 2. Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `vision-board`
3. Set it to **Public**
4. Enable RLS policies (optional, but recommended)

### 3. Storage Policies (Optional)

If you want to add RLS to storage, run this in SQL Editor:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vision-board' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vision-board');
```

## Deployment

### Frontend on Vercel

1. **Push your code to GitHub**

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Configure Vercel**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Backend on Render (Optional)

If you need a backend API (beyond Supabase), you can deploy a Node.js service:

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Build Command: `npm install`
   - Start Command: `node server.js` (if you create one)

2. **Add Environment Variables**
   - Add your Supabase credentials
   - Add any other required variables

3. **Note**: For this app, Supabase handles most backend functionality, so you may not need a separate Render backend unless you have specific requirements.

## Project Structure

```
Goaltracker_sat/
├── app/
│   ├── auth/              # Authentication page
│   ├── calendar/          # Calendar view
│   ├── goals/
│   │   ├── [id]/         # Goal details page
│   │   └── new/          # Create goal page
│   ├── vision-board/     # Vision board page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home/dashboard page
├── components/
│   ├── ActionButtons.tsx
│   ├── GoalCard.tsx
│   ├── GoalStats.tsx
│   └── Header.tsx
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
├── supabase/
│   └── schema.sql        # Database schema
└── package.json
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Features Overview

### Dashboard
- View all goals with status indicators
- See goal statistics (Total, Active, Done)
- Quick access to add goals, calendar, and vision board

### Goal Management
- Create goals with title, description, dates
- Add accountability partners
- Break goals into milestones/steps
- Track progress with visual progress bars
- Mark milestones as complete

### Calendar
- Monthly calendar view
- See goals scheduled for specific dates
- Navigate between months
- View goal details from calendar

### Vision Board
- Upload images to represent goals
- Visual inspiration gallery
- Remove images as needed

## Troubleshooting

### Authentication Issues
- Ensure Supabase Auth is enabled in your project
- Check that email confirmation is configured correctly
- Verify RLS policies are set up correctly

### Storage Issues
- Ensure the `vision-board` bucket exists and is public
- Check storage policies if uploads fail
- Verify file size limits in Supabase settings

### Database Issues
- Run the schema.sql script again if tables are missing
- Check RLS policies if you can't access data
- Verify user authentication is working

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
