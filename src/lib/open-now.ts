/**
 * Open/Closed status logic for ASM AUTO Repair.
 * Determines whether the shop is currently open based on America/Toronto timezone.
 */

export interface DayHours {
  day: string;          // "Monday", "Tuesday", etc.
  open: string | null;  // "10:00" or null (closed)
  close: string | null; // "19:00" or null
  display: string;      // "10 a.m. – 7 p.m." or "Closed"
}

export interface OpenNowResult {
  isOpen: boolean;
  currentDay: string;
  nextOpening?: {
    day: string;
    time: string;       // Display format like "10 a.m."
  };
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Converts a 24h time string ("14:00") to display format ("2 p.m.").
 */
function formatTimeDisplay(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const period = hour >= 12 ? 'p.m.' : 'a.m.';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  if (minute === 0) {
    return `${displayHour} ${period}`;
  }
  return `${displayHour}:${minuteStr} ${period}`;
}

/**
 * Converts a time string ("10:00") to total minutes since midnight.
 */
function timeToMinutes(time: string): number {
  const [hourStr, minuteStr] = time.split(':');
  return parseInt(hourStr, 10) * 60 + parseInt(minuteStr, 10);
}

/**
 * Gets the current day name and time in minutes for the America/Toronto timezone.
 */
function getTorontoTime(now: Date): { dayName: string; minutesSinceMidnight: number } {
  // Use Intl.DateTimeFormat to get Toronto-local time parts
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Toronto',
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const dayName = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);

  // Intl may return hour 24 for midnight — normalize to 0
  const normalizedHour = hour === 24 ? 0 : hour;

  return {
    dayName,
    minutesSinceMidnight: normalizedHour * 60 + minute,
  };
}

/**
 * Determines if the shop is currently open based on the America/Toronto timezone.
 * @param hours - Array of DayHours objects for each day of the week
 * @param now - Optional override for current time (for testing)
 * @returns OpenNowResult with isOpen status and next opening info if closed
 */
export function getOpenNowStatus(hours: DayHours[], now?: Date): OpenNowResult {
  const currentDate = now ?? new Date();
  const { dayName, minutesSinceMidnight } = getTorontoTime(currentDate);

  // Find today's hours entry
  const todayHours = hours.find((h) => h.day === dayName);

  // Determine if currently open
  let isOpen = false;

  if (todayHours && todayHours.open !== null && todayHours.close !== null) {
    const openMinutes = timeToMinutes(todayHours.open);
    const closeMinutes = timeToMinutes(todayHours.close);

    // Opening time is INCLUSIVE, closing time is EXCLUSIVE
    // At exactly 19:00 (closeMinutes), the shop is closed
    if (minutesSinceMidnight >= openMinutes && minutesSinceMidnight < closeMinutes) {
      isOpen = true;
    }
  }

  const result: OpenNowResult = {
    isOpen,
    currentDay: dayName,
  };

  // If closed, find the next opening
  if (!isOpen) {
    const nextOpening = findNextOpening(hours, dayName, minutesSinceMidnight, todayHours);
    if (nextOpening) {
      result.nextOpening = nextOpening;
    }
  }

  return result;
}

/**
 * Finds the next opening day and time by cycling through subsequent days.
 */
function findNextOpening(
  hours: DayHours[],
  currentDayName: string,
  currentMinutes: number,
  todayHours: DayHours | undefined
): { day: string; time: string } | undefined {
  // First, check if today still has an upcoming opening (before open time)
  if (todayHours && todayHours.open !== null && todayHours.close !== null) {
    const openMinutes = timeToMinutes(todayHours.open);
    if (currentMinutes < openMinutes) {
      return {
        day: todayHours.day,
        time: formatTimeDisplay(todayHours.open),
      };
    }
  }

  // Otherwise, look at subsequent days (up to 7 days ahead)
  const currentDayIndex = DAYS_OF_WEEK.indexOf(currentDayName as typeof DAYS_OF_WEEK[number]);
  if (currentDayIndex === -1) return undefined;

  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDayName = DAYS_OF_WEEK[nextDayIndex];
    const nextDayHours = hours.find((h) => h.day === nextDayName);

    if (nextDayHours && nextDayHours.open !== null) {
      return {
        day: nextDayHours.day,
        time: formatTimeDisplay(nextDayHours.open),
      };
    }
  }

  // No opening found (all days closed — unlikely but handle gracefully)
  return undefined;
}
