// lib/whatsapp.js
import { formatDateDisplay } from "./calendar";

/**
 * Normalizes phone number into international format without '+' or special characters.
 * E.g., "9876543210" -> "919876543210"
 * "+91 98765 43210" -> "919876543210"
 */
export function normalizePhoneNumber(phone) {
  if (!phone) return "";
  const cleaned = String(phone).replace(/[^0-9]/g, "");
  // If 10 digits (standard India mobile without country code), prepend 91
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  return cleaned;
}

/**
 * Generate a clean, personalized WhatsApp task assignment message without special/garbled characters.
 */
export function generateWhatsAppMessage({
  employeeName,
  employeeRole,
  headName,
  isHead,
  dateKey,
  tasks,
}) {
  const formattedDate = formatDateDisplay(dateKey);

  // Clean greeting
  let greeting = `Hello ${employeeName || "Team Member"}`;
  if (employeeName === "Harleen" || employeeRole?.toLowerCase()?.includes("teamhead")) {
    greeting = `Hello Harleen (TeamHead)`;
  } else if (
    employeeName === "Namika" ||
    employeeRole?.toLowerCase()?.includes("crmhead") ||
    employeeRole?.toLowerCase()?.includes("hr")
  ) {
    greeting = `Hello Namika (HR and CRM Head)`;
  } else if (employeeName) {
    if (headName) {
      greeting = `Hello ${employeeName} (${employeeRole || "Team Member"} - Team ${headName})`;
    } else if (employeeRole) {
      greeting = `Hello ${employeeName} (${employeeRole})`;
    }
  }

  // Format numbered list of tasks without problematic unicode or markdown asterisks
  const taskLines = (tasks || [])
    .filter((t) => t.text && t.text.trim().length > 0)
    .map(
      (t, idx) =>
        `${idx + 1}. ${t.text.trim()}${t.completed ? " [Completed]" : ""}`
    )
    .join("\n");

  const fallbackTasks = taskLines || "No active tasks assigned.";

  return `${greeting},

Date: ${formattedDate}

Assigned Tasks:
${fallbackTasks}

Please review and execute the assigned deliverables.`;
}

/**
 * Generate a clean, combined WhatsApp message for a Team Head including their own tasks and all member tasks under them.
 */
export function generateTeamWhatsAppMessage({
  headName,
  headRole,
  dateKey,
  headTasks = [],
  memberAssignments = [],
}) {
  const formattedDate = formatDateDisplay(dateKey);
  const headTitle = headName === "Namika" ? "HR and CRM Head" : "TeamHead";
  const greeting = `Hello ${headName} (${headTitle})`;

  const sections = [];

  // 1. Head's own tasks (if any)
  const validHeadTasks = (headTasks || []).filter((t) => t.text && t.text.trim());
  if (validHeadTasks.length > 0) {
    const headLines = validHeadTasks
      .map(
        (t, idx) =>
          `  ${idx + 1}. ${t.text.trim()}${t.completed ? " [Completed]" : ""}`
      )
      .join("\n");
    sections.push(`Direct Tasks for ${headName}:\n${headLines}`);
  }

  // 2. Member tasks under this head
  memberAssignments.forEach((mem) => {
    const memTasks = (mem.tasks || []).filter((t) => t.text && t.text.trim());
    if (memTasks.length > 0) {
      const roleStr = mem.employeeRole ? ` (${mem.employeeRole})` : "";
      const memLines = memTasks
        .map(
          (t, idx) =>
            `  ${idx + 1}. ${t.text.trim()}${t.completed ? " [Completed]" : ""}`
        )
        .join("\n");
      sections.push(`Team Member - ${mem.employeeName}${roleStr}:\n${memLines}`);
    }
  });

  const body = sections.length > 0 ? sections.join("\n\n") : "No active deliverables assigned.";

  return `${greeting},

Date: ${formattedDate}

Assigned Deliverables:
${body}

Please review and coordinate the assigned deliverables with your team.`;
}

/**
 * Creates a valid wa.me URL for the employee and their personalized message.
 */
export function createWhatsAppUrl(phone, message) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${normalizedPhone}?text=${encodedMsg}`;
}

/**
 * Open WhatsApp in a new tab
 */
export function openWhatsAppChat(phone, message) {
  const url = createWhatsAppUrl(phone, message);
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}



