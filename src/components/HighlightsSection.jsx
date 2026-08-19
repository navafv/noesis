import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { STATS, FEATURES, PARTNERS } from "../data/highlightsData";
import LiveTag from "./LiveTag";

function FeatureCard({ feature: f, index: i }) {
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
    const rx = ((y - 50) / 50) * -5;
    const ry = ((x - 50) / 50) * 5;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: i * 0.1 }}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      data-cursor="interactive"
      className="spotlight-card relative rounded-brutal border border-spidey-white/10 bg-spidey-surface/40 px-6 py-7 group hover:border-spidey-cyan/30 transition-[border-color] duration-300"
      style={{ transformStyle: "preserve-3d", willChange: "transform" }}
    >
      <span className="relative z-10 font-mono text-spidey-cyan/40 text-4xl font-black block mb-3">
        0{i + 1}
      </span>
      <h3 className="relative z-10 font-display font-bold text-lg text-spidey-white mb-2">
        {f.title}
      </h3>
      <p className="relative z-10 text-spidey-white/60 text-sm leading-relaxed">
        {f.description}
      </p>
    </motion.div>
  );
}

function AnimatedNumber({ value, prefix, suffix }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function HighlightsSection() {
  return (
    <section
      id="highlights"
      className="relative py-24 sm:py-32 px-4 overflow-hidden"
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] -z-10 rounded-full blur-[140px] opacity-15 bg-spidey-cyan"
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
          <LiveTag className="font-mono text-xs uppercase tracking-[0.3em] text-spidey-cyan mb-3">
            By The Numbers
          </LiveTag>
          <h2 className="heading-scanline font-display font-black text-4xl sm:text-5xl md:text-6xl text-spidey-white tracking-tight">
            Fest Highlights
          </h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-5 mb-20">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-brutal border border-spidey-white/10 bg-spidey-surface/60 backdrop-blur-sm px-4 py-6 sm:py-8 flex flex-col items-center text-center hover:border-spidey-red/40 transition-colors"
            >
              <stat.icon size={20} className="text-spidey-cyan mb-3" />
              <p className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-spidey-red-light text-glow-red">
                <AnimatedNumber
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </p>
              <p className="text-[10px] sm:text-xs text-spidey-white/50 font-mono uppercase tracking-[0.1em] mt-2 leading-snug">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-20">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.id} feature={f} index={i} />
          ))}
        </div>

        {/* Sponsor marquee */}
        <div>
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.25em] text-spidey-white/40 mb-6">
            Community & Sponsor Partners
          </p>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-[marquee_22s_linear_infinite] gap-10 py-2">
              {[...PARTNERS, ...PARTNERS].map((name, i) => (
                <span
                  key={i}
                  className="font-display font-bold text-lg sm:text-xl text-spidey-white/25 whitespace-nowrap hover:text-spidey-cyan/70 transition-colors"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
