import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, MapPin } from "lucide-react";
import confetti from "canvas-confetti";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#________";
const HEADLINE = "NOESIS'26";

/**
 * Scramble engine with two modes:
 *  - "mount": one-shot reveal on load
 *  - "hover": velocity-tinged scramble triggered by mouse proximity to each char
 */
function useScramble(text, trigger) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let frame = 0;
    let raf;
    const totalFrames = 30;

    const tick = () => {
      frame++;
      const progress = frame / totalFrames;
      const revealedCount = Math.floor(progress * text.length);

      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealedCount) return text[i];
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");

      setDisplay(next);

      if (frame < totalFrames) {
        raf = requestAnimationFrame(() => setTimeout(tick, 26));
      } else {
        setDisplay(text);
      }
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [text, trigger]);

  return display;
}

/** Per-character hover scramble: only the char(s) near the cursor flicker. */
function useHoverScramble(text) {
  const [chars, setChars] = useState(() => text.split(""));
  const timers = useRef({});

  const scrambleAt = useCallback(
    (index) => {
      if (text[index] === " " || text[index] === "'") return;
      let count = 0;
      clearInterval(timers.current[index]);
      timers.current[index] = setInterval(() => {
        count++;
        setChars((prev) => {
          const copy = [...prev];
          copy[index] =
            count < 5
              ? SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
              : text[index];
          return copy;
        });
        if (count >= 5) clearInterval(timers.current[index]);
      }, 40);
    },
    [text],
  );

  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach(clearInterval);
  }, []);

  return { chars, scrambleAt };
}

export default function Hero() {
  const scrambled = useScramble(HEADLINE, "mount");
  const { chars, scrambleAt } = useHoverScramble(HEADLINE);
  const [mounted, setMounted] = useState(false);

  // 3D tilt + magnetic float driven by mouse position within the hero
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 120, damping: 18, mass: 0.4 });
  const springY = useSpring(mvY, { stiffness: 120, damping: 18, mass: 0.4 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const floatX = useTransform(springX, [-0.5, 0.5], [-14, 14]);
  const floatY = useTransform(springY, [-0.5, 0.5], [-10, 10]);

  const heroRef = useRef(null);

  useEffect(() => setMounted(true), []);

  const handlePointerMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width - 0.5);
    mvY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    mvX.set(0);
    mvY.set(0);
  };

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#00d2ff", "#e51b23", "#f4f6fb"],
    });
  }, []);

  return (
    <section
      id="top"
      ref={heroRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={resetTilt}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-28 pb-16 px-4 perspective-1200"
    >
      {/* Base canvas is provided by the global CyberBackground; this section
          layers extra hero-specific density (mesh, orbs) on top of it. */}
      <motion.div
        className="absolute -inset-32 -z-20 radial-mesh animate-mesh-drift"
        aria-hidden
      />
      <div
        className="absolute top-[8%] left-[10%] -z-20 w-72 h-72 rounded-full bg-spidey-cyan/10 blur-[90px] animate-orb-drift"
        aria-hidden
      />
      <div
        className="absolute bottom-[10%] right-[12%] -z-20 w-80 h-80 rounded-full bg-spidey-red-light/20 blur-[100px] animate-orb-drift-rev"
        aria-hidden
      />

      {/* Grid overlay + scanline */}
      <div className="absolute inset-0 -z-10 grid-overlay opacity-30" aria-hidden />
      <div className="absolute inset-0 -z-10 noise-scan animate-scan opacity-25" aria-hidden />

      {/* Infinite horizon perspective grid */}
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[45vh] overflow-hidden preserve-3d"
        style={{ transform: "rotateX(62deg)", transformOrigin: "bottom" }}
        aria-hidden
      >
        <div className="absolute inset-0 horizon-grid animate-horizon-drift" />
      </div>
      <div
        className="absolute inset-x-0 bottom-0 -z-10 h-[30vh] bg-gradient-to-t from-spidey-blue via-spidey-blue/80 to-transparent"
        aria-hidden
      />

      {/* Floating particles */}
      <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
        <span className="absolute top-[18%] left-[12%] w-1.5 h-1.5 rounded-full bg-spidey-cyan/60 animate-float-slow" />
        <span className="absolute top-[70%] left-[20%] w-1 h-1 rounded-full bg-spidey-white/40 animate-float-slower" />
        <span className="absolute top-[30%] left-[85%] w-2 h-2 rounded-full bg-spidey-cyan/40 animate-float-slower" />
        <span className="absolute top-[80%] left-[75%] w-1.5 h-1.5 rounded-full bg-spidey-red-light/70 animate-float-slow" />
        <span className="absolute top-[50%] left-[50%] w-1 h-1 rounded-full bg-spidey-white/30 animate-float-slow" />
      </div>

      <motion.div
        style={{ x: floatX, y: floatY }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto"
      >
        {/* Venue / date pill */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 mb-6 text-xs sm:text-sm text-spidey-white/80 font-mono"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-spidey-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-spidey-cyan" />
          </span>
          <MapPin size={13} className="text-spidey-cyan" />
          Jamia Hamdard Kannur Campus • Sept 30 – Oct 01, 2026
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="flex items-center gap-2 text-spidey-cyan font-mono text-xs sm:text-sm uppercase tracking-[0.3em] mb-4"
        >
          <Sparkles size={14} />
          Neura IT Club presents
        </motion.p>

        {/* Comic-tech badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-md border border-spidey-red/50 bg-spidey-red/10 px-3 py-1 mb-5 text-[11px] sm:text-xs font-mono uppercase tracking-widest text-spidey-red-light border-glow-red"
        >
          With Great Code Comes Great Innovation
        </motion.div>

        {/* 3D kinetic headline */}
        <motion.h1
          style={{ rotateX, rotateY }}
          className="scrambled-char preserve-3d font-display font-black text-[clamp(2.75rem,10vw,7rem)] leading-[0.95] tracking-tight text-spidey-white text-glow-cyan select-none cursor-default"
        >
          {(mounted ? scrambled : HEADLINE).split("").map((char, i) => (
            <motion.span
              key={i}
              onMouseEnter={() => mounted && scrambled === HEADLINE && scrambleAt(i)}
              className={
                char === "'" || char === "2" || char === "6"
                  ? "text-spidey-cyan inline-block"
                  : "inline-block"
              }
            >
              {scrambled === HEADLINE ? chars[i] : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-5 text-base sm:text-lg md:text-xl text-spidey-white/70 font-medium max-w-xl"
        >
          Where Curiosity Becomes Innovation.
        </motion.p>

        {/* CTAs — direct routes, no in-page hash anchors */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-14"
        >
          <Link
            to="/register"
            onClick={fireConfetti}
            data-cursor="interactive"
            className="liquid-shine group relative flex items-center gap-2 rounded-full bg-spidey-red text-spidey-white font-bold text-sm px-7 py-3.5 overflow-hidden hover:scale-105 active:scale-95 transition-transform animate-pulse-glow order-1 sm:order-2"
          >
            <span className="relative z-10">Register Now</span>
            <ArrowRight
              size={16}
              className="relative z-10 group-hover:translate-x-1 transition-transform"
            />
          </Link>

          <Link
            to="/events"
            data-cursor="interactive"
            className="liquid-shine group flex items-center gap-2 rounded-full glass border-glow-cyan text-spidey-white font-semibold text-sm px-7 py-3.5 hover:border-spidey-cyan/60 hover:-translate-y-0.5 active:translate-y-0 transition-all order-2 sm:order-1"
          >
            Explore 9 Flagship Events
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
