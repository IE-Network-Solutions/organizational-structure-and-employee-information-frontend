import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'cdn.prod.website-files.com',
      'files.ienetworks.co',
      'example.com',
    ],
  },
  env: {
    PAYROLL_DEV_URL: process.env.PAYROLL_DEV_URL,
    ORG_AND_EMP_URL: process.env.ORG_AND_EMP_URL,
    ORG_DEV_URL: process.env.ORG_DEV_URL,
    TENANT_MGMT_URL: process.env.TENANT_MGMT_URL,
    PAYROLL_URL: process.env.PAYROLL_URL,
    NOTIFICATION_URL: process.env.NOTIFICATION_URL,
    RECRUITMENT_URL: process.env.RECRUITMENT_URL,
    PUBLIC_DOMAIN: process.env.PUBLIC_DOMAIN,
    OKR_URL: process.env.OKR_URL,
    APPROVER_URL: process.env.NEXT_PUBLIC_APPROVERS_URL,
    OKR_URL: process.env.OKR_URL,
    ORG_DEV: process.env.ORG_DEV,
    EMAIL_URL: process.env.EMAIL_URL,
    INCENTIVE_URL: process.env.INCENTIVE_URL,
    PAYROLL_URL: process.env.PAYROLL_URL,
    TENANT_BASE_URL:process.env.TENANT_BASE_URL,
    TENANT_MGMT_URL: process.env.TENANT_BASE_URL,
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development' || process.env.DISABLE_PWA === 'true',
  register: true,
  skipWaiting: true,
  sw: 'sw.js',
  fallbacks: {
    document: '/offline',
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-static',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 365 days
        }
      }
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-css-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        }
      }
    },
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        networkTimeoutSeconds: 10
      }
    },
    // {
    //   urlPattern: /.*/i,
    //   handler: 'NetworkFirst',
    //   options: {
    //     cacheName: 'others',
    //     expiration: {
    //       maxEntries: 32,
    //       maxAgeSeconds: 24 * 60 * 60 // 24 hours
    //     },
    //     networkTimeoutSeconds: 10
    //   }
    // }
  ]
});

export default pwaConfig(nextConfig);
