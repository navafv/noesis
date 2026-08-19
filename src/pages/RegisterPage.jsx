import { useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  User,
  Mail,
  Phone,
  MessageCircle,
  Building2,
  GraduationCap,
  BadgeCheck,
  Users,
  QrCode,
  Hash,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

import SEO from "../components/SEO";
import { EVENTS } from "../data/eventsData";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "PG / Other"];

// Team size per event, keyed by eventsData.js ids. Drives how many
// additional "Team Member" inputs render below the primary registrant.
const TEAM_SIZES = {
  coding: 2,
  debugging: 1,
  "web-designing": 2,
  prompting: 1,
  "it-quiz": 2,
  "treasure-hunt": 3,
  gaming: 4,
  "blind-typing": 1,
  "reel-making": 2,
};

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  whatsapp: "",
  college: "",
  department: "",
  year: "",
  rollNo: "",
  eventId: "",
  teamMembers: [],
  utr: "",
};

/**
 * RegisterPage.jsx
 * Dedicated registration route ("/register"). Reads `?event=<id>` from
 * the URL (set by EventsPage / EventModal / SchedulePage deep-links) to
 * pre-select the event, auto-expands team-member fields based on that
 * event's rules, shows a Spider-themed UPI QR block for payment, and —
 * on submit — renders a downloadable digital pass preview.
 */
function teamSizeFor(eventId) {
  if (!eventId) return 1;
  return TEAM_SIZES[eventId] ?? 1;
}

