/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cdn.prod.website-files.com'],
      },
      env: {
        ORG_AND_EMP_URL: process.env.ORG_AND_EMP_URL,
      },
};

export default nextConfig;
