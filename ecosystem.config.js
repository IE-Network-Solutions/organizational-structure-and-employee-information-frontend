module.exports = {
  apps: [
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
