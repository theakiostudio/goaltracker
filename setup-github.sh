#!/bin/bash

echo "🚀 Setting up GitHub repository for Goal Tracker"
echo ""
echo "Step 1: Please create a repository on GitHub first:"
echo "  1. Go to https://github.com/new"
echo "  2. Create a new repository (don't initialize with README)"
echo "  3. Copy the repository URL"
echo ""
read -p "Enter your GitHub repository URL: " REPO_URL

if [ -z "$REPO_URL" ]; then
  echo "❌ Repository URL is required!"
  exit 1
fi

echo ""
echo "📦 Initializing git repository..."
git init

echo "📝 Adding files..."
git add .

echo "💾 Creating initial commit..."
git commit -m "Initial commit: Goal Tracker app with Next.js and Supabase"

echo "🔗 Adding remote repository..."
git remote add origin "$REPO_URL"

echo "🌿 Setting branch to main..."
git branch -M main

echo ""
echo "✅ Ready to push! Run the following command:"
echo "   git push -u origin main"
echo ""
read -p "Push now? (y/n): " PUSH_NOW

if [ "$PUSH_NOW" = "y" ] || [ "$PUSH_NOW" = "Y" ]; then
  echo "🚀 Pushing to GitHub..."
  git push -u origin main
  echo ""
  echo "✅ Successfully pushed to GitHub!"
else
  echo "📋 Run 'git push -u origin main' when ready"
fi
