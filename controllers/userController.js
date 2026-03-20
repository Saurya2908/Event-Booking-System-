const pool = require("../config/db");


// POST /users
exports.createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Check duplicate email
    const [existing] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    await pool.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    res.json({ message: "User created successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// GET /users/:id/bookings
exports.getUserBookings = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      "SELECT * FROM bookings WHERE user_id = ?",
      [id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /events/:id/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_code } = req.body;

    const [booking] = await pool.query(
      "SELECT tickets FROM bookings WHERE booking_code = ? AND event_id = ?",
      [booking_code, id]
    );

    if (booking.length === 0) {
      return res.status(404).json({ error: "Invalid booking code" });
    }

    res.json({
      tickets_booked: booking[0].tickets,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};