export default function RegisterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Pre-select the event from ?event=<id> (validated against known events)
  // and size the teamMembers array to match it — computed once, lazily,
  // as the initial state rather than synced in afterward via an effect.
  const [form, setForm] = useState(() => {
    const requested = searchParams.get("event");
    const eventId =
      requested && EVENTS.some((e) => e.id === requested) ? requested : "";
    const needed = Math.max(teamSizeFor(eventId) - 1, 0);
    return {
      ...initialForm,
      eventId,
      teamMembers: Array.from({ length: needed }, () => ""),
    };
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const badgeRef = useRef(null);

  const teamSize = useMemo(() => teamSizeFor(form.eventId), [form.eventId]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Selecting an event card resizes teamMembers to match the new event's
  // team size right away, and syncs the URL so the choice stays
  // shareable/bookmarkable and survives a refresh.
  const selectEvent = (eventId) => {
    setForm((prev) => {
      const needed = Math.max(teamSizeFor(eventId) - 1, 0);
      const next = Array.from(
        { length: needed },
        (_, i) => prev.teamMembers[i] || "",
      );
      return { ...prev, eventId, teamMembers: next };
    });
    setErrors((prev) => ({ ...prev, eventId: undefined }));
    setSearchParams({ event: eventId }, { replace: true });
  };

  const updateTeamMember = (index, value) => {
    setForm((prev) => {
      const copy = [...prev.teamMembers];
      copy[index] = value;
      return { ...prev, teamMembers: copy };
    });
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      errs.phone = "Enter a valid 10-digit number";
    if (!/^[6-9]\d{9}$/.test(form.whatsapp))
      errs.whatsapp = "Enter a valid 10-digit number";
    if (!form.college.trim()) errs.college = "Required";
    if (!form.department.trim()) errs.department = "Required";
    if (!form.year) errs.year = "Select your year";
    if (!form.rollNo.trim()) errs.rollNo = "Required";
    if (!form.eventId) errs.eventId = "Select an event";
    if (!form.utr.trim() || form.utr.trim().length < 6)
      errs.utr = "Enter a valid transaction reference";
    form.teamMembers.forEach((m, i) => {
      if (!m.trim()) errs[`teamMember${i}`] = "Required";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");
    // Simulated network submission — wire to a real backend/Sheets API later.
    await new Promise((resolve) => setTimeout(resolve, 1600));
    setStatus("success");
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#00d2ff", "#e51b23", "#f4f6fb"],
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setStatus("idle");
    setSearchParams({}, { replace: true });
  };

  const selectedEvent = EVENTS.find((e) => e.id === form.eventId);

  return (
    <>
      <SEO
        title="Register | Noesis'26 — Secure Your Spot"
        description="Register now for Noesis'26, the National-Level Inter-College IT Fest at Jamia Hamdard Kannur Campus. Limited seats across all events — sign up today."
      />

      <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32 px-4 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] -z-10 rounded-full blur-[140px] opacity-15 bg-spidey-cyan"
          aria-hidden
        />

        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-spidey-cyan mb-3">
              Claim Your Spot
            </p>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-spidey-white tracking-tight">
              Register
            </h1>
            {selectedEvent && status !== "success" && (
              <p className="mt-4 text-sm text-spidey-white/60">
                Registering for{" "}
                <span className="text-spidey-cyan font-semibold">
                  {selectedEvent.title}
                </span>{" "}
                — not the right event?{" "}
                <Link
                  to="/events"
                  className="underline decoration-spidey-cyan/40 hover:text-spidey-cyan"
                >
                  Browse all events
                </Link>
                .
              </p>
            )}
          </motion.div>

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <PassPreview
                key="success"
                form={form}
                event={selectedEvent}
                onReset={resetForm}
                badgeRef={badgeRef}
                navigate={navigate}
              />
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="rounded-brutal border border-spidey-white/10 bg-spidey-surface/90 md:bg-spidey-surface/50 md:backdrop-blur-sm p-5 sm:p-8 space-y-10"
              >
                {/* Personal Details */}
                <FormGroup title="Personal Details">
                  <Field icon={User} label="Full Name" error={errors.fullName}>
                    <input
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      className={inputClass(errors.fullName)}
                      placeholder="Your full name"
                    />
                  </Field>
                  <Field icon={Mail} label="Email" error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputClass(errors.email)}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field icon={Phone} label="Phone Number" error={errors.phone}>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        update(
                          "phone",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className={inputClass(errors.phone)}
                      placeholder="10-digit mobile number"
                    />
                  </Field>
                  <Field
                    icon={MessageCircle}
                    label="WhatsApp Number"
                    error={errors.whatsapp}
                  >
                    <input
                      value={form.whatsapp}
                      onChange={(e) =>
                        update(
                          "whatsapp",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className={inputClass(errors.whatsapp)}
                      placeholder="10-digit WhatsApp number"
                    />
                  </Field>
                </FormGroup>

                {/* Academic Details */}
                <FormGroup title="Academic Details">
                  <Field
                    icon={Building2}
                    label="College / Institution"
                    error={errors.college}
                  >
                    <input
                      value={form.college}
                      onChange={(e) => update("college", e.target.value)}
                      className={inputClass(errors.college)}
                      placeholder="Your college name"
                    />
                  </Field>
                  <Field
                    icon={GraduationCap}
                    label="Department"
                    error={errors.department}
                  >
                    <input
                      value={form.department}
                      onChange={(e) => update("department", e.target.value)}
                      className={inputClass(errors.department)}
                      placeholder="e.g. Computer Science"
                    />
                  </Field>
                  <Field
                    icon={GraduationCap}
                    label="Year of Study"
                    error={errors.year}
                  >
                    <select
                      value={form.year}
                      onChange={(e) => update("year", e.target.value)}
                      className={inputClass(errors.year)}
                    >
                      <option value="">Select year</option>
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    icon={BadgeCheck}
                    label="College Roll No / ID"
                    error={errors.rollNo}
                  >
                    <input
                      value={form.rollNo}
                      onChange={(e) => update("rollNo", e.target.value)}
                      className={inputClass(errors.rollNo)}
                      placeholder="Roll number / student ID"
                    />
                  </Field>
                </FormGroup>

                {/* Event Selection */}
                <FormGroup title="Event Selection">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-[0.12em] text-spidey-white/50 mb-2">
                      Choose Your Event
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {EVENTS.map((ev) => {
                        const isActive = form.eventId === ev.id;
                        return (
                          <button
                            type="button"
                            key={ev.id}
                            onClick={() => selectEvent(ev.id)}
                            data-cursor="interactive"
                            className={`px-3.5 py-2 rounded-full text-xs font-mono font-medium border transition-colors ${
                              isActive
                                ? "bg-spidey-cyan text-spidey-red border-spidey-cyan"
                                : "border-spidey-white/15 text-spidey-white/70 hover:border-spidey-cyan/40"
                            }`}
                          >
                            {ev.title}
                          </button>
                        );
                      })}
                    </div>
                    {errors.eventId && <ErrorText>{errors.eventId}</ErrorText>}
                  </div>

                  {/* Dynamic team member fields — count driven by TEAM_SIZES
                      for the selected event. */}
                  <AnimatePresence>
                    {teamSize > 1 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="sm:col-span-2 space-y-3 overflow-hidden"
                      >
                        <p className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-spidey-white/50">
                          <Users size={13} className="text-spidey-cyan" />
                          Team Members ({teamSize} total — 1 registrant +{" "}
                          {teamSize - 1} more)
                        </p>
                        {form.teamMembers.map((val, i) => (
                          <Field
                            key={i}
                            icon={Users}
                            label={`Team Member ${i + 2} — Full Name`}
                            error={errors[`teamMember${i}`]}
                          >
                            <input
                              value={val}
                              onChange={(e) =>
                                updateTeamMember(i, e.target.value)
                              }
                              className={inputClass(errors[`teamMember${i}`])}
                              placeholder={`Team member ${i + 2} name`}
                            />
                          </Field>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </FormGroup>

                {/* Payment */}
                <FormGroup title="Payment / UPI Confirmation">
                  <div className="sm:col-span-2 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                    <SpideyQRCode />

                    <div className="flex-1 w-full space-y-4">
                      <Field
                        icon={Hash}
                        label="Transaction UTR / Reference Number"
                        error={errors.utr}
                      >
                        <input
                          value={form.utr}
                          onChange={(e) => update("utr", e.target.value)}
                          className={inputClass(errors.utr)}
                          placeholder="e.g. 302516789432"
                        />
                      </Field>
                      <p className="text-xs text-spidey-white/50 leading-relaxed">
                        Pay the applicable event fee via any UPI app, then enter
                        the transaction reference number above. Your
                        registration is confirmed once payment is verified —
                        you'll receive a confirmation email at the address
                        provided.
                      </p>
                    </div>
                  </div>
                </FormGroup>

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  data-cursor="interactive"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-6 py-4 hover:scale-[1.01] active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed animate-pulse-glow"
                >
                  {status === "submitting" ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Complete Registration
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Spider-themed UPI QR block                                         */
/* ------------------------------------------------------------------ */

function SpideyQRCode() {
  return (
    <div className="shrink-0 flex flex-col items-center gap-3 rounded-brutal border border-spidey-cyan/25 bg-spidey-red/40 p-5">
      <div className="relative w-36 h-36 bg-spidey-white rounded-lg flex items-center justify-center overflow-hidden">
        {/* Faint web-line pattern behind the QR glyph, in keeping with the
            Spider-Verse theme, without obscuring scannability. */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.12]"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <circle
            cx="50"
            cy="50"
            r="10"
            fill="none"
            stroke="#e51b23"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="50"
            r="24"
            fill="none"
            stroke="#e51b23"
            strokeWidth="1"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#e51b23"
            strokeWidth="1"
          />
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI) / 4;
            const x2 = 50 + 55 * Math.cos(angle);
            const y2 = 50 + 55 * Math.sin(angle);
            return (
              <line
                key={i}
                x1="50"
                y1="50"
                x2={x2}
                y2={y2}
                stroke="#e51b23"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <QrCode size={100} className="relative text-spidey-red" />
        <span className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-spidey-red/60" />
        <span className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-spidey-red/60" />
        <span className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-spidey-red/60" />
        <span className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-spidey-red/60" />
      </div>
      <p className="font-mono text-xs text-spidey-cyan text-center break-all">
        noesisitfest@okhdfcbank
      </p>
      <p className="text-[10px] text-spidey-white/50 text-center">
        Scan &amp; pay registration fee
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form building blocks                                               */
/* ------------------------------------------------------------------ */

function FormGroup({ title, children }) {
  return (
    <div>
      <h3 className="font-display font-bold text-spidey-white text-base mb-5 pb-3 border-b border-spidey-white/10">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-spidey-white/50 mb-2">
        <Icon size={13} className="text-spidey-cyan" />
        {label}
      </label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ children }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
      <AlertCircle size={12} />
      {children}
    </p>
  );
}

function inputClass(error) {
  return `w-full rounded-lg bg-spidey-blue/60 border ${
    error ? "border-red-400/60" : "border-spidey-white/15"
  } text-spidey-white text-sm px-4 py-3 outline-none focus:border-spidey-red focus:shadow-[0_0_0_1px_rgba(229,27,35,0.4),0_0_16px_rgba(229,27,35,0.25)] transition-colors placeholder:text-spidey-white/30`;
}

/* ------------------------------------------------------------------ */
/*  Digital pass preview (post-submit)                                 */
/* ------------------------------------------------------------------ */

function PassPreview({ form, event, onReset, badgeRef, navigate }) {
  const handleDownload = () => {
    // Lightweight print-to-PDF trigger; a canvas/image export
    // library can replace this for true PNG downloads later.
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-brutal border border-spidey-cyan/40 bg-spidey-surface/90 md:bg-spidey-surface/60 md:backdrop-blur-sm p-6 sm:p-10 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-spidey-cyan flex items-center justify-center">
        <CheckCircle2 size={30} className="text-spidey-red" />
      </div>
      <h2 className="font-display font-black text-2xl sm:text-3xl text-spidey-white mb-2">
        You're In! 🎉
      </h2>
      <p className="text-spidey-white/60 text-sm mb-8 max-w-md mx-auto">
        Your registration for{" "}
        <span className="text-spidey-cyan font-semibold">{event?.title}</span>{" "}
        has been received. A confirmation email is on its way to {form.email}.
      </p>

      {/* Digital pass — Spider-Verse framed participant badge */}
      <div
        ref={badgeRef}
        className="max-w-sm mx-auto rounded-brutal border border-spidey-cyan/30 bg-gradient-to-br from-spidey-red to-spidey-blue p-6 text-left relative overflow-hidden"
      >
        <div className="absolute inset-0 grid-overlay opacity-10" />
        <div className="absolute inset-0 comic-halftone opacity-[0.12]" />
        {/* Web-corner frame accents */}
        <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-spidey-cyan/70" />
        <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-spidey-cyan/70" />
        <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-spidey-cyan/70" />
        <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-spidey-cyan/70" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-spidey-cyan mb-1 relative">
          Official Digital Pass
        </p>
        <h3 className="font-display font-black text-xl text-spidey-white mb-4 relative">
          Noesis'26
        </h3>
        <div className="space-y-1.5 relative">
          <p className="text-spidey-white text-sm font-semibold">
            {form.fullName || "Participant Name"}
          </p>
          <p className="text-spidey-white/60 text-xs">
            {form.college || "College Name"}
          </p>
          <p className="text-spidey-white/60 text-xs">{event?.title}</p>
          {form.teamMembers.length > 0 && (
            <p className="text-spidey-white/45 text-[11px] pt-1">
              + {form.teamMembers.filter(Boolean).join(", ")}
            </p>
          )}
        </div>
        <div className="mt-5 pt-4 border-t border-spidey-white/10 flex items-center justify-between relative">
          <span className="text-[9px] font-mono text-spidey-white/40">
            Sept 30 – Oct 01, 2026
          </span>
          <span className="text-[9px] font-mono text-spidey-white/40">
            Jamia Hamdard, Kannur
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <button
          onClick={handleDownload}
          data-cursor="interactive"
          className="flex items-center justify-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-6 py-3"
        >
          <Download size={16} />
          Download Pass
        </button>
        <button
          onClick={onReset}
          data-cursor="interactive"
          className="flex items-center justify-center gap-2 rounded-full border border-spidey-white/20 text-spidey-white font-semibold text-sm px-6 py-3 hover:border-spidey-cyan/40 transition-colors"
        >
          Register Another
        </button>
        <button
          onClick={() => navigate("/")}
          data-cursor="interactive"
          className="flex items-center justify-center gap-2 rounded-full border border-spidey-white/20 text-spidey-white/70 font-semibold text-sm px-6 py-3 hover:border-spidey-cyan/40 hover:text-spidey-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </button>
      </div>
    </motion.div>
  );
}
