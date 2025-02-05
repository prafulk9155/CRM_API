const mysql = require('mysql2/promise');
require('dotenv').config();


// Create a connection pool
// const pool = mysql.createPool({
//   host: '192.168.1.140',
//   user: 'ogesone',
//   password: 'My$ql@ogOne#123',
//   database: 'sys_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port:13098,
  database: 'CRM',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Function to test the database connection
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query('SELECT 1');

    console.log('Database connection successful!');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  } finally {
     if (connection) connection.release();
  }
}

testConnection();

module.exports = pool;

//added env config