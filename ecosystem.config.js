module.exports = {
  apps: [
    {
      name: 'osei-front-app',
      script: 'npm',
      args: 'run start',
      env: {
        PORT: 3001,
      },
    },
  ],
};
