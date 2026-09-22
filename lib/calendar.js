// lib/calendar.js

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const WEEKDAYS_FULL = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

export const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Format year, month (0-indexed), and day into stable local 'YYYY-MM-DD'
 */
export function formatDateKey(year, monthIndex, day) {
  const y = String(year).padStart(4, "0");
  const m = String(monthIndex + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Get today's local dateKey 'YYYY-MM-DD'
 */
export function getTodayDateKey() {
  const today = new Date();
  return formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Parse 'YYYY-MM-DD' into components safely without timezone shifts
 */
export function parseDateKey(dateKey) {
  if (!dateKey) return null;
  const parts = dateKey.split("-").map(Number);
  if (parts.length !== 3) return null;
  const [year, monthNum, day] = parts;
  return {
    year,
    monthIndex: monthNum - 1,
    day,
  };
}

/**
 * Format 'YYYY-MM-DD' into human readable string e.g. "18 September 2026"
 */
export function formatDateDisplay(dateKey) {
  const parsed = parseDateKey(dateKey);
  if (!parsed) return dateKey || "";
  const monthName = MONTH_NAMES[parsed.monthIndex] || "";
  return `${parsed.day} ${monthName} ${parsed.year}`;
}

/**
 * Format year and monthIndex into "September 2026"
 */
export function formatMonthYear(year, monthIndex) {
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

/**
 * Returns the number of days in a month (handles leap years accurately)
 */
export function getDaysInMonth(year, monthIndex) {
  // Day 0 of next month gives the last day of current month
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Generate calendar grid cells (array of 35 or 42 cells) for given year and month
 */
export function generateMonthGrid(year, monthIndex, todayKey = getTodayDateKey()) {
  const daysInCurrentMonth = getDaysInMonth(year, monthIndex);
  
  // First day of current month: 0 (Sun) to 6 (Sat)
  const firstDayWeekday = new Date(year, monthIndex, 1).getDay();

  // Previous month info
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevMonthYear = monthIndex === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonthIndex);

  // Next month info
  const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1;
  const nextMonthYear = monthIndex === 11 ? year + 1 : year;

  const cells = [];

  // 1. Previous month trailing days
  for (let i = firstDayWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dateKey = formatDateKey(prevMonthYear, prevMonthIndex, day);
    cells.push({
      dateKey,
      day,
      monthIndex: prevMonthIndex,
      year: prevMonthYear,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
    });
  }

  // 2. Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const dateKey = formatDateKey(year, monthIndex, day);
    cells.push({
      dateKey,
      day,
      monthIndex,
      year,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
    });
  }

  // 3. Next month leading days to complete the 35 or 42 grid
  const totalCellsSoFar = cells.length;
  const targetTotal = totalCellsSoFar <= 35 ? 35 : 42;
  const remainingDays = targetTotal - totalCellsSoFar;

  for (let day = 1; day <= remainingDays; day++) {
    const dateKey = formatDateKey(nextMonthYear, nextMonthIndex, day);
    cells.push({
      dateKey,
      day,
      monthIndex: nextMonthIndex,
      year: nextMonthYear,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
    });
  }

  return cells;
}
