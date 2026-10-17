const mysql = require('mysql2/promise');
require('dotenv').config();

// TiDB Cloud uses port 4000 and requires SSL.
// Set DB_SSL=true in your Render environment variables.
const sslConfig = process.env.DB_SSL === 'true'
  ? { rejectUnauthorized: true }
  : false;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bes_db',
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  connectTimeout: 30000,
});

module.exports = pool;
