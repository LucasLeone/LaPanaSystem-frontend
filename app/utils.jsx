import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

export const capitalize = (str) => {
  if (typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getTodayDate = (dateObj) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const hours = String(today.getHours()).padStart(2, "0");
  const minutes = String(today.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  const isoDate = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(millisecond, 3)}${formattedOffset}`;

  return isoDate;
};

export const formatDateForDisplay = (dateInput, showTime = true) => {
  if (!dateInput) return null;

  let dateObj;

  // Asegúrate de que el objeto Date esté en UTC
  if (typeof dateInput === "string") {
    const parts = dateInput.split('-');
    dateObj = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2])); // Meses son 0-based en JavaScript
  } else {
    dateObj = dateInput;
  }

  if (isNaN(dateObj.getTime())) return null;

  const year = dateObj.getUTCFullYear();
  const month = dateObj.getUTCMonth() + 1; // Meses son 0-based
  const day = dateObj.getUTCDate();

  const pad = (num, size = 2) => num.toString().padStart(size, '0');
  const datePart = `${pad(day)}/${pad(month)}/${year}`;

  let formattedDate = datePart;

  if (showTime) {
    const hour = dateObj.getUTCHours();
    const minute = dateObj.getUTCMinutes();
    const timePart = `${pad(hour)}:${pad(minute)}`;
    formattedDate = `${datePart} ${timePart}`;
  }

  return formattedDate;
};

export function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return weekNo;
}