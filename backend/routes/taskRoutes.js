const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/taskController");
const { authenticateToken } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticateToken);

// Task collection routes
router.get("/", TaskController.getAllTasks);
router.get("/stats", TaskController.getTaskStats);
router.get("/search", TaskController.searchTasks);
router.post("/", TaskController.createTask);
router.post("/bulk", TaskController.bulkUpdate);

// Single task routes
router.get("/:id", TaskController.getTask);
router.put("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);
router.patch("/:id/toggle", TaskController.toggleTaskComplete);

module.exports = router;
