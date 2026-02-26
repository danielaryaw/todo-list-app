const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
        code: "NO_TOKEN",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        error: "User not found.",
        code: "USER_NOT_FOUND",
      });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        error: "Invalid token.",
        code: "INVALID_TOKEN",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        error: "Token has expired.",
        code: "TOKEN_EXPIRED",
      });
    }

    console.error("Authentication error:", error);
    res.status(500).json({
      error: "Authentication failed.",
      code: "AUTH_FAILED",
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
        };
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

const authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required.",
        code: "AUTH_REQUIRED",
      });
    }

    // For future role-based features
    // Currently all users have same role
    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  authorizeRole,
};
