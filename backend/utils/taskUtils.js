import { isBefore, parseISO, startOfDay } from "date-fns";

export const calculateOverdueTasks = (tasks) => {
  const today = startOfDay(new Date());

  return tasks.filter((task) => {
    // Hanya task yang belum selesai dan memiliki due date
    if (!task.due_date || task.completed) return false;

    const dueDate = startOfDay(parseISO(task.due_date));
    return isBefore(dueDate, today);
  });
};

export const getTaskStatistics = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter((t) => t.priority === 3).length;
  const overdue = calculateOverdueTasks(tasks).length;

  return {
    total,
    completed,
    pending,
    highPriority,
    overdue,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};
