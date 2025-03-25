
module.exports = {
  apps: [
    {
      name: 'staging-osei-front-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3005',
      env: {
        NODE_ENV: 'production',
        PORT: 3005,
      },
    },
  ],
};
