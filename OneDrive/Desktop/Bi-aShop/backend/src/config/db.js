const sql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME,
  options: {
    encrypt: String(process.env.DB_ENCRYPT).toLowerCase() === 'true',
    trustServerCertificate: String(process.env.DB_TRUST_SERVER_CERT).toLowerCase() !== 'false',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;

async function connectDB() {
  if (pool) return pool;
  pool = await sql.connect(dbConfig);
  return pool;
}

function getRequest() {
  if (!pool) {
    throw new Error('Database is not connected. Call connectDB() first.');
  }
  return pool.request();
}

module.exports = {
  sql,
  connectDB,
  getRequest,
};
