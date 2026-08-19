import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus2,
  Zap,
  CheckCircle2,
  IndianRupee,
  Banknote,
  QrCode as QrCodeIcon,
  RotateCcw,
  History,
} from "lucide-react";
import { EVENTS } from "../../data/eventsData";

const SPOT_FEE_BY_EVENT = {
  coding: 500,
  debugging: 200,
  "web-designing": 300,
  prompting: 200,
  "it-quiz": 100,
  "treasure-hunt": 100,
  gaming: 250,
  "blind-typing": 100,
  "reel-making": 150,
};

const PAYMENT_MODES = [
  { key: "cash", label: "Cash", icon: Banknote },
  { key: "upi", label: "UPI (on spot)", icon: QrCodeIcon },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  college: "",
  eventId: "",
  teamSize: "1",
  paymentMode: "cash",
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Required";
  if (!/^\d{10}$/.test(form.phone.trim())) errors.phone = "10-digit number";
  if (!form.college.trim()) errors.college = "Required";
  if (!form.eventId) errors.eventId = "Pick an event";
  return errors;
}

export default function SpotEntryPage() {
  useOutletContext();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [justAdded, setJustAdded] = useState(null);
  const [queue, setQueue] = useState([]); // today's spot registrations, newest first
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const selectedEvent = EVENTS.find((e) => e.id === form.eventId);
  const fee = form.eventId ? (SPOT_FEE_BY_EVENT[form.eventId] ?? 0) : 0;

  const todayTotal = useMemo(
    () => queue.reduce((sum, r) => sum + r.fee, 0),
    [queue],
  );

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function resetForNext() {
    setForm((prev) => ({
      ...EMPTY_FORM,
      eventId: prev.eventId, // keep the same event selected — most desks batch by event
      paymentMode: prev.paymentMode,
    }));
    setJustAdded(null);
    nameInputRef.current?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 450)); // mock write

    const record = {
      id: `SPOT-${Date.now().toString().slice(-6)}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      college: form.college.trim(),
      eventTitle: selectedEvent?.title || "—",
      teamSize: form.teamSize,
      paymentMode: form.paymentMode,
      fee,
      time: new Date().toLocaleTimeString(undefined, { timeStyle: "short" }),
    };

    setQueue((prev) => [record, ...prev]);
    setSubmitting(false);
    setJustAdded(record);

    // Auto-reset for the next walk-in after a brief confirmation beat —
    // keeps the desk moving without a manual "add another" click.
    setTimeout(() => {
      setForm((prev) => ({
        ...EMPTY_FORM,
        eventId: prev.eventId,
        paymentMode: prev.paymentMode,
      }));
      setJustAdded(null);
      nameInputRef.current?.focus();
    }, 1600);
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
            Command Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
            Spot Entry
          </h1>
          <p className="text-sm text-spidey-white/50 mt-1">
            Fast walk-in registration for the volunteer desk
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.1em] text-spidey-white/40 font-mono">
              Today
            </p>
            <p className="text-lg font-bold text-spidey-white">
              {queue.length} entries
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.1em] text-spidey-white/40 font-mono">
              Collected
            </p>
            <p className="text-lg font-bold text-spidey-cyan">
              ₹{todayTotal.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Fast form */}
        <div className="lg:col-span-3 rounded-brutal border border-spidey-white/10 glass p-5 sm:p-6">
          <AnimatePresence mode="wait">
            {justAdded ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col items-center justify-center gap-3 py-14 text-center"
              >
                <span className="w-14 h-14 rounded-full bg-spidey-cyan/15 border border-spidey-cyan/40 flex items-center justify-center">
                  <CheckCircle2 size={26} className="text-spidey-cyan" />
                </span>
                <h3 className="font-bold text-spidey-white text-lg">
                  {justAdded.name} registered
                </h3>
                <p className="text-sm text-spidey-white/50">
                  {justAdded.eventTitle} · ₹{justAdded.fee} ·{" "}
                  {justAdded.paymentMode === "cash" ? "Cash" : "UPI"}
                </p>
                <button
                  onClick={resetForNext}
                  data-cursor="interactive"
                  className="mt-2 flex items-center gap-2 rounded-full border border-spidey-white/15 text-spidey-white/70 text-xs font-mono px-4 py-2 hover:border-spidey-cyan/40 hover:text-spidey-cyan transition-colors"
                >
                  <RotateCcw size={12} /> Next entry now
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Full Name"
                    error={errors.name}
                    className="sm:col-span-2"
                  >
                    <input
                      ref={nameInputRef}
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Participant's full name"
                      autoComplete="off"
                      className={inputCls(errors.name)}
                    />
                  </Field>

                  <Field label="Phone Number" error={errors.phone}>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        update(
                          "phone",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="10-digit mobile"
                      inputMode="numeric"
                      className={inputCls(errors.phone)}
                    />
                  </Field>

                  <Field label="Team Size">
                    <select
                      value={form.teamSize}
                      onChange={(e) => update("teamSize", e.target.value)}
                      className={inputCls()}
                    >
                      {["1", "2", "3", "4", "5"].map((n) => (
                        <option key={n} value={n} className="bg-spidey-blue">
                          {n} {n === "1" ? "(Individual)" : "members"}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    label="College / Institution"
                    error={errors.college}
                    className="sm:col-span-2"
                  >
                    <input
                      value={form.college}
                      onChange={(e) => update("college", e.target.value)}
                      placeholder="College name"
                      className={inputCls(errors.college)}
                    />
                  </Field>

                  <Field
                    label="Event"
                    error={errors.eventId}
                    className="sm:col-span-2"
                  >
                    <select
                      value={form.eventId}
                      onChange={(e) => update("eventId", e.target.value)}
                      className={inputCls(errors.eventId)}
                    >
                      <option value="" className="bg-spidey-blue">
                        Select event
                      </option>
                      {EVENTS.map((e) => (
                        <option
                          key={e.id}
                          value={e.id}
                          className="bg-spidey-blue"
                        >
                          {e.title} — ₹{SPOT_FEE_BY_EVENT[e.id] ?? 0}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Payment mode */}
                <div>
                  <p className="text-xs font-mono uppercase tracking-[0.08em] text-spidey-white/50 mb-2">
                    Payment Mode
                  </p>
                  <div className="flex gap-2">
                    {PAYMENT_MODES.map((m) => {
                      const active = form.paymentMode === m.key;
                      return (
                        <button
                          key={m.key}
                          type="button"
                          onClick={() => update("paymentMode", m.key)}
                          data-cursor="interactive"
                          className={`flex-1 flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                            active
                              ? "border-spidey-cyan/50 bg-spidey-cyan/10 text-spidey-cyan"
                              : "border-spidey-white/15 text-spidey-white/60 hover:border-spidey-white/30"
                          }`}
                        >
                          <m.icon size={15} />
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Fee + submit */}
                <div className="flex items-center justify-between rounded-lg border border-spidey-white/10 bg-spidey-white/[0.03] px-4 py-3 mt-1">
                  <span className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.08em] text-spidey-white/50">
                    <IndianRupee size={12} /> Fee Due
                  </span>
                  <span className="text-lg font-bold text-spidey-white">
                    ₹{fee.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  data-cursor="interactive"
                  className="flex items-center justify-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-base px-6 py-3.5 hover:scale-[1.01] active:scale-95 transition-transform disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Zap size={17} className="animate-pulse" /> Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus2 size={17} /> Register & Collect
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* Today's queue */}
        <div className="lg:col-span-2 rounded-brutal border border-spidey-white/10 glass p-5">
          <div className="flex items-center gap-2 mb-4">
            <History size={15} className="text-spidey-white/45" />
            <h2 className="font-bold text-spidey-white text-sm">
              Today&apos;s Walk-ins
            </h2>
          </div>

          {queue.length === 0 ? (
            <p className="text-xs text-spidey-white/40 py-8 text-center">
              No spot registrations yet — the first one you add shows up here
              instantly.
            </p>
          ) : (
            <ul className="flex flex-col divide-y divide-spidey-white/5 max-h-[520px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {queue.map((r) => (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-3 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-spidey-white/90 truncate">
                        {r.name}
                      </p>
                      <p className="text-[11px] text-spidey-white/45 truncate">
                        {r.eventTitle} · {r.teamSize}{" "}
                        {r.teamSize === "1" ? "member" : "members"}
                      </p>
                      <p className="text-[10px] font-mono text-spidey-white/30">
                        {r.time}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-mono font-bold text-spidey-cyan">
                        ₹{r.fee}
                      </p>
                      <p className="text-[10px] uppercase font-mono text-spidey-white/35">
                        {r.paymentMode}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-mono uppercase tracking-[0.08em] text-spidey-white/50">
        {label}
      </span>
      {children}
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </label>
  );
}

function inputCls(error) {
  return `w-full rounded-lg bg-spidey-blue/60 border text-spidey-white text-sm px-4 py-2.5 outline-none transition-colors placeholder:text-spidey-white/30 ${
    error
      ? "border-red-400/60 focus:border-red-400"
      : "border-spidey-white/15 focus:border-spidey-cyan/50"
  }`;
}
