import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TerminalSquare, X, Volume2, VolumeX } from "lucide-react";
import { EVENTS } from "../data/eventsData";

const WELCOME = [
  "web-os :: spidey-cli v2.6.0 — Neura IT Club",
  "Type 'help' to see available commands.",
];

const BGM_SRC = "/bgm.mp3";
const BGM_VOLUME = 0.35;

export default function TerminalEasterEgg() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState(WELCOME);
  const [muted, setMuted] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const audioRef = useRef(null);
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  // Lazily create a single Audio instance for the lifetime of the component.
  const getAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(BGM_SRC);
      audio.loop = true;
      audio.volume = BGM_VOLUME;
      audioRef.current = audio;
    }
    return audioRef.current;
  }, []);

  // Play when the terminal opens, pause + rewind when it closes.
  useEffect(() => {
    const audio = getAudio();

    if (open) {
      audio.muted = mutedRef.current;
      const playPromise = audio.play();
      // Autoplay can be blocked by the browser (e.g. terminal opened via
      // keyboard shortcut before any user gesture) — handle it gracefully
      // instead of throwing an unhandled rejection.
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Playback was blocked; the mute button / any later click on the
          // page will let the user manually retry via the CLI or toggle.
        });
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    return () => {
      if (!open) {
        audio.pause();
      }
    };
  }, [open, getAudio]);

  // Clean up the audio element entirely on unmount.
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  const setMuteState = useCallback(
    (next) => {
      setMuted(next);
      const audio = audioRef.current;
      if (audio) audio.muted = next;
    },
    [],
  );

  const toggleMute = useCallback(() => {
    setMuteState(!mutedRef.current);
  }, [setMuteState]);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "`" && !e.metaKey && !e.ctrlKey) {
        const tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        toggle();
      }
      if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    const push = (out) => setLines((prev) => [...prev, `$ ${raw}`, ...out]);

    if (!cmd) return;

    switch (cmd) {
      case "help":
        push([
          "Available commands:",
          "  help          — show this list",
          "  events        — list all Noesis'26 events",
          "  prize         — show total prize pool",
          "  theme         — show fest theme",
          "  spider-sense  — ping the venue & dates",
          "  multiverse    — jump between fest sections",
          "  contact       — show organizer contact info",
          "  mute          — mute background music",
          "  play          — unmute / resume background music",
          "  clear         — clear the terminal",
        ]);
        break;
      case "events":
        push(
          EVENTS.map(
            (e) => `  • ${e.title} — ${e.prizePool} — ${e.day} ${e.time}`,
          ),
        );
        break;
      case "prize":
        push(["  Total Prize Pool: ₹50,000+"]);
        break;
      case "theme":
        push([
          '  "Where Curiosity Becomes Innovation."',
          "  Visual identity: Web-Slinger Tech / Comic-Brutalist.",
        ]);
        break;
      case "spider-sense":
        push([
          "  📍 Tingling... signal locked.",
          "  Jamia Hamdard Kannur Campus • Sept 30 – Oct 01, 2026",
        ]);
        break;
      case "multiverse":
        push([
          "  Available dimensions: #events #schedule #highlights #faqs #register",
          "  usage: multiverse <dimension> — e.g. multiverse events",
        ]);
        break;
      case "contact":
        push([
          "  Email: noesisitfest@gmail.com",
          "  Phone: +91 99950 61050",
          "  Instagram: @noesis.26",
        ]);
        break;
      case "sudo":
        push([
          "  Permission denied: you are not in the /etc/organizers file.",
          "  Nice try though 😉",
        ]);
        break;
      case "mute":
        setMuteState(true);
        push(["  🔇 Background music muted."]);
        break;
      case "play":
      case "unmute":
        setMuteState(false);
        // If audio got blocked by autoplay policy, this call carries the
        // click-triggered form submit as a user gesture and can retry.
        audioRef.current
          ?.play()
          .catch(() => {});
        push(["  🔊 Background music playing."]);
        break;
      case "clear":
        setLines(WELCOME);
        return;
      default:
        if (cmd.startsWith("multiverse ")) {
          const dest = cmd.split(" ")[1];
          const valid = ["events", "schedule", "highlights", "faqs", "register"];
          if (valid.includes(dest)) {
            document.getElementById(dest)?.scrollIntoView({ behavior: "smooth" });
            push([`  Jumping to dimension: #${dest}`]);
          } else {
            push([`  Unknown dimension: ${dest}`]);
          }
          break;
        }
        push([
          `  command not found: ${cmd}`,
          "  type 'help' for a list of commands",
        ]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    runCommand(input);
    setInput("");
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={toggle}
        aria-label="Open terminal"
        data-cursor="interactive"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full glass border-glow flex items-center justify-center text-spidey-cyan hover:scale-105 active:scale-95 transition-transform"
      >
        <TerminalSquare size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[110] bg-spidey-blue/90 md:bg-spidey-blue/80 md:backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[120] w-[92%] max-w-xl rounded-xl border border-spidey-cyan/30 bg-spidey-blue/98 md:bg-spidey-blue/95 md:backdrop-blur-md overflow-hidden font-mono"
            >
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-spidey-white/10 bg-spidey-surface/70">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-spidey-cyan/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-spidey-red-light/70" />
                  <span className="ml-2 text-[11px] text-spidey-white/50">
                    ~/spidey-cli
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    data-cursor="interactive"
                    aria-label={muted ? "Unmute background music" : "Mute background music"}
                    aria-pressed={muted}
                    className="text-spidey-white/50 hover:text-spidey-white transition-colors"
                  >
                    {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    data-cursor="interactive"
                    aria-label="Close terminal"
                    className="text-spidey-white/50 hover:text-spidey-white"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="h-64 overflow-y-auto px-4 py-3 text-xs sm:text-sm space-y-1"
              >
                {lines.map((line, i) => (
                  <p
                    key={i}
                    className={
                      line.startsWith("$")
                        ? "text-spidey-cyan"
                        : "text-spidey-white/70 whitespace-pre-wrap"
                    }
                  >
                    {line}
                  </p>
                ))}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 px-4 py-3 border-t border-spidey-white/10"
              >
                <span className="text-spidey-cyan text-sm">➜</span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  data-cursor="text"
                  className="flex-1 bg-transparent outline-none text-spidey-white text-sm placeholder:text-spidey-white/30"
                  placeholder="type a command..."
                  autoComplete="off"
                  spellCheck={false}
                />
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
