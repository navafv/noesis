import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trophy,
  Users,
  Clock,
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export default function EventModal({ event, onClose, onRegister }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!event) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [event, handleKeyDown]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-spidey-blue/92 md:bg-spidey-blue/80 md:backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-spidey-red border border-spidey-white/12 md:glass border-glow rounded-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 sm:px-8 pt-6 pb-5 bg-spidey-surface/98 md:bg-spidey-surface/90 md:backdrop-blur-md border-b border-spidey-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-spidey-red border border-spidey-cyan/30 flex items-center justify-center">
                  <event.icon size={22} className="text-spidey-cyan" />
                </div>
                <div>
                  <span className="inline-block text-[10px] font-mono uppercase tracking-[0.15em] text-spidey-cyan mb-1">
                    {event.tag}
                  </span>
                  <h3
                    id="event-modal-title"
                    className="font-display font-bold text-xl sm:text-2xl text-spidey-white leading-tight"
                  >
                    {event.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close event details"
                className="shrink-0 p-2 rounded-lg border border-spidey-white/15 text-spidey-white/70 hover:text-spidey-white hover:border-spidey-cyan/40 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 sm:px-8 py-6 space-y-7">
              {/* Meta grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetaChip
                  icon={Trophy}
                  label="Prize Pool"
                  value={event.prizePool}
                />
                <MetaChip icon={Users} label="Team" value={event.teamSize} />
                <MetaChip
                  icon={Clock}
                  label="Timing"
                  value={`${event.day} • ${event.time}`}
                />
                <MetaChip icon={MapPin} label="Venue" value={event.venue} />
              </div>

              {/* Description */}
              <div>
                <SectionLabel>Overview</SectionLabel>
                <p className="text-spidey-white/75 text-sm leading-relaxed mt-2">
                  {event.longDescription}
                </p>
              </div>

              {/* Guidelines */}
              <div>
                <SectionLabel>Guidelines</SectionLabel>
                <ul className="mt-2 space-y-2">
                  {event.guidelines.map((g, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-spidey-white/75 leading-relaxed"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-spidey-cyan mt-0.5 shrink-0"
                      />
                      {g}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Judging Criteria */}
              <div>
                <SectionLabel>Judgment Criteria</SectionLabel>
                <div className="mt-2 flex flex-wrap gap-2">
                  {event.judgingCriteria.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs font-mono text-spidey-white/70 border border-spidey-white/15 rounded-full px-3 py-1.5"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Coordinator */}
              <div>
                <SectionLabel>Coordinator Contact</SectionLabel>
                <div className="mt-2 flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${event.coordinator.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-sm text-spidey-white/75 hover:text-spidey-cyan transition-colors"
                  >
                    <Phone size={14} className="text-spidey-cyan" />
                    {event.coordinator.phone}
                  </a>
                  <a
                    href={`mailto:${event.coordinator.email}`}
                    className="flex items-center gap-2 text-sm text-spidey-white/75 hover:text-spidey-cyan transition-colors"
                  >
                    <Mail size={14} className="text-spidey-cyan" />
                    {event.coordinator.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="sticky bottom-0 px-6 sm:px-8 py-5 bg-spidey-surface/98 md:bg-spidey-surface/90 md:backdrop-blur-md border-t border-spidey-white/10">
              <a
                href={onRegister ? undefined : `#register?event=${event.id}`}
                onClick={(e) => {
                  if (onRegister) {
                    e.preventDefault();
                    onRegister(event.id);
                  } else {
                    onClose();
                  }
                }}
                data-cursor="interactive"
                className="liquid-shine group flex items-center justify-center gap-2 w-full rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-6 py-3.5 hover:scale-[1.02] active:scale-95 transition-transform animate-pulse-glow cursor-pointer"
              >
                Register for {event.title}
                <ArrowUpRight
                  size={16}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const SectionLabel = ({ children }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-spidey-white/40">
    {children}
  </p>
);

const MetaChip = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-spidey-white/10 bg-spidey-white/[0.03] px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-spidey-white/40 mb-1">
      <Icon size={12} />
      <span className="text-[9px] font-mono uppercase tracking-[0.12em]">
        {label}
      </span>
    </div>
    <p className="text-spidey-white text-xs sm:text-sm font-semibold leading-tight">
      {value}
    </p>
  </div>
);
