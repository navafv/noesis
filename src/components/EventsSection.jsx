import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Trophy, Users, ArrowRight, Eye } from "lucide-react";
import { EVENTS, CATEGORIES } from "../data/eventsData";
import EventModal from "./EventModal";
import LiveTag from "./LiveTag";

export default function EventsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = useMemo(() => {
    if (activeCategory === "All") return EVENTS;
    return EVENTS.filter((e) => e.tag === activeCategory);
  }, [activeCategory]);

  const handleQuickRegister = (e, eventId) => {
    e.stopPropagation();
    const target = document.getElementById("register");
    target?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `#register?event=${eventId}`);
  };

  return (
    <section
      id="events"
      className="relative py-24 sm:py-32 px-4 overflow-hidden"
    >
      {/* Ambient background accent */}
      <div
        className="absolute inset-0 -z-10 grid-overlay opacity-20"
        aria-hidden
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] -z-10 rounded-full blur-[120px] opacity-20 bg-emerald"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <LiveTag className="font-mono text-xs uppercase tracking-[0.3em] text-emerald mb-3">
            Compete • Build • Win
          </LiveTag>
          <h2 className="heading-scanline font-display font-black text-4xl sm:text-5xl md:text-6xl text-sand tracking-tight">
            The Events
          </h2>
          <p className="text-sand/60 mt-4 max-w-xl mx-auto text-sm sm:text-base">
            Nine flagship competitions across two days — pick your arena.
          </p>
        </motion.div>

        {/* Category filters */}
        <LayoutGroup id="category-filters">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  data-cursor="interactive"
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium font-mono transition-colors ${
                    isActive
                      ? "text-cyprus-void"
                      : "text-sand/70 hover:text-sand"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-category-pill"
                      className="absolute inset-0 rounded-full bg-emerald"
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

        {/* Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onView={() => setSelectedEvent(event)}
                onQuickRegister={(e) => handleQuickRegister(e, event.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <EventModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
}

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

    // Subtle 3D tilt
    const rx = ((y - 50) / 50) * -6;
    const ry = ((x - 50) / 50) * 6;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
  };

  const handlePointerLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--spot-opacity", "0");
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
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
      className="spotlight-card group relative cursor-pointer rounded-brutal border border-sand/10 bg-surface/60 backdrop-blur-sm px-5 sm:px-6 py-6 overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-emerald/30"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      {/* Icon + tag */}
      <div className="relative z-10 flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-lg bg-cyprus border border-emerald/25 flex items-center justify-center group-hover:border-emerald/50 transition-colors">
          <Icon size={20} className="text-emerald" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-sand/50 border border-sand/15 rounded-full px-2.5 py-1">
          {event.tag}
        </span>
      </div>

      <h3 className="relative z-10 font-display font-bold text-lg sm:text-xl text-sand mb-1.5 leading-snug">
        {event.title}
      </h3>
      <p className="relative z-10 text-sand/55 text-sm leading-relaxed mb-5 line-clamp-2">
        {event.description}
      </p>

      {/* Quick facts */}
      <div className="relative z-10 flex items-center gap-4 mb-6 text-xs text-sand/60 font-mono">
        <span className="flex items-center gap-1.5">
          <Trophy size={13} className="text-emerald" />
          {event.prizePool}
        </span>
        <span className="flex items-center gap-1.5">
          <Users size={13} className="text-emerald" />
          {event.teamSize}
        </span>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex items-center gap-3 pt-4 border-t border-sand/10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          data-cursor="interactive"
          className="flex items-center gap-1.5 text-xs font-semibold text-sand/80 hover:text-emerald transition-colors"
        >
          <Eye size={14} />
          View Details
        </button>
        <span className="w-px h-4 bg-sand/15" />
        <button
          onClick={onQuickRegister}
          data-cursor="interactive"
          className="flex items-center gap-1.5 text-xs font-semibold text-emerald hover:gap-2.5 transition-all ml-auto"
        >
          Quick Register
          <ArrowRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
