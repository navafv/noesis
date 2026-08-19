import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Link2,
  Instagram,
  FolderOpen,
  Layout,
  Video,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Pencil,
} from "lucide-react";

const GITHUB_REPO_RE = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/i;
const URL_RE = /^https?:\/\/\S+\.\S+/i;
const DRIVE_RE = /^https?:\/\/(drive|docs)\.google\.com\/\S+/i;
const INSTAGRAM_RE = /^https?:\/\/(www\.)?instagram\.com\/\S+/i;

/**
 * SUBMISSION_TRACKS
 * Static config for the two submission types this page handles. Each
 * track owns its own field schema + validators, so the same shell
 * (SubmissionCard) can render both without duplicating markup.
 */
const SUBMISSION_TRACKS = [
  {
    key: "web-design",
    title: "Web Designing",
    subtitle: "Round 2 · Final Deliverable",
    icon: Layout,
    deadline: "Aug 22, 2026 · 11:59 PM",
    fields: [
      {
        key: "repoUrl",
        label: "GitHub Repository",
        icon: Github,
        placeholder: "https://github.com/your-team/project",
        validate: (v) => GITHUB_REPO_RE.test(v.trim()),
        error: "Enter a valid GitHub repo URL (github.com/user/repo)",
      },
      {
        key: "liveUrl",
        label: "Live Site URL",
        icon: Link2,
        placeholder: "https://your-project.vercel.app",
        validate: (v) => URL_RE.test(v.trim()),
        error: "Enter a valid, publicly accessible live URL",
      },
    ],
  },
  {
    key: "reel-making",
    title: "Reel Making",
    subtitle: "Single Round · Final Deliverable",
    icon: Video,
    deadline: "Aug 23, 2026 · 06:00 PM",
    fields: [
      {
        key: "driveUrl",
        label: "Google Drive Link",
        icon: FolderOpen,
        placeholder: "https://drive.google.com/file/d/...",
        optional: true,
        validate: (v) => !v.trim() || DRIVE_RE.test(v.trim()),
        error: "Enter a valid Google Drive link",
      },
      {
        key: "instagramUrl",
        label: "Instagram Reel URL",
        icon: Instagram,
        placeholder: "https://instagram.com/reel/...",
        optional: true,
        validate: (v) => !v.trim() || INSTAGRAM_RE.test(v.trim()),
        error: "Enter a valid Instagram URL",
      },
    ],
    // At least one of the two optional fields above must be filled.
    requireOneOf: ["driveUrl", "instagramUrl"],
    requireOneOfError: "Provide at least one: a Drive link or an Instagram URL",
  },
];

export default function StudentSubmissionsPage() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
          Student Portal
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
          Submissions
        </h1>
        <p className="text-sm text-spidey-white/50 mt-1">
          Submit your final deliverables before each track's deadline.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {SUBMISSION_TRACKS.map((track) => (
          <SubmissionCard key={track.key} track={track} />
        ))}
      </div>
    </div>
  );
}

