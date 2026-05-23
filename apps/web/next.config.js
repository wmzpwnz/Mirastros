//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Optimize images
  images: {
    domains: ['localhost', 'mirastros.ru', 'www.mirastros.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Optimize production builds
  swcMinify: true,
  
  // Output configuration for standalone deployment (only in production)
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' } : {}),
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@mirastros-universal/shared-core', '@mirastros-universal/design-system'],
    scrollRestoration: true,
  },
  
  // Optimize for scroll performance
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  
  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      {
        // Cache static assets
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Transpile packages if needed
  transpilePackages: ['three', 'gsap', '@mirastros-universal/design-system'],
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Alias @mirastros/design-system -> @mirastros-universal/design-system
    const path = require('path');
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      '@mirastros/design-system': path.resolve(__dirname, '../../packages/design-system/src/index.ts'),
    };
    // Let Next.js handle chunk splitting - custom config causes issues with static file generation
    // Next.js has its own optimized chunk splitting strategy
    
    return config;
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
