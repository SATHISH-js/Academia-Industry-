const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

const root = path.resolve(__dirname, '..');
const backendDir = path.join(root, 'backend');
const envPath = path.join(backendDir, '.env');
const examplePath = path.join(backendDir, '.env.example');

if (!fs.existsSync(envPath)) {
  let env = fs.readFileSync(examplePath, 'utf8');
  env = env.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${crypto.randomBytes(48).toString('hex')}`);
  fs.writeFileSync(envPath, env, { encoding: 'utf8', mode: 0o600 });
  console.log('Created backend/.env with a local-only JWT secret. Confirm the MySQL settings before signing up.');
}

const env = fs.readFileSync(envPath, 'utf8');
const secretMatch = env.match(/^\s*JWT_SECRET\s*=\s*(.*?)\s*$/m);
const secret = secretMatch?.[1]?.replace(/^['"]|['"]$/g, '') || '';
if (secret.length < 32 || /replace_with|change_in_production/i.test(secret)) {
  console.error('backend/.env needs a unique JWT_SECRET of at least 32 characters. No secret value was displayed.');
  process.exit(1);
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const options = { stdio: 'inherit', shell: process.platform === 'win32' };
const children = [
  spawn(npm, ['run', 'dev'], { ...options, cwd: backendDir }),
  spawn(npm, ['run', 'dev'], { ...options, cwd: path.join(root, 'frontend') })
];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) if (!child.killed) child.kill('SIGINT');
  setTimeout(() => process.exit(code), 500);
}

for (const child of children) {
  child.on('error', error => {
    console.error('Could not start local development server:', error.message);
    stop(1);
  });
  child.on('exit', code => {
    if (!stopping && code !== 0) stop(code || 1);
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
console.log('Starting API and Vite. Open http://localhost:5173. Press Ctrl+C to stop both.');
