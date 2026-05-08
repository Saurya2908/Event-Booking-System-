/**
 * Test Suite for Event Booking System.
 * 
 * Tests cover:
 * 1. Past-event creation logic (should be rejected)
 * 2. Booking code validation (valid UUID vs invalid)
 * 3. Email validation
 * 4. Duplicate email handling
 * 5. Input validation for all endpoints
 * 
 * Usage: node tests/test.js
 * Requires: Server running on http://localhost:3000
 */

const BASE_URL = "http://localhost:3000";

let passCount = 0;
let failCount = 0;
const results = [];

// ─── Test Helpers ────────────────────────────────────────────────────────────

async function request(method, path, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

function assert(testName, condition, actual, expected) {
  if (condition) {
    passCount++;
    results.push(`  ✅ PASS: ${testName}`);
  } else {
    failCount++;
    results.push(`  ❌ FAIL: ${testName}`);
    results.push(`         Expected: ${expected}`);
    results.push(`         Actual:   ${JSON.stringify(actual)}`);
  }
}

// ─── Test Groups ─────────────────────────────────────────────────────────────

async function testPastEventCreation() {
  results.push("\n📅 Test Group: Past-Event Creation Logic");
  results.push("─".repeat(50));

  // Test 1: Creating event with past date should fail
  const pastDate = "2020-01-01T10:00:00Z";
  const res1 = await request("POST", "/events", {
    title: "Past Concert",
    description: "This event is in the past",
    date: pastDate,
    capacity: 100,
  });
  assert(
    "Reject event with past date",
    res1.status === 400 && res1.data.error.includes("future"),
    res1,
    "400 with 'future' error message"
  );

  // Test 2: Creating event with future date should succeed
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  const res2 = await request("POST", "/events", {
    title: "Future Concert",
    description: "This event is in the future",
    date: futureDate.toISOString(),
    capacity: 100,
  });
  assert(
    "Accept event with future date",
    res2.status === 200 && res2.data.message === "Event created successfully",
    res2,
    "200 with success message"
  );

  // Test 3: Creating event with invalid date format
  const res3 = await request("POST", "/events", {
    title: "Bad Date Event",
    date: "not-a-date",
    capacity: 100,
  });
  assert(
    "Reject event with invalid date format",
    res3.status === 400,
    res3,
    "400 status"
  );

  // Test 4: Creating event with zero capacity
  const futureDate2 = new Date();
  futureDate2.setFullYear(futureDate2.getFullYear() + 1);
  const res4 = await request("POST", "/events", {
    title: "Zero Capacity Event",
    date: futureDate2.toISOString(),
    capacity: 0,
  });
  assert(
    "Reject event with zero capacity",
    res4.status === 400,
    res4,
    "400 status"
  );

  // Test 5: Creating event with negative capacity
  const res5 = await request("POST", "/events", {
    title: "Negative Capacity Event",
    date: futureDate2.toISOString(),
    capacity: -5,
  });
  assert(
    "Reject event with negative capacity",
    res5.status === 400,
    res5,
    "400 status"
  );
}

async function testBookingCodeValidation() {
  results.push("\n🎟️  Test Group: Booking Code Validation");
  results.push("─".repeat(50));

  // Test 1: Attendance with invalid UUID format
  const res1 = await request("POST", "/users/events/1/attendance", {
    booking_code: "not-a-valid-uuid",
  });
  assert(
    "Reject invalid UUID format for booking code",
    res1.status === 400 && res1.data.error.includes("UUID"),
    res1,
    "400 with UUID error"
  );

  // Test 2: Attendance with empty booking code
  const res2 = await request("POST", "/users/events/1/attendance", {
    booking_code: "",
  });
  assert(
    "Reject empty booking code",
    res2.status === 400,
    res2,
    "400 status"
  );

  // Test 3: Attendance with missing booking code
  const res3 = await request("POST", "/users/events/1/attendance", {});
  assert(
    "Reject missing booking code",
    res3.status === 400,
    res3,
    "400 status"
  );

  // Test 4: Attendance with valid UUID format but non-existent code
  const res4 = await request("POST", "/users/events/1/attendance", {
    booking_code: "550e8400-e29b-41d4-a716-446655440000",
  });
  assert(
    "Return 404 for valid-format but non-existent booking code",
    res4.status === 404,
    res4,
    "404 status"
  );

  // Test 5: Attendance with invalid event ID
  const res5 = await request("POST", "/users/events/abc/attendance", {
    booking_code: "550e8400-e29b-41d4-a716-446655440000",
  });
  assert(
    "Reject non-integer event ID in attendance",
    res5.status === 400,
    res5,
    "400 status"
  );
}

async function testEmailValidation() {
  results.push("\n📧 Test Group: Email Validation");
  results.push("─".repeat(50));

  // Test 1: Invalid email format
  const res1 = await request("POST", "/users", {
    name: "Test User",
    email: "not-an-email",
  });
  assert(
    "Reject invalid email format",
    res1.status === 400 && res1.data.error.includes("email"),
    res1,
    "400 with email error"
  );

  // Test 2: Email without domain
  const res2 = await request("POST", "/users", {
    name: "Test User",
    email: "test@",
  });
  assert(
    "Reject email without domain",
    res2.status === 400,
    res2,
    "400 status"
  );

  // Test 3: Email without @ symbol
  const res3 = await request("POST", "/users", {
    name: "Test User",
    email: "testexample.com",
  });
  assert(
    "Reject email without @ symbol",
    res3.status === 400,
    res3,
    "400 status"
  );

  // Test 4: Valid email should be accepted
  const uniqueEmail = `testuser_${Date.now()}@example.com`;
  const res4 = await request("POST", "/users", {
    name: "Valid User",
    email: uniqueEmail,
  });
  assert(
    "Accept valid email format",
    res4.status === 200,
    res4,
    "200 status"
  );

  // Test 5: Duplicate email should return 409
  const res5 = await request("POST", "/users", {
    name: "Duplicate User",
    email: uniqueEmail,
  });
  assert(
    "Return 409 for duplicate email",
    res5.status === 409,
    res5,
    "409 status"
  );
}

async function testNameValidation() {
  results.push("\n👤 Test Group: Name Validation");
  results.push("─".repeat(50));

  // Test 1: Name with special characters
  const res1 = await request("POST", "/users", {
    name: "Test<script>alert(1)</script>",
    email: `special_${Date.now()}@example.com`,
  });
  assert(
    "Reject name with HTML/script tags",
    res1.status === 400,
    res1,
    "400 status"
  );

  // Test 2: Name with numbers
  const res2 = await request("POST", "/users", {
    name: "User123",
    email: `num_${Date.now()}@example.com`,
  });
  assert(
    "Reject name with numbers",
    res2.status === 400,
    res2,
    "400 status"
  );

  // Test 3: Empty name
  const res3 = await request("POST", "/users", {
    name: "",
    email: `empty_${Date.now()}@example.com`,
  });
  assert(
    "Reject empty name",
    res3.status === 400,
    res3,
    "400 status"
  );

  // Test 4: Valid name with hyphens and apostrophes
  const res4 = await request("POST", "/users", {
    name: "Mary O'Brien-Smith",
    email: `hyphen_${Date.now()}@example.com`,
  });
  assert(
    "Accept name with hyphens and apostrophes",
    res4.status === 200,
    res4,
    "200 status"
  );
}

async function testBookingValidation() {
  results.push("\n🎫 Test Group: Booking Input Validation");
  results.push("─".repeat(50));

  // Test 1: Non-integer user_id
  const res1 = await request("POST", "/bookings", {
    user_id: "abc",
    event_id: 1,
    tickets: 2,
  });
  assert(
    "Reject non-integer user_id",
    res1.status === 400,
    res1,
    "400 status"
  );

  // Test 2: Negative tickets
  const res2 = await request("POST", "/bookings", {
    user_id: 1,
    event_id: 1,
    tickets: -1,
  });
  assert(
    "Reject negative ticket count",
    res2.status === 400,
    res2,
    "400 status"
  );

  // Test 3: Too many tickets (> 10)
  const res3 = await request("POST", "/bookings", {
    user_id: 1,
    event_id: 1,
    tickets: 15,
  });
  assert(
    "Reject ticket count exceeding 10",
    res3.status === 400 && res3.data.error.includes("10"),
    res3,
    "400 with limit error"
  );

  // Test 4: Zero tickets
  const res4 = await request("POST", "/bookings", {
    user_id: 1,
    event_id: 1,
    tickets: 0,
  });
  assert(
    "Reject zero tickets",
    res4.status === 400,
    res4,
    "400 status"
  );

  // Test 5: Non-existent user
  const res5 = await request("POST", "/bookings", {
    user_id: 99999,
    event_id: 1,
    tickets: 1,
  });
  assert(
    "Return 404 for non-existent user",
    res5.status === 404,
    res5,
    "404 status"
  );
}

async function testEventTitleValidation() {
  results.push("\n📝 Test Group: Event Title & Description Validation");
  results.push("─".repeat(50));

  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);

  // Test 1: Empty title
  const res1 = await request("POST", "/events", {
    title: "",
    date: futureDate.toISOString(),
    capacity: 50,
  });
  assert(
    "Reject empty event title",
    res1.status === 400,
    res1,
    "400 status"
  );

  // Test 2: Title with HTML injection
  const res2 = await request("POST", "/events", {
    title: "   ",
    date: futureDate.toISOString(),
    capacity: 50,
  });
  assert(
    "Reject whitespace-only title",
    res2.status === 400,
    res2,
    "400 status"
  );

  // Test 3: Description exceeding 2000 chars
  const res3 = await request("POST", "/events", {
    title: "Long Description Event",
    description: "x".repeat(2001),
    date: futureDate.toISOString(),
    capacity: 50,
  });
  assert(
    "Reject description over 2000 characters",
    res3.status === 400,
    res3,
    "400 status"
  );

  // Test 4: Capacity over 100,000
  const res4 = await request("POST", "/events", {
    title: "Mega Event",
    date: futureDate.toISOString(),
    capacity: 200000,
  });
  assert(
    "Reject capacity over 100,000",
    res4.status === 400,
    res4,
    "400 status"
  );
}

// ─── Run All Tests ───────────────────────────────────────────────────────────

async function runAllTests() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║     Event Booking System — Test Suite            ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  try {
    await testPastEventCreation();
    await testBookingCodeValidation();
    await testEmailValidation();
    await testNameValidation();
    await testBookingValidation();
    await testEventTitleValidation();
  } catch (err) {
    console.error("🔥 Test suite crashed:", err.message);
    console.error("   Make sure the server is running on", BASE_URL);
    process.exit(1);
  }

  // Print results
  results.forEach((r) => console.log(r));

  console.log("\n" + "═".repeat(50));
  console.log(`  Total: ${passCount + failCount} | ✅ Passed: ${passCount} | ❌ Failed: ${failCount}`);
  console.log("═".repeat(50) + "\n");

  process.exit(failCount > 0 ? 1 : 0);
}

runAllTests();
