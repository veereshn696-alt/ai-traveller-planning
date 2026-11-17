const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
  try {
    let role = req.userRole;

    if (!role) {
      const user = await User.findById(req.userId);
      if (user) {
        role = user.role;
      }
    }

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server Error in admin middleware" });
  }
};

module.exports = adminMiddleware;
