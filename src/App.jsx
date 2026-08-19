import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";
import "./App.css";

/* ------------------------------------------------------------------ */
/*  Lightweight placeholders — swap these for the real page           */
/*  components (src/pages/HomePage.jsx etc.) as they're built out.    */
/* ------------------------------------------------------------------ */

import Hero from "./components/Hero";
import HighlightsSection from "./components/HighlightsSection";
import EventsSection from "./components/EventsSection";
import ScheduleSection from "./components/ScheduleSection";
import GallerySection from "./components/GallerySection";
import RegisterSection from "./components/RegisterSection";
import FaqSection from "./components/FaqSection";

function HomePage() {
  return (
    <>
      <Hero />
      <HighlightsSection />
      <EventsSection />
      <ScheduleSection />
      <GallerySection />
      <RegisterSection />
      <FaqSection />
    </>
  );
}

function PagePlaceholder({ title }) {
  return (
    <section className="min-h-[70vh] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-[#F0EDE4]">
        {title}
      </h1>
      <p className="text-[#8fd6c9] font-mono text-sm">
        // page under construction — coming soon
      </p>
    </section>
  );
}

function EventsPage() {
  return <PagePlaceholder title="Events" />;
}

function SchedulePage() {
  return <PagePlaceholder title="Schedule" />;
}

function RegisterPage() {
  return <PagePlaceholder title="Register" />;
}

function LoginPage() {
  return <PagePlaceholder title="Login" />;
}

function NotFoundPage() {
  return (
    <section className="min-h-[80vh] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-mono text-[#8fd6c9] text-sm tracking-widest">
        ERROR 404
      </p>
      <h1 className="text-5xl md:text-7xl font-bold text-[#F0EDE4]">
        Lost in the Web
      </h1>
      <p className="max-w-md text-[#c9c4b8]">
        Looks like this page swung off somewhere it shouldn't have. Let's get
        you back to Noesis'26.
      </p>
      <a
        href="/"
        className="mt-2 inline-block rounded-full border border-[#8fd6c9]/40 px-6 py-2.5 font-mono text-sm text-[#8fd6c9] transition hover:bg-[#8fd6c9]/10"
      >
        ← Back to Home
      </a>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Router                                                             */
/* ------------------------------------------------------------------ */

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
