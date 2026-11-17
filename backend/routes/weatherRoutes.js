const express = require("express");
const router = express.Router();
const { getWeatherByCity } = require("../controllers/weatherController");
const authMiddleware = require("../middleware/authMiddleware");

// All weather routes require user authentication
router.use(authMiddleware);

router.get("/:city", getWeatherByCity);

module.exports = router;
