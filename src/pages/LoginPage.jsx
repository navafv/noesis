import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ShieldCheck,
  Loader2,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import SEO from "../components/SEO";

const TABS = [
  { key: "student", label: "Student Portal", icon: GraduationCap },
  { key: "coordinator", label: "Coordinator / Admin", icon: ShieldCheck },
];

const initialForm = { email: "", password: "" };

/**
 * LoginPage.jsx
 * Spider-Verse themed auth portal for "/login". Two tabs — Student and
 * Coordinator/Admin — share one email/password form but validate and
 * redirect differently, since there's no real backend yet:
 *  - Student tab  -> mock-authenticates, then redirects to "/" with a
 *    success flash (stand-in for a future participant dashboard).
 *  - Coordinator tab -> mock-authenticates, then redirects to "/" as
 *    well, but is styled/labelled as an admin sign-in so it's easy to
 *    swap for a real "/admin" route later.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("student");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    if (status === "error") setStatus("idle");
  };

  const switchTab = (key) => {
    setActiveTab(key);
    setErrors({});
    setStatus("idle");
  };

  const validate = () => {
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    // Mock authentication — no backend wired up yet. Replace this
    // timeout + redirect with a real auth call (Firebase/Sheets/API)
    // when the participant/coordinator dashboards are built.
    await new Promise((resolve) => setTimeout(resolve, 1400));

    setStatus("success");
    setTimeout(() => {
      navigate("/", {
        state: {
          loginSuccess: true,
          role: activeTab,
        },
      });
    }, 900);
  };

  return (
    <>
      <SEO
        title="Login | Noesis'26 Participant Portal"
        description="Log in to your Noesis'26 participant account to manage your registrations and event passes."
        robots="noindex, nofollow"
      />

      <section className="relative min-h-[85vh] flex items-center justify-center pt-32 sm:pt-40 pb-20 px-4 overflow-hidden">
        {/* Ambient background accents, consistent with the rest of the site */}
        <div
          className="absolute top-[10%] left-[15%] -z-10 w-72 h-72 rounded-full bg-spidey-cyan/10 blur-[100px]"
          aria-hidden
        />
        <div
          className="absolute bottom-[10%] right-[12%] -z-10 w-80 h-80 rounded-full bg-spidey-red-light/15 blur-[110px]"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 grid-overlay opacity-20"
          aria-hidden
        />
        <div
          className="absolute inset-0 -z-10 comic-halftone opacity-[0.06]"
          aria-hidden
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Web-corner framed card */}
          <div className="relative rounded-brutal border border-spidey-white/10 md:glass border-glow-red bg-spidey-surface/90 md:bg-spidey-surface/60 md:backdrop-blur-md p-6 sm:p-8 overflow-hidden">
            <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-spidey-cyan/60" />
            <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-spidey-cyan/60" />
            <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-spidey-cyan/60" />
            <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-spidey-cyan/60" />

            {/* Header */}
            <div className="text-center mb-7">
              <div className="mx-auto w-12 h-12 rounded-lg bg-spidey-blue border-2 border-spidey-red flex items-center justify-center mb-4">
                <span className="font-mono font-black text-spidey-red text-sm tracking-tighter">
                  N26
                </span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-spidey-white tracking-tight">
                Welcome Back
              </h1>
              <p className="text-spidey-white/55 text-sm mt-1.5">
                Sign in to your Noesis'26 portal
              </p>
            </div>

            {/* Tabs */}
            <div className="relative flex items-center gap-1 rounded-full glass p-1.5 mb-7">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => switchTab(tab.key)}
                    data-cursor="interactive"
                    className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full text-[11px] sm:text-xs font-mono font-semibold transition-colors ${
                      isActive
                        ? "text-spidey-red"
                        : "text-spidey-white/65 hover:text-spidey-white"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-login-tab-pill"
                        className="absolute inset-0 rounded-full bg-spidey-cyan"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}
                    <tab.icon size={14} className="relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "student" ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "student" ? 12 : -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-spidey-white/50 mb-2">
                    <Mail size={13} className="text-spidey-cyan" />
                    {activeTab === "student" ? "Student Email" : "Admin Email"}
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass(errors.email)}
                    placeholder={
                      activeTab === "student"
                        ? "you@example.com"
                        : "coordinator@noesis26.dev"
                    }
                    autoComplete="email"
                  />
                  {errors.email && <ErrorText>{errors.email}</ErrorText>}
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-spidey-white/50 mb-2">
                    <Lock size={13} className="text-spidey-cyan" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className={`${inputClass(errors.password)} pr-11`}
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-spidey-white/40 hover:text-spidey-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <ErrorText>{errors.password}</ErrorText>}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-spidey-white/55 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-3.5 h-3.5 rounded border-spidey-white/30 bg-spidey-blue/60 accent-spidey-red"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-spidey-cyan hover:underline underline-offset-2"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={status === "submitting" || status === "success"}
                  data-cursor="interactive"
                  className={`w-full flex items-center justify-center gap-2 rounded-full font-bold text-sm px-6 py-3.5 transition-transform disabled:cursor-not-allowed ${
                    status === "success"
                      ? "bg-spidey-cyan text-spidey-canvas"
                      : "bg-spidey-red text-spidey-white hover:scale-[1.01] active:scale-95 animate-pulse-glow disabled:opacity-80"
                  }`}
                >
                  {status === "submitting" && (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying...
                    </>
                  )}
                  {status === "success" && (
                    <>
                      <ShieldCheck size={18} />
                      Access Granted
                    </>
                  )}
                  {(status === "idle" || status === "error") && (
                    <>
                      Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] font-mono text-spidey-white/35 leading-relaxed">
                  {activeTab === "student"
                    ? "New participant? Registering for an event creates your access automatically."
                    : "Coordinator access is provisioned by the Neura IT Club core team."}
                </p>
              </motion.form>
            </AnimatePresence>
          </div>

          {/* Back link */}
          <p className="text-center text-sm text-spidey-white/50 mt-6">
            <Link to="/" className="hover:text-spidey-cyan transition-colors">
              ← Back to Home
            </Link>
            {" · "}
            <Link
              to="/register"
              className="hover:text-spidey-cyan transition-colors"
            >
              Register for Noesis'26
            </Link>
          </p>
        </motion.div>
      </section>
    </>
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
