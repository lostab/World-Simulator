const { spawn } = require('child_process');
const process = require('process');

console.log('Starting World-Simulator Dev Server...');

const child = spawn('npm', ['run', 'dev'], { 
  stdio: 'inherit', 
  shell: true,
  env: { ...process.env, NODE_ENV: 'development' }
});

child.on('exit', (code) => {
  console.log(`Dev server exited with code ${code}`);
  process.exit(code);
});
