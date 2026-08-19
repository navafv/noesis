import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy,
  Save,
  Check,
  Trash2,
  Crown,
  Medal,
  ChevronDown,
} from "lucide-react";
import { EVENTS } from "../../data/eventsData";

/**
 * Rubric definition per event category. Falls back to DEFAULT_RUBRIC
 * for events that don't define one. `max` is the ceiling used both
 * for the input and the tally bar; `weight` lets a coordinator flag
 * a criterion as heavier without changing the UI.
 */
const DEFAULT_RUBRIC = [
  { key: "logic", label: "Logic", max: 25 },
  { key: "ui", label: "UI / Presentation", max: 25 },
  { key: "speed", label: "Speed", max: 25 },
  { key: "penalty", label: "Penalty", max: 25, isPenalty: true },
];

const RUBRICS_BY_EVENT = {
  coding: [
    { key: "logic", label: "Logic", max: 40 },
    { key: "speed", label: "Speed", max: 30 },
    { key: "penalty", label: "Penalty", max: 30, isPenalty: true },
  ],
  "web-designing": [
    { key: "ui", label: "UI / Design", max: 40 },
    { key: "logic", label: "Functionality", max: 35 },
    { key: "penalty", label: "Penalty", max: 25, isPenalty: true },
  ],
};

/** Mock participants/teams per event — swap for a real registrations query. */
const PARTICIPANTS_BY_EVENT = {
  coding: [
    { id: "T-01", name: "Team ByteForce" },
    { id: "T-02", name: "Team NullPointer" },
    { id: "T-03", name: "Aarav Mehta (Solo)" },
    { id: "T-04", name: "Team Segfault" },
  ],
  "web-designing": [
    { id: "T-11", name: "Ishita Rao" },
    { id: "T-12", name: "Team Pixel Pushers" },
    { id: "T-13", name: "Neha Deshmukh" },
  ],
  debugging: [
    { id: "T-21", name: "Kabir Shah" },
    { id: "T-22", name: "Team StackTrace" },
  ],
  gaming: [
    { id: "T-31", name: "Team Cyber Wolves" },
    { id: "T-32", name: "Team GG Easy" },
    { id: "T-33", name: "Devansh Patel" },
  ],
};

function getRubric(eventId) {
  return RUBRICS_BY_EVENT[eventId] || DEFAULT_RUBRIC;
}

function getParticipants(eventId) {
  return PARTICIPANTS_BY_EVENT[eventId] || [];
}

function tallyScore(rubric, scores) {
  return rubric.reduce((sum, r) => {
    const v = Number(scores?.[r.key]) || 0;
    return sum + (r.isPenalty ? -v : v);
  }, 0);
}

