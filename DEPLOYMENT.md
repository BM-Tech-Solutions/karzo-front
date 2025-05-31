# Karzo Frontend Deployment Guide

## Environment Variables

The Karzo frontend uses environment variables to configure the API URL. This allows for easy deployment to different environments (development, staging, production).

### Required Environment Variables

- `NEXT_PUBLIC_API_URL`: The base URL of the backend API (default: http://localhost:8000)

### Setting Up Environment Variables

#### Local Development

Create a `.env.local` file in the root of the project with the following content:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Production Deployment

When deploying to production, set the `NEXT_PUBLIC_API_URL` environment variable to the URL of your production backend API.

For Vercel deployments:
1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Environment Variables" section
3. Add the `NEXT_PUBLIC_API_URL` variable with your production API URL

### API Configuration

The frontend uses a centralized configuration file at `lib/config.ts` that exports the API base URL:

```typescript
// API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Helper function to construct API URLs
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// Auth API URL
export const AUTH_API_URL = `${API_BASE_URL}/api/auth`;
```

All API requests should use this configuration to ensure consistent URL handling across the application.

## Checking for Hardcoded URLs

To find any remaining hardcoded URLs in the codebase, you can use the following command:

```bash
grep -r "http://localhost:8000" --include="*.ts" --include="*.tsx" .
```

Replace any hardcoded URLs with the `API_BASE_URL` import from the config file.
