"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Briefcase,
  Phone,
  Check,
  Send,
  Crown,
  User,
} from "lucide-react";
import FluidButton from "./FluidButton";
import { formatDateDisplay } from "@/lib/calendar";
import {
  openWhatsAppChat,
  generateWhatsAppMessage,
  generateTeamWhatsAppMessage,
} from "@/lib/whatsapp";
import { useToast } from "@/hooks/useToast";

export default function DateDetailsModal({
  isOpen,
  dateKey,
  onClose,
  assignments = [],
  onOpenAddTask,
  onToggleTaskComplete,
  onUpdateTaskText,
  onAddTaskToAssignment,
  onDeleteTask,
  onDeleteAssignment,
}) {
  const { success, error } = useToast();
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskText, setEditingTaskText] = useState("");
  const [newTaskTexts, setNewTaskTexts] = useState({}); // { [assignmentId]: string }
  const [addingTaskForId, setAddingTaskForId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setEditingTaskId(null);
      setNewTaskTexts({});
      setAddingTaskForId(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedDate = formatDateDisplay(dateKey);

  // Group assignments by Team Head
  const harleenHeadAssignment = assignments.find(
    (a) => a.employeeId === "head_harleen" || a.employeeName === "Harleen"
  );
  const harleenMembers = assignments.filter(
    (a) =>
      a.employeeId !== "head_harleen" &&
      a.employeeName !== "Harleen" &&
      a.employeeId !== "head_namika" &&
      a.employeeName !== "Namika" &&
      (a.headId === "head_harleen" || (!a.headId && a.headName !== "Namika"))
  );
  const hasHarleenGroup = !!harleenHeadAssignment || harleenMembers.length > 0;

  const namikaHeadAssignment = assignments.find(
    (a) => a.employeeId === "head_namika" || a.employeeName === "Namika"
  );
  const namikaMembers = assignments.filter(
    (a) =>
      a.employeeId !== "head_harleen" &&
      a.employeeName !== "Harleen" &&
      a.employeeId !== "head_namika" &&
      a.employeeName !== "Namika" &&
      (a.headId === "head_namika" || a.headName === "Namika")
  );
  const hasNamikaGroup = !!namikaHeadAssignment || namikaMembers.length > 0;

  // Other standalone assignments if any
  const otherAssignments = assignments.filter(
    (a) =>
      a !== harleenHeadAssignment &&
      a !== namikaHeadAssignment &&
      !harleenMembers.includes(a) &&
      !namikaMembers.includes(a)
  );

  // Send WhatsApp for full Team (Head + members under that head)
  const handleTeamShare = (headName, headRole, headAssignment, members) => {
    try {
      const headPhone =
        headAssignment?.employeePhone ||
        (headName === "Harleen" ? "917008467714" : "");
      
      const message = generateTeamWhatsAppMessage({
        headName,
        headRole,
        dateKey,
        headTasks: headAssignment?.tasks || [],
        memberAssignments: members || [],
      });

      openWhatsAppChat(headPhone, message);
      success(`Opened WhatsApp chat for ${headName}`);
    } catch (err) {
      error(err.message || "Could not launch WhatsApp");
    }
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  const handleSaveEdit = async (assignmentId, taskId) => {
    if (!editingTaskText.trim()) {
      error("Task text cannot be empty");
      return;
    }
    const textToSave = editingTaskText;
    setEditingTaskId(null);
    setEditingTaskText("");
    success("Task updated");

    try {
      await onUpdateTaskText(assignmentId, taskId, textToSave);
    } catch (err) {
      error(err.message || "Failed to update task in database");
    }
  };

  const handleAddNewTaskToEmployee = async (assignmentId) => {
    const text = newTaskTexts[assignmentId]?.trim();
    if (!text) return;

    setNewTaskTexts((prev) => ({ ...prev, [assignmentId]: "" }));
    setAddingTaskForId(null);
    success("Added new task");

    try {
      await onAddTaskToAssignment(assignmentId, text);
    } catch (err) {
      error(err.message || "Failed to add task to database");
    }
  };

  // Instant deletion of entire assignment
  const handleDeleteAssignment = (assignment) => {
    if (
      window.confirm(
        `Delete all task entries for ${assignment.employeeName} on ${formattedDate}?`
      )
    ) {
      success(`Deleted ${assignment.employeeName}'s entries`);
      onDeleteAssignment(assignment.id).catch((err) => {
        console.error("Delete assignment error:", err);
        error(err.message || "Failed to remove assignment from database");
      });
    }
  };

  // Delete all assignments in a team group
  const handleDeleteTeam = (teamName, headAssignment, members) => {
    if (
      window.confirm(
        `Delete all tasks for ${teamName} Team on ${formattedDate}?`
      )
    ) {
      if (headAssignment) {
        onDeleteAssignment(headAssignment.id).catch(console.error);
      }
      members.forEach((m) => {
        onDeleteAssignment(m.id).catch(console.error);
      });
      success(`Deleted all ${teamName} Team entries`);
    }
  };

  // Delete all assignments on this date
  const handleDeleteAllForDate = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ALL tasks and entries for ${formattedDate}?`
      )
    ) {
      assignments.forEach((a) => {
        onDeleteAssignment(a.id).catch(console.error);
      });
      success(`Cleared all entries for ${formattedDate}`);
      onClose();
    }
  };

  // Instant single task deletion
  const handleDeleteSingleTask = (assignmentId, taskId) => {
    success("Task entry deleted");
    onDeleteTask(assignmentId, taskId).catch((err) => {
      console.error("Delete task error:", err);
      error(err.message || "Failed to delete task entry");
    });
  };

  const handleToggleTask = (assignmentId, taskId) => {
    onToggleTaskComplete(assignmentId, taskId).catch((err) => {
      console.error("Toggle task error:", err);
      error(err.message || "Failed to toggle task status");
    });
  };

  // Render a task list component for any assignee
  const renderTaskList = (assignment) => {
    const tasks = assignment?.tasks || [];

    return (
      <div className="space-y-2">
        {tasks.map((task, idx) => {
          const isEditing = editingTaskId === task.id;

          return (
            <div
              key={task.id || idx}
              className={`flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all ${
                task.completed
                  ? "bg-slate-50 border-slate-200"
                  : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
              }`}
            >
              {/* Complete Checkbox */}
              <button
                type="button"
                onClick={() => handleToggleTask(assignment.id, task.id)}
                className="mt-0.5 text-slate-400 hover:text-blue-600 transition-colors shrink-0 touch-manipulation"
                title={
                  task.completed ? "Mark as pending" : "Mark as completed"
                }
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 fill-emerald-50" />
                ) : (
                  <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300 hover:text-blue-500" />
                )}
              </button>

              {/* Task Text or Edit Input */}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingTaskText}
                      onChange={(e) => setEditingTaskText(e.target.value)}
                      rows={2}
                      className="w-full text-xs sm:text-sm p-2 bg-white border border-blue-500 rounded-lg focus:outline-none text-black font-semibold"
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <FluidButton
                        size="sm"
                        variant="primary"
                        icon={Check}
                        onClick={() => handleSaveEdit(assignment.id, task.id)}
                      >
                        Save
                      </FluidButton>
                      <FluidButton
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingTaskId(null)}
                      >
                        Cancel
                      </FluidButton>
                    </div>
                  </div>
                ) : (
                  <p
                    className={`text-xs sm:text-sm break-words whitespace-pre-wrap leading-relaxed ${
                      task.completed
                        ? "line-through text-slate-400"
                        : "text-black font-semibold"
                    }`}
                  >
                    {task.text}
                  </p>
                )}
              </div>

              {/* Task Row Actions: Edit & DELETE BUTTON */}
              {!isEditing && (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(task)}
                    title="Edit this task entry"
                    className="p-1 sm:p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteSingleTask(assignment.id, task.id)
                    }
                    title="Delete this task entry"
                    className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Inline Add Task Row */}
        {addingTaskForId === assignment.id ? (
          <div className="p-2.5 sm:p-3 bg-white rounded-xl border-2 border-blue-400 space-y-2">
            <textarea
              placeholder={`Add new task for ${assignment.employeeName}...`}
              value={newTaskTexts[assignment.id] || ""}
              onChange={(e) =>
                setNewTaskTexts((prev) => ({
                  ...prev,
                  [assignment.id]: e.target.value,
                }))
              }
              rows={2}
              className="w-full text-xs sm:text-sm p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-black font-semibold placeholder-slate-400"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <FluidButton
                size="sm"
                variant="primary"
                icon={Plus}
                onClick={() => handleAddNewTaskToEmployee(assignment.id)}
              >
                Add Task
              </FluidButton>
              <FluidButton
                size="sm"
                variant="secondary"
                onClick={() => setAddingTaskForId(null)}
              >
                Cancel
              </FluidButton>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingTaskForId(assignment.id)}
            className="w-full py-2 px-3 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl border border-dashed border-blue-300 flex items-center justify-center gap-1.5 transition-colors touch-manipulation"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="truncate">
              + Add another task for {assignment.employeeName}
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-black leading-tight">
                  {formattedDate}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  {assignments.length}{" "}
                  {assignments.length === 1 ? "Person" : "People"} Assigned
                </p>
              </div>
            </div>

            {/* Close button on mobile right header */}
            <button
              onClick={onClose}
              className="p-1.5 sm:hidden text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <FluidButton
              size="sm"
              variant="primary"
              icon={Plus}
              onClick={onOpenAddTask}
              className="flex-1 sm:flex-initial text-xs py-1.5 px-3 font-bold"
            >
              + Add More Tasks
            </FluidButton>

            <button
              onClick={onClose}
              className="hidden sm:inline-flex p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Grouped Team Cards */}
        <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-slate-50/50">
          {assignments.length === 0 ? (
            <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-200 text-center bg-white">
              <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mx-auto mb-2 opacity-50" />
              <h3 className="text-sm sm:text-base font-bold text-black">
                No tasks assigned for this date
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Assign tasks to Harleen, Namika, or team members.
              </p>
              <div className="mt-4">
                <FluidButton
                  variant="primary"
                  icon={Plus}
                  onClick={onOpenAddTask}
                  className="font-bold text-xs sm:text-sm"
                >
                  Assign Tasks Now
                </FluidButton>
              </div>
            </div>
          ) : (
            <>
              {/* HARLEEN TEAM BLOCK */}
              {hasHarleenGroup && (
                <div className="rounded-2xl border border-blue-200 bg-white shadow-xs overflow-hidden transition-all">
                  {/* Team Card Header */}
                  <div className="p-3 sm:p-4 bg-blue-50/70 border-b border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
                          <Crown className="w-4 h-4" />
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-black truncate">
                          Harleen
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                          TeamHead
                        </span>
                        {harleenMembers.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            +{harleenMembers.length} team members
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
                        {harleenHeadAssignment?.employeePhone && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-bold">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            {harleenHeadAssignment.employeePhone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Team WhatsApp Dispatch & Delete Team */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <FluidButton
                        size="sm"
                        variant="whatsapp"
                        icon={Send}
                        onClick={() =>
                          handleTeamShare(
                            "Harleen",
                            "TeamHead",
                            harleenHeadAssignment,
                            harleenMembers
                          )
                        }
                        title="Send team deliverables to Harleen via WhatsApp"
                        className="text-xs py-1.5 px-3 font-bold"
                      >
                        Send WhatsApp
                      </FluidButton>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteTeam(
                            "Harleen",
                            harleenHeadAssignment,
                            harleenMembers
                          )
                        }
                        title="Delete all Harleen team entries"
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  </div>

                  {/* Team Card Content: Harleen Direct Tasks + Members Under Harleen */}
                  <div className="p-3.5 sm:p-5 space-y-4 bg-white">
                    {/* 1. Harleen's Own Tasks */}
                    {harleenHeadAssignment && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-bold text-slate-900">
                              Harleen (TeamHead Deliverables)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAssignment(harleenHeadAssignment)
                            }
                            className="text-[10px] text-slate-400 hover:text-rose-600 font-medium"
                          >
                            Clear Harleen's Tasks
                          </button>
                        </div>
                        {renderTaskList(harleenHeadAssignment)}
                      </div>
                    )}

                    {/* 2. Team Members Under Harleen (Nested neatly under Harleen) */}
                    {harleenMembers.length > 0 && (
                      <div className="space-y-3.5 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          Team Members Under Harleen
                        </div>

                        {harleenMembers.map((memberAssignment) => (
                          <div
                            key={memberAssignment.id}
                            className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5"
                          >
                            {/* Member Sub-Header */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-black">
                                  {memberAssignment.employeeName}
                                </span>
                                {memberAssignment.employeeRole && (
                                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-blue-100/80 text-blue-800">
                                    {memberAssignment.employeeRole}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteAssignment(memberAssignment)
                                }
                                title={`Delete ${memberAssignment.employeeName}'s tasks`}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                            </div>

                            {/* Member Task List */}
                            {renderTaskList(memberAssignment)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NAMIKA TEAM BLOCK */}
              {hasNamikaGroup && (
                <div className="rounded-2xl border border-purple-200 bg-white shadow-xs overflow-hidden transition-all">
                  {/* Team Card Header */}
                  <div className="p-3 sm:p-4 bg-purple-50/70 border-b border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="p-1 rounded-lg bg-purple-100 text-purple-800">
                          <Crown className="w-4 h-4" />
                        </span>
                        <h4 className="text-sm sm:text-base font-extrabold text-black truncate">
                          Namika
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                          Hr and crmhead
                        </span>
                        {namikaMembers.length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            +{namikaMembers.length} team members
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-1 font-medium">
                        {namikaHeadAssignment?.employeePhone && (
                          <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-700 font-bold">
                            <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                            {namikaHeadAssignment.employeePhone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Team WhatsApp Dispatch & Delete Team */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <FluidButton
                        size="sm"
                        variant="whatsapp"
                        icon={Send}
                        onClick={() =>
                          handleTeamShare(
                            "Namika",
                            "Hr and crmhead",
                            namikaHeadAssignment,
                            namikaMembers
                          )
                        }
                        title="Send team deliverables to Namika via WhatsApp"
                        className="text-xs py-1.5 px-3 font-bold"
                      >
                        Send WhatsApp
                      </FluidButton>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteTeam(
                            "Namika",
                            namikaHeadAssignment,
                            namikaMembers
                          )
                        }
                        title="Delete all Namika team entries"
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </button>
                    </div>
                  </div>

                  {/* Team Card Content: Namika Direct Tasks + Members Under Namika */}
                  <div className="p-3.5 sm:p-5 space-y-4 bg-white">
                    {/* 1. Namika's Own Tasks */}
                    {namikaHeadAssignment && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-purple-500" />
                            <span className="text-xs font-bold text-slate-900">
                              Namika (HR & CRM Head Deliverables)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteAssignment(namikaHeadAssignment)
                            }
                            className="text-[10px] text-slate-400 hover:text-rose-600 font-medium"
                          >
                            Clear Namika's Tasks
                          </button>
                        </div>
                        {renderTaskList(namikaHeadAssignment)}
                      </div>
                    )}

                    {/* 2. Team Members Under Namika */}
                    {namikaMembers.length > 0 && (
                      <div className="space-y-3.5 pt-2 border-t border-slate-100">
                        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-500" />
                          Team Members Under Namika
                        </div>

                        {namikaMembers.map((memberAssignment) => (
                          <div
                            key={memberAssignment.id}
                            className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2.5"
                          >
                            {/* Member Sub-Header */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-black">
                                  {memberAssignment.employeeName}
                                </span>
                                {memberAssignment.employeeRole && (
                                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-purple-100/80 text-purple-800">
                                    {memberAssignment.employeeRole}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteAssignment(memberAssignment)
                                }
                                title={`Delete ${memberAssignment.employeeName}'s tasks`}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              </button>
                            </div>

                            {/* Member Task List */}
                            {renderTaskList(memberAssignment)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* OTHER STANDALONE ASSIGNMENTS (if any) */}
              {otherAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden"
                >
                  <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-black">
                      {assignment.employeeName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(assignment)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                  <div className="p-3 sm:p-4">{renderTaskList(assignment)}</div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Modal Footer with Delete All Option */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2">
          {assignments.length > 0 ? (
            <button
              type="button"
              onClick={handleDeleteAllForDate}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5 border border-rose-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All Entries for Date
            </button>
          ) : (
            <div />
          )}

          <FluidButton
            variant="secondary"
            onClick={onClose}
            className="font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs sm:text-sm"
          >
            Close
          </FluidButton>
        </div>
      </div>
    </div>
  );
}


