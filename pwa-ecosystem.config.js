module.exports = {
  apps: [
    {
      name: 'osei-front-app-pwa',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3008',
      env: {
        NODE_ENV: 'production',
        PORT: 3008,
        NODE_OPTIONS: '--max-old-space-size=4096',
      },
    },
  ],
};
