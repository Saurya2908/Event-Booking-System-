const pool = require("../config/db");
const {
  validateName,
  validateEmail,
  validatePositiveInt,
  validateUUID,
} = require("../utils/validators");


// POST /users
exports.createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    // Validate name
    const nameResult = validateName(name);
    if (!nameResult.valid) {
      return res.status(400).json({ error: nameResult.message });
    }

    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      return res.status(400).json({ error: emailResult.message });
    }

    // Insert user — rely on DB UNIQUE constraint for duplicate detection
    // ER_DUP_ENTRY is caught by the global error handler → 409 Conflict
    await pool.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [nameResult.value, emailResult.value]
    );

    res.json({ message: "User created successfully" });

  } catch (err) {
    next(err); // Pass to global error handler
  }
};

// GET /users
exports.getAllUsers = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT id, name, email FROM users");
    res.json(rows);
  } catch (err) {
    next(err);
  }
};


// GET /users/:id/bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate id is a positive integer
    const idResult = validatePositiveInt(id, "User ID");
    if (!idResult.valid) {
      return res.status(400).json({ error: idResult.message });
    }

    const [rows] = await pool.query(
      "SELECT * FROM bookings WHERE user_id = ?",
      [idResult.value]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /events/:id/attendance
exports.markAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { booking_code } = req.body;

    // Validate event id
    const idResult = validatePositiveInt(id, "Event ID");
    if (!idResult.valid) {
      return res.status(400).json({ error: idResult.message });
    }

    // Validate booking code is present and is a valid UUID
    const codeResult = validateUUID(booking_code, "Booking code");
    if (!codeResult.valid) {
      return res.status(400).json({ error: codeResult.message });
    }

    const [booking] = await pool.query(
      "SELECT tickets FROM bookings WHERE booking_code = ? AND event_id = ?",
      [codeResult.value, idResult.value]
    );

    if (booking.length === 0) {
      return res.status(404).json({ error: "Invalid booking code for this event" });
    }

    res.json({
      tickets_booked: booking[0].tickets,
    });
  } catch (err) {
    next(err);
  }
};