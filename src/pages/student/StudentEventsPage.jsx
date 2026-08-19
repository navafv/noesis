import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Users,
  Phone,
  Mail,
  ShieldCheck,
  ShieldAlert,
  Hourglass,
  Search,
  CalendarDays,
} from "lucide-react";

/**
 * Mock registrations — swap for a real "my registrations" query keyed
 * off the logged-in student's uid. Shape mirrors src/data/eventsData.js
 * (coordinator block) plus per-registration fields (team, verification).
 */
const MOCK_REGISTRATIONS = [
  {
    id: "coding",
    title: "Coding",
    day: "Day 1",
    time: "10:30 AM",
    venue: "Computer Lab A",
    mode: "Individual / Team",
    team: { status: "solo" }, // solo | complete | incomplete
    entryStatus: "verified", // verified | pending
    coordinator: {
      name: "Rhea Kulkarni",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "hackathon",
    title: "CodeStorm — Hackathon Finals",
    day: "Day 2",
    time: "09:00 AM",
    venue: "Main Auditorium",
    mode: "Team",
    team: { status: "complete", size: "4/4 Members" },
    entryStatus: "verified",
    coordinator: {
      name: "Aditya Rao",
      phone: "+91 98220 44017",
      email: "hackathon.noesis26@gmail.com",
    },
  },
  {
    id: "web-design",
    title: "Web Designing",
    day: "Day 1",
    time: "02:00 PM",
    venue: "Design Studio, Block C",
    mode: "Team",
    team: { status: "incomplete", size: "1/2 Members" },
    entryStatus: "pending",
    coordinator: {
      name: "Neha Deshmukh",
      phone: "+91 90210 33564",
      email: "webdesign.noesis26@gmail.com",
    },
  },
  {
    id: "reel-making",
    title: "Reel Making",
    day: "Day 2",
    time: "11:00 AM",
    venue: "Media Lab",
    mode: "Individual / Team",
    team: { status: "solo" },
    entryStatus: "pending",
    coordinator: {
      name: "Kabir Shah",
      phone: "+91 97690 12245",
      email: "reels.noesis26@gmail.com",
    },
  },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "verified", label: "Verified" },
  { key: "pending", label: "Pending" },
];

export default function StudentEventsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    return MOCK_REGISTRATIONS.filter((ev) => {
      const matchesQuery = ev.title
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesFilter = filter === "all" || ev.entryStatus === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
            Student Portal
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
            My Events
          </h1>
          <p className="text-sm text-spidey-white/50 mt-1">
            {MOCK_REGISTRATIONS.length} registered ·{" "}
            {
              MOCK_REGISTRATIONS.filter((e) => e.entryStatus === "verified")
                .length
            }{" "}
            verified for entry
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-spidey-white/35"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your events..."
            className="w-full rounded-lg bg-spidey-blue/60 border border-spidey-white/15 text-spidey-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-spidey-cyan/50 transition-colors placeholder:text-spidey-white/30"
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            data-cursor="interactive"
            className={`rounded-full px-4 py-1.5 text-xs font-mono font-semibold border transition-colors ${
              filter === f.key
                ? "bg-spidey-cyan text-spidey-canvas border-spidey-cyan"
                : "border-spidey-white/15 text-spidey-white/60 hover:text-spidey-white hover:border-spidey-white/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ev, i) => (
            <EventRegistrationCard key={ev.id} event={ev} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventRegistrationCard({ event, index }) {
  const verified = event.entryStatus === "verified";

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
      className="relative rounded-brutal border border-spidey-white/10 glass overflow-hidden flex flex-col"
    >
      {/* Comic-corner accents */}
      <span className="absolute top-2.5 left-2.5 w-3 h-3 border-t border-l border-spidey-cyan/40 z-10" />
      <span className="absolute top-2.5 right-2.5 w-3 h-3 border-t border-r border-spidey-cyan/40 z-10" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-spidey-white/10">
        <div>
          <h3 className="font-bold text-spidey-white text-base leading-snug">
            {event.title}
          </h3>
          <p className="text-[11px] font-mono text-spidey-white/45 mt-1">
            {event.mode}
          </p>
        </div>
        <EntryStatusBadge verified={verified} />
      </div>

      {/* Details */}
      <div className="px-5 py-4 flex flex-col gap-2.5 text-sm text-spidey-white/75 flex-1">
        <DetailRow icon={CalendarDays} label={`${event.day} · ${event.time}`} />
        <DetailRow icon={MapPin} label={event.venue} />
        <TeamStatusRow team={event.team} />
      </div>

      {/* Coordinator footer */}
      <div className="px-5 py-3.5 border-t border-spidey-white/10 bg-spidey-white/[0.03] flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.12em] text-spidey-white/40 font-mono">
            Coordinator
          </p>
          <p className="text-xs font-semibold text-spidey-white truncate">
            {event.coordinator.name}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`tel:${event.coordinator.phone.replace(/\s+/g, "")}`}
            data-cursor="interactive"
            aria-label={`Call ${event.coordinator.name}`}
            className="p-2 rounded-lg border border-spidey-white/15 text-spidey-white/70 hover:text-spidey-cyan hover:border-spidey-cyan/40 transition-colors"
          >
            <Phone size={14} />
          </a>
          <a
            href={`mailto:${event.coordinator.email}`}
            data-cursor="interactive"
            aria-label={`Email ${event.coordinator.name}`}
            className="p-2 rounded-lg border border-spidey-white/15 text-spidey-white/70 hover:text-spidey-cyan hover:border-spidey-cyan/40 transition-colors"
          >
            <Mail size={14} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

function DetailRow({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon size={15} className="text-spidey-cyan shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}

function TeamStatusRow({ team }) {
  if (team.status === "solo") {
    return (
      <div className="flex items-center gap-2.5">
        <Users size={15} className="text-spidey-cyan shrink-0" />
        <span>Solo entry — no team required</span>
      </div>
    );
  }

  const complete = team.status === "complete";
  return (
    <div className="flex items-center gap-2.5">
      <Users
        size={15}
        className={`shrink-0 ${complete ? "text-spidey-cyan" : "text-spidey-red-light"}`}
      />
      <span>
        Team {complete ? "complete" : "incomplete"}
        {team.size ? ` · ${team.size}` : ""}
      </span>
    </div>
  );
}

function EntryStatusBadge({ verified }) {
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold whitespace-nowrap ${
        verified
          ? "border-spidey-cyan/50 bg-spidey-cyan/10 text-spidey-cyan"
          : "border-spidey-red/50 bg-spidey-red/10 text-spidey-red-light"
      }`}
    >
      {verified ? <ShieldCheck size={11} /> : <ShieldAlert size={11} />}
      {verified ? "Verified" : "Pending"}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="rounded-brutal border border-dashed border-spidey-white/15 py-16 flex flex-col items-center gap-3 text-center">
      <Hourglass size={28} className="text-spidey-white/30" />
      <p className="text-spidey-white/60 text-sm">
        No events match your search.
      </p>
    </div>
  );
}
