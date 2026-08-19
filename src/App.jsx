import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";
import DevRouteSwitcher from "./components/DevRouteSwitcher";

import HomePage from "./pages/HomePage";
import EventsPage from "./pages/EventsPage";
import SchedulePage from "./pages/SchedulePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentEventsPage from "./pages/student/StudentEventsPage";
import StudentTeamPage from "./pages/student/StudentTeamPage";
import StudentSubmissionsPage from "./pages/student/StudentSubmissionsPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import PaymentVerificationPage from "./pages/admin/PaymentVerificationPage";
import LiveScoringPage from "./pages/admin/LiveScoringPage";
import QrScannerPage from "./pages/admin/QrScannerPage";
import SpotEntryPage from "./pages/admin/SpotEntryPage";

import "./App.css";

/* ------------------------------------------------------------------ */
/*  Student Portal — lightweight placeholder for the one sub-page not  */
/*  yet built out. Swap for a real component under src/pages/student/  */
/*  as it's implemented.                                               */
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
          <Route index element={<AdminDashboard />} />
          <Route path="payments" element={<PaymentVerificationPage />} />
          <Route path="scoring" element={<LiveScoringPage />} />
          <Route path="scanner" element={<QrScannerPage />} />
          <Route path="spot-entry" element={<SpotEntryPage />} />
        </Route>
      </Routes>

      {/* Dev-only floating route dock — lets every public, student, and
          admin route be reached in one click during local development.
          Mounted here (rather than inside RootLayout) so it persists
          across ALL layouts, including /student/* and /admin/*, which
          RootLayout never wraps. It's a no-op outside dev — see the
          `import.meta.env.DEV` guard inside the component itself. */}
      <DevRouteSwitcher />
    </BrowserRouter>
  );
}
