import CustomCursor from "./components/CustomCursor";
import CyberBackground from "./components/CyberBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HighlightsSection from "./components/HighlightsSection";
import EventsSection from "./components/EventsSection";
import ScheduleSection from "./components/ScheduleSection";
import GallerySection from "./components/GallerySection";
import RegisterSection from "./components/RegisterSection";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import TerminalEasterEgg from "./components/TerminalEasterEgg";
import "./App.css";

export default function App() {
  return (
    <div className="relative min-h-screen">
      <CyberBackground />
      <CustomCursor />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <HighlightsSection />
        <EventsSection />
        <ScheduleSection />
        <GallerySection />
        <RegisterSection />
        <FaqSection />
      </main>
      <Footer />
      <TerminalEasterEgg />
    </div>
  );
}
