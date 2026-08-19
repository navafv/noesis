import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Home,
  CalendarDays,
  ClipboardList,
  UserPlus,
  LogIn,
  Ticket,
  CalendarCheck,
  Users,
  FileCheck2,
  LayoutDashboard,
  Wallet,
  ScanLine,
  UserPlus2,
  ChevronUp,
  X,
} from "lucide-react";

/**
 * ROUTE_GROUPS
 * Every route in the app, grouped by section, for the dev-only quick
 * navigator below. Keep this in sync with src/App.jsx whenever a route
 * is added, renamed, or removed.
 */
const ROUTE_GROUPS = [
  {
    label: "Public",
    routes: [
      { label: "Home", to: "/", end: true, icon: Home },
      { label: "Events", to: "/events", icon: CalendarDays },
      { label: "Schedule", to: "/schedule", icon: ClipboardList },
      { label: "Register", to: "/register", icon: UserPlus },
      { label: "Login", to: "/login", icon: LogIn },
    ],
  },
  {
    label: "Student Portal",
    routes: [
      { label: "Pass", to: "/student", end: true, icon: Ticket },
      { label: "My Events", to: "/student/events", icon: CalendarCheck },
      { label: "Team", to: "/student/team", icon: Users },
      { label: "Submissions", to: "/student/submissions", icon: FileCheck2 },
    ],
  },
  {
    label: "Admin Command Center",
    routes: [
      { label: "Overview", to: "/admin", end: true, icon: LayoutDashboard },
      { label: "Payments", to: "/admin/payments", icon: Wallet },
      { label: "Scoring", to: "/admin/scoring", icon: ClipboardList },
      { label: "QR Scanner", to: "/admin/scanner", icon: ScanLine },
      { label: "Spot Entry", to: "/admin/spot-entry", icon: UserPlus2 },
    ],
  },
];

/**
 * DevRouteSwitcher
 * A floating, collapsible bottom-right dock that lists every route in
 * the app (public, student, admin) so the whole site can be clicked
 * through in dev without typing URLs. Only ever mounted when
 * `import.meta.env.DEV` is true — see App.jsx — so it never ships to
 * production, but this component also no-ops in production as a
 * defense-in-depth guard in case it's ever imported elsewhere.
 */
export default function DevRouteSwitcher() {
  const [open, setOpen] = useState(false);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] font-mono">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="mb-3 w-72 max-h-[70vh] overflow-y-auto rounded-brutal border border-spidey-cyan/30 bg-spidey-blue/95 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between gap-2 px-4 py-3 border-b border-spidey-white/10 bg-spidey-blue/95 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <Code2 size={14} className="text-spidey-cyan" />
                <p className="text-[11px] uppercase tracking-[0.15em] text-spidey-white/70 font-semibold">
                  Dev Route Navigator
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close dev route navigator"
                className="p-1 rounded-md text-spidey-white/50 hover:text-spidey-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Route groups */}
            <div className="p-3 flex flex-col gap-4">
              {ROUTE_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="px-1 pb-1.5 text-[9px] uppercase tracking-[0.15em] text-spidey-white/35">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-1">
                    {group.routes.map((route) => (
                      <NavLink
                        key={route.to}
                        to={route.to}
                        end={route.end}
                        className="relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors group"
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              aria-hidden
                              className={`absolute inset-0 rounded-lg transition-colors ${
                                isActive
                                  ? "bg-spidey-cyan/15 border border-spidey-cyan/40"
                                  : "border border-transparent group-hover:bg-spidey-white/5"
                              }`}
                            />
                            <route.icon
                              size={13}
                              className={`relative z-10 shrink-0 ${
                                isActive
                                  ? "text-spidey-cyan"
                                  : "text-spidey-white/50 group-hover:text-spidey-white"
                              }`}
                            />
                            <span
                              className={`relative z-10 truncate ${
                                isActive
                                  ? "text-spidey-white font-semibold"
                                  : "text-spidey-white/70 group-hover:text-spidey-white"
                              }`}
                            >
                              {route.label}
                            </span>
                          </>
                        )}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-spidey-white/10">
              <p className="text-[9px] text-spidey-white/30 leading-relaxed">
                Dev-only — never rendered in production builds.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        data-cursor="interactive"
        aria-label={open ? "Close dev route navigator" : "Open dev route navigator"}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-spidey-cyan/40 bg-spidey-red text-spidey-white font-bold text-xs px-4 py-3 shadow-[0_4px_20px_rgba(229,27,35,0.4)] hover:scale-105 active:scale-95 transition-transform"
      >
        {open ? <ChevronUp size={15} /> : <Code2 size={15} />}
        {open ? "Close" : "Dev Routes"}
      </button>
    </div>
  );
}
