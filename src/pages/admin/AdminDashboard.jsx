import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  IndianRupee,
  Users,
  QrCode,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Clock3,
} from "lucide-react";
import { EVENTS } from "../../data/eventsData";

/**
 * Mock aggregate stats — swap for a real analytics/reporting query
 * once the backend is wired up. Shapes are kept flat & simple so the
 * UI components don't need to change when real data lands.
 */
const REVENUE_STATS = {
  collected: 284650,
  target: 400000,
  pendingVerification: 18400,
  deltaPct: 12.4,
};

const REGISTRATION_STATS = {
  total: 1247,
  individual: 512,
  team: 735,
  deltaPct: 8.1,
};

const CHECKIN_STATS = {
  checkedIn: 683,
  registered: 1247,
  deltaPct: 3.6,
};

/**
 * Per-event registration counts, derived against the real EVENTS list
 * so the distribution bars stay in sync with whatever events exist —
 * counts themselves are mocked pending a real submissions/registrations
 * table.
 */
const EVENT_REGISTRATION_COUNTS = {
  coding: 214,
  debugging: 168,
  "web-designing": 143,
  prompting: 187,
  "it-quiz": 121,
  "treasure-hunt": 96,
  gaming: 176,
  "blind-typing": 88,
  "reel-making": 54,
};

const RECENT_ACTIVITY = [
  {
    id: 1,
    text: "Ishita Rao's payment for Web Designing was approved.",
    time: "6m ago",
  },
  {
    id: 2,
    text: "42 new check-ins recorded at Computer Lab A.",
    time: "22m ago",
  },
  {
    id: 3,
    text: "Spot entry desk registered 9 walk-ins for Gaming / Esports.",
    time: "38m ago",
  },
  {
    id: 4,
    text: "Round 1 scores locked for Coding — Hackathon Finals.",
    time: "1h ago",
  },
];

