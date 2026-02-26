import React, { useState, useEffect, useCallback, useRef } from "react";
import TaskItem from "./TaskItem";
import { taskAPI } from "../services/tasks";
import LoadingSpinner from "./LoadingSpinner";
import { FiFilter, FiSearch, FiGrid, FiList } from "react-icons/fi";

const TaskList = ({ tasks: initialTasks, onTaskUpdated, onTaskDeleted, onTaskEdit }) => {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    completed: "",
    category: "",
    priority: "",
    search: "",
    sortBy: "due_date",
    sortOrder: "asc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'grid'
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    setTasks(initialTasks || []);
  }, [initialTasks]);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getAll(filters);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const sortTasks = (tasksToSort) => {
    return [...tasksToSort].sort((a, b) => {
      const now = new Date();

      // First sort by overdue status (overdue tasks first)
      const aOverdue = a.due_date && new Date(a.due_date) < now && !a.completed;
      const bOverdue = b.due_date && new Date(b.due_date) < now && !b.completed;

      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1;
      }

      // Then sort by due_date
      const aDate = a.due_date ? new Date(a.due_date) : new Date("9999-12-31");
      const bDate = b.due_date ? new Date(b.due_date) : new Date("9999-12-31");

      if (filters.sortOrder === "asc") {
        return aDate - bDate;
      } else {
        return bDate - aDate;
      }

      // Finally sort by completion status (pending first)
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      return 0;
    });
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prevTasks) => {
      const newTasks = prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
      return sortTasks(newTasks);
    });
    onTaskUpdated(updatedTask);
  };

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchInput(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      handleFilterChange("search", value);
    }, 300);
  }, []);

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({
      completed: "",
      category: "",
      priority: "",
      search: "",
      sortBy: "due_date",
      sortOrder: "asc",
    });
  };

  const getFilterCount = () => {
    let count = 0;
    if (filters.completed !== "") count++;
    if (filters.category) count++;
    if (filters.priority) count++;
    if (filters.search) count++;
    return count;
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filters {getFilterCount() > 0 && `(${getFilterCount()})`}</h3>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button onClick={() => setViewMode("list")} className={`px-3 py-1 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-gray-700 shadow" : "text-gray-600 dark:text-gray-400"}`}>
                <FiList className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode("grid")} className={`px-3 py-1 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-gray-700 shadow" : "text-gray-600 dark:text-gray-400"}`}>
                <FiGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input ref={searchInputRef} type="text" defaultValue={filters.search} onChange={handleSearch} placeholder="Search tasks..." className="input pl-10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Status</label>
              <select value={filters.completed} onChange={(e) => handleFilterChange("completed", e.target.value)} className="input">
                <option value="">All</option>
                <option value="false">Pending</option>
                <option value="true">Completed</option>
              </select>
            </div>

            <div>
              <label className="label">Category</label>
              <select value={filters.category} onChange={(e) => handleFilterChange("category", e.target.value)} className="input">
                <option value="">All Categories</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
                <option value="general">General</option>
              </select>
            </div>

            <div>
              <label className="label">Priority</label>
              <select value={filters.priority} onChange={(e) => handleFilterChange("priority", e.target.value)} className="input">
                <option value="">All Priorities</option>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
              </select>
            </div>

            <div>
              <label className="label">Sort by Time</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  handleFilterChange("sortBy", sortBy);
                  handleFilterChange("sortOrder", sortOrder);
                }}
                className="input"
              >
                <option value="due_date-desc">Oldest</option>
                <option value="due_date-asc">Newest</option>
              </select>
            </div>
          </div>

          {getFilterCount() > 0 && (
            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {tasks.length} task{tasks.length !== 1 ? "s" : ""} found
              </span>
              <button onClick={handleClearFilters} className="text-sm text-primary-600 hover:text-primary-700">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <FiFilter className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-600 dark:text-gray-400">{filters.search || filters.category || filters.priority || filters.completed !== "" ? "Try changing your filters" : "Create your first task to get started"}</p>
        </div>
      ) : (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} onTaskUpdated={handleTaskUpdated} onTaskDeleted={onTaskDeleted} onTaskEdit={onTaskEdit} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;
