const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Protected routes
router.get("/profile", authenticateToken, AuthController.getProfile);
router.put("/profile", authenticateToken, AuthController.updateProfile);
router.post("/logout", authenticateToken, AuthController.logout);
router.post("/refresh", AuthController.refreshToken);

module.exports = router;
