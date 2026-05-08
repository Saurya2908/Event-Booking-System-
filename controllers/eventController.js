const pool = require("../config/db");
const {
  validateTitle,
  validateDescription,
  validateFutureDate,
  validateCapacity,
} = require("../utils/validators");

// GET /events
exports.getEvents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM events WHERE date > NOW()"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// POST /events
exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, date, capacity } = req.body;

    // Validate title (required, 1–255 chars, sanitized)
    const titleResult = validateTitle(title);
    if (!titleResult.valid) {
      return res.status(400).json({ error: titleResult.message });
    }

    // Validate description (optional, max 2000 chars)
    const descResult = validateDescription(description);
    if (!descResult.valid) {
      return res.status(400).json({ error: descResult.message });
    }

    // Validate date (required, valid format, must be in the future)
    const dateResult = validateFutureDate(date);
    if (!dateResult.valid) {
      return res.status(400).json({ error: dateResult.message });
    }

    // Validate capacity (required, positive integer, 1–100,000)
    const capResult = validateCapacity(capacity);
    if (!capResult.valid) {
      return res.status(400).json({ error: capResult.message });
    }

    await pool.query(
      `INSERT INTO events (title, description, date, total_capacity, remaining_tickets)
       VALUES (?, ?, ?, ?, ?)`,
      [titleResult.value, descResult.value, dateResult.value, capResult.value, capResult.value]
    );

    res.json({ message: "Event created successfully" });
  } catch (err) {
    next(err);
  }
};