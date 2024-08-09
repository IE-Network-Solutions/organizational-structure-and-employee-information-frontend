/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cdn.prod.website-files.com'],
      },
      env: {
        ORG_AND_EMP_URL: process.env.ORG_AND_EMP_URL,
        TENANT_MGMT_URL: process.env.TENANT_MGMT_URL,

      },
};

export default nextConfig;
