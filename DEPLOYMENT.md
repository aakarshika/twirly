# Deployment Guide

This document provides detailed instructions for deploying the COMPARE application to various platforms.

## Table of Contents

- [Building for Production](#building-for-production)
- [Static Hosting (Netlify, Vercel, GitHub Pages)](#static-hosting)
- [Docker Deployment](#docker-deployment)
- [Environment Variables](#environment-variables)
- [Performance Optimization](#performance-optimization)
- [Monitoring](#monitoring)

## Building for Production

Before deploying, create an optimized production build:

```bash
npm run build
# or
yarn build
```

This will generate a `dist` directory containing optimized, minified files ready for deployment.

## Static Hosting

### Netlify

1. **Manual Deployment**:
   - Run `npm run build`
   - Drag and drop the `dist` folder to Netlify

2. **Continuous Deployment**:
   - Push your code to a Git repository (GitHub, GitLab, etc.)
   - Log in to Netlify and click "New site from Git"
   - Connect your repository
   - Set build command to `npm run build`
   - Set publish directory to `dist`
   - Click "Deploy site"

3. **Using Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

### Vercel

1. **Manual Deployment**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run `vercel` in the project directory
   - Follow the prompts

2. **Continuous Deployment**:
   - Push your code to GitHub
   - Import your repository on vercel.com
   - Vercel will automatically detect Vite and configure the build settings

### GitHub Pages

1. Update `vite.config.js` to include your base path:

   ```javascript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... other config
   });
   ```

2. Create a deployment script:

   ```bash
   #!/usr/bin/env sh

   # abort on errors
   set -e

   # build
   npm run build

   # navigate to output directory
   cd dist

   # if deploying to custom domain
   # echo 'www.example.com' > CNAME

   git init
   git add -A
   git commit -m 'deploy'

   git push -f git@github.com:username/your-repo-name.git main:gh-pages

   cd -
   ```

3. Run the script to deploy

## Docker Deployment

### Creating a Docker Image

1. Create a `Dockerfile` in the project root:

```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create an `nginx.conf` file:

```
server {
    listen 80;
    server_name _;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

3. Build and run the Docker image:

```bash
docker build -t compare-app .
docker run -p 8080:80 compare-app
```

## Environment Variables

Create a `.env` file in the project root for environment-specific configuration:

```
VITE_API_URL=https://api.yourbackend.com
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

Access environment variables in your code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

For different environments, create `.env.development`, `.env.production`, etc.

## Performance Optimization

1. **Implement code splitting** to reduce bundle size:

```javascript
import { lazy, Suspense } from 'react';

const CustomComparison = lazy(() => import('./pages/CustomComparison'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CustomComparison />
    </Suspense>
  );
}
```

2. **Optimize images**:
   - Use modern formats (WebP)
   - Implement lazy loading
   - Use responsive images

3. **Implement caching** with proper cache headers in your web server

## Monitoring

### Setup application monitoring:

1. **Error tracking** with Sentry:

```bash
npm install @sentry/react
```

Initialize in your `main.jsx` file:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: import.meta.env.MODE,
});
```

2. **Analytics** with Google Analytics or Plausible.io

3. **Performance monitoring** with Lighthouse CI

## Scaling Considerations

1. **API Rate Limiting**: Implement rate limiting if connecting to external APIs
2. **CDN**: Use a CDN for static assets to improve load times
3. **Database**: For user persistence, consider adding a serverless database like Firebase or Supabase

## Security Considerations

1. **Content Security Policy**: Implement a strong CSP
2. **HTTPS**: Always serve over HTTPS
3. **Input Validation**: Validate all user inputs
4. **Dependencies**: Regularly update dependencies with `npm audit fix`