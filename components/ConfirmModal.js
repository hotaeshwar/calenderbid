"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import FluidButton from "./FluidButton";

export default function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  confirmVariant = "danger",
  onConfirm,
  onClose,
  loading = false,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 p-4 sm:p-6 overflow-hidden animate-slide-up sm:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 sm:gap-4 bg-white">
          <div className="p-2.5 sm:p-3 rounded-2xl bg-rose-50 text-rose-600 shrink-0">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 sm:mt-6 flex items-center justify-end gap-2.5 sm:gap-3 bg-white">
          <FluidButton
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1 sm:flex-initial text-xs sm:text-sm py-2 px-3"
          >
            Cancel
          </FluidButton>

          <FluidButton
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
            className="flex-1 sm:flex-initial text-xs sm:text-sm py-2 px-3"
          >
            {confirmText}
          </FluidButton>
        </div>
      </div>
    </div>
  );
}
