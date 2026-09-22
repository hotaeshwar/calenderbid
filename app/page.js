"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import Calendar from "@/components/Calendar";
import AddTaskModal from "@/components/AddTaskModal";
import DateDetailsModal from "@/components/DateDetailsModal";
import WhatsAppShareModal from "@/components/WhatsAppShareModal";
import { useEmployees } from "@/hooks/useEmployees";
import { useAssignments } from "@/hooks/useAssignments";
import { getTodayDateKey, parseDateKey } from "@/lib/calendar";

export default function HomePage() {
  const [todayKey, setTodayKey] = useState(getTodayDateKey());
  const [currentYear, setCurrentYear] = useState(() => {
    const parsed = parseDateKey(getTodayDateKey());
    return parsed ? parsed.year : new Date().getFullYear();
  });
  const [currentMonthIndex, setCurrentMonthIndex] = useState(() => {
    const parsed = parseDateKey(getTodayDateKey());
    return parsed ? parsed.monthIndex : new Date().getMonth();
  });

  // Modal states
  const [activeDateKey, setActiveDateKey] = useState(() => getTodayDateKey());
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isDateDetailsModalOpen, setIsDateDetailsModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppAssignments, setWhatsAppAssignments] = useState([]);

  // Client-side synchronization: Ensure today's date is accurately synced with device local clock
  useEffect(() => {
    const syncToday = () => {
      const freshToday = getTodayDateKey();
      setTodayKey((prev) => {
        if (prev !== freshToday) {
          return freshToday;
        }
        return prev;
      });
    };

    syncToday();

    // Check periodically so midnight transitions and waking tabs update accurately
    const interval = setInterval(syncToday, 30000);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        syncToday();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // Firestore hooks
  const {
    employees,
    addEmployee,
    updateEmployee,
    updateHeadPhone,
    deleteEmployee,
  } = useEmployees();

  const {
    assignments,
    assignmentsByDate,
    loading: loadingAssignments,
    saveAssignments,
    toggleTaskComplete,
    updateTaskText,
    addTaskToAssignment,
    deleteTaskFromAssignment,
    deleteAssignment,
  } = useAssignments();

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonthIndex((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonthIndex((m) => m + 1);
    }
  };

  const handleToday = () => {
    const freshToday = getTodayDateKey();
    const parsed = parseDateKey(freshToday);
    if (parsed) {
      setTodayKey(freshToday);
      setCurrentYear(parsed.year);
      setCurrentMonthIndex(parsed.monthIndex);
      setActiveDateKey(freshToday);
    }
  };

  // Date selection logic
  const handleSelectDate = (dateKey) => {
    setActiveDateKey(dateKey);
    const dateAssignments = assignmentsByDate[dateKey] || [];
    if (dateAssignments.length > 0) {
      setIsDateDetailsModalOpen(true);
    } else {
      setIsAddTaskModalOpen(true);
    }
  };

  // Open Add Tasks modal for specific date
  const handleOpenAddTaskFromDetails = () => {
    setIsDateDetailsModalOpen(false);
    setIsAddTaskModalOpen(true);
  };

  // Open WhatsApp share queue modal
  const handleOpenWhatsAppShare = (itemsToShare) => {
    const targetItems =
      itemsToShare || assignmentsByDate[activeDateKey] || [];
    setWhatsAppAssignments(targetItems);
    setIsWhatsAppModalOpen(true);
  };

  // Quick action from header
  const handleOpenQuickAdd = () => {
    const freshToday = getTodayDateKey();
    setActiveDateKey(freshToday);
    setIsAddTaskModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* Top Main Header */}
      <Header
        currentYear={currentYear}
        currentMonthIndex={currentMonthIndex}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        onOpenQuickAdd={handleOpenQuickAdd}
      />

      {/* Main Container: Focused Pure Calendar View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-5 md:py-6 bg-white">
        {/* Full Interactive Calendar Grid */}
        <Calendar
          year={currentYear}
          monthIndex={currentMonthIndex}
          todayKey={todayKey}
          assignmentsByDate={assignmentsByDate}
          onSelectDate={handleSelectDate}
          loading={loadingAssignments}
        />
      </main>

      {/* MODALS */}

      {/* 1. Add Task Modal with Head Hierarchy & WhatsApp Configuration */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        dateKey={activeDateKey}
        employees={employees}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSaveTasks={saveAssignments}
        onAddEmployee={addEmployee}
        onUpdateEmployee={updateEmployee}
        onDeleteEmployee={deleteEmployee}
        onUpdateHeadPhone={updateHeadPhone}
      />

      {/* 2. Date Details Modal */}
      <DateDetailsModal
        isOpen={isDateDetailsModalOpen}
        dateKey={activeDateKey}
        assignments={assignmentsByDate[activeDateKey] || []}
        onClose={() => setIsDateDetailsModalOpen(false)}
        onOpenAddTask={handleOpenAddTaskFromDetails}
        onOpenWhatsAppShare={handleOpenWhatsAppShare}
        onToggleTaskComplete={toggleTaskComplete}
        onUpdateTaskText={updateTaskText}
        onAddTaskToAssignment={addTaskToAssignment}
        onDeleteTask={deleteTaskFromAssignment}
        onDeleteAssignment={deleteAssignment}
      />

      {/* 3. WhatsApp Multi-Employee Sharing Queue Modal */}
      <WhatsAppShareModal
        isOpen={isWhatsAppModalOpen}
        dateKey={activeDateKey}
        assignments={whatsAppAssignments}
        onClose={() => setIsWhatsAppModalOpen(false)}
      />
    </div>
  );
}

