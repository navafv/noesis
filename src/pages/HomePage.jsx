import SEO from "../components/SEO";
import Hero from "../components/Hero";
import HighlightsSection from "../components/HighlightsSection";
import GallerySection from "../components/GallerySection";
import FaqSection from "../components/FaqSection";

/**
 * HomePage.jsx
 * Public landing route ("/"). Composes the marketing sections — Hero
 * (kinetic headline + dual CTAs straight into the dedicated /events and
 * /register routes), the animated Highlights counters, a Gallery teaser,
 * and the FAQ accordion — behind the shared RootLayout chrome
 * (Navbar/Footer/CyberBackground/etc).
 *
 * Hero already owns the primary conversion path (Register Now /
 * Explore Events), so this page intentionally has no secondary CTA
 * strip beneath it — a repeated banner here would just compete with
 * Hero's own actions instead of reinforcing them.
 */
export default function HomePage() {
  return (
    <>
      <SEO
        title="Noesis'26 | National-Level IT Fest — Jamia Hamdard Kannur"
        description="Noesis'26 is the National-Level Inter-College IT Fest hosted by Neura IT Club, Dept. of Computer Science, Jamia Hamdard Kannur Campus. Sept 30 - Oct 01, 2026. Register now for hackathons, workshops & tech competitions."
      />

      <Hero />
      <HighlightsSection />
      <GallerySection />
      <FaqSection />
    </>
  );
}
