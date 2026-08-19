import { useEffect, useState, useRef } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, ShieldCheck } from "lucide-react";
import { PRIMARY_ROUTES } from "../data/routes";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const btnRef = useRef(null);
  const [magnet, setMagnet] = useState({ x: 0, y: 0 });
  const location = useLocation();

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

  // Auto-close the mobile drawer on any route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
              ? "bg-spidey-blue/90 border border-spidey-white/10 md:glass border-glow-red"
              : "bg-transparent border border-transparent"
          }`}
        >
          {/* Branding — "N26" badge, web-corner accents */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-lg bg-spidey-blue border-2 border-spidey-red flex items-center justify-center overflow-hidden">
              <span className="font-mono font-black text-spidey-red text-sm tracking-tighter">
                N26
              </span>
              {/* web-corner accents */}
              <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-spidey-cyan/70" />
              <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-spidey-cyan/70" />
              <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-spidey-cyan/70" />
              <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-spidey-cyan/70" />
              <span className="absolute inset-0 bg-gradient-to-tr from-spidey-cyan/0 via-spidey-cyan/10 to-spidey-cyan/0 group-hover:translate-x-full transition-transform duration-700" />
            </div>
            <div className="leading-tight hidden sm:block">
              <p className="font-bold text-spidey-white tracking-tight text-sm md:text-base">
                Noesis <span className="text-spidey-cyan">'26</span>
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-spidey-white/50 font-mono">
                by Neura IT Club
              </p>
            </div>
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8">
            {PRIMARY_ROUTES.map((link) => (
              <li key={link.to} className="relative group">
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `text-sm font-medium tracking-wide transition-colors ${
                      isActive
                        ? "text-spidey-white"
                        : "text-spidey-white/80 hover:text-spidey-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {/* Spider-Verse red laser underline — active state is a solid,
                          glowing beam; hover state is the same beam sweeping in. */}
                      <span
                        aria-hidden
                        className={`absolute -bottom-1.5 left-0 h-[2px] bg-spidey-red shadow-[0_0_8px_1px_rgba(229,27,35,0.6)] transition-all duration-300 ease-out ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <motion.div
              ref={btnRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetMagnet}
              animate={{ x: magnet.x, y: magnet.y }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 12,
                mass: 0.3,
              }}
              className="hidden sm:block"
            >
              <NavLink
                to="/login"
                data-cursor="interactive"
                className={({ isActive }) =>
                  `magnetic-btn liquid-shine inline-flex items-center gap-1.5 rounded-full font-bold text-sm px-5 py-2.5 transition-all ${
                    isActive
                      ? "bg-spidey-cyan text-spidey-blue"
                      : "bg-spidey-red text-spidey-white animate-pulse-glow hover:scale-105 active:scale-95"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <ShieldCheck size={16} strokeWidth={2.5} />
                    ) : null}
                    {isActive ? "Portal" : "Login"}
                    {!isActive && <ArrowUpRight size={16} strokeWidth={2.5} />}
                  </>
                )}
              </NavLink>
            </motion.div>

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg border border-spidey-white/15 text-spidey-white"
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
              className="fixed inset-0 z-[60] bg-spidey-blue/90 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="fixed top-0 right-0 z-[70] h-full w-[80%] max-w-sm bg-spidey-surface border-l border-spidey-white/10 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-spidey-white/10">
                <p className="font-bold text-spidey-white">
                  Noesis <span className="text-spidey-cyan">'26</span>
                </p>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-lg border border-spidey-white/15 text-spidey-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              <ul className="flex flex-col px-6 py-8 gap-2">
                {PRIMARY_ROUTES.map((link, i) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.end}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `relative block py-3 pl-4 text-lg font-medium border-b border-spidey-white/5 transition-colors ${
                          isActive
                            ? "text-spidey-white"
                            : "text-spidey-white/85"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {link.label}
                          {/* Red laser marker on the active mobile item */}
                          <span
                            aria-hidden
                            className={`absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-spidey-red shadow-[0_0_8px_1px_rgba(229,27,35,0.6)] transition-opacity duration-300 ${
                              isActive ? "opacity-100" : "opacity-0"
                            }`}
                          />
                        </>
                      )}
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto px-6 pb-10 flex flex-col gap-3">
                <NavLink
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-center gap-2 w-full rounded-full font-bold text-sm px-5 py-3.5 transition-colors ${
                      isActive
                        ? "bg-spidey-cyan text-spidey-blue"
                        : "bg-spidey-red text-spidey-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <ShieldCheck size={16} strokeWidth={2.5} />
                      ) : null}
                      {isActive ? "Portal" : "Login"}
                      {!isActive && (
                        <ArrowUpRight size={16} strokeWidth={2.5} />
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
