const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Task = require("../models/Task");
const { userValidationRules, validate } = require("../utils/validators");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      // Validate request
      await Promise.all(userValidationRules.register.map((validation) => validation.run(req)));
      await validate(req, res, () => {});

      const { username, email, password } = req.body;

      // Create user
      const user = await User.create(username, email, password);

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      // Set cookie (optional)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
        },
        token,
      });
    } catch (error) {
      console.error("Registration error:", error);

      if (error.code === "23505") {
        // PostgreSQL unique violation
        return res.status(409).json({
          error: "User already exists with this email or username",
          code: "USER_EXISTS",
        });
      }

      res.status(500).json({
        error: "Registration failed. Please try again.",
        code: "REGISTRATION_FAILED",
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      // Validate request
      await Promise.all(userValidationRules.login.map((validation) => validation.run(req)));
      await validate(req, res, () => {});

      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      // Verify password
      const isValidPassword = await User.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      // Set cookie (optional)
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });

      res.json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
        },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        error: "Login failed. Please try again.",
        code: "LOGIN_FAILED",
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Get user statistics using Task model
      const taskStats = await Task.getStats(req.user.id);

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at,
        },
        stats: {
          total_tasks: taskStats.total || 0,
        },
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        error: "Failed to get profile",
        code: "PROFILE_FETCH_FAILED",
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      // Validate request
      await Promise.all(userValidationRules.updateProfile.map((validation) => validation.run(req)));
      await validate(req, res, () => {});

      const updates = {};
      if (req.body.username) updates.username = req.body.username;
      if (req.body.email) updates.email = req.body.email;

      // If password is being updated
      if (req.body.password) {
        if (!req.body.currentPassword) {
          return res.status(400).json({
            error: "Current password is required to change password",
            code: "CURRENT_PASSWORD_REQUIRED",
          });
        }

        const user = await User.findByEmail(req.user.email);
        const isValidPassword = await User.verifyPassword(req.body.currentPassword, user.password_hash);

        if (!isValidPassword) {
          return res.status(401).json({
            error: "Current password is incorrect",
            code: "INCORRECT_PASSWORD",
          });
        }

        // Hash new password
        const bcrypt = require("bcryptjs");
        updates.password_hash = await bcrypt.hash(req.body.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: "No updates provided",
          code: "NO_UPDATES",
        });
      }

      const updatedUser = await User.update(req.user.id, updates);

      res.json({
        message: "Profile updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.code === "23505") {
        // PostgreSQL unique violation
        return res.status(409).json({
          error: "Username or email already taken",
          code: "DUPLICATE_ENTRY",
        });
      }

      res.status(500).json({
        error: "Failed to update profile",
        code: "UPDATE_FAILED",
      });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      // Clear cookie
      res.clearCookie("token");

      res.json({
        message: "Logout successful",
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        error: "Logout failed",
        code: "LOGOUT_FAILED",
      });
    }
  }

  // Refresh token - PERBAIKAN DI SINI
  static async refreshToken(req, res) {
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader) {
        return res.status(401).json({
          error: "No authorization header provided",
          code: "NO_AUTH_HEADER",
        });
      }

      const oldToken = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

      if (!oldToken) {
        return res.status(401).json({
          error: "No token provided",
          code: "NO_TOKEN",
        });
      }

      // Verify old token
      let decoded;
      try {
        decoded = jwt.verify(oldToken, process.env.JWT_SECRET);
      } catch (error) {
        // Jika token expired, coba verify dengan ignoreExpiration
        if (error.name === "TokenExpiredError") {
          try {
            decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
          } catch (err) {
            return res.status(403).json({
              error: "Invalid token",
              code: "INVALID_TOKEN",
            });
          }
        } else {
          return res.status(403).json({
            error: "Invalid token",
            code: "INVALID_TOKEN",
          });
        }
      }

      // Check if user exists
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Generate new token
      const newToken = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      res.json({
        message: "Token refreshed",
        token: newToken,
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({
        error: "Failed to refresh token",
        code: "REFRESH_FAILED",
      });
    }
  }

  // Forgot password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          error: "Email is required",
          code: "EMAIL_REQUIRED",
        });
      }

      // Check if user exists
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return res.json({
          message: "If an account with that email exists, a password reset link has been sent.",
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Save reset token
      await User.setResetToken(email, resetToken, resetTokenExpires);

      // Always try to send email if email credentials are configured
      const hasEmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;

      if (!hasEmailConfig) {
        // No email config: log to console
        const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
        console.log("🔗 Password Reset URL (No Email Config):", resetUrl);
        console.log("📧 Email credentials not configured. Reset URL logged above.");
      } else {
        // Send actual email
        try {
          console.log("📧 Attempting to send password reset email to:", email);

          const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || "smtp.gmail.com",
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
            // Add timeout and debug options
            debug: true,
            logger: true,
          });

          // Verify connection
          await transporter.verify();
          console.log("✅ Email transporter verified successfully");

          const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

          const mailOptions = {
            from: `"Todo List App" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Password Reset Request - Todo List App",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You requested a password reset for your Todo List account.</p>
                <p>Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                </div>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this password reset, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message from Todo List App. Please do not reply.</p>
              </div>
            `,
          };

          const info = await transporter.sendMail(mailOptions);
          console.log("✅ Password reset email sent successfully:", info.messageId);
        } catch (emailError) {
          console.error("❌ Failed to send email:", emailError.message);
          console.error("Email config:", {
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER ? "configured" : "missing",
            pass: process.env.EMAIL_PASS ? "configured" : "missing",
          });

          // Fallback: log the reset URL to console
          const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
          console.log("🔄 Email failed, fallback reset URL:", resetUrl);
          console.log("💡 Check your email configuration in backend/.env");
        }
      }

      res.json({
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        error: "Failed to send reset email. Please try again.",
        code: "EMAIL_SEND_FAILED",
      });
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          error: "Token and password are required",
          code: "MISSING_FIELDS",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "Password must be at least 6 characters",
          code: "PASSWORD_TOO_SHORT",
        });
      }

      // Find user by reset token
      const user = await User.findByResetToken(token);
      if (!user) {
        return res.status(400).json({
          error: "Invalid or expired reset token",
          code: "INVALID_TOKEN",
        });
      }

      // Hash new password
      const hashedPassword = await require("bcryptjs").hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);

      // Update password and clear reset token
      await User.updatePassword(user.id, hashedPassword);

      res.json({
        message: "Password has been reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        error: "Failed to reset password. Please try again.",
        code: "RESET_FAILED",
      });
    }
  }
}

module.exports = AuthController;
