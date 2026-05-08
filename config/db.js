require("dotenv").config();

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root123",
  database: process.env.DB_NAME || "event_booking",
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  connectionLimit: 10,           // Max simultaneous connections
  waitForConnections: true,      // Queue requests when all connections busy
  queueLimit: 0,                 // Unlimited queue (0 = no limit)
  connectTimeout: 10000,         // 10 second connection timeout
  enableKeepAlive: true,         // Keep connections alive
  keepAliveInitialDelay: 10000,  // Delay before first keep-alive probe
});

// Verify database connectivity on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ MySQL connected on port ${process.env.DB_PORT || 3306}`);
    connection.release();
  } catch (err) {
    console.error("❌ MySQL connection failed:", err.message);
    console.error("   Ensure MySQL is running on port", process.env.DB_PORT || 3306);
    process.exit(1);
  }
})();

module.exports = pool;