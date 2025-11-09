# JANTEC ERP - Vercel Deployment Instructions

## Automatic Deploy (Recommended)
1. Go to https://vercel.com/new
2. Import: robertjanji15-hash/JANTEC-ERP
3. Settings:
   - Framework: Vite
   - Build: npm run build
   - Output: dist
4. Deploy!

## Manual Deploy via CLI
```bash
# Build first
npm run build

# Deploy to production
vercel --prod
```

## Update Existing Deployment
Just push to GitHub if you set up automatic deployment!

Or run: `vercel --prod` to manually deploy
