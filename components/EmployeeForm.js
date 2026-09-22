"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  UserCheck,
  Briefcase,
  User,
  AlertCircle,
  Save,
  Crown,
} from "lucide-react";
import FluidButton from "./FluidButton";
import { useToast } from "@/hooks/useToast";

export default function EmployeeForm({
  isOpen,
  employee = null, // if editing existing member
  initialHeadId = "head_harleen", // default head when adding new member
  onClose,
  onSave,
}) {
  const { success, error } = useToast();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [headId, setHeadId] = useState("head_harleen");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const isEdit = !!employee?.id;

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setName(employee.name || "");
        setRole(employee.role || "");
        setHeadId(employee.headId || "head_harleen");
      } else {
        setName("");
        setRole("");
        setHeadId(initialHeadId || "head_harleen");
      }
      setFormError("");
      setLoading(false);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, employee, initialHeadId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Member name is required");
      return;
    }

    const memberData = {
      id: employee?.id,
      name: name.trim(),
      role: role.trim() || "Team Member",
      headId: headId,
    };

    onClose();
    success(
      isEdit
        ? `Updated member "${name.trim()}"`
        : `Added "${name.trim()}" under ${
            headId === "head_harleen" ? "Harleen" : "Namika"
          }`
    );

    try {
      await onSave(memberData);
    } catch (err) {
      console.error("Member save background error:", err);
      error(err.message || "Failed to sync to database");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-0 overflow-hidden animate-slide-up sm:animate-scale-in max-h-[92vh] sm:max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              {isEdit ? (
                <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {isEdit ? "Edit Team Member" : "Add Team Member"}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {isEdit
                  ? "Update member details"
                  : "Assign member under Harleen or Namika"}
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

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 bg-white overflow-y-auto flex-1"
        >
          {formError && (
            <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Reporting Head Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-500" />
              Assign Under Head <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHeadId("head_harleen")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  headId === "head_harleen"
                    ? "border-blue-600 bg-blue-50/70 ring-1 ring-blue-600 font-bold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Harleen</div>
                <div className="text-[10px] text-blue-700 font-medium">
                  TeamHead
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHeadId("head_namika")}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  headId === "head_namika"
                    ? "border-purple-600 bg-purple-50/70 ring-1 ring-purple-600 font-bold"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Namika</div>
                <div className="text-[10px] text-purple-700 font-medium">
                  Hr & crmhead
                </div>
              </button>
            </div>
          </div>

          {/* Name Field */}
          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-500" />
              Member Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Role Field */}
          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-500" />
              Role / Designation
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Graphic Designer, Video Editor, CRM Executive"
              className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400 font-medium"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-2 sm:pt-3 flex items-center justify-end gap-2.5 sm:gap-3">
            <FluidButton
              variant="secondary"
              onClick={onClose}
              disabled={loading}
              className="flex-1 sm:flex-initial text-xs sm:text-sm py-2 px-3"
            >
              Cancel
            </FluidButton>

            <FluidButton
              type="submit"
              variant="primary"
              icon={isEdit ? Save : UserPlus}
              loading={loading}
              disabled={loading}
              className="flex-1 sm:flex-initial text-xs sm:text-sm py-2 px-3 font-bold"
            >
              {isEdit ? "Update Member" : "Add Member"}
            </FluidButton>
          </div>
        </form>
      </div>
    </div>
  );
}

