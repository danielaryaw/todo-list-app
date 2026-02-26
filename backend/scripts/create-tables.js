const pool = require("../config/database");
const bcrypt = require("bcryptjs");

async function createTables() {
  const client = await pool.connect();

  try {
    console.log("🚀 Starting database migration...");

    // Drop tables if exists (untuk development)
    await client.query("DROP TABLE IF EXISTS tasks CASCADE");
    await client.query("DROP TABLE IF EXISTS users CASCADE");
    console.log("🗑️  Dropped existing tables (if any)");

    // Create users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created users table");

    // Create tasks table dengan updated_at
    await client.query(`
      CREATE TABLE tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        category VARCHAR(50) DEFAULT 'general',
        priority INTEGER CHECK (priority BETWEEN 1 AND 3) DEFAULT 2,
        due_date DATE,
        start_time TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created tasks table with updated_at");

    // Create function to update updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Create trigger for tasks
    await client.query(`
      CREATE TRIGGER update_tasks_updated_at
      BEFORE UPDATE ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);

    // Create trigger for users
    await client.query(`
      CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `);
    console.log("✅ Created triggers for updated_at");

    // Create indexes for performance
    await client.query("CREATE INDEX idx_tasks_user_id ON tasks(user_id)");
    await client.query("CREATE INDEX idx_tasks_completed ON tasks(completed)");
    await client.query("CREATE INDEX idx_tasks_category ON tasks(category)");
    await client.query("CREATE INDEX idx_tasks_priority ON tasks(priority)");
    console.log("✅ Created indexes");

    // Insert demo user
    const hashedPassword = await bcrypt.hash("password", 10);
    const demoUser = await client.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id`,
      ["demo", "demo@example.com", hashedPassword],
    );
    const userId = demoUser.rows[0].id;
    console.log("👤 Created demo user");

    // Insert sample tasks
    const sampleTasks = [
      ["Complete portfolio project", "Finish the todo list application for portfolio", "work", 3, "2024-03-15"],
      ["Buy groceries", "Milk, eggs, bread, fruits", "shopping", 2, "2024-03-10"],
      ["Call mom", "Wish her happy birthday", "personal", 1, "2024-03-08"],
      ["Study algorithms", "Prepare for technical interview questions", "education", 3, "2024-03-20"],
      ["Exercise", "30 minutes of cardio and weight training", "health", 2, "2024-03-09"],
    ];

    for (const [title, description, category, priority, due_date] of sampleTasks) {
      await client.query(
        `INSERT INTO tasks (user_id, title, description, category, priority, due_date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, title, description, category, priority, due_date],
      );
    }

    console.log("📝 Inserted sample tasks");
    console.log("\n🎉 Database migration completed successfully!");
    console.log("\n📋 DEMO CREDENTIALS:");
    console.log("   Email: demo@example.com");
    console.log("   Password: password");
  } catch (error) {
    console.error("❌ Error during migration:", error.message);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

createTables();
