# Todo List Application

This repository contains a full-stack **Todo List** project built with modern tools and best practices.

## 🛠️ Technology Stack

### Backend

- **Node.js** with **Express** server
- **PostgreSQL** (or SQLite depending on configuration) via `pg` module
- Architecture organized into controllers, models, routes, and middleware
- JWT-based authentication
- Input validation and reusable utilities

### Frontend

- **React** powered by **Vite** for fast development
- Components structured into pages & reusable pieces
- Context API for authentication and theme management
- Tailwind CSS for styling

## 📁 Project Structure

```
backend/         # API server code and database scripts
frontend/        # React application with Vite setup
```

## 🚀 Features

- User registration and login
- Secure JWT authentication
- Create, read, update, delete tasks
- Task filtering and statistics
- Responsive UI with dark/light theme support

## 📦 Setup Instructions

> 🔐 **Security note:** Do **not** push `.env` files or any secrets to GitHub. Use the `backend/.env.example` (and similar) as a template and keep real credentials private. The project’s `.gitignore` already excludes `.env` files, logs, and other sensitive data.

### Prerequisites

- Node.js (14+)
- npm or yarn
- PostgreSQL (if using production DB)

### Backend

1. Copy `.env.example` to `.env` and fill in your database connection and JWT secret.
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Initialize database:
   ```bash
   node scripts/setup-database.js
   ```
4. Start the server:
   ```bash
   npm start
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Production build:
   ```bash
   npm run build
   ```

## 🧪 Testing

- Backend tests are located under `backend/tests` (Jest).
- Run with:
  ```bash
  cd backend
  npm test
  ```

## 📄 Additional Notes

- Use `scripts/create-tables.js` and `scripts/setup-database.js` for local DB seeding.
- Customize Tailwind config in `frontend/tailwind.config.js`.

## 📧 Contact & Contributions

Feel free to open issues or submit pull requests. This project is open for learning and enhancement!

---

Made with ❤️ by Me.
