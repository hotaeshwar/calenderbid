"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  PlusCircle,
} from "lucide-react";
import FluidButton from "./FluidButton";
import { formatMonthYear } from "@/lib/calendar";

export default function Header({
  currentYear,
  currentMonthIndex,
  onPrevMonth,
  onNextMonth,
  onToday,
  onOpenQuickAdd,
}) {
  const monthTitle = formatMonthYear(currentYear, currentMonthIndex);

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 lg:px-8 py-2.5 sm:py-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3.5 lg:gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl overflow-hidden bg-white p-1 border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                <img
                  src="https://www.buildingindiadigital.com/media/bid.png"
                  alt="Building India Digital Logo"
                  className="w-full h-full object-contain transform scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    BiD Calendar
                  </h1>
                  <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Pro
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-none mt-0.5">
                  Building India Digital • Task Calendar
                </p>
              </div>
            </div>

            {/* Mobile Quick Action Button */}
            <div className="flex items-center gap-1.5 sm:hidden">
              <FluidButton
                size="sm"
                variant="primary"
                icon={PlusCircle}
                onClick={onOpenQuickAdd}
                className="px-2.5 py-1.5 text-xs font-bold"
              >
                Assign
              </FluidButton>
            </div>
          </div>

          {/* Month Navigation & Controls */}
          <div className="flex items-center justify-between sm:justify-center w-full sm:w-auto gap-1 sm:gap-2 bg-white p-1 sm:p-1.5 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={onPrevMonth}
              aria-label="Previous Month"
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 touch-manipulation"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 min-w-[125px] sm:min-w-[150px]">
              <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
              <span className="text-xs sm:text-sm md:text-base font-bold text-slate-900 text-center tracking-tight">
                {monthTitle}
              </span>
            </div>

            <button
              onClick={onNextMonth}
              aria-label="Next Month"
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 touch-manipulation"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="h-4 sm:h-5 w-px bg-slate-200 mx-0.5" />

            <button
              onClick={onToday}
              className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs md:text-sm font-bold rounded-lg sm:rounded-xl text-blue-700 hover:bg-blue-50 transition-colors touch-manipulation"
            >
              Today
            </button>
          </div>

          {/* Desktop & Tablet Assign Task Action */}
          <div className="hidden sm:flex items-center gap-2.5">
            <FluidButton
              size="md"
              variant="primary"
              icon={PlusCircle}
              onClick={onOpenQuickAdd}
              className="font-bold shadow-sm"
            >
              Assign Task
            </FluidButton>
          </div>
        </div>
      </div>
    </header>
  );
}

