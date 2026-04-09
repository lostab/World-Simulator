module.exports = {
  apps : [{
    name: 'world-sim',
    script: 'npm',
    args: 'run preview -- --port 5173',
    interpreter: 'cmd',
    cwd: 'D:\\Work\\openclaw\\World-Simulator',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
