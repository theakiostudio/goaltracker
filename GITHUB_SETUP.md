# How to Add This Project to GitHub

Follow these steps to push your Goal Tracker app to GitHub:

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `goal-tracker` (or your preferred name)
   - **Description**: "A modern goal tracking application built with Next.js and Supabase"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click **"Create repository"**

## Step 2: Initialize Git and Push to GitHub

Run these commands in your terminal (you're already in the project directory):

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Goal Tracker app with Next.js and Supabase"

# Add your GitHub repository as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Replace Placeholder Values

**Important**: Before running the commands above, replace:
- `YOUR_USERNAME` with your GitHub username
- `REPO_NAME` with your repository name

For example, if your username is `johndoe` and repo is `goal-tracker`:
```bash
git remote add origin https://github.com/johndoe/goal-tracker.git
```

## Alternative: Using SSH (if you have SSH keys set up)

If you prefer SSH:
```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
```

## Quick Copy-Paste Commands

After creating the repo on GitHub, copy the repository URL and run:

```bash
git init
git add .
git commit -m "Initial commit: Goal Tracker app"
git branch -M main
git remote add origin YOUR_REPO_URL_HERE
git push -u origin main
```

## What Gets Pushed?

✅ **Included:**
- All source code
- Configuration files
- README and documentation
- Package files

❌ **Excluded (via .gitignore):**
- `node_modules/` - Dependencies (will be installed via `npm install`)
- `.env.local` - Your Supabase credentials (keep this secret!)
- `.next/` - Build files
- Other temporary files

## Important Security Note

⚠️ **Never commit your `.env.local` file!** It contains your Supabase credentials. The `.gitignore` file is already configured to exclude it, but double-check before pushing.

## After Pushing

1. Your code will be on GitHub
2. You can now deploy to Vercel by connecting your GitHub repo
3. Team members can clone and contribute
4. You can track changes with version control

## Troubleshooting

**"Repository not found" error:**
- Check that the repository URL is correct
- Make sure you have access to the repository
- Verify your GitHub credentials

**"Permission denied" error:**
- You may need to authenticate with GitHub
- Use GitHub CLI: `gh auth login`
- Or set up SSH keys

**Want to update later?**
```bash
git add .
git commit -m "Your commit message"
git push
```
