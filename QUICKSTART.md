# Quick Start Guide

Get your Goal Tracker app up and running in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor → Run `supabase/schema.sql`
4. Go to Storage → Create bucket `vision-board` (set to Public)
5. Go to Settings → API → Copy your URL and anon key

## 3. Configure Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. Test the App

1. Sign up with a new account
2. Create a goal
3. Add milestones/steps
4. Mark steps as complete
5. Check calendar view
6. Upload images to vision board

## Next Steps

- See [README.md](./README.md) for detailed documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
- See [supabase/storage-setup.md](./supabase/storage-setup.md) for storage configuration

## Troubleshooting

**Can't connect to Supabase?**
- Check your `.env.local` file has correct values
- Verify Supabase project is active

**Storage upload fails?**
- Ensure `vision-board` bucket exists and is public
- Check browser console for errors

**Database errors?**
- Make sure you ran `schema.sql` in Supabase SQL Editor
- Check RLS policies are enabled

Happy goal tracking! 🎯
