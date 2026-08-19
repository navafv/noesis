import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Sparkle, Eye } from "lucide-react";

import SEO from "../components/SEO";
import LiveTag from "../components/LiveTag";
import EventModal from "../components/EventModal";
import { SCHEDULE } from "../data/scheduleData";
import { getEventById } from "../data/eventsData";

const DAY_KEYS = ["day1", "day2"];

// Distinct venues across both days, used to build the venue-indicator legend.
const VENUES = Array.from(
  new Set(
    DAY_KEYS.flatMap((key) => SCHEDULE[key].items.map((item) => item.venue)),
  ),
);

const VENUE_DOT_COLORS = [
  "bg-spidey-cyan",
  "bg-spidey-red-light",
  "bg-spidey-white/60",
  "bg-spidey-cyan/60",
  "bg-spidey-red/70",
];

function venueColor(venue) {
  const index = VENUES.indexOf(venue);
  return VENUE_DOT_COLORS[index % VENUE_DOT_COLORS.length];
}

/**
 * SchedulePage.jsx
 * Dedicated Day 1 vs Day 2 timeline. Adds a "track" filter (by tag —
 * Technical, Design, Gaming, etc.) on top of the existing day switcher,
 * plus a venue-indicator legend so participants can plan movement
 * between labs/halls at a glance. Timeline items that map back to a
 * competitive event (`linkedEventId`) open the shared EventModal for
 * full details.
 */
