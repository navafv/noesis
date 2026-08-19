import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
} from "lucide-react";
import { EVENTS } from "../data/eventsData";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "PG / Other"];

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

export default function RegisterSection() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success
  const badgeRef = useRef(null);

  const applyEventFromHash = useCallback(() => {
    const hash = window.location.hash;
    const match = hash.match(/event=([\w-]+)/);
    if (match) {
      const id = match[1];
      if (EVENTS.some((e) => e.id === id)) {
        setForm((prev) => ({ ...prev, eventId: id }));
        const registerEl = document.getElementById("register");
        registerEl?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  useEffect(() => {
    applyEventFromHash();
    window.addEventListener("hashchange", applyEventFromHash);
    return () => window.removeEventListener("hashchange", applyEventFromHash);
  }, [applyEventFromHash]);

  const teamSize = useMemo(() => {
    if (!form.eventId) return 1;
    return TEAM_SIZES[form.eventId] ?? 1;
  }, [form.eventId]);

  useEffect(() => {
    setForm((prev) => {
      const needed = Math.max(teamSize - 1, 0);
      const current = prev.teamMembers;
      if (current.length === needed) return prev;
      const next = Array.from({ length: needed }, (_, i) => current[i] || "");
      return { ...prev, teamMembers: next };
    });
  }, [teamSize]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
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
    // Simulated network submission — wire to real backend/Sheets API later.
    await new Promise((resolve) => setTimeout(resolve, 1600));
    setStatus("success");
    confetti({
      particleCount: 140,
      spread: 100,
      origin: { y: 0.5 },
      colors: ["#00F5D4", "#004741", "#F0EDE4"],
    });
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
    setStatus("idle");
  };

  const selectedEvent = EVENTS.find((e) => e.id === form.eventId);

  return (
    <section
      id="register"
      className="relative py-24 sm:py-32 px-4 overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] -z-10 rounded-full blur-[140px] opacity-15 bg-emerald"
        aria-hidden
      />

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-emerald mb-3">
            Claim Your Spot
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl text-sand tracking-tight">
            Register
          </h2>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <SuccessBadge
              key="success"
              form={form}
              event={selectedEvent}
              onReset={resetForm}
              badgeRef={badgeRef}
            />
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="rounded-brutal border border-sand/10 bg-surface/90 md:bg-surface/50 md:backdrop-blur-sm p-5 sm:p-8 space-y-10"
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
                  <label className="block text-xs font-mono uppercase tracking-[0.12em] text-sand/50 mb-2">
                    Choose Your Event
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EVENTS.map((ev) => {
                      const isActive = form.eventId === ev.id;
                      return (
                        <button
                          type="button"
                          key={ev.id}
                          onClick={() => update("eventId", ev.id)}
                          className={`px-3.5 py-2 rounded-full text-xs font-mono font-medium border transition-colors ${
                            isActive
                              ? "bg-emerald text-cyprus border-emerald"
                              : "border-sand/15 text-sand/70 hover:border-emerald/40"
                          }`}
                        >
                          {ev.title}
                        </button>
                      );
                    })}
                  </div>
                  {errors.eventId && <ErrorText>{errors.eventId}</ErrorText>}
                </div>

                {/* Dynamic team member fields */}
                <AnimatePresence>
                  {teamSize > 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="sm:col-span-2 space-y-3 overflow-hidden"
                    >
                      <p className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-sand/50">
                        <Users size={13} className="text-emerald" />
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
                  <div className="shrink-0 flex flex-col items-center gap-3 rounded-brutal border border-emerald/25 bg-cyprus/40 p-5">
                    <div className="w-36 h-36 bg-sand rounded-lg flex items-center justify-center">
                      <QrCode size={100} className="text-cyprus" />
                    </div>
                    <p className="font-mono text-xs text-emerald text-center break-all">
                      noesisitfest@okhdfcbank
                    </p>
                    <p className="text-[10px] text-sand/50 text-center">
                      Scan & pay registration fee
                    </p>
                  </div>

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
                    <p className="text-xs text-sand/50 leading-relaxed">
                      Pay the applicable event fee via any UPI app, then enter
                      the transaction reference number above. Your registration
                      is confirmed once payment is verified — you'll receive a
                      confirmation email at the address provided.
                    </p>
                  </div>
                </div>
              </FormGroup>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-emerald text-cyprus-void font-bold text-sm px-6 py-4 hover:scale-[1.01] active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed animate-pulse-glow"
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
  );
}

function FormGroup({ title, children }) {
  return (
    <div>
      <h3 className="font-display font-bold text-sand text-base mb-5 pb-3 border-b border-sand/10">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

function Field({ icon: Icon, label, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-sand/50 mb-2">
        <Icon size={13} className="text-emerald" />
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
  return `w-full rounded-lg bg-canvas/60 border ${
    error ? "border-red-400/60" : "border-sand/15"
  } text-sand text-sm px-4 py-3 outline-none focus:border-emerald/60 transition-colors placeholder:text-sand/30`;
}

function SuccessBadge({ form, event, onReset, badgeRef }) {
  const handleDownload = () => {
    // Lightweight print-to-PDF trigger; a canvas/image export
    // library can replace this for true PNG downloads later.
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-brutal border border-emerald/40 bg-surface/90 md:bg-surface/60 md:backdrop-blur-sm p-6 sm:p-10 text-center"
    >
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald flex items-center justify-center">
        <CheckCircle2 size={30} className="text-cyprus" />
      </div>
      <h3 className="font-display font-black text-2xl sm:text-3xl text-sand mb-2">
        You're In! 🎉
      </h3>
      <p className="text-sand/60 text-sm mb-8 max-w-md mx-auto">
        Your registration for{" "}
        <span className="text-emerald font-semibold">{event?.title}</span> has
        been received. A confirmation email is on its way to {form.email}.
      </p>

      {/* Badge preview */}
      <div
        ref={badgeRef}
        className="max-w-sm mx-auto rounded-brutal border border-emerald/30 bg-gradient-to-br from-cyprus to-canvas p-6 text-left relative overflow-hidden"
      >
        <div className="absolute inset-0 grid-overlay opacity-10" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald mb-1 relative">
          Official Participant Badge
        </p>
        <h4 className="font-display font-black text-xl text-sand mb-4 relative">
          Noesis '26
        </h4>
        <div className="space-y-1.5 relative">
          <p className="text-sand text-sm font-semibold">
            {form.fullName || "Participant Name"}
          </p>
          <p className="text-sand/60 text-xs">
            {form.college || "College Name"}
          </p>
          <p className="text-sand/60 text-xs">{event?.title}</p>
        </div>
        <div className="mt-5 pt-4 border-t border-sand/10 flex items-center justify-between relative">
          <span className="text-[9px] font-mono text-sand/40">
            Sept 30 – Oct 01, 2026
          </span>
          <span className="text-[9px] font-mono text-sand/40">
            Jamia Hamdard, Kannur
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <button
          onClick={handleDownload}
          className="flex items-center justify-center gap-2 rounded-full bg-emerald text-cyprus-void font-bold text-sm px-6 py-3"
        >
          <Download size={16} />
          Download Badge
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 rounded-full border border-sand/20 text-sand font-semibold text-sm px-6 py-3 hover:border-emerald/40 transition-colors"
        >
          Register Another
        </button>
      </div>
    </motion.div>
  );
}
