import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Expand, X } from "lucide-react";

/**
 * Replace `img` paths with real fest photography once available.
 * Using themed gradient placeholders keeps this visually complete
 * and production-shippable without broken image requests.
 */
const GALLERY_ITEMS = [
  {
    id: 1,
    caption: "Hackathon Zone — Lab A",
    tag: "Coding",
    span: "row-span-2",
  },
  { id: 2, caption: "Prize Ceremony 2025", tag: "Ceremony", span: "" },
  { id: 3, caption: "Esports Arena Finals", tag: "Gaming", span: "" },
  {
    id: 4,
    caption: "Crowd at Main Auditorium",
    tag: "Crowd",
    span: "row-span-2",
  },
  { id: 5, caption: "Web Design Sprint", tag: "Design", span: "" },
  { id: 6, caption: "IT Quiz Buzzer Round", tag: "Knowledge", span: "" },
  { id: 7, caption: "Treasure Hunt Trail", tag: "Fun/Tech", span: "" },
  { id: 8, caption: "Keynote Session", tag: "Talk", span: "" },
];

const GRADIENTS = [
  "from-spidey-red via-spidey-red-light to-spidey-blue",
  "from-spidey-cyan/40 via-spidey-red to-spidey-blue",
  "from-spidey-red-light via-spidey-surface to-spidey-blue",
  "from-spidey-cyan/30 via-spidey-surface to-spidey-red",
];

export default function GallerySection() {
  const [active, setActive] = useState(null);

  // Escape-to-close + body scroll lock while the lightbox is open.
  useEffect(() => {
    if (!active) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  return (
    <section
      id="gallery"
      className="relative py-24 sm:py-32 px-4 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-spidey-cyan mb-3">
            Relive the Energy
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-spidey-white tracking-tight">
            Gallery
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 auto-rows-[160px] sm:auto-rows-[200px]">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              onClick={() => setActive(item)}
              data-cursor="interactive"
              className={`group relative rounded-brutal overflow-hidden cursor-pointer border border-spidey-white/10 hover:border-spidey-cyan/50 transition-colors ${item.span}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} opacity-80 group-hover:scale-110 transition-transform duration-500`}
              />
              <div className="absolute inset-0 grid-overlay opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-spidey-blue/90 via-spidey-blue/10 to-transparent" />

              {/* Neon glow ring on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_0_2px_rgba(0,210,255,0.5)] rounded-brutal" />

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand size={16} className="text-spidey-white" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-spidey-cyan block mb-1">
                  {item.tag}
                </span>
                <p className="text-spidey-white text-xs sm:text-sm font-semibold leading-snug">
                  {item.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            key="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setActive(null)}
            role="dialog"
            aria-modal="true"
            aria-label={active.caption}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-spidey-blue/90 backdrop-blur-md px-6"
          >
            <motion.div
              key="lightbox-panel"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl aspect-video rounded-brutal overflow-hidden border border-spidey-cyan/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-spidey-red via-spidey-red-light to-spidey-blue" />
              <div className="absolute inset-0 grid-overlay opacity-20" />

              <button
                onClick={() => setActive(null)}
                data-cursor="interactive"
                aria-label="Close preview"
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center glass border border-spidey-white/20 text-spidey-white hover:border-spidey-cyan/60 hover:text-spidey-cyan transition-colors"
              >
                <X size={16} />
              </button>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-spidey-blue/95 to-transparent">
                <span className="text-xs font-mono uppercase tracking-[0.14em] text-spidey-cyan block mb-1">
                  {active.tag}
                </span>
                <p className="text-spidey-white text-lg font-bold">{active.caption}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
