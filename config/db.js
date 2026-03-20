const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "admin123",
  database: "event_booking",
});

module.exports = pool;