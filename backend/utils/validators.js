const { body, param, query, validationResult } = require("express-validator");
const User = require("../models/User");

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map((err) =>
    extractedErrors.push({
      field: err.path,
      message: err.msg,
    }),
  );

  return res.status(422).json({
    error: "Validation failed",
    errors: extractedErrors,
  });
};

// User validation rules
const userValidationRules = {
  register: [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3-50 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores")
      .custom(async (username) => {
        const existingUser = await User.findByUsername(username);
        if (existingUser) {
          throw new Error("Username already taken");
        }
        return true;
      }),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail()
      .custom(async (email) => {
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
          throw new Error("Email already registered");
        }
        return true;
      }),

    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

    body("confirmPassword")
      .notEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],

  login: [body("email").trim().notEmpty().withMessage("Email is required").isEmail().withMessage("Invalid email format").normalizeEmail(), body("password").notEmpty().withMessage("Password is required")],

  updateProfile: [
    body("username")
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage("Username must be between 3-50 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores")
      .custom(async (username, { req }) => {
        const existingUser = await User.findByUsername(username);
        if (existingUser && existingUser.id !== req.user.id) {
          throw new Error("Username already taken");
        }
        return true;
      }),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail()
      .custom(async (email, { req }) => {
        const existingUser = await User.findByEmail(email);
        if (existingUser && existingUser.id !== req.user.id) {
          throw new Error("Email already registered");
        }
        return true;
      }),
  ],
};

// Task validation rules
const taskValidationRules = {
  create: [
    body("title").trim().notEmpty().withMessage("Title is required").isLength({ min: 1, max: 255 }).withMessage("Title must be between 1-255 characters"),

    body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

    body("category").optional().trim().isIn(["work", "personal", "shopping", "health", "education", "general"]).withMessage("Invalid category"),

    body("priority").optional().isInt({ min: 1, max: 3 }).withMessage("Priority must be between 1-3"),

    body("due_date")
      .optional()
      .isDate()
      .withMessage("Invalid date format")
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error("Due date cannot be in the past");
        }
        return true;
      }),
  ],

  update: [
    body("title").optional().trim().isLength({ min: 1, max: 255 }).withMessage("Title must be between 1-255 characters"),

    body("description").optional().trim().isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),

    body("category").optional().trim().isIn(["work", "personal", "shopping", "health", "education", "general"]).withMessage("Invalid category"),

    body("priority").optional().isInt({ min: 1, max: 3 }).withMessage("Priority must be between 1-3"),

    body("due_date")
      .optional()
      .isDate()
      .withMessage("Invalid date format")
      .custom((value) => {
        if (new Date(value) < new Date()) {
          throw new Error("Due date cannot be in the past");
        }
        return true;
      }),
  ],

  idParam: [param("id").isInt().withMessage("Task ID must be an integer").toInt()],

  queryParams: [
    query("completed").optional().isBoolean().withMessage("Completed must be true or false").toBoolean(),

    query("category").optional().trim(),

    query("priority").optional().isInt({ min: 1, max: 3 }).withMessage("Priority must be between 1-3").toInt(),

    query("search").optional().trim(),

    query("sortBy").optional().isIn(["created_at", "updated_at", "due_date", "priority", "title"]).withMessage("Invalid sort field"),

    query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc"),

    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1-100").toInt(),

    query("offset").optional().isInt({ min: 0 }).withMessage("Offset must be a positive integer").toInt(),
  ],
};

module.exports = {
  validate,
  userValidationRules,
  taskValidationRules,
};
