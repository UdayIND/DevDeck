# DevDeck Deployment Guide

This guide will help you deploy DevDeck to production environments. DevDeck is a collaborative developer platform with real-time features.

## Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database (or another supported database)
- Liveblocks account (for real-time collaboration)
- Clerk account (for authentication)
- Email service (for notifications)

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

### Database Configuration
```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/devdeck"

# For production, use connection pooling
DATABASE_URL="postgresql://username:password@host:5432/devdeck?pgbouncer=true&connection_limit=1"
```

### Authentication (Clerk)
```bash
# Get these from your Clerk dashboard
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_key_here"

# Clerk configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/signup"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

### Liveblocks (Real-time collaboration)
```bash
# Get these from your Liveblocks dashboard
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY="pk_prod_your_public_key_here"
LIVEBLOCKS_SECRET_KEY="sk_prod_your_secret_key_here"
```

### Email Configuration
```bash
# For email notifications (using Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="DevDeck <noreply@devdeck.com>"
```

### Next.js Configuration
```bash
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Optional: Analytics & Monitoring
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Sentry (for error tracking)
SENTRY_DSN="https://your-sentry-dsn"
```

## Database Setup

1. **Install and run PostgreSQL**
2. **Create database**:
   ```sql
   CREATE DATABASE devdeck;
   ```

3. **Run Prisma migrations**:
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

## Platform-Specific Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Variables**: Add all environment variables in the Vercel dashboard

4. **Database**: Use Vercel Postgres or external PostgreSQL

### Netlify

1. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Functions directory: `netlify/functions`

2. **Add environment variables** in Netlify dashboard

### Railway

1. **Connect GitHub repo** to Railway
2. **Add environment variables** in Railway dashboard
3. **Deploy automatically** on git push

### Docker Deployment

1. **Build Docker image**:
   ```bash
   docker build -t devdeck .
   ```

2. **Run container**:
   ```bash
   docker run -p 3000:3000 --env-file .env devdeck
   ```

3. **Docker Compose** (with PostgreSQL):
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - DATABASE_URL=postgresql://postgres:password@db:5432/devdeck
       depends_on:
         - db
     
     db:
       image: postgres:15
       environment:
         POSTGRES_DB: devdeck
         POSTGRES_USER: postgres
         POSTGRES_PASSWORD: password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

### Self-Hosted Server

1. **Install dependencies**:
   ```bash
   npm ci --production
   ```

2. **Build application**:
   ```bash
   npm run build
   ```

3. **Start with PM2**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "devdeck" -- start
   pm2 save
   pm2 startup
   ```

## Configuration Steps

### 1. Clerk Setup

1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Configure OAuth providers (GitHub, Google, etc.)
4. Set up webhooks for user management
5. Configure appearance to match DevDeck theme

### 2. Liveblocks Setup

1. Create account at [liveblocks.io](https://liveblocks.io)
2. Create new project
3. Configure authentication (use Clerk integration)
4. Set up rooms for different workspaces

### 3. Database Configuration

1. Set up PostgreSQL database
2. Configure connection pooling for production
3. Set up automated backups
4. Monitor query performance

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different keys for development and production
- Rotate secrets regularly

### Database Security
- Use connection pooling
- Enable SSL in production
- Regular security updates
- Backup encryption

### Authentication
- Configure Clerk security settings
- Enable 2FA for admin accounts
- Set up proper CORS policies
- Use HTTPS only in production

## Performance Optimization

### Next.js Optimizations
```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  compress: true,
  images: {
    domains: ['your-image-domains.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'fabric'],
  },
  webpack: (config) => {
    config.optimization.sideEffects = false;
    return config;
  },
};

export default nextConfig;
```

### Caching Strategy
- Enable Redis for session storage
- Use CDN for static assets
- Implement proper cache headers
- Use Liveblocks caching features

## Monitoring & Analytics

### Health Checks
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
  });
}
```

### Logging
- Use structured logging
- Monitor real-time collaboration metrics
- Track user engagement
- Monitor database performance

## Troubleshooting

### Common Issues

1. **Liveblocks connection errors**:
   - Check API keys
   - Verify network connectivity
   - Check CORS settings

2. **Database connection issues**:
   - Verify connection string
   - Check firewall rules
   - Monitor connection pool

3. **Build failures**:
   - Clear `.next` directory
   - Check Node.js version
   - Verify all dependencies

### Performance Issues
- Monitor bundle size
- Check for memory leaks
- Optimize real-time operations
- Use profiling tools

## Backup and Recovery

### Database Backups
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### Application Data
- Export user workspaces
- Backup Liveblocks rooms
- Save configuration settings

## Scaling Considerations

### Horizontal Scaling
- Use load balancers
- Implement sticky sessions for WebSockets
- Scale database with read replicas

### Vertical Scaling
- Monitor resource usage
- Optimize memory usage
- Use performance profiling

## Support and Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor security advisories
- Review performance metrics
- Update documentation

### Emergency Procedures
- Database failover process
- Service restart procedures
- Rollback deployment process
- Contact information for critical issues

## Compliance and Legal

### Data Protection
- GDPR compliance for EU users
- Data retention policies
- User data export/deletion
- Privacy policy updates

### Terms of Service
- Clear usage guidelines
- Intellectual property protection
- Service availability guarantees
- Limitation of liability

---

For additional support, please refer to the project documentation or create an issue in the GitHub repository. 