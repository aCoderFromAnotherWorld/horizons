import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format milliseconds into a human-readable duration string.
 * @param {number} ms
 * @returns {string} e.g. '0s', '1s', '1m 5s'
 */
export function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

/**
 * Generate a UUID v4 string.
 * @returns {string}
 */
export function generateId() {
  return uuidv4();
}
