const pool = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  // Create new user
  static async create(username, email, password) {
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);

    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;

    const values = [username, email, hashedPassword];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = "SELECT id, username, email, created_at FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Update user profile
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(id);

    const query = `
      UPDATE users 
      SET ${fields.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING id, username, email, created_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const query = "DELETE FROM users WHERE id = $1 RETURNING id";
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get user statistics
  static async getStats(userId) {
    const query = `
    SELECT
      COUNT(t.id) as total_tasks,
      COUNT(CASE WHEN t.completed = true THEN 1 END) as completed_tasks,
      u.created_at as member_since,
      MAX(t.created_at) as last_activity
    FROM users u
    LEFT JOIN tasks t ON u.id = t.user_id
    WHERE u.id = $1
    GROUP BY u.id
  `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  // Set reset token
  static async setResetToken(email, token, expires) {
    const query = `
      UPDATE users
      SET reset_token = $1, reset_token_expires = $2
      WHERE email = $3
      RETURNING id
    `;
    const result = await pool.query(query, [token, expires, email]);
    return result.rows[0];
  }

  // Find user by reset token
  static async findByResetToken(token) {
    const query = `
      SELECT * FROM users
      WHERE reset_token = $1 AND reset_token_expires > NOW()
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  // Clear reset token
  static async clearResetToken(id) {
    const query = `
      UPDATE users
      SET reset_token = NULL, reset_token_expires = NULL
      WHERE id = $1
    `;
    await pool.query(query, [id]);
  }

  // Update password
  static async updatePassword(id, hashedPassword) {
    const query = `
      UPDATE users
      SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL
      WHERE id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [hashedPassword, id]);
    return result.rows[0];
  }
}

module.exports = User;
