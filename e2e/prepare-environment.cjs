const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT_DIR = process.cwd();
const SEED_PATH = path.join(ROOT_DIR, 'database', 'seed.sql');
const FRONTEND_URL = process.env.LOGELEC_FRONTEND_URL || 'http://localhost:8081/index/login.html';
const BACKEND_URL = process.env.LOGELEC_BACKEND_URL || 'http://localhost:8080/api/auth/me';

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    throw new Error(`Falha ao executar: ${command} ${args.join(' ')}`);
  }
}

async function waitForUrl(url, options = {}) {
  const timeoutMs = options.timeoutMs || 90_000;
  const intervalMs = options.intervalMs || 1_000;
  const acceptedStatuses = options.acceptedStatuses || [200, 204, 401, 403];
  const deadline = Date.now() + timeoutMs;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (acceptedStatuses.includes(response.status)) {
        return;
      }
      lastError = new Error(`Status inesperado ${response.status} em ${url}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw lastError || new Error(`Tempo esgotado aguardando ${url}`);
}

async function prepararAmbiente({ resetDb }) {
  run('docker', ['compose', 'up', '--build', '-d']);

  if (resetDb) {
    run('docker', ['cp', SEED_PATH, 'logelec-db:/tmp/seed.sql']);
    run('docker', ['exec', 'logelec-db', 'sh', '-c', 'mysql -uroot -p74123LogElec logelec < /tmp/seed.sql']);
    run('docker', ['compose', 'restart', 'backend']);
  }

  await Promise.all([
    waitForUrl(FRONTEND_URL, { acceptedStatuses: [200] }),
    waitForUrl(BACKEND_URL)
  ]);
}

prepararAmbiente({ resetDb: process.argv.includes('--reset-db') }).catch((error) => {
  console.error(error.message);
  process.exit(1);
});