import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";

const NAV_LINKS = [
  { label: "Events", href: "#events" },
  { label: "Schedule", href: "#schedule" },
  { label: "Highlights", href: "#highlights" },
  { label: "FAQs", href: "#faqs" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const btnRef = useRef(null);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleMouseMove = (e) => {
    const el = btnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setMagnet({ x: x * 0.25, y: y * 0.35 });
  };

  const resetMagnet = () => setMagnet({ x: 0, y: 0 });

  return (
    <>
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 flex justify-center transition-all duration-500 ${
          scrolled ? "pt-3" : "pt-5"
        }`}
      >
        <nav
          className={`w-[92%] md:w-[88%] max-w-6xl flex items-center justify-between rounded-2xl px-4 md:px-6 py-3 transition-all duration-500 ${
            scrolled
              ? "bg-cyprus/90 border border-sand/10 md:glass border-glow"
              : "bg-transparent border border-transparent"
          }`}
        >
          {/* Branding */}
          <a href="#top" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg bg-cyprus border border-emerald/30 flex items-center justify-center overflow-hidden">
              <span className="font-mono font-bold text-emerald text-sm tracking-tighter">
                <img src="logo.png" alt="Noesis Logo" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-tr from-emerald/0 via-emerald/10 to-emerald/0 group-hover:translate-x-full transition-transform duration-700" />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-bold text-sand tracking-tight text-sm md:text-base">
                Noesis <span className="text-emerald">'26</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-sand/50 font-mono">
                by Neura IT Club
              </p>
            </div>
          </a>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="relative group">
                <a
                  href={link.href}
                  className="text-sm font-medium text-sand/80 hover:text-sand transition-colors tracking-wide"
                >
                  {link.label}
                </a>
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-emerald shadow-[0_0_8px_1px_rgba(0,245,212,0.6)] group-hover:w-full transition-all duration-300 ease-out" />
              </li>
            ))}
          </ul>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <motion.a
              ref={btnRef}
              href="#register"
              data-cursor="interactive"
              onMouseMove={handleMouseMove}
              onMouseLeave={resetMagnet}
              animate={{ x: magnet.x, y: magnet.y }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 12,
                mass: 0.3,
              }}
              className="magnetic-btn liquid-shine hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald text-cyprus-void font-bold text-sm px-5 py-2.5 animate-pulse-glow hover:scale-105 active:scale-95 transition-transform"
            >
              Register Now
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </motion.a>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-sand/15 text-sand"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[60] bg-canvas/90 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="fixed top-0 right-0 z-[70] h-full w-[80%] max-w-sm bg-surface border-l border-sand/10 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-sand/10">
                <p className="font-bold text-sand">
                  Noesis <span className="text-emerald">'26</span>
                </p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg border border-sand/15 text-sand"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="flex flex-col px-6 py-8 gap-2">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-3 text-lg font-medium text-sand/85 border-b border-sand/5"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto px-6 pb-10">
                <a
                  href="#register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full rounded-full bg-emerald text-cyprus-void font-bold text-sm px-5 py-3.5"
                >
                  Register Now
                  <ArrowUpRight size={16} strokeWidth={2.5} />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
