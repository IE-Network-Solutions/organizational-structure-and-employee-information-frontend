import withPWA from 'next-pwa';

const isDev = process.env.NODE_ENV === "development";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  
  // 1. Remove basePath because Nginx is stripping the prefix
  // 2. Add assetPrefix so JS/CSS are requested via /workspace/_next/...
  assetPrefix: isDev ? undefined : "/workspace",

  async rewrites() {
    return {
      beforeFiles: [
        // 3. Map the prefixed requests back to internal Next.js paths
        {
          source: "/workspace/_next/:path*",
          destination: "/_next/:path*",
        },
        // Map PWA files and static assets
        {
          source: "/workspace/sw.js",
          destination: "/sw.js",
        },
        {
          source: "/workspace/workbox-:hash.js",
          destination: "/workbox-:hash.js",
        },
      ],
    };
  },
  
  experimental: {
    cpus: 1,
  },
  
  images: {
    domains: [
      'cdn.prod.website-files.com',
      'files.ienetworks.co',
      'example.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.ienetworks.co',
        pathname: '/**',
      },
    ],
  },
  
  env: {
    PAYROLL_DEV_URL: process.env.PAYROLL_DEV_URL,
    ORG_AND_EMP_URL: process.env.ORG_AND_EMP_URL,
    ORG_DEV_URL: process.env.ORG_DEV_URL,
    TENANT_MGMT_URL: process.env.TENANT_MGMT_URL,
    TENANT_BASE_URL: process.env.TENANT_BASE_URL,
    PAYROLL_URL: process.env.PAYROLL_URL,
    NOTIFICATION_URL: process.env.NOTIFICATION_URL,
    RECRUITMENT_URL: process.env.RECRUITMENT_URL,
    PUBLIC_DOMAIN: process.env.PUBLIC_DOMAIN,
    OKR_URL: process.env.OKR_URL,
    APPROVER_URL: process.env.NEXT_PUBLIC_APPROVERS_URL,
    ORG_DEV: process.env.ORG_DEV,
    EMAIL_URL: process.env.EMAIL_URL,
    INCENTIVE_URL: process.env.INCENTIVE_URL,
    AI_BASE_URL: process.env.NEXT_PUBLIC_AI_BASE_URL,
    AI_REC_BASE_URL: process.env.NEXT_PUBLIC_AI_REC_BASE_URL,
    NEXT_PUBLIC_AZURE_APP_SERVICE: process.env.NEXT_PUBLIC_AZURE_APP_SERVICE,
    NEXT_PUBLIC_ENCRYPTION_DISABLED: process.env.NEXT_PUBLIC_ENCRYPTION_DISABLED,
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: isDev || process.env.DISABLE_PWA === 'true',
  register: true,
  skipWaiting: false,
  sw: 'sw.js',
  // Ensure the PWA knows it's running under /workspace
  scope: '/workspace/', 
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-static',
        expiration: { maxEntries: 4, maxAgeSeconds: 365 * 24 * 60 * 60 }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-image-assets', expiration: { maxEntries: 64, maxAgeSeconds: 24 * 60 * 60 } }
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'static-js-css-assets', expiration: { maxEntries: 32, maxAgeSeconds: 24 * 60 * 60 } }
    },
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 16, maxAgeSeconds: 24 * 60 * 60 },
        networkTimeoutSeconds: 10
      }
    },
  ]
});

export default pwaConfig(nextConfig);
