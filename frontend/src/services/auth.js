import API from "./api";

export const authAPI = {
  login: (email, password) => API.post("/auth/login", { email, password }),

  register: (username, email, password, confirmPassword) => API.post("/auth/register", { username, email, password, confirmPassword }),

  getProfile: () => API.get("/auth/profile"),

  updateProfile: (updates) => API.put("/auth/profile", updates),

  logout: () => API.post("/auth/logout"),

  refreshToken: () => API.post("/auth/refresh"),

  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),

  resetPassword: (token, password) => API.post("/auth/reset-password", { token, password }),
};
