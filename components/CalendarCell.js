"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Crown } from "lucide-react";

export default function CalendarCell({
  cell,
  assignments = [],
  onClick,
}) {
  const { dateKey, day, isCurrentMonth, isToday } = cell;

  // Calculate task counts across assignments
  const totalEmployees = assignments.length;
  let totalTasks = 0;
  let completedTasks = 0;

  assignments.forEach((a) => {
    const tasks = a.tasks || [];
    totalTasks += tasks.length;
    completedTasks += tasks.filter((t) => t.completed).length;
  });

  const allCompleted = totalTasks > 0 && completedTasks === totalTasks;

  // Group assignments by Team Head
  const harleenHead = assignments.find(
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
  const hasHarleen = !!harleenHead || harleenMembers.length > 0;

  const namikaHead = assignments.find(
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
  const hasNamika = !!namikaHead || namikaMembers.length > 0;

  const otherAssignments = assignments.filter(
    (a) =>
      a !== harleenHead &&
      a !== namikaHead &&
      !harleenMembers.includes(a) &&
      !namikaMembers.includes(a)
  );

  // Helper to collect all task items for a team
  const getTeamItems = (headAssignment, members) => {
    const items = [];
    if (headAssignment) {
      (headAssignment.tasks || []).forEach((t) => {
        items.push({
          id: t.id,
          text: t.text,
          completed: t.completed,
          ownerName: headAssignment.employeeName,
          isHead: true,
        });
      });
    }
    members.forEach((m) => {
      (m.tasks || []).forEach((t) => {
        items.push({
          id: t.id,
          text: t.text,
          completed: t.completed,
          ownerName: m.employeeName,
          isHead: false,
        });
      });
    });
    return items;
  };

  const harleenItems = getTeamItems(harleenHead, harleenMembers);
  const harleenDoneCount = harleenItems.filter((i) => i.completed).length;
  const isHarleenDone =
    harleenItems.length > 0 && harleenDoneCount === harleenItems.length;

  const namikaItems = getTeamItems(namikaHead, namikaMembers);
  const namikaDoneCount = namikaItems.filter((i) => i.completed).length;
  const isNamikaDone =
    namikaItems.length > 0 && namikaDoneCount === namikaItems.length;

  return (
    <div
      onClick={() => onClick(dateKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(dateKey);
        }
      }}
      className={cn(
        "group relative min-h-[85px] sm:min-h-[120px] md:min-h-[145px] lg:min-h-[160px] p-1.5 sm:p-2 md:p-2.5 flex flex-col justify-between border-b border-r border-slate-100 transition-all duration-150 outline-none text-left select-none touch-manipulation active:bg-blue-50/70 cursor-pointer overflow-hidden",
        isCurrentMonth
          ? "bg-white hover:bg-blue-50/40"
          : "bg-slate-50/50 text-slate-400 hover:bg-slate-100/50",
        isToday && "bg-blue-50/30 ring-1 sm:ring-2 ring-inset ring-blue-500/50"
      )}
    >
      {/* Top Header of Date Cell */}
      <div className="flex items-center justify-between gap-0.5 sm:gap-1">
        <span
          className={cn(
            "inline-flex items-center justify-center text-[11px] sm:text-xs md:text-sm font-semibold transition-transform duration-200 group-hover:scale-105",
            isToday
              ? "w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-blue-600 text-white shadow-xs font-bold text-[10px] sm:text-xs md:text-sm"
              : isCurrentMonth
              ? "text-slate-800"
              : "text-slate-400"
          )}
        >
          {day}
        </span>

        {/* Total Tasks Status Indicator */}
        {totalTasks > 0 && (
          <div className="flex items-center gap-0.5 sm:gap-1">
            {allCompleted ? (
              <>
                <span
                  className="sm:hidden w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 shrink-0"
                  title="All tasks done"
                />
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] md:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-2.5 h-2.5 shrink-0" />
                  Done
                </span>
              </>
            ) : (
              <>
                <span className="sm:hidden text-[9px] font-bold text-blue-700 bg-blue-50 px-1 py-0.2 rounded-full border border-blue-200 leading-tight">
                  {totalTasks}
                </span>
                <span className="hidden sm:inline-flex text-[9px] md:text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                  {completedTasks}/{totalTasks}
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Middle & Bottom Content: Grouped by Team Head */}
      <div className="mt-1 flex flex-col flex-1 justify-start gap-1 overflow-hidden">
        {/* MOBILE VIEW (< sm) */}
        {totalEmployees > 0 && (
          <div className="flex sm:hidden flex-col gap-0.5 w-full overflow-hidden">
            {hasHarleen && (
              <div
                className={cn(
                  "w-full px-1 py-0.5 rounded text-[9px] font-semibold truncate flex flex-col border leading-tight",
                  isHarleenDone
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-blue-50 text-blue-950 border-blue-200"
                )}
              >
                <div className="flex items-center justify-between gap-0.5 font-bold">
                  <span className="truncate flex items-center gap-0.5">
                    <Crown className="w-2 h-2 text-amber-500" />
                    Harleen
                  </span>
                  <span className="text-[8px] opacity-75">
                    {harleenItems.length}t
                  </span>
                </div>
                {harleenItems[0] && (
                  <span className="text-[8px] font-normal truncate opacity-80">
                    • {harleenItems[0].ownerName !== "Harleen" ? `${harleenItems[0].ownerName}: ` : ""}
                    {harleenItems[0].text}
                  </span>
                )}
              </div>
            )}

            {hasNamika && (
              <div
                className={cn(
                  "w-full px-1 py-0.5 rounded text-[9px] font-semibold truncate flex flex-col border leading-tight",
                  isNamikaDone
                    ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                    : "bg-purple-50 text-purple-950 border-purple-200"
                )}
              >
                <div className="flex items-center justify-between gap-0.5 font-bold">
                  <span className="truncate flex items-center gap-0.5">
                    <Crown className="w-2 h-2 text-purple-500" />
                    Namika
                  </span>
                  <span className="text-[8px] opacity-75">
                    {namikaItems.length}t
                  </span>
                </div>
                {namikaItems[0] && (
                  <span className="text-[8px] font-normal truncate opacity-80">
                    • {namikaItems[0].ownerName !== "Namika" ? `${namikaItems[0].ownerName}: ` : ""}
                    {namikaItems[0].text}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* TABLET & DESKTOP VIEW (>= sm): Rich Nested Team Head Display */}
        {totalEmployees > 0 && (
          <div className="hidden sm:flex flex-col gap-1 w-full overflow-hidden">
            {/* HARLEEN TEAM BLOCK */}
            {hasHarleen && (
              <div
                className={cn(
                  "w-full text-left p-1 sm:p-1.5 rounded-lg text-xs font-medium flex flex-col gap-0.5 transition-all border",
                  isHarleenDone
                    ? "bg-emerald-50/90 text-emerald-900 border-emerald-200"
                    : "bg-blue-50/90 text-blue-900 border-blue-200/90 shadow-2xs"
                )}
              >
                {/* Team Head Header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <Crown className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                    <span className="truncate font-extrabold text-[10px] sm:text-[11px] text-black">
                      Harleen
                    </span>
                    {harleenMembers.length > 0 && (
                      <span className="text-[8px] font-bold text-blue-700 bg-blue-100 px-1 py-0.2 rounded">
                        +{harleenMembers.length}m
                      </span>
                    )}
                  </div>

                  <span
                    className={cn(
                      "shrink-0 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded",
                      isHarleenDone
                        ? "text-emerald-800 bg-emerald-100"
                        : "text-blue-800 bg-blue-100"
                    )}
                  >
                    {harleenDoneCount > 0
                      ? `${harleenDoneCount}/${harleenItems.length}`
                      : `${harleenItems.length}t`}
                  </span>
                </div>

                {/* Team Tasks (Nested Directly Below Harleen) */}
                <div className="space-y-0.5 mt-0.5">
                  {harleenItems.slice(0, 2).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={cn(
                        "text-[9px] sm:text-[10px] leading-tight truncate flex items-center gap-1",
                        item.completed
                          ? "line-through text-slate-400"
                          : "text-slate-800 font-medium"
                      )}
                    >
                      <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0 opacity-70" />
                      <span className="truncate">
                        {item.ownerName !== "Harleen" && (
                          <strong className="text-black font-semibold mr-0.5">
                            {item.ownerName}:
                          </strong>
                        )}
                        {item.text}
                      </span>
                    </div>
                  ))}
                  {harleenItems.length > 2 && (
                    <span className="text-[8px] text-blue-700 font-semibold block pl-2 leading-none">
                      +{harleenItems.length - 2} more tasks
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* NAMIKA TEAM BLOCK */}
            {hasNamika && (
              <div
                className={cn(
                  "w-full text-left p-1 sm:p-1.5 rounded-lg text-xs font-medium flex flex-col gap-0.5 transition-all border",
                  isNamikaDone
                    ? "bg-emerald-50/90 text-emerald-900 border-emerald-200"
                    : "bg-purple-50/90 text-purple-900 border-purple-200/90 shadow-2xs"
                )}
              >
                {/* Team Head Header */}
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1 min-w-0">
                    <Crown className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                    <span className="truncate font-extrabold text-[10px] sm:text-[11px] text-black">
                      Namika
                    </span>
                    {namikaMembers.length > 0 && (
                      <span className="text-[8px] font-bold text-purple-700 bg-purple-100 px-1 py-0.2 rounded">
                        +{namikaMembers.length}m
                      </span>
                    )}
                  </div>

                  <span
                    className={cn(
                      "shrink-0 text-[8px] sm:text-[9px] font-bold px-1 py-0.2 rounded",
                      isNamikaDone
                        ? "text-emerald-800 bg-emerald-100"
                        : "text-purple-800 bg-purple-100"
                    )}
                  >
                    {namikaDoneCount > 0
                      ? `${namikaDoneCount}/${namikaItems.length}`
                      : `${namikaItems.length}t`}
                  </span>
                </div>

                {/* Team Tasks (Nested Directly Below Namika) */}
                <div className="space-y-0.5 mt-0.5">
                  {namikaItems.slice(0, 2).map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className={cn(
                        "text-[9px] sm:text-[10px] leading-tight truncate flex items-center gap-1",
                        item.completed
                          ? "line-through text-slate-400"
                          : "text-slate-800 font-medium"
                      )}
                    >
                      <span className="w-1 h-1 rounded-full bg-purple-500 shrink-0 opacity-70" />
                      <span className="truncate">
                        {item.ownerName !== "Namika" && (
                          <strong className="text-black font-semibold mr-0.5">
                            {item.ownerName}:
                          </strong>
                        )}
                        {item.text}
                      </span>
                    </div>
                  ))}
                  {namikaItems.length > 2 && (
                    <span className="text-[8px] text-purple-700 font-semibold block pl-2 leading-none">
                      +{namikaItems.length - 2} more tasks
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Other Standalone Assignments */}
            {otherAssignments.map((assignment) => {
              const tasks = assignment.tasks || [];
              return (
                <div
                  key={assignment.id}
                  className="w-full text-left p-1 rounded bg-slate-50 border border-slate-200 text-[9px]"
                >
                  <span className="font-bold text-black truncate block">
                    {assignment.employeeName}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plus icon on hover (Desktop only) */}
      <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block pointer-events-none">
        <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold shadow-xs border border-blue-100">
          +
        </span>
      </div>
    </div>
  );
}