export default function SchedulePage() {
  const [activeDay, setActiveDay] = useState("day1");
  const [activeTrack, setActiveTrack] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const day = SCHEDULE[activeDay];

  const tracks = useMemo(() => {
    const tags = new Set(["All"]);
    DAY_KEYS.forEach((key) =>
      SCHEDULE[key].items.forEach((item) => tags.add(item.tag)),
    );
    return Array.from(tags);
  }, []);

  const filteredItems = useMemo(() => {
    if (activeTrack === "All") return day.items;
    return day.items.filter((item) => item.tag === activeTrack);
  }, [day, activeTrack]);

  const handleOpenLinkedEvent = (linkedEventId) => {
    if (!linkedEventId) return;
    const event = getEventById(linkedEventId);
    if (event) setSelectedEvent(event);
  };

  return (
    <>
      <SEO
        title="Schedule | Noesis'26 — Full Two-Day Event Timeline"
        description="Full Day 1 & Day 2 schedule for Noesis'26 at Jamia Hamdard Kannur Campus, Sept 30 - Oct 01, 2026 — from the inaugural keynote to the valedictory ceremony."
      />

      <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32 px-4 overflow-hidden">
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] -z-10 rounded-full blur-[130px] opacity-15 bg-spidey-red-light"
          aria-hidden
        />

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <LiveTag className="font-mono text-xs uppercase tracking-[0.3em] text-spidey-cyan mb-3">
              Two Days, Zero Downtime
            </LiveTag>
            <h1 className="heading-scanline font-display font-black text-4xl sm:text-5xl md:text-6xl text-spidey-white tracking-tight">
              Schedule
            </h1>
          </motion.div>

          {/* Day switcher */}
          <div className="flex justify-center mb-8">
            <div className="relative inline-flex items-center gap-1 rounded-full glass p-1.5">
              {DAY_KEYS.map((key) => {
                const isActive = activeDay === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveDay(key)}
                    data-cursor="interactive"
                    className={`relative px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-mono font-semibold transition-colors ${
                      isActive
                        ? "text-spidey-red"
                        : "text-spidey-white/70 hover:text-spidey-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-day-pill"
                        className="absolute inset-0 rounded-full bg-spidey-cyan"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">
                      {SCHEDULE[key].label} — {SCHEDULE[key].date}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Track (tag) filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {tracks.map((tag) => {
              const isActive = activeTrack === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setActiveTrack(tag)}
                  data-cursor="interactive"
                  className={`relative px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-medium border transition-colors ${
                    isActive
                      ? "bg-spidey-cyan text-spidey-canvas border-spidey-cyan"
                      : "border-spidey-white/15 text-spidey-white/65 hover:border-spidey-cyan/40 hover:text-spidey-white"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          {/* Venue indicator legend */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-16 px-4">
            {VENUES.map((venue) => (
              <span
                key={venue}
                className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-spidey-white/45"
              >
                <span className={`w-2 h-2 rounded-full ${venueColor(venue)}`} />
                {venue}
              </span>
            ))}
          </div>

          {/* Timeline */}
          <div className="relative pl-8 sm:pl-10">
            <div className="absolute left-[9px] sm:left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-spidey-cyan/60 via-spidey-white/15 to-transparent overflow-hidden">
              <span className="absolute left-0 top-0 w-full h-16 bg-gradient-to-b from-transparent via-spidey-cyan to-transparent animate-[timeline-pulse_3.2s_ease-in-out_infinite]" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeDay}-${activeTrack}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
              >
                {filteredItems.map((item, i) => (
                  <TimelineNode
                    key={`${activeDay}-${activeTrack}-${i}`}
                    item={item}
                    index={i}
                    onOpenLinkedEvent={() =>
                      handleOpenLinkedEvent(item.linkedEventId)
                    }
                  />
                ))}

                {filteredItems.length === 0 && (
                  <p className="font-mono text-sm text-spidey-white/50 py-10">
                    No sessions in this track for {day.label}.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      </section>
    </>
  );
}

function TimelineNode({ item, index, onOpenLinkedEvent }) {
  const isCeremony = item.tag === "Ceremony";
  const isLinked = Boolean(item.linkedEventId);
  const cardRef = useRef(null);

  const handlePointerMove = (e) => {
    if (isCeremony) return;
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--spot-x", `${x}%`);
    el.style.setProperty("--spot-y", `${y}%`);
    el.style.setProperty("--spot-opacity", "1");
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--spot-opacity", "0");
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative"
    >
      {/* Spider-Sense node — alternates crimson / cyan along the web line,
          colored by venue so the same lab/hall reads consistently. */}
      <div className="absolute -left-8 sm:-left-10 top-1.5 flex items-center justify-center">
        <span className="relative flex h-5 w-5 items-center justify-center">
          {!isCeremony && (
            <span
              className={`animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-50 ${venueColor(item.venue)}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isCeremony ? "bg-spidey-white/40" : venueColor(item.venue)
            }`}
          />
        </span>
      </div>

      <div
        ref={cardRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        onClick={isLinked ? onOpenLinkedEvent : undefined}
        data-cursor={isLinked ? "interactive" : undefined}
        className={`spotlight-card rounded-brutal border px-5 py-4 sm:px-6 sm:py-5 transition-[border-color,transform] duration-300 ${
          isCeremony
            ? "border-spidey-white/10 bg-spidey-white/[0.02]"
            : "border-spidey-white/10 bg-spidey-surface/60 hover:border-spidey-cyan/30 hover:-translate-y-1"
        } ${isLinked ? "cursor-pointer" : ""}`}
      >
        <div className="relative z-10 flex flex-wrap items-center gap-x-3 gap-y-1.5 mb-2">
          <span className="flex items-center gap-1.5 text-spidey-cyan font-mono text-xs sm:text-sm font-semibold">
            <Clock size={13} />
            {item.time}
          </span>
          <span
            className={`text-[10px] font-mono uppercase tracking-[0.12em] rounded-full px-2.5 py-0.5 border ${
              isCeremony
                ? "border-spidey-white/15 text-spidey-white/50"
                : "border-spidey-cyan/25 text-spidey-cyan/90"
            }`}
          >
            {item.tag}
          </span>
          {isCeremony && <Sparkle size={12} className="text-spidey-white/30" />}
        </div>

        <h4 className="relative z-10 font-display font-semibold text-base sm:text-lg text-spidey-white mb-1.5">
          {item.title}
        </h4>

        <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 text-xs text-spidey-white/55">
            <MapPin
              size={12}
              className={
                isCeremony ? "text-spidey-white/40" : "text-spidey-cyan/70"
              }
            />
            {item.venue}
          </span>

          {isLinked && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-spidey-cyan hover:gap-2.5 transition-all">
              <Eye size={13} />
              Event Details
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
