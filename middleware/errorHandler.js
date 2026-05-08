/**
 * Global error handling middleware.
 * Catches all unhandled errors and returns consistent JSON responses.
 */
function errorHandler(err, req, res, next) {
  // Log with timestamp for debugging
  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  // MySQL duplicate entry error (ER_DUP_ENTRY)
  if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
    return res.status(409).json({
      error: "Duplicate entry. This record already exists.",
      details: extractDuplicateField(err.message),
    });
  }

  // MySQL foreign key constraint error
  if (err.code === "ER_NO_REFERENCED_ROW_2" || err.errno === 1452) {
    return res.status(400).json({
      error: "Referenced record does not exist",
    });
  }

  // MySQL connection error
  if (err.code === "ECONNREFUSED" || err.code === "ER_ACCESS_DENIED_ERROR") {
    return res.status(503).json({
      error: "Database connection failed. Please try again later.",
    });
  }

  // JSON parse error (malformed request body)
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON in request body",
    });
  }

  // Default: Internal server error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: statusCode === 500 ? "Internal server error" : err.message,
  });
}

/**
 * Extract the duplicate field name from MySQL error message.
 * e.g., "Duplicate entry 'test@test.com' for key 'users.email'" → "email"
 */
function extractDuplicateField(message) {
  const match = message.match(/for key '(?:\w+\.)?(\w+)'/);
  return match ? `Duplicate value for field: ${match[1]}` : "Duplicate entry";
}

module.exports = errorHandler;
