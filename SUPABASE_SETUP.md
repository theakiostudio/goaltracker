# Supabase Email Confirmation Setup

## Problem: "Email not confirmed" Error

If you're getting an "Email not confirmed" error when trying to sign in, you have two options:

## Option 1: Disable Email Confirmation (Recommended for Development)

This is the easiest solution for local development:

1. **Go to your Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication** → **Settings** (or **Configuration**)

2. **Disable Email Confirmation**
   - Find the **"Enable email confirmations"** toggle
   - Turn it **OFF**
   - Save changes

3. **For Existing Users**
   - You may need to manually confirm users in the Supabase dashboard:
   - Go to **Authentication** → **Users**
   - Find your user
   - Click the three dots menu
   - Select **"Confirm user"** or **"Send confirmation email"**

## Option 2: Keep Email Confirmation Enabled

If you want to keep email confirmation enabled:

1. **Check Your Email**
   - After signing up, check your email inbox
   - Look for an email from Supabase
   - Click the confirmation link

2. **Check Spam Folder**
   - Sometimes confirmation emails go to spam

3. **Resend Confirmation Email**
   - In Supabase Dashboard → Authentication → Users
   - Find your user
   - Click the three dots menu
   - Select **"Send confirmation email"**

4. **Configure Email Templates** (Optional)
   - Go to Authentication → Email Templates
   - Customize the confirmation email if needed

## Quick Fix: Confirm User Manually

If you just want to test the app quickly:

1. Go to Supabase Dashboard → Authentication → Users
2. Find your user email
3. Click the three dots (⋮) next to the user
4. Select **"Confirm user"**
5. Try signing in again

## For Production

For production deployments, you should:
- Keep email confirmation enabled
- Configure proper email settings
- Set up custom SMTP (optional, for custom email domains)
- Test the email flow thoroughly

## Testing Without Email

If you want to test without setting up email:

1. Disable email confirmation (Option 1 above)
2. Or use Supabase's built-in test email service (works for development)
3. Or manually confirm users in the dashboard

## Troubleshooting

**Still can't sign in after confirming?**
- Clear your browser cookies/localStorage
- Try signing out and signing in again
- Check Supabase logs for errors

**Email not received?**
- Check spam folder
- Verify email address is correct
- Check Supabase email logs
- Try resending from dashboard
