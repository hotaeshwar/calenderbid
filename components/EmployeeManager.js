"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Briefcase,
  Loader2,
} from "lucide-react";
import FluidButton from "./FluidButton";
import EmployeeForm from "./EmployeeForm";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "@/hooks/useToast";

export default function EmployeeManager({
  isOpen,
  onClose,
  employees = [],
  loading = false,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) {
  const { success, error } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setSearchTerm("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (e) =>
        e.name?.toLowerCase().includes(term) ||
        e.role?.toLowerCase().includes(term) ||
        e.phone?.includes(term)
    );
  }, [employees, searchTerm]);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleSaveForm = async (data) => {
    if (data.id) {
      await onUpdateEmployee(data.id, data);
    } else {
      await onAddEmployee(data);
    }
  };

  // Instant deletion (0ms latency, modal closes right away)
  const handleConfirmDelete = () => {
    if (!deletingEmployee?.id) return;
    const empToDelete = deletingEmployee;
    
    // Close confirmation modal immediately
    setDeletingEmployee(null);
    success(`Employee "${empToDelete.name}" deleted`);

    // Perform optimistic deletion in background
    onDeleteEmployee(empToDelete.id).catch((err) => {
      console.error("Delete employee error:", err);
      error(err.message || "Failed to delete employee from Firebase");
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
        <div
          className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-black leading-tight">
                  Manage Employees
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                  {employees.length} Team Members Registered in BiD Directory
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

          {/* Search & Actions Bar */}
          <div className="p-3.5 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search team members by name, role, phone..."
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-black font-semibold placeholder-slate-400"
              />
            </div>

            <FluidButton
              variant="primary"
              icon={UserPlus}
              onClick={handleOpenAdd}
              className="w-full sm:w-auto shrink-0 font-bold text-xs sm:text-sm py-2 sm:py-2.5"
            >
              Add Employee
            </FluidButton>
          </div>

          {/* Employees List */}
          <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto flex-1 space-y-2.5 sm:space-y-3 bg-white">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-semibold">Loading employees...</span>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-6 sm:p-8 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                <h3 className="text-sm sm:text-base font-bold text-black">
                  {searchTerm
                    ? "No matching employees found"
                    : "No employees added yet"}
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {searchTerm
                    ? "Try adjusting your search query."
                    : "Add your team members to start assigning tasks and sharing via WhatsApp."}
                </p>
                {!searchTerm && (
                  <div className="mt-4">
                    <FluidButton
                      variant="primary"
                      icon={UserPlus}
                      onClick={handleOpenAdd}
                      className="font-bold text-xs sm:text-sm"
                    >
                      Add First Employee
                    </FluidButton>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee.id}
                    className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-2.5 sm:gap-3 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      {/* Avatar Initials */}
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm flex items-center justify-center border border-blue-200 shrink-0">
                        {employee.name
                          ? employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)
                          : "U"}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm md:text-base font-bold text-black truncate">
                          {employee.name}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] sm:text-xs text-slate-600 mt-0.5 font-medium">
                          {employee.role && (
                            <span className="flex items-center gap-1 text-slate-700 truncate">
                              <Briefcase className="w-3 h-3 text-slate-500 shrink-0" />
                              {employee.role}
                            </span>
                          )}
                          {employee.phone && (
                            <span className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-slate-600 shrink-0">
                              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                              {employee.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(employee)}
                        title="Edit employee"
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingEmployee(employee)}
                        title="Delete employee"
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-white flex items-center justify-end">
            <FluidButton variant="secondary" onClick={onClose} className="w-full sm:w-auto font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-xs sm:text-sm">
              Close
            </FluidButton>
          </div>
        </div>
      </div>

      {/* Employee Add / Edit Sub-Modal */}
      <EmployeeForm
        isOpen={isFormOpen}
        employee={editingEmployee}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveForm}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingEmployee}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deletingEmployee?.name}? This will remove them from the employee directory.`}
        confirmText="Delete Employee"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingEmployee(null)}
      />
    </>
  );
}
