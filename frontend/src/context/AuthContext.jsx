import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/auth";
import toast from "react-hot-toast";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await authAPI.getProfile();
          setUser(response.data.user);
        } catch (error) {
          console.error("Failed to load user:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);

      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);

      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, confirmPassword) => {
    try {
      setLoading(true);
      const response = await authAPI.register(username, email, password, confirmPassword);

      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);

      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const updateProfile = async (updates) => {
    try {
      const response = await authAPI.updateProfile(updates);
      setUser(response.data.user);
      toast.success("Profile updated successfully");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Update failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
      return { success: true };
    } catch (error) {
      console.error("Token refresh failed:", error);
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshToken,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
