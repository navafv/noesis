import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import SEO from "../components/SEO";
import Hero from "../components/Hero";
import HighlightsSection from "../components/HighlightsSection";
import GallerySection from "../components/GallerySection";
import FaqSection from "../components/FaqSection";

/**
 * HomePage.jsx
 * Public landing route ("/"). Composes the existing marketing sections —
 * Hero (dynamic scramble headline + dual CTAs), the animated Highlights
 * counters, a Gallery teaser, and the FAQ accordion — behind the shared
 * RootLayout chrome (Navbar/Footer/CyberBackground/etc).
 *
 * Hero's own CTAs ("Explore The Arena" / "Direct Register") still scroll
 * to the in-page #events/#register anchors for continuity with the
 * existing landing flow; the extra CTA strip below routes visitors
 * straight to the dedicated /events and /register pages.
 */
export default function HomePage() {
  return (
    <>
      <SEO
        title="Noesis '26 | National-Level IT Fest — Jamia Hamdard Kannur"
        description="Noesis'26 is the National-Level Inter-College IT Fest hosted by Neura IT Club, Dept. of Computer Science, Jamia Hamdard Kannur Campus. Sept 30 - Oct 01, 2026. Register now for hackathons, workshops & tech competitions."
      />

      <Hero />

      {/* Dedicated-page CTA strip — bridges the scroll-based Hero actions
          with the new multi-page routes. */}
      <section className="relative px-4 -mt-6 sm:-mt-10 pb-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/events"
            data-cursor="interactive"
            className="liquid-shine group flex items-center gap-2 rounded-full glass border-glow-red text-spidey-white font-semibold text-sm px-7 py-3.5 hover:border-spidey-red/60 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Browse All Events
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            to="/register"
            data-cursor="interactive"
            className="liquid-shine group relative flex items-center gap-2 rounded-full bg-spidey-red text-spidey-white font-bold text-sm px-7 py-3.5 overflow-hidden hover:scale-105 active:scale-95 transition-transform animate-pulse-glow"
          >
            <span className="relative z-10">Go to Registration</span>
            <ArrowRight
              size={16}
              className="relative z-10 group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </section>

      <HighlightsSection />
      <GallerySection />
      <FaqSection />
    </>
  );
}
