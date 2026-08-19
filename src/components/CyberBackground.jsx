import { useEffect, useRef, useState } from "react";

const PARTICLE_COUNT_DESKTOP = 70;
const PARTICLE_COUNT_TABLET = 28;
const REPEL_RADIUS = 120;
const REPEL_STRENGTH = 0.9;
const LOW_POWER_BREAKPOINT = 768;

/**
 * Devices under the mobile breakpoint, or any device without a fine hover
 * pointer (i.e. touch), skip the canvas entirely: no context, no particle
 * array, no rAF loop. They get a cheap static CSS gradient mesh instead,
 * which costs nothing on the GPU beyond a single composited layer.
 */
const isLowPowerDevice = () =>
  typeof window !== "undefined" &&
  (window.innerWidth < LOW_POWER_BREAKPOINT ||
    window.matchMedia("(hover: none)").matches);

/**
 * CyberBackground renders a single fixed full-viewport layer shared by every
 * section: a canvas-based constellation of drifting motes that mildly repel
 * from the cursor, a CSS perspective horizon grid, and slow-breathing Cyprus
 * ambient glow nodes that parallax gently with scroll. It sits behind all
 * content (z-index -50) and never intercepts pointer events.
 */
export default function CyberBackground() {
  const canvasRef = useRef(null);
  const glowLayerRef = useRef(null);
  const rafRef = useRef(null);
  const particles = useRef([]);
  const mouse = useRef({ x: -9999, y: -9999 });
  const scrollY = useRef(0);
  const reduceMotion = useRef(false);
  const [lowPower, setLowPower] = useState(isLowPowerDevice);

  // Re-evaluate on resize/orientation change (e.g. foldables, rotating a
  // tablet across the breakpoint) but never upgrade a touch device to the
  // canvas path just because it got wider.
  useEffect(() => {
    const recheck = () => {
      setLowPower((prev) => prev || isLowPowerDevice());
    };
    window.addEventListener("resize", recheck, { passive: true });
    return () => window.removeEventListener("resize", recheck);
  }, []);

  useEffect(() => {
    if (lowPower) return; // No canvas, no listeners, no rAF loop at all.

    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const count = isDesktop ? PARTICLE_COUNT_DESKTOP : PARTICLE_COUNT_TABLET;
    const canHover = window.matchMedia("(hover: hover)").matches;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      particles.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        r: Math.random() * 1.6 + 0.6,
        hue: Math.random() > 0.65 ? "sand" : "emerald",
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    seed();

    const handleResize = () => {
      resize();
      seed();
    };

    const handleMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouse.current = { x: -9999, y: -9999 };
    };

    const handleScroll = () => {
      scrollY.current = window.scrollY;
      if (glowLayerRef.current) {
        // Subtle parallax: glow nodes drift opposite the scroll direction.
        glowLayerRef.current.style.transform = `translateY(${scrollY.current * 0.06}px)`;
      }
    };

    window.addEventListener("resize", handleResize);
    if (canHover) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseleave", handleMouseLeave);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const sandColor = "240, 237, 228";
      const emeraldColor = "0, 245, 212";

      for (const p of particles.current) {
        // Gentle magnetic repulsion from cursor
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_RADIUS) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
          p.vx += (dx / (dist || 1)) * force * 0.03;
          p.vy += (dy / (dist || 1)) * force * 0.03;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.twinkle += 0.02;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const alpha = 0.25 + Math.sin(p.twinkle) * 0.2;
        const color = p.hue === "sand" ? sandColor : emeraldColor;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${Math.max(alpha, 0.08)})`;
        ctx.fill();
      }

      // Faint constellation lines between nearby motes
      ctx.lineWidth = 0.6;
      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const a = particles.current[i];
          const b = particles.current[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 110) {
            ctx.strokeStyle = `rgba(0, 245, 212, ${0.08 * (1 - d / 110)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    if (!reduceMotion.current) {
      rafRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [lowPower]);

  if (lowPower) {
    // Cheap static fallback: a single gradient-mesh layer, no canvas, no
    // rAF, no listeners, no blurred glow orbs, no animated scanline.
    return (
      <div
        className="fixed inset-0 -z-50 overflow-hidden bg-canvas pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyprus-void via-canvas to-cyprus-void" />
        <div className="absolute inset-0 radial-mesh opacity-60" />
        <div className="absolute inset-0 grid-overlay opacity-[0.05]" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 -z-50 overflow-hidden bg-canvas pointer-events-none"
      aria-hidden="true"
    >
      {/* Deep base wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyprus-void via-canvas to-cyprus-void" />

      {/* Breathing Cyprus ambient glow nodes, parallax on scroll */}
      <div
        ref={glowLayerRef}
        className="absolute inset-0 will-change-transform"
      >
        <div className="absolute top-[6%] left-[8%] w-[36rem] h-[36rem] rounded-full bg-cyprus/40 blur-[140px] animate-orb-drift" />
        <div className="absolute top-[40%] right-[6%] w-[30rem] h-[30rem] rounded-full bg-cyprus-mid/50 blur-[130px] animate-orb-drift-rev" />
        <div className="absolute bottom-[4%] left-[30%] w-[34rem] h-[34rem] rounded-full bg-emerald/[0.07] blur-[150px] animate-mesh-drift" />
      </div>

      {/* Perspective cyber horizon grid, tiled the full page height */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60vh] opacity-[0.35]"
        style={{ transform: "rotateX(58deg)", transformOrigin: "bottom" }}
      >
        <div className="absolute inset-0 horizon-grid animate-horizon-drift" />
      </div>

      {/* Static overhead grid + scanline for texture across all sections */}
      <div className="absolute inset-0 grid-overlay opacity-[0.06]" />
      <div className="absolute inset-0 noise-scan animate-scan opacity-[0.12]" />

      {/* Constellation particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
