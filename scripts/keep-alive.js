/**
 * Parampara — Render Keep-Alive Pinger
 * =====================================
 * Render.com free-tier services spin down after 15 minutes of inactivity,
 * causing a 15-30 second cold start delay for the next visitor.
 *
 * This script pings /api/health every 10 minutes to keep the server warm.
 *
 * Usage:
 *   node scripts/keep-alive.js
 *
 * Or run it as a background process with PM2:
 *   pm2 start scripts/keep-alive.js --name parampara-pinger
 *
 * Or host it on a free cron service like cron-job.org pointing to:
 *   https://parampara-a-e-com-website-1.onrender.com/api/health
 */

const RENDER_URL = process.env.RENDER_URL || 'https://parampara-a-e-com-website-1.onrender.com';
const HEALTH_ENDPOINT = `${RENDER_URL}/api/health`;
const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

async function ping() {
  const start = Date.now();
  try {
    const res = await fetch(HEALTH_ENDPOINT, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    const ms = Date.now() - start;
    const dbStatus = data?.database?.status || 'unknown';
    const status = data?.status || 'unknown';
    console.log(`[${new Date().toISOString()}] ✅ Ping OK — ${ms}ms | server: ${status} | db: ${dbStatus}`);
  } catch (err) {
    const ms = Date.now() - start;
    console.warn(`[${new Date().toISOString()}] ⚠️  Ping failed after ${ms}ms: ${err.message}`);
  }
}

// Run immediately, then on interval
ping();
setInterval(ping, INTERVAL_MS);
console.log(`🏺 Parampara keep-alive pinger started — pinging ${HEALTH_ENDPOINT} every ${INTERVAL_MS / 60000} minutes`);
