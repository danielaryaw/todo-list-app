import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { taskAPI } from "../services/tasks";
import toast from "react-hot-toast";
import { FiBarChart2, FiTrendingUp, FiClock, FiTarget, FiAward, FiDownload, FiHome, FiSettings, FiLogOut, FiSun, FiMoon, FiMenu, FiCheckCircle, FiAlertTriangle, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";
import { Line, Doughnut, Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, PieController } from "chart.js";
import { format, subDays, eachDayOfInterval } from "date-fns";
import Papa from "papaparse";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Preload from "../components/Preloader";

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

const StatisticsPage = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [detailedStats, setDetailedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [productivityData, setProductivityData] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);

  useEffect(() => {
    fetchDetailedStats();
  }, [timeRange]);

  const fetchDetailedStats = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getStats({ timeRange });
      setDetailedStats(response.data);
      generateProductivityData(response.data);
    } catch (error) {
      console.error("Failed to load detailed statistics:", error);
      toast.error("Failed to load detailed statistics");
      generateProductivityData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateProductivityData = (stats) => {
    const endDate = new Date();
    const startDate = subDays(endDate, 29);
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    const productivityResults = dates.map((date, index) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOfWeek = date.getDay();

      let baseMultiplier = 1;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        baseMultiplier = 1.5;
      } else if (dayOfWeek === 1) {
        baseMultiplier = 0.8;
      }

      const avgCompletedPerDay = stats?.stats?.completed ? Math.max(1, Math.round(stats.stats.completed / 30)) : 2;
      const avgTotalPerDay = stats?.stats?.total ? Math.max(1, Math.round(stats.stats.total / 30)) : 3;

      const completed = Math.max(0, Math.round(avgCompletedPerDay * baseMultiplier * (0.5 + Math.random())));
      const total = Math.max(completed, Math.round(avgTotalPerDay * baseMultiplier * (0.7 + Math.random() * 0.6)));

      return {
        date: dateStr,
        completed: completed,
        total: total,
      };
    });

    setProductivityData(productivityResults);
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

  const exportStats = async (format = "json") => {
    try {
      const currentDate = new Date();
      const dateStr = currentDate.toISOString().split("T")[0];
      const timeStr = currentDate.toLocaleTimeString();

      if (format === "json") {
        const statsData = {
          metadata: {
            reportType: "Task Statistics Report",
            user: user.username,
            timeRange: timeRange,
            generatedAt: currentDate.toISOString(),
            generatedDate: dateStr,
            generatedTime: timeStr,
            appVersion: "1.0.0",
          },
          summary: {
            totalTasks: detailedStats?.stats?.total || 0,
            completedTasks: detailedStats?.stats?.completed || 0,
            pendingTasks: detailedStats?.stats?.pending || 0,
            overdueTasks: detailedStats?.stats?.overdue || 0,
            completionRate: detailedStats?.stats?.total > 0 ? Math.round((detailedStats.stats.completed / detailedStats.stats.total) * 100) : 0,
            currentStreak: streaks.current,
            longestStreak: streaks.longest,
            avgTasksPerDay: productivityData ? (productivityData.reduce((sum, d) => sum + d.total, 0) / productivityData.length).toFixed(1) : 0,
            bestDay: productivityData ? Math.max(...productivityData.map((d) => d.total)) : 0,
            activeCategories: detailedStats?.byCategory?.length || 0,
          },
          detailedData: {
            statistics: detailedStats,
            productivityData: productivityData,
            streaks: streaks,
          },
        };

        const blob = new Blob([JSON.stringify(statsData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `task-statistics-detailed-${timeRange}-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "csv") {
        const csvData = [
          ["Task Statistics Report - " + timeRange.toUpperCase()],
          ["Generated on", dateStr + " " + timeStr],
          ["User", user.username],
          [""],
          ["SUMMARY METRICS"],
          ["Metric", "Value", "Description"],
          ["Total Tasks", detailedStats?.stats?.total || 0, "Total number of tasks created"],
          ["Completed Tasks", detailedStats?.stats?.completed || 0, "Tasks marked as completed"],
          ["Pending Tasks", detailedStats?.stats?.pending || 0, "Tasks still in progress"],
          ["Overdue Tasks", detailedStats?.stats?.overdue || 0, "Tasks past their due date"],
          ["Completion Rate", detailedStats?.stats?.total > 0 ? Math.round((detailedStats.stats.completed / detailedStats.stats.total) * 100) + "%" : "0%", "Percentage of tasks completed"],
          ["Current Streak", streaks.current, "Current consecutive days with completed tasks"],
          ["Longest Streak", streaks.longest, "Longest consecutive days with completed tasks"],
          ["Average Tasks/Day", productivityData ? (productivityData.reduce((sum, d) => sum + d.total, 0) / productivityData.length).toFixed(1) : 0, "Average tasks created per day"],
          ["Best Day", productivityData ? Math.max(...productivityData.map((d) => d.total)) : 0, "Highest number of tasks in a single day"],
          ["Active Categories", detailedStats?.byCategory?.length || 0, "Number of categories with tasks"],
          [""],
          ["PRIORITY DISTRIBUTION"],
          ["Priority Level", "Count"],
          ["Low Priority", detailedStats?.stats?.low_priority || 0],
          ["Medium Priority", detailedStats?.stats?.medium_priority || 0],
          ["High Priority", detailedStats?.stats?.high_priority || 0],
        ];

        // Add category breakdown if available
        if (detailedStats?.byCategory && detailedStats.byCategory.length > 0) {
          csvData.push([""]);
          csvData.push(["TASKS BY CATEGORY"]);
          csvData.push(["Category", "Total Tasks", "Completed", "Completion Rate"]);

          detailedStats.byCategory.forEach((cat) => {
            const rate = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;
            csvData.push([cat.category, cat.total, cat.completed, rate + "%"]);
          });
        }

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `task-statistics-report-${timeRange}-${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === "pdf") {
        const pdf = new jsPDF("portrait", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 20;
        let yPos = margin;

        // === HEADER WITH PROFESSIONAL DESIGN ===
        // Main header background
        pdf.setFillColor(59, 130, 246);
        pdf.rect(0, 0, pageWidth, 50, "F");

        // App logo/icon
        try {
          // Load and add the icon image
          const iconResponse = await fetch("/icons/icon128.png");
          const iconBlob = await iconResponse.blob();
          const iconDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(iconBlob);
          });
          pdf.addImage(iconDataUrl, "PNG", 20, 11, 20, 25);
        } catch (error) {
          // Fallback to text logo if image fails to load
          pdf.setFillColor(255, 255, 255);
          pdf.rect(20, 10, 20, 20, "F");
          pdf.setFontSize(12);
          pdf.setTextColor(59, 130, 246);
          pdf.setFont("helvetica", "bold");
        }

        // Report title (moved left to avoid metadata overlap)
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text("TASK STATISTICS REPORT", 42, 26);

        // Report subtitle (moved left to avoid metadata overlap)
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text("Comprehensive Performance Analysis", 42, 34);

        // Report metadata in header
        pdf.setFontSize(9);
        pdf.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - margin, 18, { align: "right" });
        pdf.text(`Time Range: ${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}`, pageWidth - margin, 24, { align: "right" });
        pdf.text(`User: ${user.username}`, pageWidth - margin, 30, { align: "right" });
        pdf.text(`Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - margin, 36, { align: "right" });

        yPos = 70;

        // === EXECUTIVE SUMMARY SECTION ===
        pdf.setFillColor(243, 244, 246);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 25, "F");
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text("Executive Summary", margin + 10, yPos + 8);

        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.line(margin + 10, yPos + 10, margin + 60, yPos + 10);

        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99);
        pdf.setFont("helvetica", "normal");
        const summaryText = `This report provides a comprehensive analysis of task management performance for ${user.username}. It includes completion metrics, productivity trends, and priority distribution over the ${timeRange} period.`;
        pdf.text(summaryText, margin + 10, yPos + 16, { maxWidth: pageWidth - 2 * margin - 20 });

        yPos += 40;

        // === KEY METRICS CARDS ===
        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text("Key Performance Indicators", margin, yPos);
        yPos += 8;

        // Card dimensions
        const cardWidth = (pageWidth - 2 * margin - 15) / 4;
        const cardHeight = 35;

        const metricsCards = [
          {
            label: "Total Tasks",
            value: detailedStats?.stats?.total || 0,
            color: [59, 130, 246],
          },
          {
            label: "Completed",
            value: detailedStats?.stats?.completed || 0,
            color: [16, 185, 129],
          },
          {
            label: "Completion Rate",
            value: detailedStats?.stats?.total > 0 ? `${Math.round((detailedStats.stats.completed / detailedStats.stats.total) * 100)}%` : "0%",
            color: [139, 92, 246],
          },
          {
            label: "Productivity Score",
            value: calculateProductivityScore(),
            color: [245, 158, 11],
          },
        ];

        function calculateProductivityScore() {
          if (!detailedStats?.stats) return "0";
          const completionRate = detailedStats.stats.total > 0 ? (detailedStats.stats.completed / detailedStats.stats.total) * 100 : 0;
          const overduePenalty = detailedStats.stats.overdue > 0 ? Math.min(20, (detailedStats.stats.overdue / detailedStats.stats.total) * 100) : 0;
          const score = Math.max(0, Math.min(100, completionRate - overduePenalty + streaks.current * 2));
          return `${Math.round(score)}/100`;
        }

        metricsCards.forEach((card, index) => {
          const x = margin + index * (cardWidth + 5);

          // Card background
          pdf.setFillColor(255, 255, 255);
          pdf.setDrawColor(229, 231, 235);
          pdf.setLineWidth(0.2);
          pdf.rect(x, yPos, cardWidth, cardHeight, "S");

          // Top accent bar
          pdf.setFillColor(card.color[0], card.color[1], card.color[2]);
          pdf.rect(x, yPos, cardWidth, 4, "F");

          // Value
          pdf.setFontSize(16);
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(31, 41, 55);
          pdf.text(card.value.toString(), x + cardWidth / 2, yPos + 18, { align: "center" });

          // Label
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(75, 85, 99);
          pdf.text(card.label, x + 5, yPos + 28, { maxWidth: cardWidth - 10 });
        });

        yPos += cardHeight + 8;

        // === DETAILED STATISTICS TABLE ===
        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text("Detailed Statistics", margin, yPos);
        yPos += 8;

        // Table header
        pdf.setFillColor(59, 130, 246);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text("Metric", margin + 5, yPos + 5);
        pdf.text("Value", margin + 80, yPos + 5);
        pdf.text("Description", margin + 120, yPos + 5);

        yPos += 8;

        // Table data
        const tableData = [
          { metric: "Pending Tasks", value: detailedStats?.stats?.pending || 0, desc: "Tasks in progress" },
          { metric: "Overdue Tasks", value: detailedStats?.stats?.overdue || 0, desc: "Tasks past due date" },
          { metric: "Current Streak", value: `${streaks.current} days`, desc: "Consecutive active days" },
          { metric: "Longest Streak", value: `${streaks.longest} days`, desc: "Best consecutive days" },
          { metric: "Avg Tasks/Day", value: productivityData ? (productivityData.reduce((sum, d) => sum + d.total, 0) / productivityData.length).toFixed(1) : "0.0", desc: "Average daily task volume" },
          { metric: "Best Day", value: productivityData ? Math.max(...productivityData.map((d) => d.total)) : 0, desc: "Highest productivity day" },
          { metric: "Active Categories", value: detailedStats?.byCategory?.length || 0, desc: "Categories with tasks" },
        ];

        tableData.forEach((row, index) => {
          // Alternate row colors
          if (index % 2 === 0) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
          }

          pdf.setDrawColor(229, 231, 235);
          pdf.setLineWidth(0.1);
          pdf.line(margin, yPos + 8, pageWidth - margin, yPos + 8);

          pdf.setTextColor(31, 41, 55);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "normal");
          pdf.text(row.metric, margin + 5, yPos + 5);

          pdf.setFont("helvetica", "bold");
          pdf.text(row.value.toString(), margin + 80, yPos + 5);

          pdf.setFont("helvetica", "normal");
          pdf.text(row.desc, margin + 120, yPos + 5, { maxWidth: pageWidth - margin - 125 });

          yPos += 8;
        });

        yPos += 10;

        // === PRIORITY DISTRIBUTION ===
        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text("Priority Distribution", margin, yPos);
        yPos += 8;

        if (detailedStats?.stats) {
          const totalPriority = (detailedStats.stats.low_priority || 0) + (detailedStats.stats.medium_priority || 0) + (detailedStats.stats.high_priority || 0);

          const priorities = [
            {
              label: "High Priority",
              value: detailedStats.stats.high_priority || 0,
              color: [239, 68, 68],
              percentage: totalPriority > 0 ? Math.round((detailedStats.stats.high_priority / totalPriority) * 100) : 0,
            },
            {
              label: "Medium Priority",
              value: detailedStats.stats.medium_priority || 0,
              color: [245, 158, 11],
              percentage: totalPriority > 0 ? Math.round((detailedStats.stats.medium_priority / totalPriority) * 100) : 0,
            },
            {
              label: "Low Priority",
              value: detailedStats.stats.low_priority || 0,
              color: [16, 185, 129],
              percentage: totalPriority > 0 ? Math.round((detailedStats.stats.low_priority / totalPriority) * 100) : 0,
            },
          ];

          priorities.forEach((priority, index) => {
            const barWidth = 100;
            const fillWidth = totalPriority > 0 ? (priority.value / totalPriority) * barWidth : 0;

            // Priority label
            pdf.setFontSize(10);
            pdf.setTextColor(75, 85, 99);
            pdf.setFont("helvetica", "normal");
            pdf.text(priority.label, margin, yPos + 5);

            // Bar background
            pdf.setDrawColor(229, 231, 235);
            pdf.setLineWidth(0.5);
            pdf.rect(margin + 50, yPos, barWidth, 8, "S");

            // Bar fill
            pdf.setFillColor(priority.color[0], priority.color[1], priority.color[2]);
            pdf.rect(margin + 50, yPos, fillWidth, 8, "F");

            // Value and percentage
            pdf.setTextColor(31, 41, 55);
            pdf.setFont("helvetica", "bold");
            pdf.text(`${priority.value} tasks (${priority.percentage}%)`, margin + 155, yPos + 5);

            yPos += 12;
          });
        }

        yPos += 5;

        // === CATEGORY BREAKDOWN ===
        if (detailedStats?.byCategory && detailedStats.byCategory.length > 0) {
          // Check if we need a new page
          if (yPos > pageHeight - 60) {
            pdf.addPage();
            yPos = margin;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(31, 41, 55);
          pdf.setFont("helvetica", "bold");
          pdf.text("Category Performance", margin, yPos);
          yPos += 8;

          // Category table header
          pdf.setFillColor(59, 130, 246);
          pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          pdf.text("Category", margin + 5, yPos + 5);
          pdf.text("Total", margin + 45, yPos + 5);
          pdf.text("Completed", margin + 70, yPos + 5);
          pdf.text("Pending", margin + 95, yPos + 5);
          pdf.text("Rate", margin + 120, yPos + 5);

          yPos += 8;

          // Category data
          detailedStats.byCategory.slice(0, 8).forEach((cat, index) => {
            const pending = cat.total - cat.completed;
            const rate = cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0;

            // Alternate row colors
            if (index % 2 === 0) {
              pdf.setFillColor(249, 250, 251);
              pdf.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
            }

            pdf.setDrawColor(229, 231, 235);
            pdf.setLineWidth(0.1);
            pdf.line(margin, yPos + 8, pageWidth - margin, yPos + 8);

            pdf.setTextColor(31, 41, 55);
            pdf.setFontSize(9);
            pdf.setFont("helvetica", "normal");
            pdf.text(cat.category.length > 20 ? cat.category.substring(0, 20) + "..." : cat.category, margin + 5, yPos + 5);

            pdf.setFont("helvetica", "bold");
            pdf.text(cat.total.toString(), margin + 45, yPos + 5);
            pdf.text(cat.completed.toString(), margin + 70, yPos + 5);
            pdf.text(pending.toString(), margin + 95, yPos + 5);

            // Color code completion rate
            if (rate >= 80) {
              pdf.setTextColor(16, 185, 129);
            } else if (rate >= 50) {
              pdf.setTextColor(245, 158, 11);
            } else {
              pdf.setTextColor(239, 68, 68);
            }

            pdf.text(`${rate}%`, margin + 120, yPos + 5);

            yPos += 8;
          });

          if (detailedStats.byCategory.length > 8) {
            pdf.setTextColor(75, 85, 99);
            pdf.setFontSize(8);
            pdf.setFont("helvetica", "italic");
            pdf.text(`... and ${detailedStats.byCategory.length - 8} more categories`, margin, yPos + 5);
            yPos += 10;
          }
        }

        yPos += 10;

        // === PERFORMANCE INSIGHTS ===
        if (yPos > pageHeight - 80) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setFillColor(243, 244, 246);
        pdf.rect(margin, yPos, pageWidth - 2 * margin, 35, "F");

        pdf.setFontSize(14);
        pdf.setTextColor(31, 41, 55);
        pdf.setFont("helvetica", "bold");
        pdf.text("Performance Insights", margin + 10, yPos + 12);

        pdf.setDrawColor(59, 130, 246);
        pdf.setLineWidth(0.5);
        pdf.line(margin + 10, yPos + 14, margin + 70, yPos + 14);

        pdf.setFontSize(9);
        pdf.setTextColor(75, 85, 99);
        pdf.setFont("helvetica", "normal");

        const completionRate = detailedStats?.stats?.total > 0 ? Math.round((detailedStats.stats.completed / detailedStats.stats.total) * 100) : 0;

        let insightText = "";
        if (completionRate >= 80) {
          insightText = "Excellent performance! Your task completion rate indicates strong productivity and time management skills.";
        } else if (completionRate >= 60) {
          insightText = "Good performance. Consider focusing on pending tasks to improve your completion rate further.";
        } else if (completionRate >= 40) {
          insightText = "Moderate performance. Try prioritizing high-impact tasks and setting more realistic deadlines.";
        } else {
          insightText = "There's room for improvement. Consider breaking down larger tasks and using time blocking techniques.";
        }

        if (detailedStats?.stats?.overdue > 0) {
          insightText += ` Note: You have ${detailedStats.stats.overdue} overdue tasks. Addressing these should be a priority.`;
        }

        if (streaks.current >= 7) {
          insightText += ` Maintaining a ${streaks.current}-day streak is impressive! Keep up the consistency.`;
        }

        pdf.text(insightText, margin + 10, yPos + 22, { maxWidth: pageWidth - 2 * margin - 20 });

        yPos += 45;

        // === FOOTER ===
        pdf.setDrawColor(229, 231, 235);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

        pdf.setFontSize(8);
        pdf.setTextColor(156, 163, 175);
        pdf.setFont("helvetica", "normal");

        const footerLeft = `Confidential Report for ${user.username}`;
        const footerCenter = `© ${new Date().getFullYear()} Todo List App. All rights reserved.`;
        const footerRight = `${new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`;

        pdf.text(footerLeft, margin, pageHeight - 15);
        pdf.text(footerCenter, pageWidth / 2, pageHeight - 15, { align: "center" });
        pdf.text(footerRight, pageWidth - margin, pageHeight - 15, { align: "right" });
        pdf.save(`task-statistics-report-${timeRange}-${dateStr}.pdf`);
      } else if (format === "png") {
        // Create a comprehensive screenshot of the entire statistics page
        const statsContainer = document.querySelector(".min-h-screen");
        if (statsContainer) {
          // Temporarily modify styles for better screenshot
          const originalOverflow = statsContainer.style.overflow;
          statsContainer.style.overflow = "visible";

          const canvas = await html2canvas(statsContainer, {
            backgroundColor: darkMode ? "#1f2937" : "#ffffff",
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: statsContainer.scrollWidth,
            height: statsContainer.scrollHeight,
          });

          // Restore original styles
          statsContainer.style.overflow = originalOverflow;

          const url = canvas.toDataURL("image/png", 1.0);
          const a = document.createElement("a");
          a.href = url;
          a.download = `task-statistics-full-page-${timeRange}-${dateStr}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          toast.error("Unable to capture page screenshot");
          return;
        }
      }

      toast.success(`Statistics exported as ${format.toUpperCase()} successfully`);
      setShowExportDropdown(false);
    } catch (error) {
      console.error("Failed to export statistics:", error);
      toast.error("Failed to export statistics");
    }
  };

  const calculateStreaks = () => {
    if (!productivityData) return { current: 0, longest: 0 };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    for (let i = productivityData.length - 1; i >= 0; i--) {
      if (productivityData[i].completed > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
        if (i === productivityData.length - 1) {
          currentStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    return { current: currentStreak, longest: longestStreak };
  };

  const streaks = calculateStreaks();

  //Preloaders
  if (loading) {
    return <Preload />;
  }

  // Productivity line chart data
  const productivityChartData = {
    labels: productivityData?.map((d) => format(new Date(d.date), "MMM dd")) || [],
    datasets: [
      {
        label: "Tasks Completed",
        data: productivityData?.map((d) => d.completed) || [],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Tasks Created",
        data: productivityData?.map((d) => d.total) || [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Priority distribution
  const priorityData = detailedStats?.stats
    ? {
        labels: ["Low Priority", "Medium Priority", "High Priority"],
        datasets: [
          {
            data: [detailedStats.stats.low_priority || 0, detailedStats.stats.medium_priority || 0, detailedStats.stats.high_priority || 0],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
            borderWidth: 2,
            borderColor: "#ffffff",
          },
        ],
      }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-x-hidden">
      {/* Overlay untuk mobile dan desktop */}
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:bg-opacity-30" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">Statistics View</p>
              </div>
            </div>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <FiHome className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link to="/statistics" className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 rounded-lg bg-primary-50 dark:bg-primary-900/20" onClick={() => setSidebarOpen(false)}>
              <FiBarChart2 className="w-5 h-5 mr-3" />
              Statistics
            </Link>
            <button
              onClick={() => toast.info("Settings coming soon!")}
              className="flex items-center w-full px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiSettings className="w-5 h-5 mr-3" />
              Settings
            </button>
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
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 md:h-16">
              <div className="flex items-center">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  <FiMenu className="w-5 h-5 md:w-6 md:h-6" />
                </button>
                <h1 className="ml-3 text-lg md:text-xl font-semibold text-gray-900 dark:text-white truncate">Statistics</h1>
              </div>

              <div className="flex items-center space-x-2 md:space-x-4">
                <button onClick={toggleDarkMode} className="hidden md:flex p-2 rounded-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                  {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </button>

                <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                  <option value="all">All Time</option>
                </select>

                <div className="relative" ref={exportDropdownRef}>
                  <button onClick={() => setShowExportDropdown(!showExportDropdown)} className="px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center">
                    <FiDownload className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                    <FiChevronDown className="w-4 h-4 ml-1" />
                  </button>

                  {showExportDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="py-1">
                        <button onClick={() => exportStats("json")} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                          <FiDownload className="w-4 h-4 mr-2" />
                          Export as JSON
                        </button>
                        <button onClick={() => exportStats("csv")} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                          <FiDownload className="w-4 h-4 mr-2" />
                          Export as CSV
                        </button>
                        <button onClick={() => exportStats("pdf")} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                          <FiDownload className="w-4 h-4 mr-2" />
                          Export as PDF
                        </button>
                        <button onClick={() => exportStats("png")} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center">
                          <FiDownload className="w-4 h-4 mr-2" />
                          Export Charts as PNG
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Statistics Content */}
        <main className="py-4 md:py-6">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8">
            {/* Welcome section */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Statistics Overview</h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Track your productivity and task completion patterns</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <FiBarChart2 className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{detailedStats?.stats.total || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <FiCheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{detailedStats?.stats.completed || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <FiClock className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{detailedStats?.stats.pending || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 md:p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <FiAlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3 md:ml-4">
                    <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                    <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{detailedStats?.stats.overdue || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completion Rate & Streaks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Completion Rate</h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-primary-600">{detailedStats?.stats.total > 0 ? Math.round((detailedStats.stats.completed / detailedStats.stats.total) * 100) : 0}%</span>
                  <FiTarget className="w-8 h-8 text-primary-600" />
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${detailedStats?.stats.total > 0 ? (detailedStats.stats.completed / detailedStats.stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Streaks</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiAward className="w-5 h-5 text-yellow-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Current Streak</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{streaks.current}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FiTrendingUp className="w-5 h-5 text-blue-500 mr-2" />
                      <span className="text-gray-600 dark:text-gray-400">Longest Streak</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{streaks.longest}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Performance Metrics</h3>
                <div className="space-y-2 md:space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Avg Tasks/Day</span>
                    <span className="font-semibold text-sm md:text-base">{productivityData ? (productivityData.reduce((sum, d) => sum + d.total, 0) / productivityData.length).toFixed(1) : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Best Day</span>
                    <span className="font-semibold text-sm md:text-base">{productivityData ? Math.max(...productivityData.map((d) => d.total)) : 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Active Categories</span>
                    <span className="font-semibold text-sm md:text-base">{detailedStats?.byCategory?.length || 0}</span>
                  </div>
                </div>
                {/* Mini Productivity Trend Chart */}
                <div className="h-32">
                  {productivityData && productivityData.length > 0 ? (
                    <Line
                      data={{
                        labels: productivityData.slice(-7).map((d) => format(new Date(d.date), "dd")),
                        datasets: [
                          {
                            label: "Tasks",
                            data: productivityData.slice(-7).map((d) => d.total),
                            borderColor: "#3b82f6",
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            borderWidth: 2,
                            pointRadius: 3,
                            pointBackgroundColor: "#3b82f6",
                            tension: 0.4,
                            fill: true,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              stepSize: 1,
                              color: darkMode ? "#9ca3af" : "#6b7280",
                              font: {
                                size: 10,
                              },
                            },
                            grid: {
                              color: darkMode ? "#374151" : "#e5e7eb",
                            },
                          },
                          x: {
                            ticks: {
                              color: darkMode ? "#9ca3af" : "#6b7280",
                              font: {
                                size: 10,
                              },
                            },
                            grid: {
                              color: darkMode ? "#374151" : "#e5e7eb",
                            },
                          },
                        },
                        elements: {
                          point: {
                            hoverRadius: 5,
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-xs">No data available</div>
                  )}
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">7-Day Productivity Trend</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Upcoming Tasks</h3>
                <div className="space-y-3">
                  {detailedStats?.upcoming && detailedStats.upcoming.length > 0 ? (
                    detailedStats.upcoming.slice(0, 3).map((task, index) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${task.priority === 3 ? "bg-red-500" : task.priority === 2 ? "bg-yellow-500" : "bg-green-500"}`}></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">{task.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{task.due_date ? format(new Date(task.due_date), "MMM dd") : "No due date"}</p>
                          </div>
                        </div>
                        <FiClock className="w-4 h-4 text-gray-400" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <FiCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No upcoming tasks</p>
                    </div>
                  )}
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">Next 3 tasks to focus on</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3 md:mb-4">Task Status Overview</h3>
                <div className="h-48">
                  {detailedStats?.stats ? (
                    <Pie
                      data={{
                        labels: ["Completed", "Pending", "Overdue"],
                        datasets: [
                          {
                            data: [detailedStats.stats.completed || 0, detailedStats.stats.pending || 0, detailedStats.stats.overdue || 0],
                            backgroundColor: ["#22c55e", "#3b82f6", "#ef4444"],
                            borderWidth: 2,
                            borderColor: "#ffffff",
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              color: darkMode ? "#ffffff" : "#374151",
                              padding: 10,
                              usePointStyle: true,
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="statistics-charts grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productivity Trends</h3>
                <div className="h-48">
                  <Line
                    data={productivityChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            color: darkMode ? "#ffffff" : "#374151",
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: darkMode ? "#ffffff" : "#374151",
                          },
                        },
                        x: {
                          ticks: {
                            color: darkMode ? "#ffffff" : "#374151",
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
                <div className="h-48">
                  {priorityData ? (
                    <Doughnut
                      data={priorityData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: {
                              color: darkMode ? "#ffffff" : "#374151",
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks by Category */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tasks by Category</h3>
              <div className="h-48">
                {detailedStats?.byCategory && detailedStats.byCategory.length > 0 ? (
                  <Bar
                    data={{
                      labels: detailedStats.byCategory.map((cat) => cat.category),
                      datasets: [
                        {
                          label: "Total Tasks",
                          data: detailedStats.byCategory.map((cat) => cat.total),
                          backgroundColor: "#3b82f6",
                          borderColor: "#2563eb",
                          borderWidth: 1,
                        },
                        {
                          label: "Completed",
                          data: detailedStats.byCategory.map((cat) => cat.completed),
                          backgroundColor: "#10b981",
                          borderColor: "#059669",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                          labels: {
                            color: darkMode ? "#ffffff" : "#374151",
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            stepSize: 1,
                            color: darkMode ? "#ffffff" : "#374151",
                          },
                        },
                        x: {
                          ticks: {
                            color: darkMode ? "#ffffff" : "#374151",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No category data available</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Logout</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to logout?</p>
            <div className="flex space-x-4">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowLogoutConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsPage;
