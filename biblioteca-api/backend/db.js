require('dotenv').config();
const mysql = require('mysql2/promise');

// Pool de conexões reutilizadas pela aplicação
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'biblioteca',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true // devolve DATE como 'YYYY-MM-DD' (sem problemas de fuso)
});

module.exports = pool;
