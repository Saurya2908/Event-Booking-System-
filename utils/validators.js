/**
 * Shared validation utilities for the Event Booking System.
 * All validators return { valid: boolean, message: string }.
 */

// RFC 5322 simplified email regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// UUID v4 format
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Name: letters, spaces, hyphens, apostrophes only
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

/**
 * Sanitize a string: trim whitespace and strip HTML tags.
 */
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/<[^>]*>/g, "");
}

/**
 * Validate user name.
 * - Must be a non-empty string
 * - 1–100 characters after trimming
 * - Only letters, spaces, hyphens, apostrophes
 */
function validateName(name) {
  if (!name || typeof name !== "string") {
    return { valid: false, message: "Name is required and must be a string" };
  }

  const cleaned = sanitize(name);

  if (cleaned.length === 0) {
    return { valid: false, message: "Name cannot be empty" };
  }

  if (cleaned.length > 100) {
    return { valid: false, message: "Name must be at most 100 characters" };
  }

  if (!NAME_REGEX.test(cleaned)) {
    return {
      valid: false,
      message: "Name can only contain letters, spaces, hyphens, and apostrophes",
    };
  }

  return { valid: true, message: "Valid", value: cleaned };
}

/**
 * Validate email address.
 * - Must be a non-empty string
 * - Must match email format
 * - Max 100 characters (matches DB VARCHAR(100))
 * - Normalized to lowercase
 */
function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, message: "Email is required and must be a string" };
  }

  const cleaned = email.trim().toLowerCase();

  if (cleaned.length === 0) {
    return { valid: false, message: "Email cannot be empty" };
  }

  if (cleaned.length > 100) {
    return { valid: false, message: "Email must be at most 100 characters" };
  }

  if (!EMAIL_REGEX.test(cleaned)) {
    return { valid: false, message: "Invalid email format" };
  }

  return { valid: true, message: "Valid", value: cleaned };
}

/**
 * Validate that a value is a positive integer (≥ 1).
 */
function validatePositiveInt(value, fieldName = "Value") {
  const num = Number(value);

  if (!Number.isInteger(num) || num < 1) {
    return {
      valid: false,
      message: `${fieldName} must be a positive integer`,
    };
  }

  return { valid: true, message: "Valid", value: num };
}

/**
 * Validate event title.
 * - Non-empty string, 1–255 chars after sanitization
 */
function validateTitle(title) {
  if (!title || typeof title !== "string") {
    return { valid: false, message: "Title is required and must be a string" };
  }

  const cleaned = sanitize(title);

  if (cleaned.length === 0) {
    return { valid: false, message: "Title cannot be empty" };
  }

  if (cleaned.length > 255) {
    return { valid: false, message: "Title must be at most 255 characters" };
  }

  return { valid: true, message: "Valid", value: cleaned };
}

/**
 * Validate event description (optional).
 * - If provided, must be a string, max 2000 chars
 */
function validateDescription(description) {
  if (description === undefined || description === null) {
    return { valid: true, message: "Valid", value: null };
  }

  if (typeof description !== "string") {
    return { valid: false, message: "Description must be a string" };
  }

  const cleaned = sanitize(description);

  if (cleaned.length > 2000) {
    return {
      valid: false,
      message: "Description must be at most 2000 characters",
    };
  }

  return { valid: true, message: "Valid", value: cleaned };
}

/**
 * Validate that a date string is a valid, parseable date-time.
 */
function validateDateString(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    return {
      valid: false,
      message: "Date is required and must be a valid date-time string",
    };
  }

  const parsed = new Date(dateStr);

  if (isNaN(parsed.getTime())) {
    return {
      valid: false,
      message: "Invalid date format. Use ISO 8601 format (e.g., 2026-12-25T18:00:00Z)",
    };
  }

  return { valid: true, message: "Valid", value: parsed };
}

/**
 * Validate that a date string represents a future date.
 */
function validateFutureDate(dateStr) {
  const dateResult = validateDateString(dateStr);
  if (!dateResult.valid) return dateResult;

  if (dateResult.value <= new Date()) {
    return {
      valid: false,
      message: "Event date must be in the future",
    };
  }

  return dateResult;
}

/**
 * Validate event capacity.
 * - Must be a positive integer, 1–100,000
 */
function validateCapacity(capacity) {
  const intResult = validatePositiveInt(capacity, "Capacity");
  if (!intResult.valid) return intResult;

  if (intResult.value > 100000) {
    return {
      valid: false,
      message: "Capacity must be at most 100,000",
    };
  }

  return intResult;
}

/**
 * Validate ticket count for booking.
 * - Must be a positive integer, 1–10
 */
function validateTicketCount(tickets) {
  const intResult = validatePositiveInt(tickets, "Tickets");
  if (!intResult.valid) return intResult;

  if (intResult.value > 10) {
    return {
      valid: false,
      message: "Cannot book more than 10 tickets at a time",
    };
  }

  return intResult;
}

/**
 * Validate UUID v4 format.
 */
function validateUUID(value, fieldName = "Value") {
  if (!value || typeof value !== "string") {
    return {
      valid: false,
      message: `${fieldName} is required`,
    };
  }

  const cleaned = value.trim();

  if (!UUID_V4_REGEX.test(cleaned)) {
    return {
      valid: false,
      message: `${fieldName} must be a valid UUID format`,
    };
  }

  return { valid: true, message: "Valid", value: cleaned };
}

/**
 * Validate password.
 * - Must be at least 6 characters
 * - Must be at most 100 characters
 */
function validatePassword(password) {
  if (!password || typeof password !== "string") {
    return { valid: false, message: "Password is required and must be a string" };
  }

  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters" };
  }

  if (password.length > 100) {
    return { valid: false, message: "Password must be at most 100 characters" };
  }

  return { valid: true, message: "Valid", value: password };
}

module.exports = {
  sanitize,
  validateName,
  validateEmail,
  validatePositiveInt,
  validateTitle,
  validateDescription,
  validateDateString,
  validateFutureDate,
  validateCapacity,
  validateTicketCount,
  validateUUID,
  validatePassword,
};
