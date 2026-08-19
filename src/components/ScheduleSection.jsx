import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, Sparkle } from "lucide-react";
import { SCHEDULE } from "../data/scheduleData";
import LiveTag from "./LiveTag";

const DAY_KEYS = ["day1", "day2"];

export default function ScheduleSection() {
  const [activeDay, setActiveDay] = useState("day1");
  const day = SCHEDULE[activeDay];

  return (
    <section
      id="schedule"
      className="relative py-24 sm:py-32 px-4 overflow-hidden"
    >
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] -z-10 rounded-full blur-[130px] opacity-15 bg-spidey-red-light"
        aria-hidden
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <LiveTag className="font-mono text-xs uppercase tracking-[0.3em] text-spidey-cyan mb-3">
            Two Days, Zero Downtime
          </LiveTag>
          <h2 className="heading-scanline font-display font-black text-4xl sm:text-5xl md:text-6xl text-spidey-white tracking-tight">
            Schedule
          </h2>
        </motion.div>

        {/* Day switcher */}
        <div className="flex justify-center mb-16">
          <div className="relative inline-flex items-center gap-1 rounded-full glass p-1.5">
            {DAY_KEYS.map((key) => {
              const isActive = activeDay === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveDay(key)}
                  className={`relative px-5 sm:px-7 py-2.5 rounded-full text-xs sm:text-sm font-mono font-semibold transition-colors ${
                    isActive ? "text-spidey-red" : "text-spidey-white/70 hover:text-spidey-white"
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

        {/* Timeline */}
        <div className="relative pl-8 sm:pl-10">
          {/* Vertical connector with a traveling pulse of light */}
          <div className="absolute left-[9px] sm:left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-spidey-cyan/60 via-spidey-white/15 to-transparent overflow-hidden">
            <span className="absolute left-0 top-0 w-full h-16 bg-gradient-to-b from-transparent via-spidey-cyan to-transparent animate-[timeline-pulse_3.2s_ease-in-out_infinite]" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              {day.items.map((item, i) => (
                <TimelineNode key={`${activeDay}-${i}`} item={item} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function TimelineNode({ item, index }) {
  const isCeremony = item.tag === "Ceremony";
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
      {/* Spider-Sense node — alternates crimson / cyan along the web line */}
      <div className="absolute -left-8 sm:-left-10 top-1.5 flex items-center justify-center">
        <span className="relative flex h-5 w-5 items-center justify-center">
          {!isCeremony && (
            <span
              className={`animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-50 ${
                index % 2 === 0 ? "bg-spidey-cyan" : "bg-spidey-red"
              }`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isCeremony
                ? "bg-spidey-white/40"
                : index % 2 === 0
                  ? "bg-spidey-cyan"
                  : "bg-spidey-red"
            }`}
          />
        </span>
      </div>

      <div
        ref={cardRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        className={`spotlight-card rounded-brutal border px-5 py-4 sm:px-6 sm:py-5 transition-[border-color,transform] duration-300 ${
          isCeremony
            ? "border-spidey-white/10 bg-spidey-white/[0.02]"
            : "border-spidey-white/10 bg-spidey-surface/60 hover:border-spidey-cyan/30 hover:-translate-y-1"
        }`}
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

        <span className="relative z-10 flex items-center gap-1.5 text-xs text-spidey-white/55">
          <MapPin size={12} className="text-spidey-cyan/70" />
          {item.venue}
        </span>
      </div>
    </motion.div>
  );
}
