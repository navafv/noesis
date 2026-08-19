/**
 * utils.js
 * Small, shared formatting helpers used across pages. Keep this file
 * focused on tiny, dependency-free utilities — anything more involved
 * should get its own module under src/lib/.
 */

/**
 * formatShortTime
 * Formats a Date (defaults to now) as a locale-aware short time string,
 * e.g. "2:45 PM". Centralizes the `toLocaleTimeString` options used by
 * the admin scan/entry logs so they stay in sync.
 */
export function formatShortTime(date = new Date()) {
  return date.toLocaleTimeString(undefined, { timeStyle: "short" });
}