function SubmissionCard({ track }) {
  const [form, setForm] = useState(() =>
    Object.fromEntries(track.fields.map((f) => [f.key, ""])),
  );
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | submitted
  const [submission, setSubmission] = useState(null); // { timestamp, values }
  const [editing, setEditing] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = () => {
    const errs = {};
    track.fields.forEach((f) => {
      if (!f.optional && !form[f.key].trim()) {
        errs[f.key] = `${f.label} is required`;
      } else if (form[f.key].trim() && !f.validate(form[f.key])) {
        errs[f.key] = f.error;
      }
    });

    if (track.requireOneOf) {
      const anyFilled = track.requireOneOf.some((key) => form[key].trim());
      if (!anyFilled) {
        track.requireOneOf.forEach((key) => {
          errs[key] = track.requireOneOfError;
        });
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 1100)); // mock request

    setSubmission({ timestamp: new Date(), values: { ...form } });
    setStatus("submitted");
    setEditing(false);
  };

  const startEdit = () => {
    setEditing(true);
    setStatus("idle");
  };

  const isLocked = status === "submitted" && !editing;

  return (
    <div className="rounded-brutal border border-spidey-white/10 glass overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 sm:px-7 pt-5 pb-4 border-b border-spidey-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-spidey-blue border-2 border-spidey-cyan/50 flex items-center justify-center shrink-0">
            <track.icon size={18} className="text-spidey-cyan" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-spidey-white text-base truncate">
              {track.title}
            </h2>
            <p className="text-[11px] font-mono text-spidey-white/45 truncate">
              {track.subtitle}
            </p>
          </div>
        </div>
        <SubmissionStatusBadge status={submission ? "submitted" : "pending"} />
      </div>

      <div className="px-5 sm:px-7 py-2 border-b border-spidey-white/5">
        <p className="text-[11px] font-mono text-spidey-white/40 py-2.5 flex items-center gap-1.5">
          <Clock3 size={11} className="text-spidey-red-light" />
          Deadline: {track.deadline}
        </p>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-7">
        <AnimatePresence mode="wait">
          {isLocked ? (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-start gap-3 rounded-lg border border-spidey-cyan/30 bg-spidey-cyan/5 px-4 py-3.5">
                <CheckCircle2
                  size={18}
                  className="text-spidey-cyan shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-spidey-white">
                    Submission received
                  </p>
                  <p className="text-xs text-spidey-white/50 mt-0.5 font-mono">
                    {submission.timestamp.toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              <ul className="flex flex-col gap-2">
                {track.fields.map((f) => {
                  const val = submission.values[f.key];
                  if (!val) return null;
                  return (
                    <li
                      key={f.key}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <f.icon
                        size={14}
                        className="text-spidey-white/40 shrink-0 mt-0.5"
                      />
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-spidey-white/40 font-mono">
                          {f.label}
                        </p>
                        <a
                          href={val}
                          target="_blank"
                          rel="noreferrer"
                          className="text-spidey-cyan hover:underline break-all"
                        >
                          {val}
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={startEdit}
                data-cursor="interactive"
                className="self-start flex items-center gap-1.5 rounded-full border border-spidey-white/20 text-spidey-white/80 text-xs font-semibold px-4 py-2 hover:border-spidey-cyan/50 hover:text-spidey-cyan transition-colors mt-1"
              >
                <Pencil size={13} /> Edit Submission
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              {track.fields.map((f) => (
                <div key={f.key}>
                  <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-spidey-white/50 mb-2">
                    <f.icon size={13} className="text-spidey-cyan" />
                    {f.label}
                    {f.optional && (
                      <span className="text-spidey-white/30 normal-case tracking-normal">
                        (optional)
                      </span>
                    )}
                  </label>
                  <input
                    type="url"
                    value={form[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className={`w-full rounded-lg bg-spidey-blue/60 border ${
                      errors[f.key]
                        ? "border-red-400/60"
                        : "border-spidey-white/15"
                    } text-spidey-white text-sm px-4 py-3 outline-none focus:border-spidey-cyan focus:shadow-[0_0_0_1px_rgba(0,210,255,0.4),0_0_16px_rgba(0,210,255,0.25)] transition-colors placeholder:text-spidey-white/30`}
                  />
                  {errors[f.key] && <FieldError>{errors[f.key]}</FieldError>}
                </div>
              ))}

              <button
                type="submit"
                disabled={status === "submitting"}
                data-cursor="interactive"
                className="flex items-center justify-center gap-2 rounded-full bg-spidey-red text-spidey-white font-bold text-sm px-6 py-3.5 hover:scale-[1.01] active:scale-95 transition-transform animate-pulse-glow disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    {editing ? "Resubmit" : "Submit"}
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SubmissionStatusBadge({ status }) {
  const submitted = status === "submitted";
  return (
    <span
      className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-mono font-semibold whitespace-nowrap ${
        submitted
          ? "border-spidey-cyan/50 bg-spidey-cyan/10 text-spidey-cyan"
          : "border-spidey-white/15 bg-spidey-white/5 text-spidey-white/50"
      }`}
    >
      {submitted ? <CheckCircle2 size={11} /> : <Clock3 size={11} />}
      {submitted ? "Submitted" : "Not Submitted"}
    </span>
  );
}

function FieldError({ children }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
      <AlertCircle size={12} />
      {children}
    </p>
  );
}
