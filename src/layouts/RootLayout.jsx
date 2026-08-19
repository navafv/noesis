import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import CyberBackground from "../components/CyberBackground";
import CustomCursor from "../components/CustomCursor";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TerminalEasterEgg from "../components/TerminalEasterEgg";

/**
 * ScrollToTop
 * Runs on every route change and resets the viewport to the top of the
 * page. Skipped when the URL carries a hash (e.g. /events#hackathon) so
 * anchor-link navigation within a page still works as expected.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" in window.HTMLElement.prototype ? "instant" : "auto",
    });
  }, [pathname, hash]);

  return null;
}

/**
 * RootLayout
 * Public-facing shell shared by every route: persistent background FX,
 * custom cursor, navbar, footer, and the terminal easter egg, wrapping a
 * route-driven <Outlet /> that swaps the active page.
 */
export default function RootLayout() {
  return (
    <div className="relative min-h-screen">
      <CyberBackground />
      <CustomCursor />
      <Navbar />

      <ScrollToTop />

      <main className="relative z-10">
        <Outlet />
      </main>

      <Footer />
      <TerminalEasterEgg />
    </div>
  );
}
