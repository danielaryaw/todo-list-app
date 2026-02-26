const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function setupDatabase() {
  const connectionConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  };

  console.log("🔧 Setting up database...");

  // First, connect without database to create it
  const client = new Client(connectionConfig);

  try {
    await client.connect();
    console.log("✅ Connected to PostgreSQL server");

    // Create database if not exists
    try {
      await client.query("CREATE DATABASE todo_app");
      console.log("✅ Created database todo_app");
    } catch (err) {
      if (err.code === "42P04") {
        // database already exists
        console.log("⚠️  Database todo_app already exists");
      } else {
        throw err;
      }
    }

    await client.end();

    // Now connect to the new database
    const dbClient = new Client({
      ...connectionConfig,
      database: "todo_app",
    });

    await dbClient.connect();
    console.log("✅ Connected to todo_app database");

    // Create tables
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created users table");

    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        category VARCHAR(50) DEFAULT 'general',
        priority INTEGER DEFAULT 2,
        due_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Created tasks table");

    // Create demo user
    const hashedPassword = await bcrypt.hash("password", 10);
    const demoUser = await dbClient.query(
      `INSERT INTO users (username, email, password_hash) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ["demo", "demo@example.com", hashedPassword],
    );

    if (demoUser.rows.length > 0) {
      const userId = demoUser.rows[0].id;
      console.log("👤 Created demo user");

      // Insert sample tasks
      const tasks = [
        ["Complete portfolio project", "Finish todo list app", "work", 3],
        ["Buy groceries", "Milk, eggs, bread", "shopping", 2],
        ["Call family", "Weekly catch up", "personal", 1],
      ];

      for (const [title, description, category, priority] of tasks) {
        await dbClient.query(
          `INSERT INTO tasks (user_id, title, description, category, priority)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, title, description, category, priority],
        );
      }
      console.log("📝 Inserted sample tasks");
    }

    console.log("\n🎉 Database setup completed!");
    console.log("\n📋 Login with:");
    console.log("   Email: demo@example.com");
    console.log("   Password: password");
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
}

setupDatabase();
