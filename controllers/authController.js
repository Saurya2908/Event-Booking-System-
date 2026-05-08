/**
 * Authentication Controller.
 * Handles user registration (with password) and login.
 */
const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../middleware/auth");
const {
  validateName,
  validateEmail,
  validatePassword,
} = require("../utils/validators");

const SALT_ROUNDS = 12;

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

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

    // Validate password
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
      return res.status(400).json({ error: passwordResult.message });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(passwordResult.value, SALT_ROUNDS);

    // Insert user — ER_DUP_ENTRY is caught by the global error handler
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [nameResult.value, emailResult.value, hashedPassword]
    );

    // Generate JWT
    const token = generateToken({
      id: result.insertId,
      email: emailResult.value,
    });

    res.status(201).json({
      message: "User registered successfully",
      user_id: result.insertId,
      token,
    });
  } catch (err) {
    next(err); // Pass to global error handler
  }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      return res.status(400).json({ error: emailResult.message });
    }

    // Validate password presence
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "Password is required" });
    }

    // Find user
    const [users] = await pool.query(
      "SELECT id, name, email, password FROM users WHERE email = ?",
      [emailResult.value]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = users[0];

    // If user was created without a password (legacy), deny login
    if (!user.password) {
      return res.status(401).json({
        error: "Account does not have a password. Please contact support.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT
    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      message: "Login successful",
      user_id: user.id,
      token,
    });
  } catch (err) {
    next(err);
  }
};
