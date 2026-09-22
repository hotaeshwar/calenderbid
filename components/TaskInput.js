"use client";

import React from "react";
import { Plus, Trash2, ListTodo } from "lucide-react";
import FluidButton from "./FluidButton";

const PLACEHOLDER_EXAMPLES = [
  "Create Instagram post and story assets",
  "Edit client video banner & reels",
  "Prepare festival promotional creative",
  "Update website hero section banner",
  "Schedule social media marketing posts",
  "Review & finalize client branding deck",
];

export default function TaskInput({ tasks = [], onChange }) {
  const handleTaskTextChange = (index, value) => {
    const updated = [...tasks];
    updated[index] = value;
    onChange(updated);
  };

  const handleAddTask = () => {
    onChange([...tasks, ""]);
  };

  const handleRemoveTask = (index) => {
    if (tasks.length <= 1) {
      onChange([""]);
      return;
    }
    const updated = tasks.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-extrabold text-black flex items-center gap-1.5 sm:gap-2">
          <ListTodo className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
          <span className="text-black font-bold">Tasks & Deliverables</span>
          <span className="text-[10px] sm:text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            {tasks.filter((t) => t.trim().length > 0).length} valid of {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </label>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {tasks.map((taskText, idx) => {
          const placeholder =
            PLACEHOLDER_EXAMPLES[idx % PLACEHOLDER_EXAMPLES.length];

          return (
            <div
              key={idx}
              className="flex items-start gap-2 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border-2 border-slate-200 focus-within:border-blue-600 shadow-xs transition-all"
            >
              <div className="pt-1.5 sm:pt-2 text-[11px] sm:text-xs font-bold text-slate-500 shrink-0 w-6 text-center">
                #{idx + 1}
              </div>

              <textarea
                value={taskText}
                onChange={(e) => handleTaskTextChange(idx, e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="flex-1 w-full text-xs sm:text-sm font-semibold bg-white text-black placeholder:text-slate-400 placeholder:font-normal border-0 focus:outline-none focus:ring-0 leading-relaxed resize-y"
              />

              <button
                type="button"
                onClick={() => handleRemoveTask(idx)}
                title="Delete this task entry"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 mt-1 touch-manipulation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Another Task Button */}
      <div className="pt-1 flex justify-center sm:justify-start">
        <FluidButton
          size="sm"
          variant="secondary"
          icon={Plus}
          onClick={handleAddTask}
          className="w-full sm:w-auto font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs sm:text-sm py-2 px-3.5"
        >
          + Add Multiple Task
        </FluidButton>
      </div>
    </div>
  );
}

