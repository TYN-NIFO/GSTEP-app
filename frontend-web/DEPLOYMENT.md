# Deployment Guide

## Environment Variables

For deployment, you need to set the following environment variables:

### Required Environment Variables

1. **REACT_APP_API_BASE_URL**: The URL of your backend API
   - Development: `http://localhost:5000`
   - Production: `https://your-backend-domain.com`

### Setting Environment Variables

#### For Development
Create a `.env` file in the root directory:
```
REACT_APP_API_BASE_URL=http://localhost:5000
```

#### For Production
Set the environment variable in your hosting platform:

**Vercel:**
- Go to your project settings
- Add environment variable: `REACT_APP_API_BASE_URL` with your backend URL

**Netlify:**
- Go to Site settings > Environment variables
- Add: `REACT_APP_API_BASE_URL` with your backend URL

**Heroku:**
```bash
heroku config:set REACT_APP_API_BASE_URL=https://your-backend-domain.com
```

## Build and Deploy

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Deploy the `build` folder to your hosting platform.

## Authentication Changes

The app now uses Redux for authentication instead of Context API. All components have been updated to use the Redux-based `useAuth` hook from `src/redux/customHooks/useAuth.js`.

## Notes

- The app uses client-side rendering (CSR) as requested
- Redux is used for state management
- All authentication logic is now centralized in Redux
- The old Context API has been completely removed 