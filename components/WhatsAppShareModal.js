"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Check,
  Phone,
  Send,
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FluidButton from "./FluidButton";
import { formatDateDisplay } from "@/lib/calendar";
import {
  generateWhatsAppMessage,
  openWhatsAppChat,
} from "@/lib/whatsapp";
import { useToast } from "@/hooks/useToast";

export default function WhatsAppShareModal({
  isOpen,
  dateKey,
  onClose,
  assignments = [],
}) {
  const { success, info } = useToast();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sentStatusMap, setSentStatusMap] = useState({}); // { [assignmentId]: boolean }
  const [previewAssignmentId, setPreviewAssignmentId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const allIds = assignments.map((a) => a.id);
      setSelectedIds(allIds);
      setSentStatusMap({});
      setCurrentIndex(0);
      setPreviewAssignmentId(null);
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, assignments]);

  if (!isOpen) return null;

  const formattedDate = formatDateDisplay(dateKey);

  // Selected assignments in order
  const selectedAssignments = assignments.filter((a) =>
    selectedIds.includes(a.id)
  );

  const allSelected =
    assignments.length > 0 && selectedIds.length === assignments.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(assignments.map((a) => a.id));
    }
  };

  const handleToggleEmployee = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSendSingle = (assignment) => {
    const msg = generateWhatsAppMessage({
      employeeName: assignment.employeeName,
      employeeRole: assignment.employeeRole,
      headName: assignment.headName,
      isHead: assignment.isHead || assignment.employeeId === "head_harleen" || assignment.employeeId === "head_namika",
      dateKey,
      tasks: assignment.tasks || [],
    });
    openWhatsAppChat(assignment.employeePhone, msg);
    setSentStatusMap((prev) => ({ ...prev, [assignment.id]: true }));
    success(`WhatsApp opened for ${assignment.employeeName}`);
  };

  const handleSendNext = () => {
    const unsentIndex = selectedAssignments.findIndex(
      (a) => !sentStatusMap[a.id]
    );

    if (unsentIndex !== -1) {
      const target = selectedAssignments[unsentIndex];
      handleSendSingle(target);
      setCurrentIndex(unsentIndex + 1);
    } else if (selectedAssignments.length > 0) {
      handleSendSingle(selectedAssignments[0]);
    }
  };

  const copyMessageText = (assignment) => {
    const msg = generateWhatsAppMessage({
      employeeName: assignment.employeeName,
      employeeRole: assignment.employeeRole,
      headName: assignment.headName,
      isHead: assignment.isHead || assignment.employeeId === "head_harleen" || assignment.employeeId === "head_namika",
      dateKey,
      tasks: assignment.tasks || [],
    });
    navigator.clipboard.writeText(msg);
    info("Personalized message copied to clipboard");
  };

  const totalSelected = selectedAssignments.length;
  const sentCount = selectedAssignments.filter((a) => sentStatusMap[a.id]).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] sm:max-h-[88vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-emerald-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm shrink-0">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight">
                WhatsApp Dispatch Queue
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                {formattedDate} • Send personalized tasks to team
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

        {/* Modal Body */}
        <div className="p-3.5 sm:p-5 md:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 bg-white">
          {/* Progress Banner */}
          {totalSelected > 0 && (
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-emerald-900">
                  Progress: {sentCount} of {totalSelected} Sent
                </span>
              </div>

              {totalSelected > 1 && (
                <FluidButton
                  size="sm"
                  variant="whatsapp"
                  icon={ArrowRight}
                  onClick={handleSendNext}
                  className="text-xs py-1.5 px-3 ml-auto sm:ml-0"
                >
                  Send Next
                </FluidButton>
              )}
            </div>
          )}

          {/* Select All Row */}
          <div
            onClick={handleToggleSelectAll}
            className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-white hover:bg-emerald-50 rounded-xl cursor-pointer select-none transition-colors border border-slate-200 touch-manipulation"
          >
            <div
              className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                allSelected
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : selectedIds.length > 0
                  ? "bg-emerald-100 border-emerald-500 text-emerald-600"
                  : "bg-white border-slate-300"
              )}
            >
              {allSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              {!allSelected && selectedIds.length > 0 && (
                <span className="w-2 h-0.5 bg-emerald-600 rounded-full" />
              )}
            </div>
            <div className="flex-1 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Select All Recipients
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                {selectedIds.length} of {assignments.length} Selected
              </span>
            </div>
          </div>

          {/* Queue of Assignees */}
          <div className="space-y-2.5 sm:space-y-3">
            {assignments.map((assignment) => {
              const isSelected = selectedIds.includes(assignment.id);
              const isSent = !!sentStatusMap[assignment.id];
              const taskCount = (assignment.tasks || []).length;
              const isPreviewOpen = previewAssignmentId === assignment.id;
              const previewMessage = generateWhatsAppMessage({
                employeeName: assignment.employeeName,
                employeeRole: assignment.employeeRole,
                headName: assignment.headName,
                isHead: assignment.isHead || assignment.employeeId === "head_harleen" || assignment.employeeId === "head_namika",
                dateKey,
                tasks: assignment.tasks || [],
              });

              return (
                <div
                  key={assignment.id}
                  className={cn(
                    "rounded-2xl border transition-all overflow-hidden",
                    isSelected
                      ? "bg-white border-slate-200 shadow-xs"
                      : "bg-slate-50/50 border-slate-200 opacity-60"
                  )}
                >
                  <div className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-white">
                    {/* Checkbox and Info */}
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => handleToggleEmployee(assignment.id)}
                        className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 touch-manipulation",
                          isSelected
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-white border-slate-300"
                        )}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                            {assignment.employeeName}
                          </h4>

                          {assignment.employeeName === "Harleen" || assignment.employeeId === "head_harleen" ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              TeamHead
                            </span>
                          ) : assignment.employeeName === "Namika" || assignment.employeeId === "head_namika" ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                              Hr & crmhead
                            </span>
                          ) : assignment.headName ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              Team {assignment.headName}
                            </span>
                          ) : null}

                          {isSent ? (
                            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] sm:text-xs text-slate-500 mt-0.5">
                          {assignment.employeeRole && (
                            <span className="text-slate-600 font-medium">
                              {assignment.employeeRole} •
                            </span>
                          )}
                          <span className="font-semibold text-blue-600">
                            {taskCount} {taskCount === 1 ? "Task" : "Tasks"}
                          </span>
                          {assignment.employeePhone && (
                            <span className="flex items-center gap-1 font-mono text-[10px] sm:text-[11px]">
                              <Phone className="w-2.5 h-2.5" />
                              {assignment.employeePhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewAssignmentId(
                            isPreviewOpen ? null : assignment.id
                          )
                        }
                        className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors text-xs font-medium flex items-center gap-1 touch-manipulation"
                        title="Preview message"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>

                      <FluidButton
                        size="sm"
                        variant={isSent ? "secondary" : "whatsapp"}
                        icon={Send}
                        disabled={!isSelected}
                        onClick={() => handleSendSingle(assignment)}
                        className="text-xs py-1 px-2.5"
                      >
                        {isSent ? "Resend" : "Send"}
                      </FluidButton>
                    </div>
                  </div>

                  {/* Message Preview Accordion */}
                  {isPreviewOpen && (
                    <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-600">
                          Personalized Message Preview:
                        </span>
                        <button
                          type="button"
                          onClick={() => copyMessageText(assignment)}
                          className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Copy className="w-3 h-3" />
                          Copy Text
                        </button>
                      </div>
                      <pre className="p-2.5 sm:p-3 rounded-xl bg-white border border-slate-200 font-sans text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px] sm:text-xs">
                        {previewMessage}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-100 bg-white flex items-center justify-between">
          <p className="text-[11px] sm:text-xs text-slate-500">
            WhatsApp Web / App will open directly
          </p>
          <FluidButton variant="secondary" onClick={onClose} className="text-xs sm:text-sm py-1.5 px-3">
            Done
          </FluidButton>
        </div>
      </div>
    </div>
  );
}
