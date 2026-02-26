import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import TaskStats from "../components/TaskStats";
import Preload from "./Preloader";
import { taskAPI } from "../services/tasks";
import toast from "react-hot-toast";
import { FiPlus, FiMenu, FiLogOut, FiSun, FiMoon, FiBell, FiHome, FiBarChart2, FiSettings, FiChevronDown, FiFilter, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [statsRefresh, setStatsRefresh] = useState(0);

  // Ref untuk form modal
  const formModalRef = useRef(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  // untuk menutup sidebar ketika mengklik di luar sidebar pada desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Jika sidebar terbuka dan klik di luar sidebar, tutup sidebar
      if (sidebarOpen && !event.target.closest(".sidebar") && window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  // untuk menutup form ketika mengklik di luar form
  useEffect(() => {
    const handleClickOutsideForm = (event) => {
      if ((showTaskForm || editingTask) && formModalRef.current && !formModalRef.current.contains(event.target)) {
        handleCloseForm();
      }
    };

    // untuk menutup form dengan tombol ESC
    const handleEscapeKey = (event) => {
      if (event.key === "Escape" && (showTaskForm || editingTask)) {
        handleCloseForm();
      }
    };

    if (showTaskForm || editingTask) {
      document.addEventListener("mousedown", handleClickOutsideForm);
      document.addEventListener("keydown", handleEscapeKey);
      // Mencegah scroll body saat form terbuka
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutsideForm);
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [showTaskForm, editingTask]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getAll();
      setTasks(response.data.tasks);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAdded = (task) => {
    if (task) {
      if (editingTask) {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      } else {
        setTasks((prev) => [task, ...prev]);
      }
    }
    handleCloseForm();
  };

  const handleTaskUpdated = (task) => {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    setStatsRefresh((prev) => prev + 1);
  };

  const handleTaskDeleted = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Fungsi untuk menutup form
  const handleCloseForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleExportTasks = async () => {
    try {
      const response = await taskAPI.getAll({ limit: 1000 });
      const tasksData = response.data.tasks;

      const headers = ["Title", "Description", "Category", "Priority", "Status", "Due Date", "Created"];
      const csvRows = [
        headers.join(","),
        ...tasksData.map((task) => [`"${task.title}"`, `"${task.description || ""}"`, task.category, task.priority, task.completed ? "Completed" : "Pending", task.due_date || "", new Date(task.created_at).toLocaleDateString()].join(",")),
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `tasks-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Tasks exported successfully");
    } catch (error) {
      toast.error("Failed to export tasks");
    }
  };

  const getUserInitials = () => {
    if (!user?.username) return "U";
    return user.username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <Preload />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-x-hidden">
      {/* Overlay untuk mobile dan desktop */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:bg-opacity-30" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-200 ease-in-out sidebar ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Sidebar header */}
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">{getUserInitials()}</span>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username || "User"}</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{tasks.filter((t) => !t.completed).length} pending tasks</p>
              </div>
            </div>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <a href="#" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg bg-primary-50 dark:bg-primary-900/20">
              <FiHome className="w-5 h-5 mr-3" />
              Dashboard
            </a>
            <Link to="/statistics" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <FiBarChart2 className="w-5 h-5 mr-3" />
              Statistics
            </Link>
            <a href="#settings" className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <FiSettings className="w-5 h-5 mr-3" />
              Settings
            </a>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t dark:border-gray-700 space-y-4">
            <button onClick={toggleDarkMode} className="flex items-center w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              {darkMode ? <FiSun className="w-5 h-5 mr-3" /> : <FiMoon className="w-5 h-5 mr-3" />}
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>

            <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center w-full px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
              <FiLogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? "md:ml-64" : "md:ml-0"}`}>
        {/* Top navigation - Responsive */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <div className="flex items-center">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiMenu className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <h1 className="ml-3 text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">Task Dashboard</h1>
              </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                {/* Dark mode toggle - hidden on mobile, show on md */}
                <button onClick={toggleDarkMode} className="hidden md:flex p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>

                {/* Filter button for mobile */}
                <button onClick={() => setShowFilters(!showFilters)} className="md:hidden p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiFilter className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button className="p-1.5 md:p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                    <FiBell className="w-5 h-5" />
                  </button>
                  <span className="absolute top-0.5 right-0.5 md:top-1 md:right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>

                {/* User profile */}
                <div className="relative">
                  <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center space-x-1 md:space-x-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="relative">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow">
                        <span className="text-white font-bold text-xs md:text-sm">{getUserInitials()}</span>
                      </div>
                      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full border border-white dark:border-gray-800"></span>
                    </div>

                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{user?.username || "User"}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{user?.email || ""}</p>
                    </div>

                    <FiChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
                  </button>

                  {/* Dropdown menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20" onClick={(e) => e.stopPropagation()}>
                      <div className="p-3 border-b dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowLogoutConfirm(true);
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="py-4 md:py-6">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8">
            {/* Welcome section */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.username}!</h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">You have {tasks.filter((t) => !t.completed).length} pending tasks</p>
            </div>

            {/* Mobile filters section */}
            {/* {showFilters && (
              <div className="mb-4 md:hidden">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Filters</h3>
                  <input type="text" placeholder="Search tasks..." className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg mb-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Status</option>
                      <option>Completed</option>
                      <option>Pending</option>
                    </select>
                    <select className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Priorities</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>
            )} */}

            {/* Task Form Modal */}
            {(showTaskForm || editingTask) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 md:p-4">
                <div ref={formModalRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="relative">
                    {/* Close button di pojok kanan atas */}
                    <button
                      onClick={handleCloseForm}
                      className="absolute right-4 top-4 z-10 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                      aria-label="Close form"
                    >
                      <FiX className="w-5 h-5" />
                    </button>

                    <div className="p-4 md:p-6 pt-12">
                      <TaskForm onTaskAdded={handleTaskAdded} initialData={editingTask} onClose={handleCloseForm} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left column - Task list */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Tasks ({tasks.length})</h3>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleExportTasks} className="flex-1 sm:flex-none px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                      Export CSV
                    </button>
                    <button
                      onClick={() => {
                        setEditingTask(null);
                        setShowTaskForm(true);
                      }}
                      className="flex-1 sm:flex-none px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                    >
                      <FiPlus className="w-4 h-4 mr-1" />
                      Add Task
                    </button>
                  </div>
                </div>

                {/* Filters for desktop */}
                {/* <div className="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <div className="flex flex-wrap gap-4 items-center">
                    <input type="text" placeholder="Search tasks..." className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                    <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Status</option>
                      <option>Completed</option>
                      <option>Pending</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Categories</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                      <option>All Priorities</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div> */}

                <TaskList tasks={tasks} onTaskUpdated={handleTaskUpdated} onTaskDeleted={handleTaskDeleted} onTaskEdit={handleEditTask} />
              </div>

              {/* Right column - Stats */}
              <div className="space-y-4 md:space-y-6">
                <div className="sticky top-4">
                  <TaskStats refresh={statsRefresh} />

                  {/* Quick Stats */}
                  <div className="card mt-4 md:mt-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Quick Stats</h3>
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">Today's Tasks</span>
                        <span className="font-semibold">{tasks.filter((t) => !t.completed && t.due_date && new Date(t.due_date).toDateString() === new Date().toDateString()).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">This Week</span>
                        <span className="font-semibold">
                          {
                            tasks.filter((t) => {
                              if (t.completed || !t.due_date) return false;
                              const taskDate = new Date(t.due_date);
                              const now = new Date();
                              const startOfWeek = new Date(now);
                              startOfWeek.setDate(now.getDate() - now.getDay() + 1);
                              startOfWeek.setHours(0, 0, 0, 0);
                              const endOfWeek = new Date(startOfWeek);
                              endOfWeek.setDate(startOfWeek.getDate() + 5);
                              endOfWeek.setHours(23, 59, 59, 999);
                              return taskDate >= startOfWeek && taskDate <= endOfWeek;
                            }).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm md:text-base text-gray-600 dark:text-gray-400">High Priority</span>
                        <span className="font-semibold text-red-600">{tasks.filter((t) => t.priority === 3).length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Productivity Tips */}
                  <div className="card mt-4 md:mt-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">💡 Productivity Tip</h3>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-3 md:mb-4">Break large tasks into smaller, manageable steps. This makes progress feel more achievable and helps maintain momentum.</p>
                    <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Tip #{Math.floor(Math.random() * 10) + 1} of 10</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <FiLogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Are you sure to logout?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">You will be redirected to the login page.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowLogoutConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showUserDropdown && <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)} />}
    </div>
  );
};

export default Dashboard;