const currency = (n) =>
  `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function AdminDashboard() {
  const { admin, role } = useOutletContext();

  const revenuePct = Math.min(
    100,
    Math.round((REVENUE_STATS.collected / REVENUE_STATS.target) * 100),
  );
  const checkinPct = Math.round(
    (CHECKIN_STATS.checkedIn / CHECKIN_STATS.registered) * 100,
  );

  const distribution = useMemo(() => {
    const rows = EVENTS.map((e) => ({
      id: e.id,
      title: e.title,
      icon: e.icon,
      tag: e.tag,
      count: EVENT_REGISTRATION_COUNTS[e.id] ?? 0,
    }));
    const max = Math.max(...rows.map((r) => r.count), 1);
    return rows
      .sort((a, b) => b.count - a.count)
      .map((r) => ({ ...r, pct: Math.round((r.count / max) * 100) }));
  }, []);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Heading */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
          Command Center
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
          Welcome back, {admin?.name?.split(" ")[0] || "Admin"}
        </h1>
        <p className="text-sm text-spidey-white/50 mt-1">
          Live snapshot of Noesis&apos;26 —{" "}
          {role === "super_admin" ? "Super Admin" : "Event Coordinator"} view
        </p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={IndianRupee}
          accent="cyan"
          label="Revenue Collected"
          value={currency(REVENUE_STATS.collected)}
          delta={REVENUE_STATS.deltaPct}
          footer={`${currency(REVENUE_STATS.pendingVerification)} pending verification`}
        >
          <ProgressBar pct={revenuePct} accent="cyan" />
          <p className="text-[10px] font-mono text-spidey-white/40 mt-1.5">
            {revenuePct}% of {currency(REVENUE_STATS.target)} target
          </p>
        </MetricCard>

        <MetricCard
          icon={Users}
          accent="red"
          label="Total Registrations"
          value={REGISTRATION_STATS.total.toLocaleString("en-IN")}
          delta={REGISTRATION_STATS.deltaPct}
          footer={`${REGISTRATION_STATS.individual} individual · ${REGISTRATION_STATS.team} team`}
        />

        <MetricCard
          icon={QrCode}
          accent="cyan"
          label="Check-in Rate"
          value={`${checkinPct}%`}
          delta={CHECKIN_STATS.deltaPct}
          footer={`${CHECKIN_STATS.checkedIn} / ${CHECKIN_STATS.registered} checked in`}
        >
          <ProgressBar pct={checkinPct} accent="red" />
        </MetricCard>

        <MetricCard
          icon={Wallet}
          accent="red"
          label="Avg. Ticket Value"
          value={currency(
            Math.round(REVENUE_STATS.collected / REGISTRATION_STATS.total),
          )}
          delta={-2.3}
          footer="Across all paid registrations"
        />
      </div>

      {/* Event distribution + activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Event distribution bars */}
        <div className="lg:col-span-2 rounded-brutal border border-spidey-white/10 glass p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-spidey-cyan" />
              <h2 className="font-bold text-spidey-white text-sm">
                Event Distribution
              </h2>
            </div>
            <span className="text-[10px] font-mono text-spidey-white/40">
              by registrations
            </span>
          </div>

          <div className="flex flex-col gap-3.5">
            {distribution.map((row, i) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    {row.icon && (
                      <row.icon
                        size={13}
                        className="text-spidey-white/40 shrink-0"
                      />
                    )}
                    <span className="text-xs font-medium text-spidey-white/80 truncate">
                      {row.title}
                    </span>
                    <span className="hidden sm:inline text-[9px] uppercase tracking-wide font-mono text-spidey-white/30 shrink-0">
                      {row.tag}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-spidey-white/50 shrink-0 pl-2">
                    {row.count}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-spidey-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{
                      delay: i * 0.03 + 0.1,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className={`h-full rounded-full ${
                      i % 2 === 0
                        ? "bg-gradient-to-r from-spidey-cyan/60 to-spidey-cyan"
                        : "bg-gradient-to-r from-spidey-red/60 to-spidey-red"
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-brutal border border-spidey-white/10 glass p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Clock3 size={16} className="text-spidey-red-light" />
            <h2 className="font-bold text-spidey-white text-sm">
              Recent Activity
            </h2>
          </div>
          <ul className="flex flex-col gap-4">
            {RECENT_ACTIVITY.map((a) => (
              <li key={a.id} className="flex gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-spidey-cyan shrink-0" />
                <div>
                  <p className="text-xs text-spidey-white/80 leading-relaxed">
                    {a.text}
                  </p>
                  <p className="text-[10px] font-mono text-spidey-white/35 mt-0.5">
                    {a.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  accent,
  label,
  value,
  delta,
  footer,
  children,
}) {
  const positive = delta >= 0;
  const accentCls =
    accent === "cyan"
      ? "text-spidey-cyan border-spidey-cyan/30 bg-spidey-cyan/10"
      : "text-spidey-red-light border-spidey-red/30 bg-spidey-red/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-brutal border border-spidey-white/10 glass p-5 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between">
        <span
          className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border ${accentCls}`}
        >
          <Icon size={17} />
        </span>
        <span
          className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold ${
            positive ? "text-spidey-cyan" : "text-spidey-red-light"
          }`}
        >
          {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {Math.abs(delta)}%
        </span>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.1em] text-spidey-white/45 font-mono">
          {label}
        </p>
        <p className="text-2xl font-bold text-spidey-white mt-0.5 tracking-tight">
          {value}
        </p>
      </div>

      {children}

      {footer && (
        <p className="text-[11px] text-spidey-white/45 mt-auto">{footer}</p>
      )}
    </motion.div>
  );
}

function ProgressBar({ pct, accent }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-spidey-white/5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className={`h-full rounded-full ${
          accent === "cyan" ? "bg-spidey-cyan" : "bg-spidey-red"
        }`}
      />
    </div>
  );
}
