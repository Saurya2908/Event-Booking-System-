const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// POST /bookings
exports.createBooking = async (req, res) => {
  const conn = await pool.getConnection();

  try {
    const { user_id, event_id, tickets } = req.body;

    if (!user_id || !event_id || !tickets) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await conn.beginTransaction();

    // Lock row to prevent race condition
    const [event] = await conn.query(
      "SELECT remaining_tickets FROM events WHERE id = ? FOR UPDATE",
      [event_id]
    );

    if (event.length === 0) {
      throw new Error("Event not found");
    }

    if (event[0].remaining_tickets < tickets) {
      throw new Error("Not enough tickets available");
    }

    const bookingCode = uuidv4();

    await conn.query(
      `INSERT INTO bookings (user_id, event_id, booking_code, tickets)
       VALUES (?, ?, ?, ?)`,
      [user_id, event_id, bookingCode, tickets]
    );

    await conn.query(
      `UPDATE events
       SET remaining_tickets = remaining_tickets - ?
       WHERE id = ?`,
      [tickets, event_id]
    );

    await conn.commit();

    res.json({
      message: "Booking successful",
      booking_code: bookingCode,
    });

  } catch (err) {
    await conn.rollback();
    res.status(400).json({ error: err.message });
  } finally {
    conn.release();
  }
};