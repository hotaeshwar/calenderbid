"use client";

import React, { useMemo } from "react";
import CalendarCell from "./CalendarCell";
import { generateMonthGrid, getTodayDateKey, WEEKDAYS_FULL, WEEKDAYS_SHORT } from "@/lib/calendar";
import { Loader2 } from "lucide-react";

export default function Calendar({
  year,
  monthIndex,
  todayKey,
  assignmentsByDate = {},
  onSelectDate,
  loading = false,
}) {
  const currentTodayKey = todayKey || getTodayDateKey();

  const gridCells = useMemo(() => {
    return generateMonthGrid(year, monthIndex, currentTodayKey);
  }, [year, monthIndex, currentTodayKey]);

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/70 sm:bg-white">
        {WEEKDAYS_FULL.map((dayFull, index) => {
          const isWeekend = index === 0 || index === 6; // Sunday or Saturday
          return (
            <div
              key={dayFull}
              className={`py-2 sm:py-2.5 md:py-3 text-center border-r last:border-r-0 border-slate-100 text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-wider ${
                isWeekend
                  ? "text-blue-600"
                  : "text-slate-600"
              }`}
            >
              <span className="hidden md:inline">{dayFull}</span>
              <span className="hidden sm:inline md:hidden">{WEEKDAYS_SHORT[index]}</span>
              <span className="sm:hidden">{WEEKDAYS_SHORT[index].slice(0, 2)}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar 7-column Matrix */}
      <div className="relative bg-white">
        {loading && (
          <div className="absolute top-2 right-2 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 shadow-md border border-slate-200 text-[11px] font-semibold text-slate-700 animate-fade-in">
            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
            <span>Syncing tasks...</span>
          </div>
        )}

        <div className="grid grid-cols-7 bg-white">
          {gridCells.map((cell) => {
            const dateAssignments = assignmentsByDate[cell.dateKey] || [];
            return (
              <CalendarCell
                key={cell.dateKey}
                cell={cell}
                assignments={dateAssignments}
                onClick={onSelectDate}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
