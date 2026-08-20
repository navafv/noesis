import { useState, useMemo, useRef, cloneElement } from "react";
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
  ArrowRight,
  ShieldCheck,
  Info,
  Check,
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

// The 4-step map. Each step owns a fixed set of field names so per-step
// validation and "which step is this field on" lookups (used to jump the
// user to a field with an error) both read from one source of truth.
const STEPS = [
  {
    id: "personal",
    label: "Personal Details",
    shortLabel: "Personal",
    fields: ["fullName", "email", "phone", "whatsapp"],
  },
  {
    id: "academic",
    label: "Academic Details",
    shortLabel: "Academic",
    fields: ["college", "department", "year", "rollNo"],
  },
  {
    id: "event",
    label: "Event & Team Roster",
    shortLabel: "Event",
    fields: ["eventId"], // teamMember{i} fields are appended dynamically
  },
  {
    id: "payment",
    label: "UPI Payment & Verification",
    shortLabel: "Payment",
    fields: ["utr"],
  },
];

/**
 * RegisterPage.jsx
 * Dedicated registration route ("/register"). Reads `?event=<id>` from
 * the URL (set by EventsPage / EventModal / SchedulePage deep-links) to
 * pre-select the event, auto-expands team-member fields based on that
 * event's rules, shows a Spider-themed UPI QR block for payment, and —
 * on submit — renders a downloadable digital pass preview.
 *
 * The form itself is a 4-step progressive stepper (Personal → Academic
 * → Event & Team → Payment) rather than one long scroll: each step
 * validates only its own fields before advancing, previous steps stay
 * filled when navigating back, and the whole thing re-validates in full
 * on final submit as a safety net.
 */
function teamSizeFor(eventId) {
  if (!eventId) return 1;
  return TEAM_SIZES[eventId] ?? 1;
}

// Field-level validators, each keyed by form field name. Shared by both
// per-step validation (Next Step) and the full-form safety-net check
// (final submit) so the rules only live in one place.
function fieldError(field, form) {
  switch (field) {
    case "fullName":
      return !form.fullName.trim() ? "Required" : undefined;
    case "email":
      return !/^\S+@\S+\.\S+$/.test(form.email)
        ? "Enter a valid email"
        : undefined;
    case "phone":
      return !/^[6-9]\d{9}$/.test(form.phone)
        ? "Enter a valid 10-digit number"
        : undefined;
    case "whatsapp":
      return !/^[6-9]\d{9}$/.test(form.whatsapp)
        ? "Enter a valid 10-digit number"
        : undefined;
    case "college":
      return !form.college.trim() ? "Required" : undefined;
    case "department":
      return !form.department.trim() ? "Required" : undefined;
    case "year":
      return !form.year ? "Select your year" : undefined;
    case "rollNo":
      return !form.rollNo.trim() ? "Required" : undefined;
    case "eventId":
      return !form.eventId ? "Select an event" : undefined;
    case "utr":
      return !form.utr.trim() || form.utr.trim().length < 6
        ? "Enter a valid transaction reference"
        : undefined;
    default:
      if (field.startsWith("teamMember")) {
        const i = Number(field.replace("teamMember", ""));
        return !form.teamMembers[i]?.trim() ? "Required" : undefined;
      }
      return undefined;
  }
}

// All field names for a given step, including the dynamic teamMember{i}
// fields on the "event" step (their count depends on the selected event).
function fieldsForStep(step, form) {
  if (step.id === "event") {
    const count = Math.max(teamSizeFor(form.eventId) - 1, 0);
    return [
      ...step.fields,
      ...Array.from({ length: count }, (_, i) => `teamMember${i}`),
    ];
  }
  return step.fields;
}

