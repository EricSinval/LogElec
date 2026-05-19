const FRONTEND_URL = process.env.LOGELEC_FRONTEND_URL || 'http://localhost:8081/index/login.html';
const BACKEND_URL = process.env.LOGELEC_BACKEND_URL || 'http://localhost:8080/api/auth/me';

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

module.exports = async function globalSetup() {
  await Promise.all([
    waitForUrl(FRONTEND_URL, { acceptedStatuses: [200] }),
    waitForUrl(BACKEND_URL)
  ]);
};