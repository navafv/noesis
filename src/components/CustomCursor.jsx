import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], [data-cursor="interactive"]';
const TEXT_SELECTOR =
  'input, textarea, [contenteditable="true"], [data-cursor="text"]';

const SPARK_LIFETIME = 280; // ms — dissolves well under the 300ms budget
const SPARK_VELOCITY_THRESHOLD = 42; // px per animation tick

// Explicit touch-capability check, independent of viewport width — a
// touchscreen laptop or a narrow-but-desktop window should not flip this,
// and a touch device should never get mousemove/rAF listeners attached.
// Mirrors the spec's exact guard: bail whenever the primary pointer isn't
// both hover-capable and fine (mouse/trackpad), which also covers
// "ontouchstart"/maxTouchPoints-only devices since those fail the query.
const supportsFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// A desktop mouse user with prefers-reduced-motion enabled should get the
// same treatment as a touch user: no custom cursor at all, since the
// reticle's spring-lerped follow and the spark-burst particles are both
// motion effects this setting is meant to suppress.
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CustomCursor() {
  const reticleRef = useRef(null);
  const spotlightRef = useRef(null);
  const sparkLayerRef = useRef(null);

  const [enabled] = useState(
    () => supportsFinePointer() && !prefersReducedMotion(),
  );
  const [mode, setMode] = useState("default"); // "default" | "target" | "text"
  const [clicking, setClicking] = useState(false);

  const mouse = useRef({ x: 0, y: 0 });
  const reticlePos = useRef({ x: 0, y: 0 });
  const lastMouse = useRef({ x: 0, y: 0, t: 0 });
  const raf = useRef(null);

  useEffect(() => {
    // Strict early-return: any device whose primary pointer isn't both
    // hover-capable and fine never gets a custom cursor, and never gets
    // mousemove/pointerover/rAF listeners attached in the first place —
    // not attached-then-ignored, simply never attached. Zero CPU/battery
    // cost on touch devices. `enabled` was resolved once, synchronously,
    // in the lazy useState initializer above, so this effect can bail
    // immediately without ever calling setState itself.
    if (!enabled) return;

    const resolveMode = (target) => {
      if (target?.closest?.(TEXT_SELECTOR)) return "text";
      if (target?.closest?.(INTERACTIVE_SELECTOR)) return "target";
      return "default";
    };

    const spawnSpark = (x, y) => {
      const layer = sparkLayerRef.current;
      if (!layer) return;
      const el = document.createElement("span");
      el.className = "cursor-spark";
      const angle = Math.random() * Math.PI * 2;
      const dist = 10 + Math.random() * 14;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      el.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
      el.style.transition = `transform ${SPARK_LIFETIME}ms cubic-bezier(0.16,1,0.3,1), opacity ${SPARK_LIFETIME}ms ease`;
      layer.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate3d(-50%, -50%, 0) translate(var(--dx), var(--dy)) scale(0.2)`;
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), SPARK_LIFETIME + 40);
    };

    const handleMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };

      const now = performance.now();
      const dt = now - lastMouse.current.t || 16;
      const dx = e.clientX - lastMouse.current.x;
      const dy = e.clientY - lastMouse.current.y;
      const speed = Math.hypot(dx, dy) / (dt / 16);
      if (speed > SPARK_VELOCITY_THRESHOLD) spawnSpark(e.clientX, e.clientY);
      lastMouse.current = { x: e.clientX, y: e.clientY, t: now };

      setMode(resolveMode(e.target));
    };

    const handleDown = () => setClicking(true);
    const handleUp = () => setClicking(false);

    // Re-resolve mode when new overlays mount/open under the pointer
    // (modals, terminal) without requiring mouse movement.
    const handlePointerOver = (e) => setMode(resolveMode(e.target));

    const loop = () => {
      reticlePos.current.x += (mouse.current.x - reticlePos.current.x) * 0.22;
      reticlePos.current.y += (mouse.current.y - reticlePos.current.y) * 0.22;
      if (reticleRef.current) {
        reticleRef.current.style.transform = `translate3d(${reticlePos.current.x}px, ${reticlePos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${mouse.current.x}px, ${mouse.current.y}px, 0) translate(-50%, -50%)`;
      }
      raf.current = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("pointerover", handlePointerOver, {
      passive: true,
    });
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mouseup", handleUp);
    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("pointerover", handlePointerOver);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mouseup", handleUp);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      {/* Ambient light trail — sits low, purely atmospheric */}
      <div ref={spotlightRef} className="cursor-spotlight" aria-hidden="true" />

      {/* Spark burst layer */}
      <div ref={sparkLayerRef} aria-hidden="true" />

      {/* Precision reticle — always on top of everything, including modals */}
      <div
        ref={reticleRef}
        className={`cyber-reticle mode-${mode} ${clicking ? "is-clicking" : ""}`}
        aria-hidden="true"
      >
        {mode === "text" ? (
          <span className="reticle-ibeam" />
        ) : (
          <>
            <span className="reticle-tick tick-tl" />
            <span className="reticle-tick tick-tr" />
            <span className="reticle-tick tick-bl" />
            <span className="reticle-tick tick-br" />
            <span className="reticle-dot" />
          </>
        )}
      </div>
    </>
  );
}
