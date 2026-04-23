# voxara Enterprise - Deployment Guide

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Docker & Docker Compose
- Git
- A domain name
- SSL certificate

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations completed
- [ ] SSL certificates obtained
- [ ] CDN configured (optional)
- [ ] Monitoring setup complete
- [ ] Backup strategy in place
- [ ] Security audit completed

## Installation & Setup

### 1. Environment Setup

```bash
# Clone the repository
git clone https://github.com/voxara/voxara-enterprise.git
cd faceless-video-enterprise

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 2. Local Development

```bash
# Start development server with turbopack
npm run dev

# Run tests
npm run test
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### 3. Database Setup

```bash
# Push migrations to Supabase
npm run db:migrate

# (Optional) Reset database
npm run db:reset
```

## Production Deployment

### Docker Deployment

```bash
# Build Docker image
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
  -t voxara:latest .

# Run container
docker run \
  -e SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  -e STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
  -e INNGEST_EVENT_KEY=$INNGEST_EVENT_KEY \
  -e INNGEST_SIGNING_KEY=$INNGEST_SIGNING_KEY \
  -p 3000:3000 \
  voxara:latest
```

### Docker Compose Deployment

```bash
# Start services
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### AWS Deployment

#### Using EC2

```bash
# Connect to instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone <repo>
cd faceless-video-enterprise
npm install
npm run build

# Start with PM2
npm install -g pm2
pm2 start npm --name "voxara" -- start
pm2 save
```

#### Using ECS (Elastic Container Service)

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URL
docker build -t voxara .
docker tag voxara:latest YOUR_ECR_URL/voxara:latest
docker push YOUR_ECR_URL/voxara:latest
```

### Heroku Deployment

```bash
# Create app
heroku create voxara

# Set environment variables
heroku config:set NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

# Deploy
git push heroku main
```

## Post-Deployment

### Health Checks

```bash
# Test API health
curl https://your-domain.com/api/health

# Test database
curl https://your-domain.com/api/health/db

# Test external services
curl https://your-domain.com/api/health/services
```

### Monitoring Setup

1. **Sentry**: Configure error tracking
2. **New Relic**: Monitor performance
3. **DataDog**: Infrastructure monitoring
4. **CloudWatch**: AWS logging

### Backup Strategy

```bash
# Daily backups
0 2 * * * /backup-script.sh

# Weekly archives
0 3 * * 0 /archive-script.sh

# Monthly snapshots
0 4 1 * * /snapshot-script.sh
```

## Scaling

### Horizontal Scaling

```bash
# Load balancer configuration (example for AWS)
- Create auto-scaling group
- Set minimum instances: 2
- Set maximum instances: 10
- CPU target: 70%
```

### Database Scaling

```bash
# Supabase scaling
- Enable connection pooling
- Increase compute size if needed
- Enable read replicas for high traffic
```

### Cache Layer

```bash
# Redis caching (optional)
- Use Upstash for rate limiting (already configured)
- Add Redis for session storage if needed
```

## Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process
lsof -i :3000
# Kill process
kill -9 <PID>
```

#### Database Connection Errors
```bash
# Check connection string
echo $NEXT_PUBLIC_SUPABASE_URL
# Test connection
psql "postgresql://user:password@host:5432/db"
```

#### Out of Memory
```bash
# Increase Node.js heap
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

#### API Rate Limiting Issues
```bash
# Check Upstash Redis connection
redis-cli -u $UPSTASH_REDIS_REST_URL ping
```

## Performance Optimization

### Next.js Optimization
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Static generation where possible
- ✅ API route optimization

### Database Optimization
- Enable connection pooling
- Add database indexes
- Archive old data
- Regular VACUUM

### CDN Setup
- CloudFlare or AWS CloudFront
- Cache static assets
- Compress responses
- Enable HTTP/2 PUSH

## Maintenance

### Regular Tasks

- [ ] Review logs daily
- [ ] Monitor error rates
- [ ] Check disk space
- [ ] Update dependencies weekly
- [ ] Review security alerts
- [ ] Backup database daily
- [ ] Check API response times

### Scheduled Maintenance

```bash
# Weekly
- npm audit
- Check for security updates
- Review performance metrics

# Monthly
- Full system check
- Database maintenance
- Update documentation

# Quarterly
- Security audit
- Performance review
- Dependency updates

# Annually
- Penetration testing
- Disaster recovery drill
- Compliance audit
```

## Rollback Procedures

```bash
# If deployment fails, rollback
git revert <commit-hash>
npm run build
# Redeploy
```

## Support

For deployment issues:
- Check logs: `docker logs <container-id>`
- Monitor health: `https://your-domain/api/health`
- Contact: `support@voxara.app`

## Additional Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Docker Docs](https://docs.docker.com)
- [AWS Best Practices](https://aws.amazon.com/architecture/best-practices/)
