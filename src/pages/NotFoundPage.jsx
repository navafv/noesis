import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Compass } from "lucide-react";

import SEO from "../components/SEO";

/**
 * NotFoundPage.jsx
 * Catch-all ("*") route. Spider-Verse framed 404 screen — matches the
 * rest of the public site's comic-panel corner accents, grid overlay,
 * and glitch-cyan/crimson palette, with a clear way back home.
 */
export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="404 — Lost in the Web | Noesis'26"
        description="This page doesn't exist. Head back to Noesis'26 to explore events, schedule and registration."
        robots="noindex, nofollow"
      />

      <section className="relative min-h-[85vh] flex items-center justify-center pt-32 sm:pt-40 pb-20 px-4 overflow-hidden">
        <div
          className="absolute top-[12%] left-[15%] -z-10 w-72 h-72 rounded-full bg-spidey-cyan/10 blur-[100px]"
          aria-hidden
        />
        <div
          className="absolute bottom-[10%] right-[12%] -z-10 w-80 h-80 rounded-full bg-spidey-red-light/15 blur-[110px]"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 grid-overlay opacity-20"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 comic-halftone opacity-[0.08]"
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-lg"
        >
          <div className="relative rounded-brutal border border-spidey-white/10 md:glass border-glow-red bg-spidey-surface/90 md:bg-spidey-surface/60 md:backdrop-blur-md p-8 sm:p-12 text-center overflow-hidden">
            <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-spidey-cyan/60" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-spidey-cyan/60" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-spidey-cyan/60" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-spidey-cyan/60" />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-mono text-xs uppercase tracking-[0.3em] text-spidey-cyan mb-4 flex items-center justify-center gap-2"
            >
              <Compass size={14} className="animate-spin-slow" />
              Error 404
            </motion.p>

            <h1 className="heading-scanline font-display font-black text-6xl sm:text-8xl text-spidey-white tracking-tight leading-none mb-4">
              404
            </h1>

            <h2 className="font-display font-bold text-xl sm:text-2xl text-spidey-white mb-3">
              Lost in the Web
            </h2>
            <p className="text-spidey-white/60 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Looks like this page swung off into another dimension. The route
              you're looking for doesn't exist on Noesis&apos;26 — let's get you
              back on track.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/"
                data-cursor="interactive"
                className="liquid-shine group relative flex items-center gap-2 rounded-full bg-spidey-red text-spidey-white font-bold text-sm px-7 py-3.5 overflow-hidden hover:scale-105 active:scale-95 transition-transform animate-pulse-glow w-full sm:w-auto justify-center"
              >
                <Home size={16} className="relative z-10" />
                <span className="relative z-10">Back to Home</span>
              </Link>
              <Link
                to="/events"
                data-cursor="interactive"
                className="group flex items-center gap-2 rounded-full glass border border-spidey-white/15 text-spidey-white font-semibold text-sm px-7 py-3.5 hover:border-spidey-cyan/50 hover:-translate-y-0.5 active:translate-y-0 transition-all w-full sm:w-auto justify-center"
              >
                <ArrowLeft
                  size={16}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                Browse Events
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
