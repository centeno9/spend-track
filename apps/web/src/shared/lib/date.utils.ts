type RangeMode = "day" | "week" | "month" | "custom";

interface DateRange {
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
}

/**
 * Formats a Date object to YYYY-MM-DD string
 */
export function formatToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a YYYY-MM-DD string as a local date (not UTC)
 * This avoids timezone issues when parsing date-only strings
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Gets the start of the current day
 */
function getStartOfDay(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Gets the end of the current day
 */
function getEndOfDay(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Gets the start of the current week (Monday)
 */
function getStartOfWeek(date: Date = new Date()): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday as first day
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Gets the end of the current week (Sunday)
 */
function getEndOfWeek(date: Date = new Date()): Date {
  const end = getStartOfWeek(date);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Gets the start of the current month
 */
function getStartOfMonth(date: Date = new Date()): Date {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Gets the end of the current month
 */
function getEndOfMonth(date: Date = new Date()): Date {
  const end = new Date(date);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Calculates date range based on range mode
 */
export function getDateRangeForMode(
  mode: RangeMode,
  customStart?: string,
  customEnd?: string
): DateRange {
  const now = new Date();

  switch (mode) {
    case "day":
      return {
        startDate: formatToYYYYMMDD(getStartOfDay(now)),
        endDate: formatToYYYYMMDD(getEndOfDay(now)),
      };

    case "week":
      return {
        startDate: formatToYYYYMMDD(getStartOfWeek(now)),
        endDate: formatToYYYYMMDD(getEndOfWeek(now)),
      };

    case "month":
      return {
        startDate: formatToYYYYMMDD(getStartOfMonth(now)),
        endDate: formatToYYYYMMDD(getEndOfMonth(now)),
      };

    case "custom":
      if (!customStart || !customEnd) {
        // Fallback to current week if custom dates not provided
        return {
          startDate: formatToYYYYMMDD(getStartOfWeek(now)),
          endDate: formatToYYYYMMDD(getEndOfWeek(now)),
        };
      }
      return {
        startDate: customStart,
        endDate: customEnd,
      };

    default:
      return {
        startDate: formatToYYYYMMDD(getStartOfWeek(now)),
        endDate: formatToYYYYMMDD(getEndOfWeek(now)),
      };
  }
}

/**
 * Formats a date range for display
 */
export function formatDateRangeDisplay(startDate: string, endDate: string): string {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
