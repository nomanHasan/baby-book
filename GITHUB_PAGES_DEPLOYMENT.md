# GitHub Pages Deployment Guide

Your project is already configured for GitHub Pages deployment! Here's how to deploy:

## Quick Setup (One-time only)

1. **Initialize Git and push to GitHub:**
   ```bash
   # Initialize git repository (if not already done)
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   
   # Add your GitHub repository as origin
   git remote add origin https://github.com/yourusername/baby-book.git
   git push -u origin main
   ```
   
   **Important:** You must have a GitHub repository set up before deploying!

2. **Enable GitHub Pages in repository settings:**
   - Go to your GitHub repository
   - Navigate to Settings → Pages
   - Under "Source", select "Deploy from a branch"
   - Choose "gh-pages" branch and "/ (root)" folder
   - Click Save

## Deploy Commands

Your project includes pre-configured deployment scripts:

```bash
# Build and deploy in one command
npm run deploy

# Or run separately:
npm run build        # Build the project
npm run deploy:gh-pages  # Deploy to gh-pages branch
```

## What's Already Configured

✅ **Vite Configuration** (`vite.config.ts`):
- `base: '/baby-book/'` - Correct GitHub Pages path
- Optimized build settings with chunking
- Asset management configured

✅ **Package.json Scripts**:
- `deploy` - Full build and deploy process
- `deploy:gh-pages` - Uses gh-pages package to push dist folder

✅ **Dependencies**:
- `gh-pages` package installed for automatic deployment

## Deployment Process

When you run `npm run deploy`:
1. Processes book data (`npm run process-books`)
2. Type checks the code (`tsc`)
3. Builds the project (`vite build`)
4. Pushes the `dist` folder to `gh-pages` branch

## Your Site URL

After deployment, your site will be available at:
```
https://yourusername.github.io/baby-book/
```

## Important Notes

- **No GitHub Actions needed** - Uses client-side deployment
- First deployment may take 5-10 minutes to go live
- Subsequent deployments are usually faster
- The `gh-pages` branch is automatically created and managed
- Only the built files are deployed, not your source code

## Troubleshooting

If deployment fails:
1. Ensure you have push permissions to the repository
2. Check that GitHub Pages is enabled in repository settings
3. Verify the `gh-pages` branch exists after first deployment
4. Make sure all dependencies are installed (`npm install`)