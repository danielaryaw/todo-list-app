import React, { useState } from "react";
import { taskAPI } from "../services/tasks";
import { format, isPast, parseISO } from "date-fns";
import toast from "react-hot-toast";
import { FiCheck, FiEdit, FiTrash2, FiCalendar, FiTag, FiAlertCircle, FiClock } from "react-icons/fi";

const TaskItem = ({ task, onTaskUpdated, onTaskDeleted, viewMode = "list", onTaskEdit }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return format(date, "h:mm a");
  };

  const handleToggleComplete = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.toggleComplete(task.id);
      onTaskUpdated(response.data.task);
      toast.success(`Task marked as ${response.data.task.completed ? "completed" : "incomplete"}`);
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setLoading(true);
    try {
      await taskAPI.delete(task.id);
      onTaskDeleted(task.id);
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleEdit = () => {
    if (onTaskEdit) {
      onTaskEdit(task);
    }
    setIsEditing(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1:
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      case 2:
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case 3:
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1:
        return "Low";
      case 2:
        return "Medium";
      case 3:
        return "High";
      default:
        return "Medium";
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      personal: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
      shopping: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
      health: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
      education: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
      general: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
    };
    return colors[category] || colors.general;
  };

  const isOverdue = task.due_date && isPast(parseISO(task.due_date)) && !task.completed;

  return (
    <>
      {viewMode === "grid" ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-4 h-full flex flex-col">
          {/* Task header - lebih kompak */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <button
                onClick={handleToggleComplete}
                disabled={loading}
                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center transition-colors ${
                  task.completed ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600" : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400"
                }`}
              >
                {task.completed && <FiCheck className="w-3 h-3 text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <h3 className={`font-medium text-sm md:text-base truncate ${task.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}>{task.title}</h3>
              </div>
            </div>
          </div>

          {/* Task description - dengan max height */}
          {task.description && <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">{task.description}</p>}

          {/* Task meta - lebih kompak */}
          <div className="space-y-3 mt-auto">
            <div className="flex flex-wrap gap-1.5">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                <FiTag className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{task.category}</span>
              </span>

              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                <FiAlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{getPriorityText(task.priority)}</span>
              </span>
            </div>

            {task.due_date && (
              <div className={`flex items-center text-xs ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                <FiCalendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                <span className="truncate">
                  {format(parseISO(task.due_date), "MMM d, yyyy")}
                  {isOverdue && <span className="ml-1.5 font-medium">(Overdue)</span>}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                <FiClock className="w-3 h-3 mr-1" />
                <span>
                  {/* {task.due_date ? format(parseISO(task.due_date), "MMM d, yyyy") : ""} */}
                  {task.start_time ? ` ${formatTime(task.start_time)}  ` : ""}
                </span>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                <button onClick={handleEdit} className="text-gray-600 hover:text-primary-600 transition-colors p-1" data-tooltip-id="tooltip" data-tooltip-content="Edit">
                  <FiEdit className="w-4 h-4" />
                </button>

                <button onClick={handleDelete} className="text-gray-600 hover:text-red-600 transition-colors p-1" data-tooltip-id="tooltip" data-tooltip-content="Delete">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button
                onClick={handleToggleComplete}
                disabled={loading}
                className={`flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  task.completed ? "bg-green-500 border-green-500 dark:bg-green-600 dark:border-green-600" : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400"
                }`}
              >
                {task.completed && <FiCheck className="w-3 h-3 text-white" />}
              </button>

              <div className="flex-1 min-w-0">
                <h3 className={`font-medium truncate ${task.completed ? "line-through text-gray-500" : "text-gray-900 dark:text-white"}`}>{task.title}</h3>
                {task.description && <p className="text-gray-600 dark:text-gray-400 text-sm truncate">{task.description}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-3">
              <div className="hidden md:flex items-center space-x-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                  <FiTag className="w-3 h-3 mr-1" />
                  {task.category}
                </span>

                {task.due_date && (
                  <div className={`flex items-center text-xs ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                    <FiCalendar className="w-3.5 h-3.5 mr-1" />
                    {format(parseISO(task.due_date), "MMM d")}
                    {task.start_time ? ` - ${formatTime(task.start_time)} ` : ""}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-4">
              <button onClick={handleEdit} className="text-gray-600 hover:text-primary-600 transition-colors p-2" data-tooltip-id="tooltip" data-tooltip-content="Edit">
                <FiEdit className="w-4 h-4" />
              </button>

              <button onClick={handleDelete} className="text-gray-600 hover:text-red-600 transition-colors p-2" data-tooltip-id="tooltip" data-tooltip-content="Delete">
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile view meta */}
          <div className="md:hidden flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
              <FiTag className="w-3 h-3 mr-1" />
              {task.category}
            </span>

            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              <FiAlertCircle className="w-3 h-3 mr-1" />
              {getPriorityText(task.priority)}
            </span>

            {task.due_date && (
              <div className={`flex items-center text-xs ${isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}>
                <FiCalendar className="w-3.5 h-3.5 mr-1" />
                {format(parseISO(task.due_date), "MMM d, yyyy")}
                {isOverdue && <span className="ml-1 font-medium">(Overdue)</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">Delete Task</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">Are you sure you want to delete "{task.title}"? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button onClick={cancelDelete} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmDelete} disabled={loading} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50">
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskItem;
