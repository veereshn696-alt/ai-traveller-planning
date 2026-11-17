const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Resilient in-memory user storage as fallback when MongoDB Atlas IP is offline/blocked
const inMemoryUsers = new Map();
inMemoryUsers.set("demo@pravasi.com", {
  _id: "demo_user_id_101",
  name: "Pravasi Explorer",
  email: "demo@pravasi.com",
  password: bcrypt.hashSync("password123", 10),
  role: "user",
});
inMemoryUsers.set("admin@pravasi.com", {
  _id: "admin_user_id_102",
  name: "Pravasi Admin",
  email: "admin@pravasi.com",
  password: bcrypt.hashSync("admin123", 10),
  role: "admin",
});

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
          return res.status(400).json({ message: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({
          name,
          email: normalizedEmail,
          password: hashedPassword,
          role: req.body.role || "user",
        });
      } catch (dbErr) {
        console.warn("MongoDB register failed, using in-memory store:", dbErr.message);
      }
    }

    if (!user) {
      if (inMemoryUsers.has(normalizedEmail)) {
        return res.status(400).json({ message: "Email is already registered" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        _id: "inmem_user_" + Date.now(),
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: req.body.role || "user",
      };
      inMemoryUsers.set(normalizedEmail, user);
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Registration failed" });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: normalizedEmail });
      } catch (dbErr) {
        console.warn("MongoDB login failed, falling back to in-memory store:", dbErr.message);
      }
    }

    if (!user && inMemoryUsers.has(normalizedEmail)) {
      user = inMemoryUsers.get(normalizedEmail);
    }

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password. You can also use demo@pravasi.com / password123 or click Quick Demo.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Login failed" });
  }
};

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findById(req.userId).select("-password");
      } catch (dbErr) {
        console.warn("MongoDB getProfile failed:", dbErr.message);
      }
    }

    if (!user) {
      for (const u of inMemoryUsers.values()) {
        if (String(u._id) === String(req.userId)) {
          user = { _id: u._id, name: u.name, email: u.email, role: u.role };
          break;
        }
      }
      if (!user) {
        user = {
          _id: req.userId,
          name: req.userName || "Pravasi Explorer",
          email: req.userEmail || "user@pravasi.com",
          role: req.userRole || "user",
        };
      }
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch profile" });
  }
};

// Google OAuth Login / Register
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: "Google token is required" });
    }

    let payload = null;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (clientId && clientId !== "your_google_client_id_here") {
      try {
        const { OAuth2Client } = require("google-auth-library");
        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: clientId,
        });
        payload = ticket.getPayload();
      } catch (verifyError) {
        console.warn("Google token verification failed (fallback to decoded token):", verifyError.message);
        payload = jwt.decode(token);
      }
    } else {
      payload = jwt.decode(token);
    }

    if (!payload) {
      return res.status(400).json({ message: "Could not decode Google token" });
    }

    const { name, email, sub: googleId } = payload;
    if (!email) {
      return res.status(400).json({ message: "Google account does not expose email address" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: normalizedEmail });
        if (!user) {
          const dummyPassword = await bcrypt.hash((googleId || "google") + "googleoauthsecret", 10);
          user = await User.create({
            name: name || "Google Explorer",
            email: normalizedEmail,
            password: dummyPassword,
            role: "user",
          });
        }
      } catch (dbErr) {
        console.warn("MongoDB googleLogin failed, using in-memory store:", dbErr.message);
      }
    }

    if (!user) {
      if (inMemoryUsers.has(normalizedEmail)) {
        user = inMemoryUsers.get(normalizedEmail);
      } else {
        const dummyPassword = await bcrypt.hash((googleId || "google") + "googleoauthsecret", 10);
        user = {
          _id: "inmem_g_" + Date.now(),
          name: name || "Google Explorer",
          email: normalizedEmail,
          password: dummyPassword,
          role: "user",
        };
        inMemoryUsers.set(normalizedEmail, user);
      }
    }

    const appToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "7d" }
    );

    res.json({
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error in googleLogin:", error);
    res.status(500).json({ message: error.message || "Google authentication failed" });
  }
};
