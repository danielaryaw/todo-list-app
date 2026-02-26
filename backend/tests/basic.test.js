const request = require("supertest");
const app = require("../server");
const pool = require("../config/database");

describe("Todo List API", () => {
  let authToken;
  let userId;
  let taskId;

  beforeAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM tasks");
    await pool.query("DELETE FROM users WHERE email LIKE $1", ["%test%"]);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("Authentication", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "Test123!",
        confirmPassword: "Test123!",
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user.email).toBe("test@example.com");

      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it("should login existing user", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "Test123!",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
    });
  });

  describe("Tasks", () => {
    it("should create a new task", async () => {
      const response = await request(app).post("/api/tasks").set("Authorization", `Bearer ${authToken}`).send({
        title: "Test Task",
        description: "Test Description",
        category: "work",
        priority: 2,
      });

      expect(response.status).toBe(201);
      expect(response.body.task).toHaveProperty("id");
      expect(response.body.task.title).toBe("Test Task");

      taskId = response.body.task.id;
    });

    it("should get all tasks", async () => {
      const response = await request(app).get("/api/tasks").set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tasks).toBeInstanceOf(Array);
      expect(response.body.tasks.length).toBeGreaterThan(0);
    });

    it("should get a single task", async () => {
      const response = await request(app).get(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.task.id).toBe(taskId);
    });

    it("should update a task", async () => {
      const response = await request(app).put(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${authToken}`).send({
        title: "Updated Task",
        completed: true,
      });

      expect(response.status).toBe(200);
      expect(response.body.task.title).toBe("Updated Task");
      expect(response.body.task.completed).toBe(true);
    });

    it("should delete a task", async () => {
      const response = await request(app).delete(`/api/tasks/${taskId}`).set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe("Health Check", () => {
    it("should return health status", async () => {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(200);
      expect(response.body.status).toBe("healthy");
    });
  });
});
