import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Dashboard from "./components/Dashboard";
import AuthPage from "./pages/AuthPage";
import StatisticsPage from "./pages/StatisticsPage";
import LandingPage from "./pages/LandingPage";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { Tooltip } from "react-tooltip";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            <Routes>
              <Route path="/login" element={<AuthPage type="login" />} />
              <Route path="/register" element={<AuthPage type="register" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/statistics"
                element={
                  <PrivateRoute>
                    <StatisticsPage />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<LandingPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Tooltip id="tooltip" className="z-50" />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
