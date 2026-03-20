const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id/bookings", userController.getUserBookings);
router.post("/events/:id/attendance", userController.markAttendance);

module.exports = router;