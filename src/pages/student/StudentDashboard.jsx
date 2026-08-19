import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Download,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Clock,
  Sparkles,
  Building2,
  Hash,
  Loader2,
  CheckCircle2,
} from "lucide-react";

/**
 * NOTE — package prerequisites for this file:
 *   npm install qrcode.react html2canvas jspdf
 *
 * qrcode.react  -> renders the live check-in QR as an inline SVG
 * html2canvas   -> rasterizes the pass card for PNG/PDF export
 * jspdf         -> wraps the rasterized pass into a downloadable PDF
 */

/** Mock "next event" data — swap for a real registrations query. */
const NEXT_EVENT = {
  name: "CodeStorm — Hackathon Finals",
  startsAt: new Date(Date.now() + 1000 * 60 * 60 * 26), // ~26h from now
};

/**
 * encodeCheckInToken
 * Produces a base64 "encrypted-looking" payload embedding the student
 * UID, a timestamp, and a rotating nonce. This is a client-side stand-in
 * — swap for a signed token minted by the backend (JWT/HMAC) before the
 * QR is used for real campus check-in.
 */
function encodeCheckInToken(uid) {
  const payload = {
    uid,
    iss: "noesis26-checkin",
    ts: Date.now(),
    nonce: Math.random().toString(36).slice(2, 10),
  };
  return btoa(JSON.stringify(payload));
}

