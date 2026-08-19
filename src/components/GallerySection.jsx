import { useState } from "react";
import { motion } from "framer-motion";
import { Expand } from "lucide-react";

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
  "from-cyprus via-cyprus-light to-canvas",
  "from-emerald/40 via-cyprus to-canvas",
  "from-cyprus-light via-surface to-canvas",
  "from-emerald/30 via-surface to-cyprus",
];

export default function GallerySection() {
  const [active, setActive] = useState(null);

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
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald mb-3">
            Relive the Energy
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-sand tracking-tight">
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
              className={`group relative rounded-brutal overflow-hidden cursor-pointer border border-sand/10 hover:border-emerald/50 transition-colors ${item.span}`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} opacity-80 group-hover:scale-110 transition-transform duration-500`}
              />
              <div className="absolute inset-0 grid-overlay opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/10 to-transparent" />

              {/* Neon glow ring on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[inset_0_0_0_2px_rgba(0,245,212,0.5)] rounded-brutal" />

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Expand size={16} className="text-sand" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <span className="text-[9px] font-mono uppercase tracking-[0.14em] text-emerald block mb-1">
                  {item.tag}
                </span>
                <p className="text-sand text-xs sm:text-sm font-semibold leading-snug">
                  {item.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setActive(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/90 backdrop-blur-md px-6"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-2xl aspect-video rounded-brutal overflow-hidden border border-emerald/30"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyprus via-cyprus-light to-canvas" />
            <div className="absolute inset-0 grid-overlay opacity-20" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-canvas/95 to-transparent">
              <span className="text-xs font-mono uppercase tracking-[0.14em] text-emerald block mb-1">
                {active.tag}
              </span>
              <p className="text-sand text-lg font-bold">{active.caption}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  );
}
