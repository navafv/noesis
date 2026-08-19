import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentEventsPage from "./pages/student/StudentEventsPage";
import StudentTeamPage from "./pages/student/StudentTeamPage";
import StudentSubmissionsPage from "./pages/student/StudentSubmissionsPage";
import AdminLayout from "./layouts/AdminLayout";
import PaymentVerificationPage from "./pages/admin/PaymentVerificationPage";
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
/*  Student Portal — lightweight placeholders for sub-pages not yet   */
/*  built out. Swap each for its real component under                 */
/*  src/pages/student/ as it's implemented.                           */
/* ------------------------------------------------------------------ */

function StudentPagePlaceholder({ title }) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono">
        Student Portal
      </p>
      <h1 className="text-3xl font-bold text-spidey-white">{title}</h1>
      <p className="text-spidey-white/50 font-mono text-sm">
        // page under construction — coming soon
      </p>
    </div>
  );
}

function StudentCertificatesPage() {
  return <StudentPagePlaceholder title="Certificates" />;
}

/* ------------------------------------------------------------------ */
/*  Admin / Coordinator Command Center — lightweight placeholders for  */
/*  sub-pages not yet built out. Swap each for its real component      */
/*  under src/pages/admin/ as it's implemented.                        */
/* ------------------------------------------------------------------ */

function AdminPagePlaceholder({ title }) {
  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono">
        Command Center
      </p>
      <h1 className="text-3xl font-bold text-spidey-white">{title}</h1>
      <p className="text-spidey-white/50 font-mono text-sm">
        // page under construction — coming soon
      </p>
    </div>
  );
}

function AdminOverviewPage() {
  return <AdminPagePlaceholder title="Overview" />;
}

function AdminScoringPage() {
  return <AdminPagePlaceholder title="Scoring" />;
}

function AdminScannerPage() {
  return <AdminPagePlaceholder title="QR Scanner" />;
}

function AdminSpotEntryPage() {
  return <AdminPagePlaceholder title="Spot Entry" />;
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

        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="events" element={<StudentEventsPage />} />
          <Route path="team" element={<StudentTeamPage />} />
          <Route path="submissions" element={<StudentSubmissionsPage />} />
          <Route path="certificates" element={<StudentCertificatesPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverviewPage />} />
          <Route path="payments" element={<PaymentVerificationPage />} />
          <Route path="scoring" element={<AdminScoringPage />} />
          <Route path="scanner" element={<AdminScannerPage />} />
          <Route path="spot-entry" element={<AdminSpotEntryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
