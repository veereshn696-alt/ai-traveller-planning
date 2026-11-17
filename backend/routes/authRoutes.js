const express = require("express");
const router = express.Router();
const { register, login, getProfile, googleLogin } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

// Protected routes
router.get("/profile", authMiddleware, getProfile);

module.exports = router;