const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");
      req.userId = decoded.id;
      req.userEmail = decoded.email;
      req.userName = decoded.name;
      req.userRole = decoded.role;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Token is not valid" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error in authentication middleware" });
  }
};

module.exports = authMiddleware;
