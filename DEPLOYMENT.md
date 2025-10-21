# JANTEC ERP - Deployment Guide

## Quick Deploy Options

Your JANTEC ERP application is ready to deploy! Choose one of these free hosting options:

---

## Option 1: Netlify Drop (Easiest - No Account Required for Test)

1. Go to **https://app.netlify.com/drop**
2. Drag and drop your **`dist`** folder onto the page
3. Get instant URL! (e.g., https://random-name.netlify.app)

**Location of dist folder:** `/home/user/JANTEC-ERP/dist/`

---

## Option 2: Vercel (Fast & Free)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd /home/user/JANTEC-ERP
   vercel --prod dist/
   ```

3. Follow the prompts and get your URL!

---

## Option 3: GitHub Pages (Via Repository Settings)

If your repository is on GitHub (robertjanji15-hash/JANTEC-ERP):

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under "Source", select **Deploy from a branch**
4. Select branch: **gh-pages** (or create one)
5. Click **Save**

Your site will be live at:
**https://robertjanji15-hash.github.io/JANTEC-ERP/**

Note: You'll need to manually create a `gh-pages` branch with the contents of the `dist` folder.

---

## Option 4: Surge.sh (Simple CLI Deploy)

1. Install Surge:
   ```bash
   npm install -g surge
   ```

2. Deploy:
   ```bash
   cd /home/user/JANTEC-ERP
   surge dist/
   ```

3. Choose a subdomain (e.g., jantec-erp.surge.sh)
4. Your site is live!

---

## Manual Deployment Steps (For GitHub Pages)

If you want to set up GitHub Pages manually:

```bash
# Create and switch to gh-pages branch
git checkout --orphan gh-pages

# Remove all files
git rm -rf .

# Copy dist contents
cp -r dist/* .

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# Switch back to main branch
git checkout main
```

Then enable GitHub Pages in repository settings.

---

## What's Included

✅ Production-ready build in `/dist` folder
✅ Optimized assets (CSS + JS)
✅ Relative paths - works anywhere!
✅ All data stored in browser localStorage

---

## Need Help?

The easiest option is **Netlify Drop** - just drag and drop the `dist` folder!