function useCountdown(target) {
  const [remaining, setRemaining] = useState(
    () => target.getTime() - Date.now(),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(target.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const clamped = Math.max(0, remaining);
  const days = Math.floor(clamped / (1000 * 60 * 60 * 24));
  const hours = Math.floor((clamped / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((clamped / (1000 * 60)) % 60);
  const secs = Math.floor((clamped / 1000) % 60);

  return { days, hours, mins, secs, isPast: remaining <= 0 };
}

export default function StudentDashboard() {
  const { student } = useOutletContext();
  const passRef = useRef(null);

  const [token, setToken] = useState(() => encodeCheckInToken(student.uid));
  const [exportState, setExportState] = useState("idle"); // idle | png | pdf
  const countdown = useCountdown(NEXT_EVENT.startsAt);

  // "Live" QR — rotates the encoded token periodically so a stale
  // screenshot can't be reused for check-in indefinitely.
  useEffect(() => {
    const id = setInterval(
      () => setToken(encodeCheckInToken(student.uid)),
      20000,
    );
    return () => clearInterval(id);
  }, [student.uid]);

  const isVerified = Boolean(student.verified);

  const nextEventLabel = useMemo(() => {
    if (countdown.isPast) return "Happening now";
    if (countdown.days > 0) return `${countdown.days}d ${countdown.hours}h`;
    if (countdown.hours > 0) return `${countdown.hours}h ${countdown.mins}m`;
    return `${countdown.mins}m ${countdown.secs}s`;
  }, [countdown]);

  async function captureCanvas() {
    if (!passRef.current) return null;
    return html2canvas(passRef.current, {
      backgroundColor: "#0b1f3a",
      scale: 2,
      useCORS: true,
    });
  }

  async function handleDownloadPNG() {
    setExportState("png");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `noesis26-pass-${student.rollNo}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setExportState("idle");
    }
  }

  async function handleDownloadPDF() {
    setExportState("pdf");
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`noesis26-pass-${student.rollNo}.pdf`);
    } finally {
      setExportState("idle");
    }
  }

  async function handlePrint() {
    const canvas = await captureCanvas();
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank", "width=480,height=760");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Noesis'26 Fest Pass — ${student.rollNo}</title>
          <style>
            @page { margin: 0; }
            html, body { margin: 0; padding: 24px; background: #0b1f3a; display: flex; justify-content: center; }
            img { max-width: 100%; border-radius: 12px; }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.focus(); window.print();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
          Student Dashboard
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
          Your Fest Pass, Ready to Swing
        </h1>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Hero: Digital Fest Pass                                      */}
      {/* ------------------------------------------------------------ */}
      <div
        ref={passRef}
        className="relative rounded-brutal border border-spidey-white/10 glass border-glow-red overflow-hidden"
      >
        {/* Ambient accents */}
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-spidey-red/20 blur-[90px]"
          aria-hidden
        />
        <div
          className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-spidey-cyan/15 blur-[100px]"
          aria-hidden
        />
        <div
          className="absolute inset-0 comic-halftone opacity-[0.05]"
          aria-hidden
        />

        <div className="relative z-10 p-5 sm:p-8 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 md:gap-10 items-center">
          {/* Left: identity */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-spidey-blue border-2 border-spidey-red flex items-center justify-center shrink-0">
                <span className="font-mono font-black text-spidey-red text-[10px] tracking-tighter">
                  N26
                </span>
              </div>
              <div className="leading-tight">
                <p className="font-bold text-sm text-spidey-white">
                  Official Digital Fest Pass
                </p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-spidey-white/45 font-mono">
                  Noesis '26 · Campus Access
                </p>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-spidey-white">
              {student.name}
            </h2>

            <div className="mt-3 flex flex-col gap-1.5 text-sm text-spidey-white/70 font-mono">
              <span className="flex items-center gap-2">
                <Building2 size={14} className="text-spidey-cyan shrink-0" />
                {student.college}
              </span>
              <span className="flex items-center gap-2">
                <Hash size={14} className="text-spidey-cyan shrink-0" />
                Roll No. {student.rollNo}
              </span>
            </div>

            <div className="mt-4">
              <VerificationBadge verified={isVerified} />
            </div>
          </div>

          {/* Right: live QR badge */}
          <div className="flex flex-col items-center gap-3 shrink-0 mx-auto">
            <div className="relative p-3 rounded-xl bg-spidey-white border-2 border-spidey-cyan/60 shadow-[0_0_28px_rgba(0,210,255,0.35)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={token}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <QRCodeSVG
                    value={token}
                    size={148}
                    bgColor="#F4F6FB"
                    fgColor="#0B1F3A"
                    level="M"
                    includeMargin={false}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Animated scan line sweeping the QR to signal it's "live" */}
              <motion.div
                aria-hidden
                initial={{ y: 8 }}
                animate={{ y: 148 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                className="absolute left-3 right-3 h-[2px] bg-spidey-red/70 shadow-[0_0_10px_rgba(229,27,35,0.7)] pointer-events-none"
              />

              {/* Corner brackets */}
              <span className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-2 border-l-2 border-spidey-red rounded-tl" />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-2 border-r-2 border-spidey-red rounded-tr" />
              <span className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-2 border-l-2 border-spidey-red rounded-bl" />
              <span className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-2 border-r-2 border-spidey-red rounded-br" />
            </div>

            <p className="flex items-center gap-1.5 text-[10px] font-mono text-spidey-white/45 tracking-wide">
              <Sparkles size={11} className="text-spidey-cyan" />
              UID {student.uid} · refreshes every 20s
            </p>
          </div>
        </div>

        {/* Actions */}
        <div
          className="relative z-10 flex flex-wrap items-center gap-3 px-5 sm:px-8 pb-6"
          data-html2canvas-ignore="true"
        >
          <button
            onClick={handleDownloadPNG}
            disabled={exportState !== "idle"}
            data-cursor="interactive"
            className="flex items-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-5 py-2.5 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exportState === "png" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download PNG
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={exportState !== "idle"}
            data-cursor="interactive"
            className="flex items-center gap-2 rounded-full bg-spidey-red text-spidey-white font-bold text-sm px-5 py-2.5 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed animate-pulse-glow"
          >
            {exportState === "pdf" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            Download PDF
          </button>

          <button
            onClick={handlePrint}
            data-cursor="interactive"
            className="flex items-center gap-2 rounded-full border border-spidey-white/20 text-spidey-white font-semibold text-sm px-5 py-2.5 hover:border-spidey-cyan/50 hover:text-spidey-cyan transition-colors"
          >
            <Printer size={16} />
            Print Pass
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Metrics row                                                   */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          icon={Ticket}
          accent="cyan"
          label="Total Registered Events"
          value={student.registeredEvents ?? 0}
          sub="Across all rounds"
        />
        <MetricCard
          icon={isVerified ? CheckCircle2 : ShieldAlert}
          accent={isVerified ? "cyan" : "red"}
          label="Verification Status"
          value={isVerified ? "Verified" : "Pending"}
          sub={
            isVerified
              ? "Cleared for campus check-in"
              : "Awaiting desk verification"
          }
        />
        <MetricCard
          icon={Clock}
          accent="red"
          label="Next Upcoming Event"
          value={nextEventLabel}
          sub={NEXT_EVENT.name}
          countdown
        />
      </div>
    </div>
  );
}

function VerificationBadge({ verified }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-mono font-semibold ${
        verified
          ? "border-spidey-cyan/50 bg-spidey-cyan/10 text-spidey-cyan"
          : "border-spidey-red/50 bg-spidey-red/10 text-spidey-red-light"
      }`}
    >
      {verified ? <ShieldCheck size={13} /> : <ShieldAlert size={13} />}
      {verified ? "Verified Pass" : "Verification Pending"}
    </span>
  );
}

function MetricCard({ icon: Icon, accent, label, value, sub, countdown }) {
  const accentClasses =
    accent === "cyan"
      ? "border-spidey-cyan/30 text-spidey-cyan bg-spidey-cyan/10"
      : "border-spidey-red/30 text-spidey-red-light bg-spidey-red/10";

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="rounded-brutal border border-spidey-white/10 glass p-5 flex flex-col gap-3"
    >
      <div
        className={`w-10 h-10 rounded-lg border flex items-center justify-center ${accentClasses}`}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-[0.15em] text-spidey-white/45 font-mono mb-1">
          {label}
        </p>
        <p
          className={`font-bold text-spidey-white ${
            countdown ? "text-xl font-mono" : "text-2xl"
          }`}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs text-spidey-white/50 mt-1 truncate">{sub}</p>
        )}
      </div>
    </motion.div>
  );
}
