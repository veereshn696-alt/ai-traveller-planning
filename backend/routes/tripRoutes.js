const express = require("express");
const router = express.Router();
const { generateTrip, getUserTrips, getTripById, deleteTrip, getTransportOptions } = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware");

// All trip routes require user authentication
router.use(authMiddleware);

router.post("/", generateTrip);
router.post("/transport-options", getTransportOptions);
router.get("/", getUserTrips);
router.get("/:id", getTripById);
router.delete("/:id", deleteTrip);

module.exports = router;
