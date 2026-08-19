import { useEffect, useRef, useState } from "react";
import {
  Outlet,
  NavLink,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileCheck2,
  Award,
  Bell,
  LogOut,
  ChevronsLeft,
  ChevronsRight,
  Menu,
  X,
  GraduationCap,
  Building2,
  Hash,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/**
 * NAV_ITEMS
 * Single source of truth for both the desktop sidebar and the mobile
 * bottom-navigation bar so the two stay in sync.
 */
const NAV_ITEMS = [
  { label: "Dashboard", to: "/student", end: true, icon: LayoutDashboard },
  { label: "My Events", to: "/student/events", icon: CalendarCheck },
  { label: "Team Hub", to: "/student/team", icon: Users },
  { label: "Submissions", to: "/student/submissions", icon: FileCheck2 },
  { label: "Certificates", to: "/student/certificates", icon: Award },
];

const SESSION_KEY = "noesis_student_session";

/**
 * getStudentSession
 * Reads the mock auth session from localStorage. Swap this out for a
 * real auth check (JWT / Firebase / session cookie) when the backend
 * is wired up — the rest of the layout only cares about the shape
 * returned here.
 */
function getStudentSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.uid) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Dev convenience: seed a mock session so /student is explorable
 *  without a login backend yet. Remove once real auth lands. */
