import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  KeyRound,
  Crown,
  Copy,
  Check,
  Loader2,
  X,
  Mail,
  ShieldCheck,
  Clock3,
  LogOut,
} from "lucide-react";

/**
 * Mock team store — swap for a real teams API. `null` represents
 * "no team yet" and drives the create/join screen below.
 */
const MOCK_TEAM = {
  id: "TEAM-9X4B2K",
  name: "Web Weavers",
  event: "CodeStorm — Hackathon Finals",
  joinCode: "9X4B2K",
  members: [
    {
      id: 1,
      name: "Aarav Mehta",
      role: "Leader",
      status: "confirmed",
      email: "aarav.mehta@example.edu",
    },
    {
      id: 2,
      name: "Ishita Rao",
      role: "Member",
      status: "confirmed",
      email: "ishita.rao@example.edu",
    },
    {
      id: 3,
      name: "Devansh Patel",
      role: "Member",
      status: "confirmed",
      email: "devansh.patel@example.edu",
    },
    {
      id: 4,
      name: "Sana Iyer",
      role: "Member",
      status: "pending",
      email: "sana.iyer@example.edu",
    },
  ],
  maxSize: 4,
};

export default function StudentTeamPage() {
  const { student } = useOutletContext();

  // Set to MOCK_TEAM to preview the roster view; null previews the
  // create/join flow. Wire both up to a real teams query when ready.
  const [team, setTeam] = useState(null);
  const [mode, setMode] = useState("create"); // create | join
  const [teamName, setTeamName] = useState("");
  const [joinCode, setJoinCode] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleCreateTeam(e) {
    e.preventDefault();
    if (!teamName.trim()) {
      setError("Give your team a name first.");
      return;
    }
    setError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900)); // mock request
    setTeam({
      id: `TEAM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      name: teamName.trim(),
      event: "CodeStorm — Hackathon Finals",
      joinCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      members: [
        {
          id: 1,
          name: student.name,
          role: "Leader",
          status: "confirmed",
          email: student.email,
        },
      ],
      maxSize: 4,
    });
    setSubmitting(false);
  }

  async function handleJoinTeam(e) {
    e.preventDefault();
    const code = joinCode.join("");
    if (code.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError("");
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900)); // mock request
    setTeam(MOCK_TEAM);
    setSubmitting(false);
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
          Student Portal
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
          Team Hub
        </h1>
        <p className="text-sm text-spidey-white/50 mt-1">
          Build your squad or link up with an existing one before the deadline.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {team ? (
          <motion.div
            key="roster"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <TeamRoster
              team={team}
              onLeave={() => setTeam(null)}
              currentUserEmail={student.email}
            />
          </motion.div>
        ) : (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-brutal border border-spidey-white/10 glass overflow-hidden"
          >
            {/* Tabs */}
            <div className="relative flex items-center gap-1 p-1.5 m-4 mb-0 rounded-full glass">
              {[
                { key: "create", label: "Create Team", icon: UserPlus },
                { key: "join", label: "Join via Code", icon: KeyRound },
              ].map((tab) => {
                const isActive = mode === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => {
                      setMode(tab.key);
                      setError("");
                    }}
                    data-cursor="interactive"
                    className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-mono font-semibold transition-colors ${
                      isActive
                        ? "text-spidey-red"
                        : "text-spidey-white/65 hover:text-spidey-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="team-tab-pill"
                        className="absolute inset-0 rounded-full bg-spidey-cyan"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <tab.icon size={14} className="relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {mode === "create" ? (
                  <motion.form
                    key="create-form"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleCreateTeam}
                    className="flex flex-col gap-5 max-w-sm mx-auto"
                  >
                    <div className="text-center mb-1">
                      <div className="mx-auto w-12 h-12 rounded-lg bg-spidey-blue border-2 border-spidey-red flex items-center justify-center mb-3">
                        <Users size={20} className="text-spidey-red" />
                      </div>
                      <p className="text-sm text-spidey-white/60">
                        Start a new team — you'll be its Leader and get a
                        shareable join code.
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-spidey-white/50 mb-2">
                        <Users size={13} className="text-spidey-cyan" />
                        Team Name
                      </label>
                      <input
                        value={teamName}
                        onChange={(e) => {
                          setTeamName(e.target.value);
                          setError("");
                        }}
                        placeholder="e.g. Web Weavers"
                        className="w-full rounded-lg bg-spidey-blue/60 border border-spidey-white/15 text-spidey-white text-sm px-4 py-3 outline-none focus:border-spidey-cyan/50 transition-colors placeholder:text-spidey-white/30"
                      />
                    </div>

                    {error && <ErrorText>{error}</ErrorText>}

                    <button
                      type="submit"
                      disabled={submitting}
                      data-cursor="interactive"
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-spidey-red text-spidey-white font-bold text-sm px-6 py-3.5 hover:scale-[1.01] active:scale-95 transition-transform animate-pulse-glow disabled:opacity-70"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />{" "}
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} /> Create Team
                        </>
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.form
                    key="join-form"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleJoinTeam}
                    className="flex flex-col gap-5 max-w-sm mx-auto"
                  >
                    <div className="text-center mb-1">
                      <div className="mx-auto w-12 h-12 rounded-lg bg-spidey-blue border-2 border-spidey-cyan flex items-center justify-center mb-3">
                        <KeyRound size={20} className="text-spidey-cyan" />
                      </div>
                      <p className="text-sm text-spidey-white/60">
                        Ask your team leader for their 6-digit join code.
                      </p>
                    </div>

                    <CodeInput
                      value={joinCode}
                      onChange={setJoinCode}
                      onClearError={() => setError("")}
                    />

                    {error && <ErrorText>{error}</ErrorText>}

                    <button
                      type="submit"
                      disabled={submitting}
                      data-cursor="interactive"
                      className="w-full flex items-center justify-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-6 py-3.5 hover:scale-[1.01] active:scale-95 transition-transform disabled:opacity-70"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />{" "}
                          Joining...
                        </>
                      ) : (
                        <>
                          <KeyRound size={16} /> Join Team
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CodeInput({ value, onChange, onClearError }) {
  const update = (idx, char) => {
    const next = [...value];
    next[idx] = char
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-1)
      .toUpperCase();
    onChange(next);
    onClearError();

    if (char && idx < 5) {
      const el = document.getElementById(`code-${idx + 1}`);
      el?.focus();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !value[idx] && idx > 0) {
      document.getElementById(`code-${idx - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 6)
      .toUpperCase();
    if (!text) return;
    e.preventDefault();
    const next = text.split("");
    while (next.length < 6) next.push("");
    onChange(next);
    onClearError();
  };

  return (
    <div
      className="flex items-center justify-center gap-2"
      onPaste={handlePaste}
    >
      {value.map((char, idx) => (
        <input
          key={idx}
          id={`code-${idx}`}
          value={char}
          onChange={(e) => update(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          maxLength={1}
          inputMode="text"
          className="w-11 h-13 sm:w-12 sm:h-14 text-center rounded-lg bg-spidey-blue/60 border border-spidey-white/15 text-spidey-white text-lg font-mono font-bold outline-none focus:border-spidey-cyan/60 focus:shadow-[0_0_0_1px_rgba(0,210,255,0.4),0_0_16px_rgba(0,210,255,0.25)] transition-colors"
        />
      ))}
    </div>
  );
}

function TeamRoster({ team, onLeave, currentUserEmail }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(team.joinCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <div className="rounded-brutal border border-spidey-white/10 glass overflow-hidden">
      {/* Header */}
      <div className="p-6 sm:p-8 border-b border-spidey-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-spidey-white/40 font-mono mb-1">
            {team.event}
          </p>
          <h2 className="text-xl font-bold text-spidey-white flex items-center gap-2">
            <Users size={20} className="text-spidey-cyan" />
            {team.name}
          </h2>
          <p className="text-xs text-spidey-white/45 mt-1 font-mono">
            {team.members.length}/{team.maxSize} members
          </p>
        </div>

        {/* Join code chip */}
        <div className="flex items-center gap-2 rounded-lg border border-spidey-cyan/40 bg-spidey-cyan/10 px-4 py-2.5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.12em] text-spidey-cyan/70 font-mono">
              Join Code
            </p>
            <p className="text-lg font-mono font-bold text-spidey-cyan tracking-[0.2em]">
              {team.joinCode}
            </p>
          </div>
          <button
            onClick={handleCopy}
            data-cursor="interactive"
            aria-label="Copy join code"
            className="p-2 rounded-md hover:bg-spidey-cyan/15 text-spidey-cyan transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Roster */}
      <ul className="divide-y divide-spidey-white/5">
        {team.members.map((member) => (
          <li
            key={member.id}
            className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                  member.role === "Leader"
                    ? "border-spidey-red/50 bg-spidey-red/10 text-spidey-red-light"
                    : "border-spidey-white/20 bg-spidey-white/5 text-spidey-white/70"
                }`}
              >
                {member.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-spidey-white truncate flex items-center gap-1.5">
                  {member.name}
                  {member.role === "Leader" && (
                    <Crown
                      size={13}
                      className="text-spidey-red-light shrink-0"
                    />
                  )}
                  {member.email === currentUserEmail && (
                    <span className="text-[10px] font-mono text-spidey-cyan/70">
                      (You)
                    </span>
                  )}
                </p>
                <p className="text-xs text-spidey-white/45 flex items-center gap-1 truncate">
                  <Mail size={11} className="shrink-0" />
                  {member.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <RoleBadge role={member.role} />
              <StatusBadge status={member.status} />
            </div>
          </li>
        ))}

        {/* Empty seat placeholders */}
        {Array.from({
          length: Math.max(0, team.maxSize - team.members.length),
        }).map((_, i) => (
          <li
            key={`empty-${i}`}
            className="flex items-center gap-3 px-6 sm:px-8 py-4 text-spidey-white/30"
          >
            <div className="w-10 h-10 rounded-full border border-dashed border-spidey-white/15 flex items-center justify-center shrink-0">
              <UserPlus size={15} />
            </div>
            <p className="text-sm font-mono">
              Open seat — share your join code
            </p>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-6 sm:px-8 py-4 border-t border-spidey-white/10 flex justify-end">
        <button
          onClick={onLeave}
          data-cursor="interactive"
          className="flex items-center gap-1.5 rounded-full border border-spidey-red/40 bg-spidey-red/10 text-spidey-red-light px-4 py-2 text-xs font-semibold hover:bg-spidey-red/20 transition-colors"
        >
          <LogOut size={13} /> Leave Team
        </button>
      </div>
    </div>
  );
}

function RoleBadge({ role }) {
  const isLeader = role === "Leader";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold whitespace-nowrap ${
        isLeader
          ? "border-spidey-red/50 bg-spidey-red/10 text-spidey-red-light"
          : "border-spidey-white/15 bg-spidey-white/5 text-spidey-white/60"
      }`}
    >
      {isLeader && <Crown size={10} />}
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const confirmed = status === "confirmed";
  return (
    <span
      className={`hidden sm:inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold whitespace-nowrap ${
        confirmed
          ? "border-spidey-cyan/50 bg-spidey-cyan/10 text-spidey-cyan"
          : "border-spidey-white/15 bg-spidey-white/5 text-spidey-white/50"
      }`}
    >
      {confirmed ? <ShieldCheck size={11} /> : <Clock3 size={11} />}
      {confirmed ? "Confirmed" : "Pending"}
    </span>
  );
}

function ErrorText({ children }) {
  return (
    <p className="flex items-center justify-center gap-1.5 text-xs text-red-400 -mt-2">
      <X size={12} />
      {children}
    </p>
  );
}
