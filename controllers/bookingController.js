const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const {
  validatePositiveInt,
  validateTicketCount,
} = require("../utils/validators");

// POST /bookings
exports.createBooking = async (req, res, next) => {
  const conn = await pool.getConnection();

  try {
    const { user_id, event_id, tickets } = req.body;

    // Validate user_id
    const userIdResult = validatePositiveInt(user_id, "User ID");
    if (!userIdResult.valid) {
      return res.status(400).json({ error: userIdResult.message });
    }

    // Validate event_id
    const eventIdResult = validatePositiveInt(event_id, "Event ID");
    if (!eventIdResult.valid) {
      return res.status(400).json({ error: eventIdResult.message });
    }

    // Validate tickets (positive integer, max 10 per booking)
    const ticketResult = validateTicketCount(tickets);
    if (!ticketResult.valid) {
      return res.status(400).json({ error: ticketResult.message });
    }

    // Verify user exists
    const [user] = await conn.query(
      "SELECT id FROM users WHERE id = ?",
      [userIdResult.value]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await conn.beginTransaction();

    // Lock row to prevent race condition
    const [event] = await conn.query(
      "SELECT remaining_tickets FROM events WHERE id = ? FOR UPDATE",
      [eventIdResult.value]
    );

    if (event.length === 0) {
      throw new Error("Event not found");
    }

    if (event[0].remaining_tickets < ticketResult.value) {
      throw new Error("Not enough tickets available");
    }

    const bookingCode = uuidv4();

    await conn.query(
      `INSERT INTO bookings (user_id, event_id, booking_code, tickets)
       VALUES (?, ?, ?, ?)`,
      [userIdResult.value, eventIdResult.value, bookingCode, ticketResult.value]
    );

    await conn.query(
      `UPDATE events
       SET remaining_tickets = remaining_tickets - ?
       WHERE id = ?`,
      [ticketResult.value, eventIdResult.value]
    );

    await conn.commit();

    res.json({
      message: "Booking successful",
      booking_code: bookingCode,
    });

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};