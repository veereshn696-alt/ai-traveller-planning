const express = require("express");
const router = express.Router();
const { getStats, getUsers, deleteUser, getTrips } = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// All admin routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminMiddleware);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.get("/trips", getTrips);

module.exports = router;
