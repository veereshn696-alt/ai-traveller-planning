const express = require("express");
const router = express.Router();
const { getProfile, putProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// All user routes require authentication
router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/profile", putProfile);

module.exports = router;
