const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

function createPool() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isExplicitSsl = process.env.DB_SSL === 'true';

  // 1. If a full connection URI (e.g. TiDB Cloud Serverless) is provided
  if (process.env.DATABASE_URL) {
    try {
      const parsed = new URL(process.env.DATABASE_URL);
      const isLocal = ['localhost', '127.0.0.1'].includes(parsed.hostname);

      // Extract and sanitize database name from URI
      const rawDb = (parsed.pathname || '').replace(/^\//, '').trim();
      let targetDb = rawDb || process.env.DB_NAME || 'test';
      // Protect against default system schemas
      if (['sys', 'information_schema', 'mysql', 'performance_schema', ''].includes(targetDb.toLowerCase())) {
        targetDb = 'test';
      }

      const poolConfig = {
        host: parsed.hostname,
        port: parseInt(parsed.port, 10) || 3306,
        user: decodeURIComponent(parsed.username),
        password: decodeURIComponent(parsed.password),
        database: targetDb,
        waitForConnections: true,
        connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 15,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        multipleStatements: true
      };

      // Always enforce TLS/SSL for cloud databases (TiDB Cloud Serverless requires SSL)
      if (!isLocal || isExplicitSsl || isProduction) {
        poolConfig.ssl = {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        };
      }

      console.log(`[Database] Initializing connection pool via DATABASE_URL to ${poolConfig.host}:${poolConfig.port}/${poolConfig.database} (SSL: ${!!poolConfig.ssl})`);
      return mysql.createPool(poolConfig);
    } catch (err) {
      console.warn('[Database] Could not parse DATABASE_URL with URL parser, using direct URI with SSL enforcement:', err.message);
      return mysql.createPool({
        uri: process.env.DATABASE_URL,
        multipleStatements: true,
        ssl: {
          minVersion: 'TLSv1.2',
          rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
        }
      });
    }
  }

  // 2. Individual environment variables (DB_HOST, DB_USER, etc.)
  const isLocal = ['localhost', '127.0.0.1'].includes(process.env.DB_HOST || 'localhost');
  let targetDb = (process.env.DB_NAME || 'academia_industry_portal').trim();
  if (['sys', 'information_schema', 'mysql', 'performance_schema', ''].includes(targetDb.toLowerCase())) {
    targetDb = 'academia_industry_portal';
  }

  const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: targetDb,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    multipleStatements: true
  };

  // Automatically enable SSL for remote cloud databases or when explicitly enabled
  if (isExplicitSsl || isProduction || !isLocal) {
    poolConfig.ssl = {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
    };
  }

  console.log(`[Database] Initializing connection pool to ${poolConfig.host}:${poolConfig.port}/${poolConfig.database} (SSL: ${!!poolConfig.ssl})`);
  return mysql.createPool(poolConfig);
}

const pool = createPool();

// Test connection helper
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    const [row] = await connection.query('SELECT DATABASE() as activeDb');
    const activeDb = row[0]?.activeDb || 'unknown';
    console.log(`[Database] Successfully connected to MySQL (Active DB: "${activeDb}")`);
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
