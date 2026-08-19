/**
 * routes.js
 * Single source of truth for the primary top-level routes shared between
 * the Navbar (desktop + mobile menus) and the Footer's quick-links list.
 * Keeping this in one place means the two never drift out of sync when a
 * route's label or path changes.
 */
export const PRIMARY_ROUTES = [
  { label: "Home", to: "/", end: true },
  { label: "Events", to: "/events" },
  { label: "Schedule", to: "/schedule" },
  { label: "Register", to: "/register" },
];
