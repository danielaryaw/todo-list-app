const Task = require("../models/Task");
const { taskValidationRules, validate } = require("../utils/validators");

class TaskController {
  // Get all tasks with filters
  static async getAllTasks(req, res) {
    try {
      // Clean filter values sebelum digunakan
      const filters = {
        completed: req.query.completed === "" ? undefined : req.query.completed,
        category: req.query.category === "" ? undefined : req.query.category,
        priority: req.query.priority === "" ? undefined : req.query.priority,
        search: req.query.search === "" ? undefined : req.query.search,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      };

      const tasks = await Task.findAllByUser(req.user.id, filters);

      // Get task statistics
      const stats = await Task.getStats(req.user.id);

      res.json({
        tasks,
        meta: {
          total: parseInt(stats.total) || 0,
          completed: parseInt(stats.completed) || 0,
          pending: parseInt(stats.pending) || 0,
        },
      });
    } catch (error) {
      console.error("Get tasks error:", error);
      res.status(500).json({
        error: "Failed to fetch tasks",
        code: "TASKS_FETCH_FAILED",
      });
    }
  }

  // Get single task
  static async getTask(req, res) {
    try {
      // Validate ID parameter
      await Promise.all(taskValidationRules.idParam.map((validation) => validation.run(req)));
      await validate(req, res, () => {});

      const task = await Task.findById(req.params.id, req.user.id);

      if (!task) {
        return res.status(404).json({
          error: "Task not found",
          code: "TASK_NOT_FOUND",
        });
      }

      res.json({
        task,
      });
    } catch (error) {
      console.error("Get task error:", error);
      res.status(500).json({
        error: "Failed to fetch task",
        code: "TASK_FETCH_FAILED",
      });
    }
  }

  // Create new task
  static async createTask(req, res) {
    try {
      // Validate request body
      await Promise.all(taskValidationRules.create.map((validation) => validation.run(req)));
      await validate(req, res, () => {});

      const taskData = {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        priority: req.body.priority,
        due_date: req.body.due_date,
        start_time: req.body.start_time,
      };

      const task = await Task.create(req.user.id, taskData);

      res.status(201).json({
        message: "Task created successfully",
        task,
      });
    } catch (error) {
      console.error("Create task error:", error);

      // Handle time conflict error specifically
      if (error.message === "A task already exists at this date and time") {
        return res.status(409).json({
          error: error.message,
          code: "TIME_CONFLICT",
        });
      }

      res.status(500).json({
        error: "Failed to create task",
        code: "TASK_CREATE_FAILED",
      });
    }
  }

  // Update task
  static async updateTask(req, res) {
    try {
      // Validate ID parameter
      await Promise.all(taskValidationRules.idParam.map((validation) => validation.run(req)));

      // Validate request body
      await Promise.all(taskValidationRules.update.map((validation) => validation.run(req)));
      await validate(req, res, () => {});

      const updates = {
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed,
        category: req.body.category,
        priority: req.body.priority,
        due_date: req.body.due_date,
        start_time: req.body.start_time,
      };

      // Remove undefined values
      Object.keys(updates).forEach((key) => {
        if (updates[key] === undefined) {
          delete updates[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: "No updates provided",
          code: "NO_UPDATES",
        });
      }

      const task = await Task.update(req.params.id, req.user.id, updates);

      if (!task) {
        return res.status(404).json({
          error: "Task not found",
          code: "TASK_NOT_FOUND",
        });
      }

      res.json({
        message: "Task updated successfully",
        task,
      });
    } catch (error) {
      console.error("Update task error:", error);

      // Handle time conflict error specifically
      if (error.message === "A task already exists at this date and time") {
        return res.status(409).json({
          error: error.message,
          code: "TIME_CONFLICT",
        });
      }

      res.status(500).json({
        error: "Failed to update task",
        code: "TASK_UPDATE_FAILED",
      });
    }
  }

  // Delete task
  static async deleteTask(req, res) {
    try {
      // Validate ID parameter
      await Promise.all(taskValidationRules.idParam.map((validation) => validation.run(req)));
      await validate(req, res, () => {});

      const task = await Task.delete(req.params.id, req.user.id);

      if (!task) {
        return res.status(404).json({
          error: "Task not found",
          code: "TASK_NOT_FOUND",
        });
      }

      res.json({
        message: "Task deleted successfully",
        task,
      });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(500).json({
        error: "Failed to delete task",
        code: "TASK_DELETE_FAILED",
      });
    }
  }

  // Toggle task completion
  static async toggleTaskComplete(req, res) {
    try {
      // Validate ID parameter
      await Promise.all(taskValidationRules.idParam.map((validation) => validation.run(req)));
      await validate(req, res, () => {});

      const task = await Task.toggleComplete(req.params.id, req.user.id);

      if (!task) {
        return res.status(404).json({
          error: "Task not found",
          code: "TASK_NOT_FOUND",
        });
      }

      res.json({
        message: task.completed ? "Task marked as completed" : "Task marked as incomplete",
        task,
      });
    } catch (error) {
      console.error("Toggle task error:", error);
      res.status(500).json({
        error: "Failed to toggle task",
        code: "TOGGLE_FAILED",
      });
    }
  }

  // Get task statistics
  static async getTaskStats(req, res) {
    try {
      const timeRange = req.query.timeRange || "all";
      const stats = await Task.getStats(req.user.id, timeRange);
      const byCategory = await Task.getByCategory(req.user.id, timeRange);
      const upcoming = await Task.getUpcoming(req.user.id);

      res.json({
        stats: {
          ...stats,
          completion_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
        },
        byCategory,
        upcoming,
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({
        error: "Failed to get task statistics",
        code: "STATS_FETCH_FAILED",
      });
    }
  }

  // Bulk operations
  static async bulkUpdate(req, res) {
    try {
      const { taskIds, updates } = req.body;

      if (!Array.isArray(taskIds) || taskIds.length === 0) {
        return res.status(400).json({
          error: "Task IDs array is required",
          code: "INVALID_TASK_IDS",
        });
      }

      if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).json({
          error: "Updates are required",
          code: "NO_UPDATES",
        });
      }

      const allowedUpdates = ["completed", "category", "priority"];
      const validUpdates = {};

      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          validUpdates[key] = updates[key];
        }
      });

      if (Object.keys(validUpdates).length === 0) {
        return res.status(400).json({
          error: "No valid updates provided",
          code: "INVALID_UPDATES",
        });
      }

      // Update tasks in parallel
      const updatePromises = taskIds.map((taskId) => Task.update(taskId, req.user.id, validUpdates));

      const results = await Promise.allSettled(updatePromises);

      const successful = results.filter((r) => r.status === "fulfilled" && r.value);
      const failed = results.filter((r) => r.status === "rejected" || !r.value);

      res.json({
        message: `Updated ${successful.length} tasks successfully`,
        updated: successful.length,
        failed: failed.length,
        tasks: successful.map((r) => r.value),
      });
    } catch (error) {
      console.error("Bulk update error:", error);
      res.status(500).json({
        error: "Failed to bulk update tasks",
        code: "BULK_UPDATE_FAILED",
      });
    }
  }

  // Search tasks
  static async searchTasks(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          error: "Search query must be at least 2 characters",
          code: "INVALID_QUERY",
        });
      }

      const tasks = await Task.findAllByUser(req.user.id, {
        search: query.trim(),
      });

      res.json({
        tasks,
        count: tasks.length,
        query,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        error: "Search failed",
        code: "SEARCH_FAILED",
      });
    }
  }
}

module.exports = TaskController;
