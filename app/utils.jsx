import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export const capitalize = (str) => {
  if (typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatDateToISO = (dateObj) => {
  if (!dateObj) return null;

  const { year, month, day, hour, minute, second, millisecond, offset } = dateObj;

  const sign = offset >= 0 ? "+" : "-";
  const absOffsetMinutes = Math.abs(offset / (1000 * 60));
  const offsetHours = String(Math.floor(absOffsetMinutes / 60)).padStart(2, '0');
  const offsetMins = String(absOffsetMinutes % 60).padStart(2, '0');
  const formattedOffset = `${sign}${offsetHours}:${offsetMins}`;

  const pad = (num, size = 2) => num.toString().padStart(size, '0');

  const isoDate = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(millisecond,3)}${formattedOffset}`;

  return isoDate;
};
