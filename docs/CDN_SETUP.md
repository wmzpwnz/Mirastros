# CDN Setup Guide for Mirastros Universal

This guide explains how to set up a CDN for static assets to improve performance.

## Recommended CDN Providers

### 1. Cloudflare (Recommended)
- **Free tier available**
- Automatic caching
- Global edge network
- DDoS protection
- SSL/TLS included

### 2. AWS CloudFront
- Pay-as-you-go pricing
- Integration with S3
- Custom SSL certificates
- Lambda@Edge for dynamic content

### 3. Vercel Edge Network
- Automatic for Vercel deployments
- Zero configuration
- Optimized for Next.js

## Setup Instructions

### Option 1: Cloudflare (Easiest)

1. **Sign up for Cloudflare**
   - Go to https://cloudflare.com
   - Create a free account
   - Add your domain (www.mirastros.com)

2. **Update DNS**
   - Cloudflare will provide nameservers
   - Update your domain registrar to use Cloudflare nameservers
   - Wait for DNS propagation (up to 24 hours)

3. **Configure Caching Rules**
   ```
   Cache Level: Standard
   Browser Cache TTL: 4 hours
   Always Online: On
   ```

4. **Page Rules for Static Assets**
   ```
   URL Pattern: www.mirastros.com/_next/static/*
   Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 year
     - Browser Cache TTL: 1 year
   ```

5. **Enable Auto Minify**
   - Go to Speed > Optimization
   - Enable Auto Minify for JavaScript, CSS, HTML

6. **Enable Brotli Compression**
   - Go to Speed > Optimization
   - Enable Brotli compression

### Option 2: AWS CloudFront + S3

1. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://mirastros-static-assets
   ```

2. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::mirastros-static-assets/*"
       }
     ]
   }
   ```

3. **Create CloudFront Distribution**
   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name mirastros-static-assets.s3.amazonaws.com \
     --default-root-object index.html
   ```

4. **Update Next.js Config**
   ```javascript
   // next.config.js
   module.exports = {
     assetPrefix: process.env.CDN_URL || '',
     images: {
       domains: ['d1234567890.cloudfront.net'],
     },
   };
   ```

5. **Upload Static Assets**
   ```bash
   # After build
   aws s3 sync .next/static s3://mirastros-static-assets/_next/static \
     --cache-control "public, max-age=31536000, immutable"
   ```

### Option 3: Self-Hosted with Nginx

If you want to use your own server as a CDN:

1. **Configure Nginx Caching**
   ```nginx
   # /etc/nginx/sites-available/mirastros.conf
   
   # Cache zone
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=static_cache:10m max_size=1g inactive=60m use_temp_path=off;
   
   server {
       listen 443 ssl http2;
       server_name cdn.mirastros.com;
       
       # SSL configuration
       ssl_certificate /etc/letsencrypt/live/cdn.mirastros.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/cdn.mirastros.com/privkey.pem;
       
       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 1024;
       gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
       
       # Brotli compression (if module installed)
       brotli on;
       brotli_comp_level 6;
       brotli_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
       
       # Static files location
       location /_next/static/ {
           alias /var/www/mirastros/web/.next/static/;
           expires 1y;
           add_header Cache-Control "public, immutable";
           access_log off;
       }
       
       location /static/ {
           alias /var/www/mirastros/web/public/static/;
           expires 1y;
           add_header Cache-Control "public, immutable";
           access_log off;
       }
       
       # Images
       location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif)$ {
           root /var/www/mirastros/web/public;
           expires 30d;
           add_header Cache-Control "public, max-age=2592000";
           access_log off;
       }
   }
   ```

2. **Enable HTTP/2**
   ```nginx
   listen 443 ssl http2;
   ```

3. **Install Brotli Module (Optional)**
   ```bash
   sudo apt-get install nginx-module-brotli
   ```

## Environment Variables

Add to your `.env` files:

```bash
# Web App (.env.local)
NEXT_PUBLIC_CDN_URL=https://cdn.mirastros.com
NEXT_PUBLIC_IMAGE_CDN=https://cdn.mirastros.com

