/**
 * Formatting utilities for ASM AUTO Repair website.
 * Handles phone numbers, dates, times, WhatsApp URLs, text truncation, and slug generation.
 */

/**
 * Formats a phone number from "+14165168181" to "(416) 516-8181".
 * Strips the country code (+1) and formats as (XXX) XXX-XXXX.
 */
export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If 11 digits starting with 1, strip the country code
  const local = digits.length === 11 && digits.startsWith('1')
    ? digits.slice(1)
    : digits;

  if (local.length !== 10) {
    return phone; // Return original if we can't parse it
  }

  const area = local.slice(0, 3);
  const prefix = local.slice(3, 6);
  const line = local.slice(6, 10);

  return `(${area}) ${prefix}-${line}`;
}

/**
 * Formats a date to a readable string like "January 15, 2025".
 * Accepts a Date object or a date string parseable by the Date constructor.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a 24-hour time string to 12-hour format with a.m./p.m.
 * Examples: "14:00" → "2 p.m.", "10:00" → "10 a.m.", "12:30" → "12:30 p.m."
 */
export function formatTime(time: string): string {
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  const period = hour >= 12 ? 'p.m.' : 'a.m.';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

  if (minute === 0) {
    return `${displayHour} ${period}`;
  }

  const displayMinute = minuteStr.padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Constructs a valid WhatsApp URL with a pre-filled message.
 * Base URL: https://wa.me/14165168181
 * Message includes visitor name and work type, plus optional vehicle info.
 */
export function buildWhatsAppUrl(data: {
  name: string;
  workType: string;
  year?: number;
  brand?: string;
  model?: string;
}): string {
  const lines = [
    "Hi ASM AUTO Repair, I'd like a quote.",
    `Name: ${data.name}`,
    `Work: ${data.workType}`,
  ];

  if (data.year || data.brand || data.model) {
    const carParts = [data.year, data.brand, data.model]
      .filter(Boolean)
      .join(' ');
    lines.push(`Car: ${carParts}`);
  }

  const message = lines.join('\n');
  const encoded = encodeURIComponent(message);

  return `https://wa.me/13435585301?text=${encoded}`;
}

/**
 * Truncates text to maxLength characters without cutting mid-word.
 * Appends "..." if truncated.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  // Find the last space within the maxLength boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // If there's a space to break at, use it; otherwise hard-truncate
  const breakPoint = lastSpace > 0 ? lastSpace : maxLength;

  return text.slice(0, breakPoint) + '...';
}

/**
 * Converts a title to a URL-safe slug.
 * Lowercase, spaces to hyphens, remove special characters, collapse multiple hyphens.
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Collapse multiple hyphens
    .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens
}
