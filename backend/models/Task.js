const pool = require("../config/database");

class Task {
  // Check for time conflicts
  static async checkTimeConflict(userId, due_date, start_time, excludeTaskId = null) {
    if (!due_date || !start_time) {
      return false; // No conflict if no date/time specified
    }

    let query = `
      SELECT id FROM tasks
      WHERE user_id = $1
        AND completed = false
        AND due_date = $2
        AND start_time = $3
    `;
    const values = [userId, due_date, start_time];

    if (excludeTaskId) {
      query += ` AND id != $4`;
      values.push(excludeTaskId);
    }

    const result = await pool.query(query, values);
    return result.rows.length > 0;
  }

  // Create new task
  static async create(userId, taskData) {
    const { title, description, category, priority, due_date, start_time } = taskData;

    // Check for time conflicts
    const hasConflict = await this.checkTimeConflict(userId, due_date, start_time);
    if (hasConflict) {
      throw new Error("A task already exists at this date and time");
    }

    const query = `
      INSERT INTO tasks (user_id, title, description, category, priority, due_date, start_time)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [userId, title, description || null, category || "general", priority || 2, due_date || null, start_time || null];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find task by ID and user ID
  static async findById(id, userId) {
    const query = "SELECT * FROM tasks WHERE id = $1 AND user_id = $2";
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  // Get all tasks for a user with filters
  static async findAllByUser(userId, filters = {}) {
    let query = "SELECT * FROM tasks WHERE user_id = $1";
    const values = [userId];
    let paramIndex = 2;

    // Apply filters - Hanya tambahkan jika nilai tidak undefined dan tidak string kosong
    if (filters.completed !== undefined && filters.completed !== "") {
      query += ` AND completed = $${paramIndex}`;
      values.push(filters.completed === "true" || filters.completed === true);
      paramIndex++;
    }

    if (filters.category && filters.category !== "") {
      query += ` AND category = $${paramIndex}`;
      values.push(filters.category);
      paramIndex++;
    }

    if (filters.priority && filters.priority !== "") {
      query += ` AND priority = $${paramIndex}`;
      values.push(parseInt(filters.priority));
      paramIndex++;
    }

    if (filters.search && filters.search !== "") {
      query += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      values.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Apply sorting - overdue tasks first, then by due_date regardless of completion status
    const sortField = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder === "asc" ? "ASC" : "DESC";
    if (sortField === "due_date") {
      query += ` ORDER BY
        CASE WHEN due_date < CURRENT_DATE AND completed = false THEN 0 ELSE 1 END ASC,
        due_date ${sortOrder} NULLS LAST,
        start_time ${sortOrder} NULLS LAST,
        completed ASC`;
    } else {
      query += ` ORDER BY
        CASE WHEN due_date < CURRENT_DATE AND completed = false THEN 0 ELSE 1 END ASC,
        ${sortField} ${sortOrder},
        completed ASC`;
    }

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Update task
  static async update(id, userId, updates) {
    const allowedUpdates = ["title", "description", "completed", "category", "priority", "due_date", "start_time"];
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedUpdates.includes(key) && value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to update");
    }

    // Check for time conflicts if updating date or time
    if (updates.due_date !== undefined || updates.start_time !== undefined) {
      const newDueDate = updates.due_date !== undefined ? updates.due_date : null;
      const newStartTime = updates.start_time !== undefined ? updates.start_time : null;

      // Get current task to check if date/time is actually changing
      const currentTask = await this.findById(id, userId);
      if (currentTask) {
        const actualDueDate = newDueDate !== null ? newDueDate : currentTask.due_date;
        const actualStartTime = newStartTime !== null ? newStartTime : currentTask.start_time;

        const hasConflict = await this.checkTimeConflict(userId, actualDueDate, actualStartTime, id);
        if (hasConflict) {
          throw new Error("A task already exists at this date and time");
        }
      }
    }

    values.push(id, userId);

    const query = `
      UPDATE tasks
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete task
  static async delete(id, userId) {
    const query = "DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *";
    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  // Toggle task completion
  static async toggleComplete(id, userId) {
    const query = `
      UPDATE tasks 
      SET completed = NOT completed 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [id, userId]);
    return result.rows[0];
  }

  // Get task statistics
  static async getStats(userId, timeRange = "all") {
    let dateFilter = "";

    if (timeRange === "week") {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (timeRange === "month") {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (timeRange === "year") {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '365 days'";
    }
    // For 'all', no date filter

    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed,
        COUNT(CASE WHEN completed = false THEN 1 END) as pending,
        COUNT(CASE WHEN priority = 1 THEN 1 END) as low_priority,
        COUNT(CASE WHEN priority = 2 THEN 1 END) as medium_priority,
        COUNT(CASE WHEN priority = 3 THEN 1 END) as high_priority,
        COUNT(CASE WHEN due_date < CURRENT_DATE AND completed = false THEN 1 END) as overdue,
        COUNT(DISTINCT category) as categories_count
      FROM tasks
      WHERE user_id = $1 ${dateFilter}
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Get tasks by category
  static async getByCategory(userId, timeRange = "all") {
    let dateFilter = "";

    if (timeRange === "week") {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (timeRange === "month") {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
    } else if (timeRange === "year") {
      dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '365 days'";
    }
    // For 'all', no date filter

    const query = `
      SELECT
        category,
        COUNT(*) as total,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed
      FROM tasks
      WHERE user_id = $1 ${dateFilter}
      GROUP BY category
      ORDER BY total DESC
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  // Get upcoming tasks
  static async getUpcoming(userId, days = 7) {
    const query = `
      SELECT * FROM tasks 
      WHERE user_id = $1 
        AND completed = false
        AND due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '${days} days'
      ORDER BY due_date ASC, priority DESC
      LIMIT 10
    `;

    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = Task;
