// TaskForm.js
import React, { useState, useEffect } from "react";
import { taskAPI } from "../services/tasks";
import toast from "react-hot-toast";
import { FiCalendar, FiTag, FiAlertCircle, FiX, FiClock } from "react-icons/fi";

const TaskForm = ({ onTaskAdded, initialData = null, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    priority: 2,
    due_date: "",
    start_time: "",
  });

  // Initialize form with initialData when it changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "general",
        priority: initialData.priority || 2,
        due_date: initialData.due_date || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category: "general",
        priority: 2,
        due_date: "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (initialData) {
        // Update existing task
        response = await taskAPI.update(initialData.id, formData);
        toast.success("Task updated successfully!");
      } else {
        // Create new task
        response = await taskAPI.create(formData);
        toast.success("Task created successfully!");
      }

      if (onTaskAdded) {
        onTaskAdded(response.data.task);
      }

      // Reset form if creating new task
      if (!initialData) {
        setFormData({
          title: "",
          description: "",
          category: "general",
          priority: 2,
          due_date: "",
          start_time: "",
        });
      }
    } catch (error) {
      const message = error.response?.data?.error || "Failed to save task";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Fungsi untuk menangani klik tombol cancel
  const handleCancel = () => {
    // Jika form sedang loading, jangan biarkan cancel
    if (loading) return;

    // Jika form memiliki data, konfirmasi sebelum menutup
    if (formData.title.trim() || formData.description.trim()) {
      if (window.confirm("Are you sure you want to cancel? Your changes will not be saved.")) {
        handleClose();
      }
    } else {
      handleClose();
    }
  };

  return (
    <div className="relative">
      {/* Header dengan judul */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{initialData ? "Edit Task" : "Add New Task"}</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{initialData ? "Update your task details" : "Create a new task to manage"}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="label">
              Task Title *
            </label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Enter task title" className="input" required disabled={loading} autoFocus />
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Enter task description (optional)" rows="3" className="input resize-none" disabled={loading} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="category" className="label">
                <FiTag className="inline mr-1" />
                Category
              </label>
              <select id="category" name="category" value={formData.category} onChange={handleChange} className="input" disabled={loading}>
                <option value="general">General</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
                <option value="education">Education</option>
              </select>
            </div>

            <div>
              <label htmlFor="priority" className="label">
                <FiAlertCircle className="inline mr-1" />
                Priority
              </label>
              <select id="priority" name="priority" value={formData.priority} onChange={handleChange} className="input" disabled={loading}>
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="due_date" className="label">
                <FiCalendar className="inline mr-1" />
                Due Date
              </label>
              <input type="date" id="due_date" name="due_date" value={formData.due_date} onChange={handleChange} className="input" disabled={loading} />
            </div>
          </div>

          <div>
            <label htmlFor="start_time" className="label">
              <FiClock className="inline mr-1" />
              Start Time
            </label>
            <input type="time" id="start_time" name="start_time" value={formData.start_time} onChange={handleChange} className="input" disabled={loading} />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {initialData ? "Updating..." : "Creating..."}
              </span>
            ) : initialData ? (
              "Update Task"
            ) : (
              "Create Task"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
