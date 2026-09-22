"use client";

import React, { useState, useEffect } from "react";
import { X, Calendar, AlertCircle, Save } from "lucide-react";
import EmployeeSelector from "./EmployeeSelector";
import TaskInput from "./TaskInput";
import FluidButton from "./FluidButton";
import EmployeeForm from "./EmployeeForm";
import ConfirmModal from "./ConfirmModal";
import { formatDateDisplay } from "@/lib/calendar";
import { useToast } from "@/hooks/useToast";

export default function AddTaskModal({
  isOpen,
  dateKey,
  onClose,
  employees = [],
  onSaveTasks,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onUpdateHeadPhone,
}) {
  const { success, error } = useToast();
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
  const [tasks, setTasks] = useState([""]);
  const [validationError, setValidationError] = useState("");

  // Sub-modals for team member management
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [targetHeadId, setTargetHeadId] = useState("head_harleen");
  const [deletingMember, setDeletingMember] = useState(null);

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedEmployeeIds([]);
      setTasks([""]);
      setValidationError("");
      setIsMemberFormOpen(false);
      setEditingMember(null);
      setDeletingMember(null);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedDate = formatDateDisplay(dateKey);

  // Open add member modal under specific head
  const handleOpenAddMember = (headId) => {
    setTargetHeadId(headId);
    setEditingMember(null);
    setIsMemberFormOpen(true);
  };

  // Open edit member modal
  const handleOpenEditMember = (member) => {
    setEditingMember(member);
    setTargetHeadId(member.headId || "head_harleen");
    setIsMemberFormOpen(true);
  };

  // Handle member form save
  const handleSaveMember = async (memberData) => {
    if (memberData.id) {
      if (onUpdateEmployee) await onUpdateEmployee(memberData.id, memberData);
    } else {
      if (onAddEmployee) {
        const newId = await onAddEmployee(memberData);
        // Automatically select newly created member only (not both head and member)
        if (newId) {
          setSelectedEmployeeIds([newId]);
        }
      }
    }
    setIsMemberFormOpen(false);
  };

  // Handle member delete confirmation
  const handleConfirmDeleteMember = async () => {
    if (!deletingMember?.id) return;
    const toDelete = deletingMember;
    setDeletingMember(null);
    setSelectedEmployeeIds((prev) => prev.filter((id) => id !== toDelete.id));
    success(`Member "${toDelete.name}" removed`);

    try {
      if (onDeleteEmployee) {
        await onDeleteEmployee(toDelete.id);
      }
    } catch (err) {
      error(err.message || "Failed to delete member");
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setValidationError("");

    if (selectedEmployeeIds.length === 0) {
      const msg = "Please select Harleen, Namika, or at least one team member";
      setValidationError(msg);
      error(msg);
      return;
    }

    const validTasks = tasks.map((t) => t.trim()).filter((t) => t.length > 0);
    if (validTasks.length === 0) {
      const msg = "Please enter at least one task or note";
      setValidationError(msg);
      error(msg);
      return;
    }

    const selectedEmployees = employees
      .filter((e) => selectedEmployeeIds.includes(e.id))
      .map((e) => ({
        ...e,
        headName:
          e.headName ||
          (e.headId === "head_harleen"
            ? "Harleen"
            : e.headId === "head_namika"
            ? "Namika"
            : null),
      }));

    // Close modal and show success feedback immediately (0ms latency)
    onClose();
    success(
      `Assigned ${validTasks.length} ${
        validTasks.length === 1 ? "task" : "tasks"
      } to ${selectedEmployees.length} ${
        selectedEmployees.length === 1 ? "person" : "people"
      } successfully!`
    );

    // Save in background with optimistic UI reflection
    try {
      await onSaveTasks({
        dateKey,
        selectedEmployees,
        tasksList: validTasks,
      });
    } catch (err) {
      console.error("Save tasks background error:", err);
      error(err.message || "Failed to sync tasks to Firebase");
    }
  };

  const selectedCount = selectedEmployeeIds.length;
  const selectedPeople = employees.filter((e) =>
    selectedEmployeeIds.includes(e.id)
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div
          className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-black leading-tight">
                  Add Task — {formattedDate}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  Select Team Head or Team Member to create and assign tasks
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body with internal scrolling */}
          <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 bg-white">
            {validationError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {validationError}
              </div>
            )}

            {/* Employee Hierarchy Selection */}
            <EmployeeSelector
              employees={employees}
              selectedEmployeeIds={selectedEmployeeIds}
              onSelectionChange={setSelectedEmployeeIds}
              onOpenAddMember={handleOpenAddMember}
              onEditMember={handleOpenEditMember}
              onDeleteMember={setDeletingMember}
              onUpdateHeadPhone={onUpdateHeadPhone}
            />

            {/* CONDITIONAL TASK INPUT: Only shows after selecting Team Head or Member */}
            {selectedCount > 0 ? (
              <div className="space-y-3.5 pt-2 border-t border-slate-200 animate-fade-in">
                {/* Active Assignee Banner */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50 border border-blue-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-blue-900">
                      Assigning tasks to ({selectedCount}):
                    </span>
                    {selectedPeople.map((person) => (
                      <span
                        key={person.id}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-blue-800 border border-blue-200 shadow-xs"
                      >
                        <span>
                          {person.name}
                          {person.headName ? ` (Team ${person.headName})` : person.isHead ? " (Head)" : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedEmployeeIds((prev) =>
                              prev.filter((id) => id !== person.id)
                            )
                          }
                          className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full w-3.5 h-3.5 flex items-center justify-center transition-colors text-xs font-extrabold"
                          title={`Unselect ${person.name}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Multiple Tasks Input */}
                <TaskInput tasks={tasks} onChange={setTasks} />
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center space-y-1">
                <p className="text-xs sm:text-sm font-bold text-slate-700">
                  👆 Select Team Head (Harleen / Namika) or a Team Member above
                </p>
                <p className="text-[11px] text-slate-500">
                  Task inputs will appear immediately once you select at least one person.
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-white flex items-center justify-end gap-2.5 sm:gap-3">
            <FluidButton
              variant="secondary"
              onClick={onClose}
              className="flex-1 sm:flex-initial text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 font-bold text-xs sm:text-sm"
            >
              Cancel
            </FluidButton>

            <FluidButton
              variant="primary"
              icon={Save}
              onClick={handleSave}
              disabled={selectedCount === 0}
              className="flex-1 sm:flex-initial font-bold text-xs sm:text-sm"
            >
              Save Tasks ({selectedCount})
            </FluidButton>
          </div>
        </div>
      </div>

      {/* Sub-modal: Add/Edit Team Member */}
      <EmployeeForm
        isOpen={isMemberFormOpen}
        employee={editingMember}
        initialHeadId={targetHeadId}
        onClose={() => setIsMemberFormOpen(false)}
        onSave={handleSaveMember}
      />

      {/* Sub-modal: Delete Member Confirm */}
      <ConfirmModal
        isOpen={!!deletingMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${deletingMember?.name}?`}
        confirmText="Remove Member"
        confirmVariant="danger"
        onConfirm={handleConfirmDeleteMember}
        onClose={() => setDeletingMember(null)}
      />
    </>
  );
}

