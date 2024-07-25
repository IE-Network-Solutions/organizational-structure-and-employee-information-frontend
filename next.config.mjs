/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cdn.prod.website-files.com'],
      },
      env: {
        BASE_URL: process.env.BASE_URL,
      },
};

export default nextConfig;
