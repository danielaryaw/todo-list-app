import API from "./api";

export const taskAPI = {
  getAll: (params) => API.get("/tasks", { params }),

  getById: (id) => API.get(`/tasks/${id}`),

  create: (taskData) => API.post("/tasks", taskData),

  update: (id, taskData) => API.put(`/tasks/${id}`, taskData),

  delete: (id) => API.delete(`/tasks/${id}`),

  toggleComplete: (id) => API.patch(`/tasks/${id}/toggle`),

  getStats: (params = {}) => API.get("/tasks/stats", { params }),

  search: (query) => API.get("/tasks/search", { params: { query } }),

  bulkUpdate: (taskIds, updates) => API.post("/tasks/bulk", { taskIds, updates }),
};
