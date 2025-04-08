module.exports = {
  apps: [
    {
      name: 'osei-front-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3001',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'pep_front_stage',
      script: 'npm',
      args: 'run start',
      env: {
        PORT: 9412,
      },
    },
    {
      name: 'pep_front_dev',
      script: 'npm',
      args: 'run start',
      env: {
        PORT: 9411,
      },
    },
  ],
};
