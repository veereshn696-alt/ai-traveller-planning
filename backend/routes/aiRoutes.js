const express = require("express");
const router = express.Router();
const { chatWithAI, getChatHistory, generateItineraryDirect } = require("../controllers/aiController");
const authMiddleware = require("../middleware/authMiddleware");

// All AI routes require user authentication
router.use(authMiddleware);

router.post("/generate-itinerary", generateItineraryDirect);
router.post("/chat", chatWithAI);
router.get("/chat", getChatHistory);

module.exports = router;