# Backend (.env)
STATIC_ASSETS_URL=https://cdn.mirastros.com
```

## Deployment Script with CDN

Update your deployment script to upload static assets to CDN:

```bash
#!/bin/bash
# deployment/deploy_with_cdn.sh

# Build applications
npm run build

# Upload static assets to CDN (example with S3)
if [ "$USE_CDN" = "true" ]; then
    echo "📦 Uploading static assets to CDN..."
    
    # Web app static files
    aws s3 sync apps/web/.next/static s3://mirastros-static-assets/_next/static \
        --cache-control "public, max-age=31536000, immutable" \
        --delete
    
    # Public assets
    aws s3 sync apps/web/public s3://mirastros-static-assets/public \
        --cache-control "public, max-age=2592000" \
        --exclude "*.html"
    
    # Invalidate CloudFront cache
    aws cloudfront create-invalidation \
        --distribution-id E1234567890ABC \
        --paths "/*"
    
    echo "✅ CDN upload complete"
fi
```

## Performance Testing

After CDN setup, test performance:

```bash
# Test from different locations
curl -w "@curl-format.txt" -o /dev/null -s https://www.mirastros.com

# Check cache headers
curl -I https://cdn.mirastros.com/_next/static/chunks/main.js

# Use online tools
# - GTmetrix: https://gtmetrix.com
# - WebPageTest: https://www.webpagetest.org
# - Lighthouse: Chrome DevTools
```

## Expected Performance Improvements

With CDN properly configured:

- **TTFB (Time to First Byte)**: < 200ms
- **FCP (First Contentful Paint)**: < 1.5s
- **LCP (Largest Contentful Paint)**: < 2.5s
- **Static Asset Load Time**: 50-80% reduction
- **Bandwidth Savings**: 60-70% (with compression)

## Monitoring

Set up monitoring for CDN performance:

1. **Cloudflare Analytics** (if using Cloudflare)
   - Requests per second
   - Bandwidth usage
   - Cache hit ratio
   - Threat analytics

2. **AWS CloudWatch** (if using CloudFront)
   - Requests
   - Bytes downloaded
   - Error rate
   - Cache statistics

3. **Custom Monitoring**
   ```javascript
   // Track CDN performance in your app
   if (typeof window !== 'undefined') {
     const cdnPerformance = performance.getEntriesByType('resource')
       .filter(entry => entry.name.includes('cdn.mirastros.com'));
     
     console.log('CDN Performance:', cdnPerformance);
   }
   ```

## Troubleshooting

### Cache Not Working
- Check cache headers: `curl -I <url>`
- Verify CDN configuration
- Clear browser cache
- Check for `Cache-Control: no-cache` headers

### Slow Load Times
- Check CDN edge location coverage
- Verify compression is enabled
- Test from different geographic locations
- Check for large unoptimized assets

### CORS Issues
- Add CORS headers to CDN configuration
- Verify `Access-Control-Allow-Origin` header
- Check for mixed content (HTTP/HTTPS)

## Best Practices

1. **Use versioned URLs** for cache busting
2. **Set long cache times** for immutable assets (1 year)
3. **Enable compression** (Gzip + Brotli)
4. **Use HTTP/2** for multiplexing
5. **Optimize images** before uploading
6. **Monitor cache hit ratio** (target > 90%)
7. **Use CDN for all static assets** (JS, CSS, images, fonts)
8. **Implement cache invalidation** strategy
9. **Test from multiple locations**
10. **Set up alerts** for CDN issues

## Cost Estimation

### Cloudflare (Free Tier)
- **Cost**: $0/month
- **Bandwidth**: Unlimited
- **Requests**: Unlimited
- **Limitations**: Basic features only

### AWS CloudFront
- **First 10 TB**: $0.085/GB
- **Requests**: $0.0075 per 10,000 requests
- **Estimated**: $20-50/month for small-medium traffic

### Self-Hosted
- **Server**: Included in VPS cost
- **Bandwidth**: Depends on VPS plan
- **Estimated**: $0 additional cost

## Conclusion

For Mirastros Universal, we recommend:

1. **Start with Cloudflare** (free, easy setup)
2. **Upgrade to CloudFront** if you need more control
3. **Use self-hosted CDN** only if you have specific requirements

The performance improvements from CDN are significant and worth the setup effort.
