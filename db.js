require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
<<<<<<< HEAD
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '!!&21adi',
  database: 'db_kas',
=======
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
>>>>>>> 57adeb7 (security: migrate credentials to environment variables)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

module.exports = pool;
