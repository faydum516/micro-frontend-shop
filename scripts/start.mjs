import { spawn } from 'node:child_process';
import http from 'node:http';

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const useShell = process.platform === 'win32';
const children = [];

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: useShell,
    });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function start(name, args, { silent = false } = {}) {
  const child = spawn(pnpm, args, {
    stdio: silent ? 'ignore' : 'inherit',
    shell: useShell,
  });

  children.push(child);

  child.on('exit', (code) => {
    if (!shuttingDown && code !== 0) {
      console.error(`${name} exited with code ${code}`);
      shutdown(1);
    }
  });

  return child;
}

function waitFor(url, timeoutMs = 15000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${url}`));
          return;
        }

        setTimeout(check, 300);
      });
    };

    check();
  });
}

let shuttingDown = false;

function shutdown(code = 0) {
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Building remote bundles...');
await run(pnpm, ['run', 'build:remotes']);

console.log('Starting remotes on ports 5001 and 5002...');
start('remote-catalog', ['run', 'preview:catalog'], { silent: true });
start('remote-cart', ['run', 'preview:cart'], { silent: true });

await Promise.all([
  waitFor('http://127.0.0.1:5001/assets/remoteEntry.js'),
  waitFor('http://127.0.0.1:5002/assets/remoteEntry.js'),
]);

console.log('Starting host shell on port 5000...');
start('host-shell', ['run', 'dev:host']);

await waitFor('http://127.0.0.1:5000');

console.log('');
console.log('Host shell ready: http://localhost:5000');
console.log('Catalog remote:   http://localhost:5001/assets/remoteEntry.js');
console.log('Cart remote:      http://localhost:5002/assets/remoteEntry.js');
console.log('');
console.log('Press Ctrl+C to stop all servers.');
