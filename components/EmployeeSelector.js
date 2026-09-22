"use client";

import React, { useState } from "react";
import {
  Check,
  Crown,
  UserPlus,
  Phone,
  Briefcase,
  Edit2,
  Trash2,
  Sparkles,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FluidButton from "./FluidButton";
import { useToast } from "@/hooks/useToast";

export default function EmployeeSelector({
  employees = [],
  selectedEmployeeIds = [],
  onSelectionChange,
  onOpenAddMember,
  onEditMember,
  onDeleteMember,
  onUpdateHeadPhone,
}) {
  const { success, error } = useToast();

  // Inline phone editing state for heads
  const [editingHeadId, setEditingHeadId] = useState(null);
  const [headPhoneInput, setHeadPhoneInput] = useState("");

  const harleen = employees.find((e) => e.id === "head_harleen") || {
    id: "head_harleen",
    name: "Harleen",
    role: "TeamHead",
    isHead: true,
    phone: "",
  };

  const namika = employees.find((e) => e.id === "head_namika") || {
    id: "head_namika",
    name: "Namika",
    role: "Hr and crmhead",
    isHead: true,
    phone: "",
  };

  // Team members under each head
  const harleenMembers = employees.filter(
    (e) =>
      !e.isHead &&
      (e.headId === "head_harleen" ||
        (!e.headId && e.id !== "head_namika" && e.id !== "head_harleen"))
  );

  const namikaMembers = employees.filter(
    (e) => !e.isHead && e.headId === "head_namika"
  );

  const isHarleenSelected = selectedEmployeeIds.includes("head_harleen");
  const isNamikaSelected = selectedEmployeeIds.includes("head_namika");
  const areBothHeadsSelected = isHarleenSelected && isNamikaSelected;

  const allAvailableIds = employees.map((e) => e.id);
  const isAllSelected =
    allAvailableIds.length > 0 &&
    selectedEmployeeIds.length === allAvailableIds.length;

  // Smart Toggle for Head or Member
  const handleToggleMember = (id) => {
    if (selectedEmployeeIds.includes(id)) {
      onSelectionChange(selectedEmployeeIds.filter((item) => item !== id));
      return;
    }

    if (id === "head_harleen") {
      // If selecting Harleen, unselect her team members to avoid duplicate tasks
      const harleenMemberIds = harleenMembers.map((m) => m.id);
      const filtered = selectedEmployeeIds.filter(
        (itemId) => !harleenMemberIds.includes(itemId)
      );
      onSelectionChange([...filtered, "head_harleen"]);
    } else if (id === "head_namika") {
      // If selecting Namika, unselect her team members to avoid duplicate tasks
      const namikaMemberIds = namikaMembers.map((m) => m.id);
      const filtered = selectedEmployeeIds.filter(
        (itemId) => !namikaMemberIds.includes(itemId)
      );
      onSelectionChange([...filtered, "head_namika"]);
    } else {
      // If selecting a member, unselect their respective Head so the task isn't duplicated to Head!
      const memberObj = employees.find((e) => e.id === id);
      let updated = [...selectedEmployeeIds];
      if (
        memberObj?.headId === "head_harleen" ||
        (!memberObj?.headId && id !== "head_namika" && id !== "head_harleen")
      ) {
        updated = updated.filter((itemId) => itemId !== "head_harleen");
      } else if (memberObj?.headId === "head_namika") {
        updated = updated.filter((itemId) => itemId !== "head_namika");
      }
      onSelectionChange([...updated, id]);
    }
  };

  // Toggle Both Heads in 1 click (selects Harleen & Namika ONLY)
  const handleToggleBothHeads = () => {
    if (areBothHeadsSelected) {
      onSelectionChange(
        selectedEmployeeIds.filter(
          (id) => id !== "head_harleen" && id !== "head_namika"
        )
      );
    } else {
      onSelectionChange(["head_harleen", "head_namika"]);
    }
  };

  // Toggle Select All
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(allAvailableIds);
    }
  };

  // Start editing Head phone
  const handleStartEditHeadPhone = (head, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    setEditingHeadId(head.id);
    setHeadPhoneInput(head.phone || "");
  };

  // Save Head phone
  const handleSaveHeadPhone = async (headId, e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const phoneToSave = headPhoneInput;
    setEditingHeadId(null);

    try {
      if (onUpdateHeadPhone) {
        await onUpdateHeadPhone(headId, phoneToSave);
        success(
          `WhatsApp number saved for ${
            headId === "head_harleen" ? "Harleen" : "Namika"
          }`
        );
      }
    } catch (err) {
      error(err.message || "Failed to update phone number");
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Top Action Bar: Quick Select Both Heads & Select All */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <FluidButton
            type="button"
            size="sm"
            variant={areBothHeadsSelected ? "primary" : "secondary"}
            icon={Sparkles}
            onClick={handleToggleBothHeads}
            className="text-xs font-bold py-1.5 px-3"
          >
            {areBothHeadsSelected
              ? "✓ Both Heads Selected"
              : "⚡ Select Both Heads"}
          </FluidButton>

          <button
            type="button"
            onClick={handleToggleSelectAll}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            {isAllSelected ? "Deselect All" : "Select All"}
          </button>
        </div>

        <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          {selectedEmployeeIds.length} selected
        </div>
      </div>

      {/* HEAD 1: HARLEEN (TeamHead) */}
      <div className="rounded-2xl border border-blue-200 bg-white overflow-hidden shadow-xs">
        {/* Head Row Header */}
        <div
          className={cn(
            "p-3 sm:p-3.5 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors",
            isHarleenSelected ? "bg-blue-50/80" : "bg-blue-50/30"
          )}
        >
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none flex-1 min-w-0"
            onClick={() => handleToggleMember("head_harleen")}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                isHarleenSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-blue-300"
              )}
            >
              {isHarleenSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-extrabold text-black">
                  Harleen
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  TeamHead
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Head of Team • {harleenMembers.length} members under Harleen
              </p>
            </div>
          </div>

          {/* WhatsApp Phone Section for Harleen */}
          <div
            className="flex items-center gap-2 self-start sm:self-center shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {editingHeadId === "head_harleen" ? (
              <div
                className="flex items-center gap-1.5 bg-white p-1 rounded-xl border-2 border-blue-500 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="tel"
                  placeholder="Enter WhatsApp No."
                  value={headPhoneInput}
                  onChange={(e) => setHeadPhoneInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveHeadPhone("head_harleen", e);
                    }
                  }}
                  className="px-2 py-1 text-xs border-none outline-none font-mono text-black w-36 bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={(e) => handleSaveHeadPhone("head_harleen", e)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingHeadId(null);
                  }}
                  className="p-1 text-xs text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {harleen.phone ? (
                  <button
                    type="button"
                    onClick={(e) => handleStartEditHeadPhone(harleen, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-mono font-bold transition-all shadow-xs"
                    title="Click to edit WhatsApp number"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{harleen.phone}</span>
                    <Edit2 className="w-3 h-3 opacity-60 ml-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleStartEditHeadPhone(harleen, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-dashed border-blue-400 text-blue-700 hover:bg-blue-50 text-xs font-bold transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    + Add WhatsApp No.
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Team Members under Harleen */}
        <div className="p-2 sm:p-3 bg-white space-y-1.5">
          {harleenMembers.length > 0 ? (
            harleenMembers.map((member) => {
              const isSelected = selectedEmployeeIds.includes(member.id);
              return (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl border transition-all",
                    isSelected
                      ? "bg-blue-50/50 border-blue-200"
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <div
                    onClick={() => handleToggleMember(member.id)}
                    className="flex items-center gap-2.5 cursor-pointer select-none flex-1 min-w-0"
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                        isSelected
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-300"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-black truncate">
                        {member.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                        {member.role && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-2.5 h-2.5" />
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Member Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {onEditMember && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onEditMember(member);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteMember && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteMember(member);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[11px] text-slate-400 italic px-2 py-1">
              No team members added under Harleen yet.
            </p>
          )}

          {/* Button to Add Team Member under Harleen */}
          {onOpenAddMember && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onOpenAddMember("head_harleen");
              }}
              className="w-full py-2 px-3 text-xs font-bold text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded-xl border border-dashed border-blue-300 flex items-center justify-center gap-1.5 transition-colors mt-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Add Team Member under Harleen
            </button>
          )}
        </div>
      </div>

      {/* HEAD 2: NAMIKA (Hr and crmhead) */}
      <div className="rounded-2xl border border-purple-200 bg-white overflow-hidden shadow-xs">
        {/* Head Row Header */}
        <div
          className={cn(
            "p-3 sm:p-3.5 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors",
            isNamikaSelected ? "bg-purple-50/80" : "bg-purple-50/30"
          )}
        >
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none flex-1 min-w-0"
            onClick={() => handleToggleMember("head_namika")}
          >
            <div
              className={cn(
                "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0",
                isNamikaSelected
                  ? "bg-purple-600 border-purple-600 text-white shadow-sm"
                  : "bg-white border-purple-300"
              )}
            >
              {isNamikaSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>

            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              <Crown className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-extrabold text-black">
                  Namika
                </span>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  Hr and crmhead
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Head of HR & CRM • {namikaMembers.length} members under Namika
              </p>
            </div>
          </div>

          {/* WhatsApp Phone Section for Namika */}
          <div
            className="flex items-center gap-2 self-start sm:self-center shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {editingHeadId === "head_namika" ? (
              <div
                className="flex items-center gap-1.5 bg-white p-1 rounded-xl border-2 border-purple-500 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="tel"
                  placeholder="Enter WhatsApp No."
                  value={headPhoneInput}
                  onChange={(e) => setHeadPhoneInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveHeadPhone("head_namika", e);
                    }
                  }}
                  className="px-2 py-1 text-xs border-none outline-none font-mono text-black w-36 bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={(e) => handleSaveHeadPhone("head_namika", e)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-1 shadow-xs"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingHeadId(null);
                  }}
                  className="p-1 text-xs text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {namika.phone ? (
                  <button
                    type="button"
                    onClick={(e) => handleStartEditHeadPhone(namika, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 text-xs font-mono font-bold transition-all shadow-xs"
                    title="Click to edit WhatsApp number"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{namika.phone}</span>
                    <Edit2 className="w-3 h-3 opacity-60 ml-0.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => handleStartEditHeadPhone(namika, e)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-dashed border-purple-400 text-purple-700 hover:bg-purple-50 text-xs font-bold transition-all shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-purple-600" />
                    + Add WhatsApp No.
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Team Members under Namika */}
        <div className="p-2 sm:p-3 bg-white space-y-1.5">
          {namikaMembers.length > 0 ? (
            namikaMembers.map((member) => {
              const isSelected = selectedEmployeeIds.includes(member.id);
              return (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-xl border transition-all",
                    isSelected
                      ? "bg-purple-50/50 border-purple-200"
                      : "bg-white border-slate-100 hover:bg-slate-50"
                  )}
                >
                  <div
                    onClick={() => handleToggleMember(member.id)}
                    className="flex items-center gap-2.5 cursor-pointer select-none flex-1 min-w-0"
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-all shrink-0",
                        isSelected
                          ? "bg-purple-600 border-purple-600 text-white"
                          : "bg-white border-slate-300"
                      )}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-black truncate">
                        {member.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2.5 text-[10px] sm:text-[11px] text-slate-500 font-medium">
                        {member.role && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <Briefcase className="w-2.5 h-2.5" />
                            {member.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Member Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {onEditMember && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onEditMember(member);
                        }}
                        className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                        title="Edit member"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteMember && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDeleteMember(member);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-[11px] text-slate-400 italic px-2 py-1">
              No team members added under Namika yet.
            </p>
          )}

          {/* Button to Add Team Member under Namika */}
          {onOpenAddMember && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onOpenAddMember("head_namika");
              }}
              className="w-full py-2 px-3 text-xs font-bold text-purple-700 hover:text-purple-900 hover:bg-purple-50 rounded-xl border border-dashed border-purple-300 flex items-center justify-center gap-1.5 transition-colors mt-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Add Team Member under Namika
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


