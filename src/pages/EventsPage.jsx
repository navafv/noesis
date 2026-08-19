import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Trophy,
  Users,
  ArrowRight,
  Eye,
  Search,
  X,
  Sparkles,
} from "lucide-react";

import SEO from "../components/SEO";
import EventModal from "../components/EventModal";
import LiveTag from "../components/LiveTag";
import { EVENTS, CATEGORIES } from "../data/eventsData";

/**
 * EventsPage.jsx
 * Dedicated showcase for all 9 Noesis'26 events — a sticky filter/search
 * bar, a responsive card grid, a detail modal (EventModal), and direct
 * "Register" actions that route to /register?event=<id> so the
 * registration form can pre-select the chosen event.
 */
export default function EventsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EVENTS.filter((e) => {
      const matchesCategory =
        activeCategory === "All" || e.tag === activeCategory;
      const matchesQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.tag.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  const handleRegister = (eventId) => {
    setSelectedEvent(null);
    navigate(`/register?event=${eventId}`);
  };

  return (
    <>
      <SEO
        title="Events | Noesis'26 — Coding, Hackathons, Gaming & More"
        description="Explore all Noesis'26 events — Coding, Debugging, Web Designing, AI Prompting, IT Quiz, Esports and more. Compete for prize pools worth over ₹65,000 at Jamia Hamdard Kannur Campus."
      />

      <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32 px-4 overflow-hidden">
        {/* Ambient background accent, consistent with the homepage section */}
        <div
          className="absolute inset-0 -z-10 grid-overlay opacity-20"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 comic-halftone opacity-[0.08]"
          aria-hidden
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] -z-10 rounded-full blur-[120px] opacity-20 bg-spidey-cyan"
          aria-hidden
        />

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <LiveTag className="font-mono text-xs uppercase tracking-[0.3em] text-spidey-cyan mb-3">
              Compete • Build • Win
            </LiveTag>
            <h1 className="heading-scanline font-display font-black text-4xl sm:text-5xl md:text-6xl text-spidey-white tracking-tight">
              The Events
            </h1>
            <p className="text-spidey-white/60 mt-4 max-w-xl mx-auto text-sm sm:text-base">
              Nine flagship competitions across two days — pick your arena.
            </p>
          </motion.div>

          <StickyFilterBar
            query={query}
            onQueryChange={setQuery}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            resultCount={filteredEvents.length}
          />

          {/* Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mt-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onView={() => setSelectedEvent(event)}
                  onQuickRegister={(e) => {
                    e.stopPropagation();
                    handleRegister(event.id);
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredEvents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="font-mono text-sm text-spidey-white/50">
                No events match "{query}". Try a different search or category.
              </p>
            </motion.div>
          )}
        </div>

        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
        />
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky filter + search bar                                         */
/* ------------------------------------------------------------------ */

function StickyFilterBar({
  query,
  onQueryChange,
  activeCategory,
  onCategoryChange,
  resultCount,
}) {
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Zero-height sentinel — flips `stuck` the instant the bar reaches
          the top of the viewport, purely for the visual "docked" style. */}
      <div ref={sentinelRef} className="h-px" aria-hidden />

      <div
        className={`sticky top-[76px] sm:top-[88px] z-30 -mx-4 px-4 py-4 transition-all duration-300 ${
          stuck
            ? "bg-spidey-blue/90 md:glass border-b border-spidey-white/10 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          {/* Search input */}
          <div className="relative w-full lg:max-w-xs">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-spidey-white/40"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search events…"
              aria-label="Search events"
              className="w-full rounded-full border border-spidey-white/15 bg-spidey-surface/60 pl-10 pr-9 py-2.5 text-sm text-spidey-white placeholder:text-spidey-white/35 outline-none focus:border-spidey-cyan/50 transition-colors"
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-spidey-white/40 hover:text-spidey-white transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category filters */}
          <LayoutGroup id="events-page-category-filters">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    data-cursor="interactive"
                    onClick={() => onCategoryChange(cat)}
                    className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium font-mono transition-colors ${
                      isActive
                        ? "text-spidey-canvas"
                        : "text-spidey-white/70 hover:text-spidey-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="events-page-active-category-pill"
                        className="absolute inset-0 rounded-full bg-spidey-cyan"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <span className="hidden lg:inline-flex items-center gap-1.5 ml-auto text-xs font-mono text-spidey-white/40 whitespace-nowrap">
            <Sparkles size={12} className="text-spidey-cyan" />
            {resultCount} of {EVENTS_TOTAL} events
          </span>
        </div>
      </div>
    </>
  );
}

const EVENTS_TOTAL = EVENTS.length;

/* ------------------------------------------------------------------ */
/*  Event card                                                         */
/* ------------------------------------------------------------------ */

function EventCard({ event, onView, onQuickRegister }) {
  const Icon = event.icon;
  const cardRef = useRef(null);

  const handlePointerMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--spot-x", `${x}%`);
    el.style.setProperty("--spot-y", `${y}%`);
    el.style.setProperty("--spot-opacity", "1");

    const rx = ((y - 50) / 50) * -6;
    const ry = ((x - 50) / 50) * 6;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--spot-opacity", "0");
    el.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  };

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onClick={onView}
      data-cursor="interactive"
      className="spotlight-card group relative cursor-pointer rounded-brutal border border-spidey-white/10 bg-spidey-surface/60 backdrop-blur-sm px-5 sm:px-6 py-6 overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-spidey-red/40"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {/* Comic-panel corner highlights — glow crimson on hover */}
      <span className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-spidey-red/0 group-hover:border-spidey-red/80 transition-colors duration-300" />
      <span className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-spidey-red/0 group-hover:border-spidey-red/80 transition-colors duration-300" />
      <span className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-spidey-red/0 group-hover:border-spidey-red/80 transition-colors duration-300" />
      <span className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-spidey-red/0 group-hover:border-spidey-red/80 transition-colors duration-300" />

      {/* Icon + tag */}
      <div className="relative z-10 flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-lg bg-spidey-red border border-spidey-cyan/25 flex items-center justify-center group-hover:border-spidey-cyan/50 transition-colors">
          <Icon size={20} className="text-spidey-cyan" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-spidey-white/50 border border-spidey-white/15 rounded-full px-2.5 py-1">
          {event.tag}
        </span>
      </div>

      <h3 className="relative z-10 font-display font-bold text-lg sm:text-xl text-spidey-white mb-1.5 leading-snug">
        {event.title}
      </h3>
      <p className="relative z-10 text-spidey-white/55 text-sm leading-relaxed mb-5 line-clamp-2">
        {event.description}
      </p>

      {/* Quick facts */}
      <div className="relative z-10 flex items-center gap-4 mb-6 text-xs text-spidey-white/60 font-mono">
        <span className="flex items-center gap-1.5 text-spidey-red-light text-glow-red">
          <Trophy size={13} className="text-spidey-red-light" />
          {event.prizePool}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} className="text-spidey-cyan" />
          {event.teamSize}
        </span>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex items-center gap-3 pt-4 border-t border-spidey-white/10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          data-cursor="interactive"
          className="flex items-center gap-1.5 text-xs font-semibold text-spidey-white/80 hover:text-spidey-cyan transition-colors"
        >
          <Eye size={14} />
          View Details
        </button>
        <span className="w-px h-4 bg-spidey-white/15" />
        <button
          onClick={onQuickRegister}
          data-cursor="interactive"
          className="flex items-center gap-1.5 text-xs font-semibold text-spidey-cyan hover:gap-2.5 transition-all ml-auto"
        >
          Register
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
