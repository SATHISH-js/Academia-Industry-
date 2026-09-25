const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

function createPool() {
  // If a full connection URI is provided (e.g., TiDB Cloud, Aiven, or cloud database URL)
  if (process.env.DATABASE_URL) {
    console.log('[Database] Connecting using DATABASE_URL');
    return mysql.createPool(process.env.DATABASE_URL);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isExplicitSsl = process.env.DB_SSL === 'true';
  const isLocal = ['localhost', '127.0.0.1'].includes(process.env.DB_HOST || 'localhost');

  const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'academia_industry_portal',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  };

  // Automatically enable SSL for remote cloud databases or when DB_SSL=true
  if (isExplicitSsl || (isProduction && !isLocal)) {
    poolConfig.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    };
  }

  return mysql.createPool(poolConfig);
}

const pool = createPool();

// Test connection helper
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const target = process.env.DATABASE_URL
      ? 'Cloud DATABASE_URL'
      : `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`;
    console.log(`[Database] Successfully connected to MySQL at ${target}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[Database Error] Connection failed:`, error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
