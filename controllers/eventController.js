const pool = require("../config/db");

// GET /events
exports.getEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM events WHERE date > NOW()"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /events
exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, capacity } = req.body;

    if (!title || !date || !capacity) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await pool.query(
      `INSERT INTO events (title, description, date, total_capacity, remaining_tickets)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description, date, capacity, capacity]
    );

    res.json({ message: "Event created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};