function seedMockSessionIfMissing() {
  if (getStudentSession()) return;
  const mock = {
    uid: "N26-STU-88421",
    name: "Aarav Mehta",
    email: "aarav.mehta@example.edu",
    college: "Vishwakarma Institute of Technology",
    rollNo: "VIT23CS091",
    verified: false,
    registeredEvents: 4,
    avatarInitials: "AM",
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(mock));
}

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Verification pending",
    detail: "Your fest pass is awaiting on-campus verification.",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    title: "Team Hub update",
    detail: "A teammate joined your Hackathon squad.",
    time: "5h ago",
    unread: true,
  },
  {
    id: 3,
    title: "Submission reminder",
    detail: "Round 1 deliverable closes in 2 days.",
    time: "1d ago",
    unread: false,
  },
];

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [student] = useState(() => {
    // Dev convenience: seed a mock session so /student is explorable
    // without a login backend yet. Remove once real auth lands.
    seedMockSessionIfMissing();
    return getStudentSession();
  });
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Close mobile drawer / notification popover on route change. Adjusted
  // during render (React's recommended pattern for state that must reset
  // in response to a prop/route change) rather than in an effect, so
  // there's no extra render pass.
  const [lastPathname, setLastPathname] = useState(location.pathname);
  if (location.pathname !== lastPathname) {
    setLastPathname(location.pathname);
    setMobileNavOpen(false);
    setNotifOpen(false);
  }

  // Click-outside to close the notifications popover.
  useEffect(() => {
    function onClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    navigate("/login", { replace: true });
  };

  // Guard the whole /student/* tree. Once real auth exists, drop the
  // dev-seed effect above and this will redirect unauthenticated users.
  if (!student) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-spidey-canvas text-spidey-white flex">
      {/* Ambient backdrop, consistent with the public site */}
      <div className="fixed inset-0 -z-10 radial-mesh opacity-70" aria-hidden />
      <div
        className="fixed inset-0 -z-10 grid-overlay opacity-[0.08]"
        aria-hidden
      />

      {/* ---------------------------------------------------------------- */}
      {/* Desktop sidebar                                                  */}
      {/* ---------------------------------------------------------------- */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 264 }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="hidden lg:flex flex-col shrink-0 h-screen sticky top-0 z-30 border-r border-spidey-white/10 bg-spidey-blue/80 backdrop-blur-md"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-spidey-white/10">
          <div className="relative w-10 h-10 shrink-0 rounded-lg bg-spidey-blue border-2 border-spidey-red flex items-center justify-center">
            <span className="font-mono font-black text-spidey-red text-sm tracking-tighter">
              N26
            </span>
            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-spidey-cyan/70" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-spidey-cyan/70" />
          </div>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden leading-tight whitespace-nowrap"
              >
                <p className="font-bold text-sm">
                  Noesis <span className="text-spidey-cyan">'26</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-spidey-white/50 font-mono">
                  Student Portal
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.to} item={item} collapsed={collapsed} />
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-spidey-white/10">
          <button
            onClick={() => setCollapsed((v) => !v)}
            data-cursor="interactive"
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-spidey-white/60 hover:text-spidey-cyan hover:bg-spidey-white/5 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronsRight size={18} />
            ) : (
              <ChevronsLeft size={18} />
            )}
            {!collapsed && <span className="text-xs font-mono">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile sidebar drawer                                            */}
      {/* ---------------------------------------------------------------- */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-[60] bg-spidey-canvas/90 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="fixed top-0 left-0 z-[70] h-full w-[78%] max-w-xs bg-spidey-blue border-r border-spidey-white/10 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-5 border-b border-spidey-white/10">
                <p className="font-bold">
                  Noesis <span className="text-spidey-cyan">'26</span>
                </p>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 rounded-lg border border-spidey-white/15"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 px-3 py-5 flex flex-col gap-1.5">
                {NAV_ITEMS.map((item) => (
                  <SidebarLink key={item.to} item={item} collapsed={false} />
                ))}
              </nav>
              <div className="p-4 border-t border-spidey-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-spidey-red/15 border border-spidey-red/40 text-spidey-red-light py-3 font-semibold text-sm"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------- */}
      {/* Main column                                                      */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-spidey-white/10 bg-spidey-canvas/80 backdrop-blur-md">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-spidey-white/15 text-spidey-white shrink-0"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-spidey-white/40 font-mono">
                Welcome back
              </p>
              <h1 className="text-sm sm:text-base font-bold text-spidey-white truncate">
                {student.name}
              </h1>
              <div className="hidden sm:flex items-center gap-3 mt-0.5 text-[11px] text-spidey-white/50 font-mono">
                <span className="flex items-center gap-1 truncate max-w-[220px]">
                  <Building2 size={11} className="text-spidey-cyan shrink-0" />
                  {student.college}
                </span>
                <span className="flex items-center gap-1">
                  <Hash size={11} className="text-spidey-cyan shrink-0" />
                  {student.rollNo}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                data-cursor="interactive"
                className="relative p-2.5 rounded-lg border border-spidey-white/15 text-spidey-white hover:text-spidey-cyan hover:border-spidey-cyan/40 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-spidey-red text-[9px] font-bold flex items-center justify-center shadow-[0_0_10px_rgba(229,27,35,0.7)]">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 max-w-[88vw] rounded-brutal border border-spidey-white/10 glass border-glow-cyan overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-spidey-white/10 flex items-center justify-between">
                      <p className="text-sm font-semibold">Notifications</p>
                      <span className="text-[10px] font-mono text-spidey-white/40">
                        {unreadCount} new
                      </span>
                    </div>
                    <ul className="max-h-72 overflow-y-auto divide-y divide-spidey-white/5">
                      {MOCK_NOTIFICATIONS.map((n) => (
                        <li
                          key={n.id}
                          className="px-4 py-3 hover:bg-spidey-white/5 transition-colors"
                        >
                          <div className="flex items-start gap-2">
                            {n.unread && (
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-spidey-cyan shrink-0" />
                            )}
                            <div className={n.unread ? "" : "pl-3.5"}>
                              <p className="text-sm font-medium text-spidey-white">
                                {n.title}
                              </p>
                              <p className="text-xs text-spidey-white/55 mt-0.5">
                                {n.detail}
                              </p>
                              <p className="text-[10px] text-spidey-white/35 mt-1 font-mono">
                                {n.time}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-spidey-surface border border-spidey-cyan/40 items-center justify-center font-mono text-xs font-bold text-spidey-cyan">
              {student.avatarInitials ||
                student.name?.slice(0, 2).toUpperCase()}
            </div>

            {/* Logout (desktop) */}
            <button
              onClick={handleLogout}
              data-cursor="interactive"
              className="hidden sm:flex items-center gap-1.5 rounded-full border border-spidey-red/40 bg-spidey-red/10 text-spidey-red-light px-4 py-2.5 text-xs font-semibold hover:bg-spidey-red/20 transition-colors"
            >
              <LogOut size={14} /> Log Out
            </button>
          </div>
        </header>

        {/* Routed page content */}
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 lg:pb-6">
          <Outlet context={{ student }} />
        </main>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Mobile bottom navigation                                        */}
      {/* ---------------------------------------------------------------- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-spidey-blue/95 backdrop-blur-md border-t border-spidey-white/10 px-1.5 py-1.5">
        <ul className="flex items-center justify-between">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.end}
                className="relative flex flex-col items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-mono"
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="student-bottom-nav-pill"
                        className="absolute inset-x-2 inset-y-0.5 rounded-lg bg-spidey-red/15 border border-spidey-red/40"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <item.icon
                      size={19}
                      strokeWidth={2.25}
                      className={`relative z-10 ${
                        isActive
                          ? "text-spidey-red-light"
                          : "text-spidey-white/60"
                      }`}
                    />
                    <span
                      className={`relative z-10 truncate max-w-[64px] ${
                        isActive
                          ? "text-spidey-red-light"
                          : "text-spidey-white/50"
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function SidebarLink({ item, collapsed }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      data-cursor="interactive"
      className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 group"
      title={collapsed ? item.label : undefined}
    >
      {({ isActive }) => (
        <>
          <span
            aria-hidden
            className={`absolute inset-0 rounded-lg transition-colors ${
              isActive
                ? "bg-spidey-red/15 border border-spidey-red/40"
                : "border border-transparent group-hover:bg-spidey-white/5"
            }`}
          />
          <item.icon
            size={19}
            strokeWidth={2.25}
            className={`relative z-10 shrink-0 ${
              isActive
                ? "text-spidey-red-light"
                : "text-spidey-white/65 group-hover:text-spidey-white"
            }`}
          />
          {!collapsed && (
            <span
              className={`relative z-10 text-sm font-medium truncate ${
                isActive
                  ? "text-spidey-white"
                  : "text-spidey-white/75 group-hover:text-spidey-white"
              }`}
            >
              {item.label}
            </span>
          )}
          {isActive && (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-spidey-red shadow-[0_0_8px_1px_rgba(229,27,35,0.6)] z-10"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

// Re-exported so pages can badge verified/unverified state consistently.
export { ShieldCheck, GraduationCap, Sparkles };
