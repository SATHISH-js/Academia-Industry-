const https = require('https');
const http = require('http');

/**
 * Keep-Alive Service
 * Prevents Render Free Tier web services from spinning down due to the 15-minute inactivity policy.
 * When running on Render, RENDER_EXTERNAL_URL is automatically set by Render's environment.
 */
function initKeepAlive() {
  const isEnabled = process.env.KEEP_ALIVE_ENABLED !== 'false';
  if (!isEnabled) {
    console.log('[Keep-Alive] Self-ping disabled via KEEP_ALIVE_ENABLED=false');
    return;
  }

  // Render automatically injects RENDER_EXTERNAL_URL (e.g. https://my-app.onrender.com)
  // Users can also manually supply KEEP_ALIVE_URL
  const rawUrl = process.env.KEEP_ALIVE_URL || process.env.RENDER_EXTERNAL_URL;

  if (!rawUrl) {
    if (process.env.NODE_ENV === 'production') {
      console.log('[Keep-Alive] No KEEP_ALIVE_URL or RENDER_EXTERNAL_URL configured. Self-ping idle.');
    }
    return;
  }

  const cleanBase = rawUrl.replace(/\/+$/, '');
  const targetUrl = cleanBase.endsWith('/api/health') ? cleanBase : `${cleanBase}/api/health`;

  // Render free tier spins down after 15 minutes of inactivity.
  // We ping every 13 minutes (or custom interval) to ensure the service remains warm.
  const intervalMinutes = parseInt(process.env.KEEP_ALIVE_INTERVAL_MINUTES, 10) || 13;
  const intervalMs = Math.max(1, intervalMinutes) * 60 * 1000;

  console.log(`[Keep-Alive] Initialized. Auto-pinging ${targetUrl} every ${intervalMinutes} minutes.`);

  const performPing = () => {
    try {
      const isHttps = targetUrl.startsWith('https');
      const client = isHttps ? https : http;

      const req = client.get(targetUrl, { timeout: 15000 }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`[Keep-Alive] Auto-ping successful at ${new Date().toISOString()} (HTTP ${res.statusCode})`);
        } else {
          console.warn(`[Keep-Alive] Auto-ping returned HTTP ${res.statusCode}`);
        }
        res.resume(); // Free up memory by consuming response
      });

      req.on('timeout', () => {
        req.destroy();
        console.warn(`[Keep-Alive] Auto-ping request timed out after 15 seconds.`);
      });

      req.on('error', (err) => {
        console.warn(`[Keep-Alive] Auto-ping notice: ${err.message}`);
      });
    } catch (err) {
      console.error(`[Keep-Alive] Exception during auto-ping: ${err.message}`);
    }
  };

  // Run initial ping after 2 minutes so service has fully finished spinning up
  setTimeout(performPing, 2 * 60 * 1000);

  // Schedule recurring ping
  const timer = setInterval(performPing, intervalMs);

  if (timer.unref) {
    timer.unref();
  }
}

module.exports = { initKeepAlive };
