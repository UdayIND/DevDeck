# Environment Variables Configuration

This document outlines all required environment variables for DevDeck to function properly in production.

## Required Environment Variables

### Clerk Authentication
```env
# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Clerk URLs (customize as needed)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### Liveblocks Real-time Collaboration
```env
# Liveblocks Keys for real-time features
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_dev_your_public_key_here
LIVEBLOCKS_SECRET_KEY=sk_dev_your_secret_key_here
```

### Application Configuration
```env
# Application Base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Setup Instructions

### 1. Clerk Authentication Setup
1. Visit [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Copy the publishable key and secret key
4. Configure authentication settings:
   - Enable Email/Password authentication
   - Configure OAuth providers if needed
   - Set up redirect URLs

### 2. Liveblocks Real-time Setup
1. Visit [Liveblocks Dashboard](https://liveblocks.io/dashboard)
2. Create a new project
3. Copy the public key and secret key
4. Configure project settings:
   - Set allowed origins for your domain
   - Configure webhooks if needed

### 3. Local Development
Create a `.env.local` file in your project root:
```bash
cp .env.example .env.local
# Edit .env.local with your actual keys
```

### 4. Production Deployment
For production deployments, set these environment variables in your hosting platform:

#### Vercel
1. Go to your project settings
2. Navigate to Environment Variables
3. Add all required variables
4. Redeploy your application

#### Netlify
1. Go to Site Settings > Environment Variables
2. Add all required variables
3. Trigger a new deploy

#### Railway/Render/Digital Ocean
1. Add environment variables in your platform's dashboard
2. Redeploy your application

## Security Notes

- **Never commit `.env.local` or `.env` files to version control**
- **Use different keys for development and production**
- **Regularly rotate your secret keys**
- **Set up proper CORS origins for production**
- **Use HTTPS in production (required for Clerk)**

## Troubleshooting

### Common Issues

1. **Clerk Authentication Not Working**
   - Verify publishable key is correct
   - Check if your domain is added to allowed origins
   - Ensure HTTPS is used in production

2. **Liveblocks Real-time Features Not Working**
   - Verify both public and secret keys are set
   - Check allowed origins in Liveblocks dashboard
   - Ensure WebSocket connections are allowed

3. **Build Failures**
   - Check all required environment variables are set
   - Verify variable names match exactly
   - Ensure no trailing spaces in values

### Debug Mode
Enable debug mode by adding:
```env
DEBUG=true
NEXT_PUBLIC_DEBUG=true
```

This will show additional logging information to help troubleshoot issues. 