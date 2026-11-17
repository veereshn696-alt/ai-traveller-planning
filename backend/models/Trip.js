const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  startLocation: {
    type: String,
    default: "Bengaluru",
  },
  days: {
    type: Number,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  travelStyle: {
    type: String,
    required: true,
    enum: ["Budget", "Standard", "Luxury", "Adventure", "Family"],
  },
  interests: {
    type: [String],
    default: [],
  },
  selectedTransport: {
    type: Object,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Trip", tripSchema);