export default function LiveScoringPage() {
  useOutletContext();

  const scorableEvents = EVENTS; // all events are scorable in this view
  const [eventId, setEventId] = useState(scorableEvents[0]?.id || "");
  const [eventPickerOpen, setEventPickerOpen] = useState(false);

  // scoresByEntry: { [participantId]: { [rubricKey]: number, savedAt } }
  const [scoresByEvent, setScoresByEvent] = useState({});
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [draft, setDraft] = useState({});
  const [savedFlash, setSavedFlash] = useState(null);

  const activeEvent = scorableEvents.find((e) => e.id === eventId);
  const rubric = getRubric(eventId);
  const participants = getParticipants(eventId);
  const eventScores = useMemo(
    () => scoresByEvent[eventId] || {},
    [scoresByEvent, eventId],
  );

  const leaderboard = useMemo(() => {
    return participants
      .map((p) => {
        const s = eventScores[p.id];
        const total = s ? tallyScore(rubric, s) : null;
        return { ...p, total, scored: s != null };
      })
      .sort((a, b) => (b.total ?? -Infinity) - (a.total ?? -Infinity));
  }, [participants, eventScores, rubric]);

  const maxPossible = rubric
    .filter((r) => !r.isPenalty)
    .reduce((s, r) => s + r.max, 0);

  function openEntry(participant) {
    setActiveEntryId(participant.id);
    const existing = eventScores[participant.id];
    const initial = {};
    rubric.forEach((r) => {
      initial[r.key] = existing?.[r.key] ?? "";
    });
    setDraft(initial);
  }

  function handleDraftChange(key, value, max) {
    const num = value === "" ? "" : Math.max(0, Math.min(max, Number(value)));
    setDraft((prev) => ({ ...prev, [key]: num }));
  }

  function draftTotal() {
    return tallyScore(rubric, draft);
  }

  function saveEntry() {
    if (!activeEntryId) return;
    setScoresByEvent((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [activeEntryId]: { ...draft, savedAt: Date.now() },
      },
    }));
    setSavedFlash(activeEntryId);
    setTimeout(
      () => setSavedFlash((cur) => (cur === activeEntryId ? null : cur)),
      1800,
    );
  }

  function clearEntry() {
    if (!activeEntryId) return;
    setScoresByEvent((prev) => {
      const next = { ...(prev[eventId] || {}) };
      delete next[activeEntryId];
      return { ...prev, [eventId]: next };
    });
    setDraft(Object.fromEntries(rubric.map((r) => [r.key, ""])));
  }

  function handleEventChange(id) {
    setEventId(id);
    setEventPickerOpen(false);
    setActiveEntryId(null);
    setDraft({});
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Heading + event select */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
            Command Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
            Live Scoring
          </h1>
          <p className="text-sm text-spidey-white/50 mt-1">
            {participants.length} entries · {Object.keys(eventScores).length}{" "}
            scored
          </p>
        </div>

        {/* Event selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => setEventPickerOpen((v) => !v)}
            data-cursor="interactive"
            className="flex items-center gap-2 rounded-full border border-spidey-white/15 bg-spidey-blue/60 px-4 py-2.5 text-sm text-spidey-white min-w-[220px] justify-between hover:border-spidey-cyan/40 transition-colors"
          >
            <span className="truncate">
              {activeEvent?.title || "Select event"}
            </span>
            <ChevronDown
              size={15}
              className={`shrink-0 transition-transform ${eventPickerOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {eventPickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-brutal border border-spidey-white/10 glass border-glow-cyan z-20"
              >
                {scorableEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleEventChange(e.id)}
                    data-cursor="interactive"
                    className={`w-full flex items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                      e.id === eventId
                        ? "bg-spidey-cyan/10 text-spidey-cyan"
                        : "text-spidey-white/75 hover:bg-spidey-white/5 hover:text-spidey-white"
                    }`}
                  >
                    {e.icon && <e.icon size={14} className="shrink-0" />}
                    <span className="truncate">{e.title}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-brutal border border-spidey-white/10 glass py-16 flex flex-col items-center gap-3 text-center">
          <Trophy size={28} className="text-spidey-white/30" />
          <p className="text-spidey-white/60 text-sm">
            No entries registered for this event yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Scorecard */}
          <div className="lg:col-span-3 rounded-brutal border border-spidey-white/10 glass p-5 flex flex-col gap-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-spidey-white/45 font-mono mb-2">
                Entries
              </p>
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => {
                  const isActive = activeEntryId === p.id;
                  const scored = eventScores[p.id] != null;
                  return (
                    <button
                      key={p.id}
                      onClick={() => openEntry(p)}
                      data-cursor="interactive"
                      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-spidey-red/15 border-spidey-red/50 text-spidey-white"
                          : scored
                            ? "border-spidey-cyan/30 bg-spidey-cyan/5 text-spidey-cyan"
                            : "border-spidey-white/15 text-spidey-white/60 hover:border-spidey-white/30 hover:text-spidey-white"
                      }`}
                    >
                      {scored && <Check size={11} />}
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-spidey-white/10 pt-5">
              {activeEntryId ? (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-spidey-white">
                      {participants.find((p) => p.id === activeEntryId)?.name}
                    </h3>
                    <span className="text-[10px] font-mono text-spidey-white/40">
                      {activeEvent?.title}
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    {rubric.map((r) => (
                      <div key={r.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor={`rubric-${r.key}`}
                            className={`text-xs font-mono uppercase tracking-[0.08em] ${
                              r.isPenalty
                                ? "text-spidey-red-light"
                                : "text-spidey-white/60"
                            }`}
                          >
                            {r.label}
                          </label>
                          <span className="text-[11px] font-mono text-spidey-white/40">
                            {draft[r.key] === "" || draft[r.key] == null
                              ? 0
                              : draft[r.key]}{" "}
                            / {r.max}
                          </span>
                        </div>
                        <input
                          id={`rubric-${r.key}`}
                          type="range"
                          min={0}
                          max={r.max}
                          value={draft[r.key] === "" ? 0 : (draft[r.key] ?? 0)}
                          onChange={(e) =>
                            handleDraftChange(r.key, e.target.value, r.max)
                          }
                          className={`w-full accent-spidey-cyan ${
                            r.isPenalty
                              ? "accent-spidey-red"
                              : "accent-spidey-cyan"
                          }`}
                        />
                        <input
                          type="number"
                          min={0}
                          max={r.max}
                          value={draft[r.key] ?? ""}
                          onChange={(e) =>
                            handleDraftChange(r.key, e.target.value, r.max)
                          }
                          className="mt-1.5 w-24 rounded-lg bg-spidey-blue/60 border border-spidey-white/15 text-spidey-white text-sm px-2.5 py-1.5 outline-none focus:border-spidey-cyan/50 transition-colors"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Auto-tally */}
                  <div className="rounded-lg border border-spidey-cyan/30 bg-spidey-cyan/5 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-[0.1em] text-spidey-white/60">
                      Total Score
                    </span>
                    <span className="text-xl font-bold text-spidey-cyan font-mono">
                      {draftTotal()}{" "}
                      <span className="text-xs text-spidey-white/40">
                        / {maxPossible}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={saveEntry}
                      data-cursor="interactive"
                      className="flex items-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-5 py-2.5 hover:scale-[1.02] active:scale-95 transition-transform"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {savedFlash === activeEntryId ? (
                          <motion.span
                            key="saved"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Check size={16} /> Saved
                          </motion.span>
                        ) : (
                          <motion.span
                            key="save"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Save size={16} /> Save Score
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                    <button
                      onClick={clearEntry}
                      data-cursor="interactive"
                      className="flex items-center gap-2 rounded-full border border-spidey-red/40 text-spidey-red-light text-sm px-4 py-2.5 hover:bg-spidey-red/10 transition-colors"
                    >
                      <Trash2 size={14} /> Clear
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-spidey-white/45 text-center py-8">
                  Select an entry above to start scoring.
                </p>
              )}
            </div>
          </div>

          {/* Live leaderboard */}
          <div className="lg:col-span-2 rounded-brutal border border-spidey-white/10 glass p-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-spidey-red-light" />
              <h2 className="font-bold text-spidey-white text-sm">
                Projected Leaderboard
              </h2>
            </div>

            <ul className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {leaderboard.map((row, i) => (
                  <motion.li
                    key={row.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 ${
                      i === 0 && row.scored
                        ? "border-spidey-cyan/40 bg-spidey-cyan/5"
                        : "border-spidey-white/10 bg-spidey-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <RankBadge rank={i + 1} scored={row.scored} />
                      <span className="text-sm text-spidey-white/85 truncate">
                        {row.name}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-sm font-bold shrink-0 ${
                        row.scored
                          ? "text-spidey-white"
                          : "text-spidey-white/25"
                      }`}
                    >
                      {row.scored ? row.total : "—"}
                    </span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function RankBadge({ rank, scored }) {
  if (!scored) {
    return (
      <span className="w-6 text-center text-xs font-mono text-spidey-white/30 shrink-0">
        {rank}
      </span>
    );
  }
  if (rank === 1) {
    return <Crown size={16} className="text-spidey-cyan shrink-0" />;
  }
  if (rank === 2 || rank === 3) {
    return (
      <Medal
        size={15}
        className={`shrink-0 ${rank === 2 ? "text-spidey-white/60" : "text-spidey-red-light"}`}
      />
    );
  }
  return (
    <span className="w-6 text-center text-xs font-mono text-spidey-white/40 shrink-0">
      {rank}
    </span>
  );
}
