const path = require('node:path');
const { spawnSync } = require('node:child_process');

const goals = process.argv.slice(2);

if (goals.length === 0) {
  console.error('Uso: node ./scripts/run-backend-maven.cjs <goal> [args...]');
  process.exit(1);
}

const backendDir = path.join(__dirname, '..', 'backend', 'LogElec');
const command = process.platform === 'win32' ? 'mvnw.cmd' : './mvnw';

const result = spawnSync(command, goals, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);