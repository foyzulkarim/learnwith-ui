# Cloudflare Pages Configuration Guide

## Build Settings

When setting up your project in Cloudflare Pages, use these settings:

1. **Build command**: `npm install && npm run build`
2. **Build output directory**: `dist`
3. **Node.js version**: 18.x

## Environment Variables

Add these environment variables in the Cloudflare Pages dashboard:

- `NODE_VERSION`: 18.17.1
- Any other environment variables your app needs from your `.env` file

## Troubleshooting

If you encounter deployment issues:

1. Make sure your package.json and package-lock.json are always in sync before pushing
2. Run `npm install && npm run build` locally to verify it works before pushing
3. Check that all required environment variables are set in the Cloudflare dashboard
4. For API endpoint issues, ensure your API URLs use the correct production domain

## Post-Deployment

After successful deployment:

1. Set up custom domains if needed
2. Configure caching rules for optimal performance
3. Set up redirects if required (e.g., for SPA routing) 
