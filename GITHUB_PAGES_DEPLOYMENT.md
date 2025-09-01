# GitHub Pages Deployment Guide

Your project is configured for GitHub Pages deployment. There are two deployment options:

## Option 1: GitHub Actions (Recommended)

**Automatic deployment on every push to master/main**

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push
   ```

2. **Enable GitHub Pages with Actions:**
   - Go to your GitHub repository
   - Navigate to Settings → Pages
   - Under "Source", select "GitHub Actions"
   - The deployment will happen automatically on every push

3. **Your site will be available at:**
   ```
   https://nomanhasan.github.io/baby-book/
   ```

## Option 2: Manual Deployment

If the gh-pages package doesn't work in your environment, build and deploy manually:

```bash
# Build the project
npm run build

# Deploy manually by:
# 1. Creating gh-pages branch
# 2. Copying dist/ contents to gh-pages branch
# 3. Pushing to GitHub
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