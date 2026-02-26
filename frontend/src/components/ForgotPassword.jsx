import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft, FiCheckCircle } from "react-icons/fi";
import { authAPI } from "../services/auth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authAPI.forgotPassword(email);
      setEmailSent(true);
      setMessage("Password reset instructions have been sent to your email.");
    } catch (error) {
      setError(error.response?.data?.error || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <FiCheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
          </div>

          <div className="mt-8">
            <Link
              to="/login"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
            <FiMail className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Forgot your password?</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Enter your email address and we'll send you a link to reset your password.</p>
        </div>

        <div className="mt-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="label">
                <FiMail className="inline mr-2" />
                Email address
              </label>
              <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" disabled={loading} />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 dark:bg-red-900 p-4">
                <div className="text-sm text-red-700 dark:text-red-200">{error}</div>
              </div>
            )}

            {message && (
              <div className="rounded-md bg-green-50 dark:bg-green-900 p-4">
                <div className="text-sm text-green-700 dark:text-green-200">{message}</div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="spinner w-4 h-4 mr-2"></div>
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500 flex items-center justify-center">
              <FiArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
