const User = require("../models/User");
const Trip = require("../models/Trip");
const Itinerary = require("../models/Itinerary");
const Chat = require("../models/Chat");

// Get overall stats
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();
    const totalItineraries = await Itinerary.countDocuments();

    res.json({
      totalUsers,
      totalTrips,
      totalItineraries,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch admin stats" });
  }
};

// List all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch users" });
  }
};

// Delete a user (cascades to their trips, itineraries, and chats)
exports.deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.userId) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find and delete all itineraries linked to the user's trips
    const userTrips = await Trip.find({ userId: targetUserId });
    const tripIds = userTrips.map((trip) => trip._id);

    await Itinerary.deleteMany({ tripId: { $in: tripIds } });
    await Trip.deleteMany({ userId: targetUserId });
    await Chat.deleteMany({ userId: targetUserId });
    await User.findByIdAndDelete(targetUserId);

    res.json({ message: "User and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to delete user" });
  }
};

// List all trips with user names and emails
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    const tripsWithItinerary = await Promise.all(
      trips.map(async (trip) => {
        const itinerary = await Itinerary.findOne({ tripId: trip._id });
        return {
          ...trip.toObject(),
          itinerary: itinerary ? itinerary.content : null,
        };
      })
    );

    res.json(tripsWithItinerary);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch all trips" });
  }
};
