#!/bin/bash

# GitHub Pages Deployment Script
# Does what gh-pages package does but simpler

set -e  # Exit on any error

echo "🚀 Starting GitHub Pages deployment..."

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist directory not found. Run 'npm run build' first."
    exit 1
fi

# Save current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📍 Current branch: $CURRENT_BRANCH"

# Create temporary directory and copy dist contents
TEMP_DIR=$(mktemp -d)
echo "📁 Copying dist contents to temporary directory..."
cp -r dist/* "$TEMP_DIR/"
echo "✅ Files copied to: $TEMP_DIR"

# Stash any uncommitted changes
echo "💾 Stashing any uncommitted changes..."
git stash push -m "Deploy script stash" || true

# Create or switch to gh-pages branch
echo "🌿 Switching to gh-pages branch..."
if git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout gh-pages
else
    git checkout --orphan gh-pages
fi

# Clean the gh-pages branch (keep .git and this script)
echo "🧹 Cleaning gh-pages branch..."
git rm -rf . 2>/dev/null || true
# Clean all files except .git and scripts starting with deploy
find . -maxdepth 1 -type f ! -name '.git*' ! -name 'deploy-*' -delete 2>/dev/null || true
find . -maxdepth 1 -type d ! -name '.git' ! -path '.' -exec rm -rf {} + 2>/dev/null || true

# Copy dist contents to root
echo "📁 Copying dist contents to gh-pages root..."
cp -r "$TEMP_DIR"/* .

# Validate files were copied
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found after copying. Deployment failed."
    rm -rf "$TEMP_DIR"
    exit 1
fi
echo "✅ Files successfully copied to gh-pages branch"

# Add .nojekyll file to disable Jekyll
echo "📄 Adding .nojekyll file..."
touch .nojekyll

# Add all files and commit
echo "📦 Adding files and creating commit..."
git add .
git commit -m "Deploy from dist folder - $(date)"

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push origin gh-pages

# Switch back to original branch
echo "🔄 Switching back to $CURRENT_BRANCH..."
git checkout $CURRENT_BRANCH

# Restore stashed changes if any
echo "💾 Restoring stashed changes..."
git stash pop 2>/dev/null || true

# Clean up temporary directory
echo "🧹 Cleaning up temporary directory..."
rm -rf "$TEMP_DIR"

echo "✅ Deployment complete!"
echo "🌐 Your site will be available at: https://nomanhasan.github.io/baby-book/"