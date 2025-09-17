module.exports = {
  apps: [
    {
      name: 'osei-front-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 9002',
      env: {
        NODE_ENV: 'production',
        PORT: 9002,
      },
    },
  ],
};