function validateFields(fields, form) {
  const errs = {};
  fields.forEach((field) => {
    const err = fieldError(field, form);
    if (err) errs[field] = err;
  });
  return errs;
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
  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const badgeRef = useRef(null);
  const formRef = useRef(null);

  const teamSize = useMemo(() => teamSizeFor(form.eventId), [form.eventId]);
  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

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
    setErrors((prev) => ({ ...prev, [`teamMember${index}`]: undefined }));
  };

  // Focuses (and smooth-scrolls to) the first invalid field currently
  // rendered in the DOM. Shared by both per-step "Next" validation and
  // the final-submit safety net.
  const focusFirstError = (errs) => {
    const firstErrorField = Object.keys(errs)[0];
    if (!firstErrorField) return;
    const el = formRef.current?.querySelector(`#${firstErrorField}`);
    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const goNext = () => {
    const stepFields = fieldsForStep(currentStep, form);
    const errs = validateFields(stepFields, form);
    if (Object.keys(errs).length > 0) {
      setErrors((prev) => ({ ...prev, ...errs }));
      focusFirstError(errs);
      return;
    }
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  };

  const goBack = () => {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  // Jump directly to a step via the stepper header — only allowed for
  // steps already completed (or the current one), so a user can't skip
  // ahead of unvalidated data by clicking a future node.
  const goToStep = (index) => {
    if (index <= stepIndex) {
      setDirection(index < stepIndex ? -1 : 1);
      setStepIndex(index);
    }
  };

  const validateAll = () => {
    const allFields = STEPS.flatMap((step) => fieldsForStep(step, form));
    const errs = validateFields(allFields, form);
    setErrors(errs);
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Full-form safety net: re-validates everything on final submit in
    // case a user reached step 4 with stale state (e.g. browser back/
    // forward), not just whatever the last "Next" click checked.
    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      // If the first invalid field belongs to an earlier step, jump back
      // to it rather than leaving the user stuck on step 4.
      const firstErrorField = Object.keys(errs)[0];
      const stepWithError = STEPS.findIndex((step) =>
        fieldsForStep(step, form).includes(firstErrorField),
      );
      if (stepWithError !== -1 && stepWithError !== stepIndex) {
        setDirection(stepWithError < stepIndex ? -1 : 1);
        setStepIndex(stepWithError);
      }
      // Defer focus until after the step transition has rendered.
      requestAnimationFrame(() => focusFirstError(errs));
      return;
    }
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
    setStepIndex(0);
    setDirection(1);
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
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-brutal border border-spidey-white/10 bg-spidey-surface/90 md:bg-spidey-surface/50 md:backdrop-blur-sm overflow-hidden"
              >
                <Stepper
                  steps={STEPS}
                  currentIndex={stepIndex}
                  errors={errors}
                  onStepClick={goToStep}
                />

                {/* Live-announced error summary — visually hidden, but
                    read out by screen readers immediately after a failed
                    step-advance or submit so non-visual users know
                    something needs fixing without having to re-tab
                    through the whole form. */}
                {Object.keys(errors).length > 0 && (
                  <p role="alert" className="sr-only">
                    {Object.keys(errors).length} field
                    {Object.keys(errors).length === 1 ? "" : "s"} need
                    attention. Please review the form and correct the
                    highlighted fields.
                  </p>
                )}

                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  noValidate
                  className="p-5 sm:p-8"
                >
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={currentStep.id}
                      custom={direction}
                      initial={{ opacity: 0, x: direction * 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction * -24 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    >
                      {currentStep.id === "personal" && (
                        <PersonalStep
                          form={form}
                          errors={errors}
                          update={update}
                        />
                      )}
                      {currentStep.id === "academic" && (
                        <AcademicStep
                          form={form}
                          errors={errors}
                          update={update}
                        />
                      )}
                      {currentStep.id === "event" && (
                        <EventStep
                          form={form}
                          errors={errors}
                          teamSize={teamSize}
                          selectEvent={selectEvent}
                          updateTeamMember={updateTeamMember}
                        />
                      )}
                      {currentStep.id === "payment" && (
                        <PaymentStep
                          form={form}
                          errors={errors}
                          update={update}
                        />
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Step navigation */}
                  <div className="flex items-center justify-between gap-3 mt-10 pt-6 border-t border-spidey-white/10">
                    <button
                      type="button"
                      onClick={goBack}
                      disabled={stepIndex === 0}
                      data-cursor="interactive"
                      className="flex items-center gap-2 rounded-full border border-spidey-white/20 text-spidey-white/80 font-semibold text-sm px-5 py-3 hover:border-spidey-cyan/40 hover:text-spidey-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
                    >
                      <ArrowLeft size={15} />
                      Previous
                    </button>

                    {!isLastStep ? (
                      <button
                        type="button"
                        onClick={goNext}
                        data-cursor="interactive"
                        className="flex items-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-6 py-3 hover:scale-[1.02] active:scale-95 transition-transform"
                      >
                        Next Step
                        <ArrowRight size={15} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        data-cursor="interactive"
                        className="flex items-center justify-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-6 py-3.5 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-70 disabled:cursor-not-allowed animate-pulse-glow"
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
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky progress stepper header                                     */
/* ------------------------------------------------------------------ */

function Stepper({ steps, currentIndex, errors, onStepClick }) {
  // A step is flagged as errored (crimson node) if any of its own fields
  // currently hold an error and it isn't the active step — active steps
  // show their errors inline instead, so the node itself stays cyan.
  const stepHasError = (step, index) => {
    if (index === currentIndex) return false;
    return fieldsForStepStatic(step).some((f) => errors[f]);
  };

  return (
    <div className="sticky top-0 z-10 bg-spidey-surface/95 md:bg-spidey-surface/80 md:backdrop-blur-md border-b border-spidey-white/10 px-5 sm:px-8 py-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-spidey-cyan mb-4">
        Step {currentIndex + 1} of {steps.length}: {steps[currentIndex].label}
      </p>

      <div className="flex items-center">
        {steps.map((step, i) => {
          const isComplete = i < currentIndex;
          const isActive = i === currentIndex;
          const hasError = stepHasError(step, i);
          const clickable = i <= currentIndex;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1 last:flex-none"
            >
              <button
                type="button"
                onClick={() => onStepClick(i)}
                disabled={!clickable}
                data-cursor={clickable ? "interactive" : undefined}
                aria-current={isActive ? "step" : undefined}
                aria-label={`${step.label}${isComplete ? " (completed)" : ""}`}
                className={`relative shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center text-xs font-mono font-bold transition-colors ${
                  hasError
                    ? "border-spidey-red bg-spidey-red/20 text-spidey-red-light"
                    : isActive
                      ? "border-spidey-cyan bg-spidey-cyan text-spidey-blue shadow-[0_0_16px_2px_rgba(0,210,255,0.45)]"
                      : isComplete
                        ? "border-spidey-cyan/70 bg-spidey-cyan/15 text-spidey-cyan"
                        : "border-spidey-white/20 text-spidey-white/40"
                } ${clickable ? "cursor-pointer" : "cursor-default"}`}
              >
                {isComplete && !hasError ? <Check size={16} /> : i + 1}
              </button>

              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="flex-1 h-[2px] mx-1.5 sm:mx-2 rounded-full bg-spidey-white/10 overflow-hidden"
                >
                  <motion.span
                    initial={false}
                    animate={{ width: i < currentIndex ? "100%" : "0%" }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="block h-full bg-spidey-cyan shadow-[0_0_8px_1px_rgba(0,210,255,0.5)]"
                  />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Compact labels beneath the nodes on larger screens */}
      <div className="hidden sm:flex justify-between mt-2 px-0.5">
        {steps.map((step, i) => (
          <span
            key={step.id}
            className={`text-[10px] font-mono uppercase tracking-wide ${
              i === currentIndex ? "text-spidey-cyan" : "text-spidey-white/35"
            }`}
          >
            {step.shortLabel}
          </span>
        ))}
      </div>
    </div>
  );
}

// Static (form-independent) field list per step, used only by the
// Stepper's error-flagging — doesn't need the dynamic teamMember count,
// since team-member errors surface via the "event" step's own eventId
// field check plus its own inline rendering while active.
function fieldsForStepStatic(step) {
  if (step.id === "event") return ["eventId"];
  return step.fields;
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Personal Details                                          */
/* ------------------------------------------------------------------ */

function PersonalStep({ form, errors, update }) {
  return (
    <FormGroup title="Personal Details">
      <Field
        id="fullName"
        icon={User}
        label="Full Name"
        error={errors.fullName}
      >
        <input
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          className={inputClass(errors.fullName)}
          placeholder="Your full name"
        />
      </Field>
      <Field id="email" icon={Mail} label="Email" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className={inputClass(errors.email)}
          placeholder="you@example.com"
        />
      </Field>
      <Field
        id="phone"
        icon={Phone}
        label="Phone Number"
        error={errors.phone}
        hint="10-digit Indian mobile number (e.g. 9876543210)"
      >
        <input
          value={form.phone}
          onChange={(e) =>
            update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className={inputClass(errors.phone)}
          placeholder="9876543210"
          inputMode="numeric"
        />
      </Field>
      <Field
        id="whatsapp"
        icon={MessageCircle}
        label="WhatsApp Number"
        error={errors.whatsapp}
        hint="10-digit Indian mobile number (e.g. 9876543210)"
      >
        <input
          value={form.whatsapp}
          onChange={(e) =>
            update("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))
          }
          className={inputClass(errors.whatsapp)}
          placeholder="9876543210"
          inputMode="numeric"
        />
      </Field>
    </FormGroup>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Academic Details                                          */
/* ------------------------------------------------------------------ */

function AcademicStep({ form, errors, update }) {
  return (
    <FormGroup title="Academic Details">
      <Field
        id="college"
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
        id="department"
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
        id="year"
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
        id="rollNo"
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
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Event & Team Roster                                       */
/* ------------------------------------------------------------------ */

function EventStep({ form, errors, teamSize, selectEvent, updateTeamMember }) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display font-bold text-spidey-white text-base mb-5 pb-3 border-b border-spidey-white/10">
          Choose Your Event
        </h3>

        <div id="eventId">
          <div
            role="group"
            aria-label="Choose your event"
            aria-invalid={!!errors.eventId}
            aria-describedby={errors.eventId ? "eventId-error" : undefined}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {EVENTS.map((ev) => {
              const isActive = form.eventId === ev.id;
              const size = TEAM_SIZES[ev.id] ?? 1;
              return (
                <button
                  type="button"
                  key={ev.id}
                  onClick={() => selectEvent(ev.id)}
                  aria-pressed={isActive}
                  data-cursor="interactive"
                  className={`text-left rounded-xl border px-4 py-3.5 transition-colors ${
                    isActive
                      ? "bg-spidey-cyan/15 border-spidey-cyan text-spidey-white border-glow-cyan"
                      : "border-spidey-white/15 text-spidey-white/75 hover:border-spidey-cyan/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm">{ev.title}</span>
                    {isActive && (
                      <CheckCircle2
                        size={16}
                        className="text-spidey-cyan shrink-0"
                      />
                    )}
                  </div>
                  <span className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-spidey-white/50">
                    <Users size={11} />
                    {size === 1 ? "Solo entry" : `Team of ${size}`}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.eventId && (
            <ErrorText id="eventId-error">{errors.eventId}</ErrorText>
          )}
        </div>
      </div>

      {/* Dynamic team member fields — count driven by TEAM_SIZES for the
          selected event. */}
      <AnimatePresence>
        {teamSize > 1 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <p className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.12em] text-spidey-white/50 mb-1.5">
                <Users size={13} className="text-spidey-cyan" />
                Team Members ({teamSize} total — 1 registrant + {teamSize - 1}{" "}
                more)
              </p>
              <p className="flex items-start gap-1.5 text-xs text-spidey-white/45 leading-relaxed mb-4">
                <Info size={13} className="text-spidey-cyan mt-0.5 shrink-0" />
                We collect teammate names to generate individual digital passes
                and QR check-in badges.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {form.teamMembers.map((val, i) => (
                  <Field
                    key={i}
                    id={`teamMember${i}`}
                    icon={Users}
                    label={`Team Member ${i + 2} — Full Name`}
                    error={errors[`teamMember${i}`]}
                  >
                    <input
                      value={val}
                      onChange={(e) => updateTeamMember(i, e.target.value)}
                      className={inputClass(errors[`teamMember${i}`])}
                      placeholder={`Team member ${i + 2} name`}
                    />
                  </Field>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — UPI Payment & Verification                                */
/* ------------------------------------------------------------------ */

function PaymentStep({ form, errors, update }) {
  return (
    <FormGroup title="Payment / UPI Confirmation">
      <div className="sm:col-span-2 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        <SpideyQRCode />

        <div className="flex-1 w-full space-y-4">
          <Field
            id="utr"
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

          <div className="flex items-start gap-2.5 rounded-lg border border-spidey-cyan/25 bg-spidey-cyan/[0.06] px-3.5 py-3">
            <ShieldCheck
              size={16}
              className="text-spidey-cyan mt-0.5 shrink-0"
            />
            <p className="text-xs text-spidey-white/65 leading-relaxed">
              Pay the applicable event fee via any UPI app, then enter the
              transaction reference number above. Your{" "}
              <span className="text-spidey-cyan font-medium">
                UTR is manually verified within 24 hours
              </span>
              . Your digital pass and schedule confirmation will be accessible
              on your dashboard upon verification.
            </p>
          </div>
        </div>
      </div>
    </FormGroup>
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

function Field({ id, icon: Icon, label, error, hint, children }) {
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-spidey-white/50 mb-2"
      >
        <Icon size={13} className="text-spidey-cyan" />
        {label}
      </label>
      {cloneElement(children, {
        id,
        "aria-invalid": !!error,
        "aria-describedby": describedBy,
      })}
      {hint && !error && (
        <p id={hintId} className="text-[11px] text-spidey-white/40 mt-1.5">
          {hint}
        </p>
      )}
      {error && <ErrorText id={errorId}>{error}</ErrorText>}
    </div>
  );
}

function ErrorText({ id, children }) {
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1.5 text-xs text-spidey-red-light mt-1.5"
    >
      <AlertCircle size={12} />
      {children}
    </p>
  );
}

function inputClass(error) {
  return `w-full rounded-lg bg-spidey-blue/60 border ${
    error ? "border-spidey-red-light/60" : "border-spidey-white/15"
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
        has been received. Your UTR is manually verified within 24 hours — your
        digital pass and schedule confirmation will be accessible on your
        dashboard upon verification. A confirmation email is on its way to{" "}
        {form.email}.
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
