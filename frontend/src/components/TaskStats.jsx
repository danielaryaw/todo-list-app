import React, { useState, useEffect } from "react";
import { taskAPI } from "../services/tasks";
import { format } from "date-fns";
import { FiCheckCircle, FiClock, FiAlertTriangle, FiCalendar, FiTrendingUp, FiBarChart2 } from "react-icons/fi";
import LoadingSpinner from "./LoadingSpinner";
import { Doughnut, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const TaskStats = ({ refresh }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, "h:mm a");
  };

  useEffect(() => {
    fetchStats();
  }, [timeRange, refresh]);

  const fetchStats = async () => {
    try {
      const response = await taskAPI.getStats({ timeRange });
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <FiBarChart2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load statistics</p>
        </div>
      </div>
    );
  }

  const completionRate = stats.stats.total > 0 ? Math.round((stats.stats.completed / stats.stats.total) * 100) : 0;

  const doughnutData = {
    labels: ["Completed", "Pending", "High Priority"],
    datasets: [
      {
        data: [stats.stats.completed, stats.stats.pending, stats.stats.high_priority],
        backgroundColor: [
          "#10b981", // green
          "#f59e0b", // yellow
          "#ef4444", // red
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const categoryData = {
    labels: stats.byCategory.map((cat) => cat.category),
    datasets: [
      {
        label: "Total Tasks",
        data: stats.byCategory.map((cat) => cat.total),
        backgroundColor: "#3b82f6",
        borderColor: "#2563eb",
        borderWidth: 1,
      },
      {
        label: "Completed",
        data: stats.byCategory.map((cat) => cat.completed),
        backgroundColor: "#10b981",
        borderColor: "#059669",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Tasks */}
      {stats.upcoming && stats.upcoming.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <FiCalendar className="inline mr-2" />
            Upcoming Tasks
          </h3>
          <div className="space-y-3">
            {stats.upcoming.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due {task.start_time ? `${formatTime(task.start_time)} - ` : ""} {new Date(task.due_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${task.priority === 1 ? "badge-success" : task.priority === 2 ? "badge-warning" : "badge-danger"}`}>Priority {task.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Task Statistics</h3>
          <div className="flex items-center space-x-2">
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="input text-sm py-1">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4">
            <div className="flex flex-col items-center text-center">
              <FiBarChart2 className="w-8 h-8 text-primary-600 mb-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex flex-col items-center text-center">
              <FiCheckCircle className="w-8 h-8 text-green-600 mb-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex flex-col items-center text-center">
              <FiClock className="w-8 h-8 text-yellow-600 mb-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex flex-col items-center text-center">
              <FiAlertTriangle className="w-8 h-8 text-red-600 mb-2" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.stats.overdue || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white">Completion Rate</h4>
            <span className="text-2xl font-bold text-primary-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Task Distribution</h4>
            <div className="h-64">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">Tasks by Category</h4>
            <div className="h-64">
              <Bar
                data={categoryData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                      labels: {
                        color: () => (document.documentElement.classList.contains("dark") ? "rgb(255, 255, 255)" : "rgb(31, 41, 55)"),
                        usePointStyle: true,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskStats;
