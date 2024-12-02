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
    ORG_AND_EMP_URL: process.env.ORG_AND_EMP_URL,
    ORG_DEV_URL: process.env.ORG_DEV_URL,
    TENANT_MGMT_URL: process.env.TENANT_MGMT_URL,
    NOTIFICATION_URL: process.env.NOTIFICATION_URL,
    RECRUITMENT_URL: process.env.RECRUITMENT_URL,
    PUBLIC_DOMAIN: process.env.PUBLIC_DOMAIN,
    OKR_URL: process.env.OKR_URL,
    APPROVER_URL: process.env.NEXT_PUBLIC_APPROVERS_URL,

    ORG_DEV: process.env.ORG_DEV,
  },
};

export default nextConfig;
