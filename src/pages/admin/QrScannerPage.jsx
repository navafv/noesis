import { useCallback, useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanLine,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DoorOpen,
  History,
  Zap,
  KeyRound,
  ArrowRight,
} from "lucide-react";
import { formatShortTime } from "../../lib/utils";
import { MOCK_PASS_REGISTRY } from "../../data/mock/passRegistry";

const DOORS = [
  "Computer Lab A",
  "Computer Lab B",
  "Main Auditorium",
  "Seminar Hall 2",
];

/** Demo helper: sample codes a volunteer can tap during a walkthrough,
 *  standing in for an actual camera pointed at a printed/phone pass. */
const DEMO_CODES = [
  "N26-PASS-10231",
  "N26-PASS-10232",
  "N26-PASS-DUPLICATE",
  "N26-PASS-UNKNOWN",
];

export default function QrScannerPage() {
  useOutletContext();

  const [door, setDoor] = useState(DOORS[0]);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // { status, code, entry }
  const [checkedIn, setCheckedIn] = useState(new Set());
  const [log, setLog] = useState([]);
  const [manualCode, setManualCode] = useState("");
  const [manualError, setManualError] = useState("");

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanCounterRef = useRef(0);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
    } catch {
      setCameraError(
        "Camera access unavailable — check permissions or use a device with a camera.",
      );
      setCameraOn(false);
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  function processCode(code) {
    setScanning(false);
    const entry = MOCK_PASS_REGISTRY[code];

    let status;
    if (!entry) {
      status = "invalid";
    } else if (entry._alreadyCheckedIn || checkedIn.has(code)) {
      status = "duplicate";
    } else {
      status = "success";
      setCheckedIn((prev) => new Set(prev).add(code));
    }

    scanCounterRef.current += 1;
    const record = {
      id: `${code}-${scanCounterRef.current}`,
      code,
      status,
      entry,
      door,
      time: formatShortTime(),
    };
    setResult(record);
    setLog((prev) => [record, ...prev].slice(0, 12));
  }

  /**
   * Simulates a QR decode firing after a short "scan" animation. In a
   * production build this handler would instead be driven by a real
   * decoder (e.g. a BarcodeDetector / jsQR frame loop reading
   * `videoRef.current`) that calls processCode() with the decoded text.
   */
  function handleSimulateScan(code) {
    setScanning(true);
    setTimeout(() => processCode(code), 700);
  }

  function handleManualSubmit(e) {
    e.preventDefault();
    const code = manualCode.trim().toUpperCase();
    if (!code) {
      setManualError("Enter a pass code to check in.");
      return;
    }
    setManualError("");
    processCode(code);
    setManualCode("");
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
            Command Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
            QR Scanner
          </h1>
          <p className="text-sm text-spidey-white/50 mt-1">
            {checkedIn.size} checked in this session
          </p>
        </div>

        {/* Door selector */}
        <div className="flex items-center gap-2 rounded-full border border-spidey-white/15 bg-spidey-blue/60 px-4 py-2.5 shrink-0">
          <DoorOpen size={14} className="text-spidey-cyan shrink-0" />
          <select
            value={door}
            onChange={(e) => setDoor(e.target.value)}
            className="bg-transparent text-sm text-spidey-white outline-none"
          >
            {DOORS.map((d) => (
              <option key={d} value={d} className="bg-spidey-blue">
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Viewfinder */}
        <div className="lg:col-span-3 rounded-brutal border border-spidey-white/10 glass overflow-hidden">
          <div className="relative aspect-[4/3] sm:aspect-video bg-spidey-canvas flex items-center justify-center">
            {cameraOn ? (
              <video
                ref={videoRef}
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-center px-6">
                <CameraOff size={30} className="text-spidey-white/25" />
                <p className="text-sm text-spidey-white/45">
                  Camera is off — start it to scan participant passes.
                </p>
                {cameraError && (
                  <p className="flex items-center gap-1.5 text-xs text-spidey-red-light">
                    <AlertTriangle size={12} />
                    {cameraError}
                  </p>
                )}
              </div>
            )}

            {/* Scan reticle overlay */}
            {cameraOn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-56 h-56 sm:w-64 sm:h-64">
                  <Corner className="top-0 left-0 border-t-2 border-l-2" />
                  <Corner className="top-0 right-0 border-t-2 border-r-2" />
                  <Corner className="bottom-0 left-0 border-b-2 border-l-2" />
                  <Corner className="bottom-0 right-0 border-b-2 border-r-2" />
                  <AnimatePresence>
                    {scanning && (
                      <motion.div
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [0, 220, 0], opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 1.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute left-0 right-0 h-0.5 bg-spidey-cyan shadow-[0_0_12px_2px_rgba(0,210,255,0.7)]"
                      />
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Status pill */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-mono font-semibold ${
                  cameraOn
                    ? "bg-spidey-cyan/15 text-spidey-cyan border border-spidey-cyan/40"
                    : "bg-spidey-white/10 text-spidey-white/50 border border-spidey-white/15"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${cameraOn ? "bg-spidey-cyan animate-pulse" : "bg-spidey-white/40"}`}
                />
                {cameraOn ? "Live" : "Idle"}
              </span>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            <button
              onClick={cameraOn ? stopCamera : startCamera}
              data-cursor="interactive"
              className={`w-full flex items-center justify-center gap-2 rounded-full font-bold text-sm px-5 py-3 transition-transform hover:scale-[1.01] active:scale-95 ${
                cameraOn
                  ? "bg-spidey-red/15 border border-spidey-red/40 text-spidey-red-light"
                  : "bg-spidey-cyan text-spidey-canvas"
              }`}
            >
              {cameraOn ? <CameraOff size={16} /> : <Camera size={16} />}
              {cameraOn ? "Stop Camera" : "Start Camera"}
            </button>

            {/* Demo scan triggers — stand in for a live decoder */}
            <div>
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-spidey-white/40 font-mono mb-2">
                <Zap size={11} />
                Demo passes (simulated decode)
              </p>
              <div className="flex flex-wrap gap-2">
                {DEMO_CODES.map((code) => (
                  <button
                    key={code}
                    onClick={() => handleSimulateScan(code)}
                    disabled={scanning}
                    data-cursor="interactive"
                    className="rounded-full border border-spidey-white/15 text-spidey-white/70 text-xs font-mono px-3 py-1.5 hover:border-spidey-cyan/40 hover:text-spidey-cyan transition-colors disabled:opacity-50"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual code fallback — for damaged QR codes, camera-less
                devices, or a camera permission failure. */}
            <div className="pt-4 border-t border-spidey-white/10">
              <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-spidey-white/40 font-mono mb-2">
                <KeyRound size={11} />
                Manual code entry
              </p>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  value={manualCode}
                  onChange={(e) => {
                    setManualCode(e.target.value);
                    setManualError("");
                  }}
                  placeholder="e.g. N26-PASS-10231"
                  autoComplete="off"
                  className={`flex-1 rounded-lg bg-spidey-blue/60 border ${
                    manualError ? "border-red-400/60" : "border-spidey-white/15"
                  } text-spidey-white text-sm font-mono px-4 py-2.5 outline-none focus:border-spidey-cyan/50 transition-colors placeholder:text-spidey-white/30`}
                />
                <button
                  type="submit"
                  data-cursor="interactive"
                  aria-label="Check in with manual code"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-spidey-cyan text-spidey-canvas font-bold text-sm px-4 py-2.5 hover:scale-[1.02] active:scale-95 transition-transform shrink-0"
                >
                  <ArrowRight size={16} />
                </button>
              </form>
              {manualError && (
                <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
                  <AlertTriangle size={12} />
                  {manualError}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Result + log */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Latest result */}
          <div className="rounded-brutal border border-spidey-white/10 glass p-5 min-h-[168px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-2 text-center py-4"
                >
                  <ScanLine size={22} className="text-spidey-white/25" />
                  <p className="text-xs text-spidey-white/40">
                    Scan results will appear here.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex flex-col gap-3"
                >
                  <ResultBanner status={result.status} />
                  {result.entry ? (
                    <div className="flex flex-col gap-0.5">
                      <p className="font-bold text-spidey-white">
                        {result.entry.name}
                      </p>
                      <p className="text-xs text-spidey-white/60">
                        {result.entry.event}
                      </p>
                      <p className="text-xs text-spidey-white/40 truncate">
                        {result.entry.college}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-spidey-white/50 font-mono">
                      {result.code}
                    </p>
                  )}
                  <p className="text-[10px] font-mono text-spidey-white/35">
                    {result.door} · {result.time}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent scans log */}
          <div className="rounded-brutal border border-spidey-white/10 glass p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <History size={15} className="text-spidey-white/45" />
              <h2 className="font-bold text-spidey-white text-sm">
                Recent Scans
              </h2>
            </div>
            {log.length === 0 ? (
              <p className="text-xs text-spidey-white/40 py-6 text-center">
                No scans yet this session.
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-spidey-white/5 max-h-72 overflow-y-auto">
                {log.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-spidey-white/85 truncate">
                        {r.entry?.name || r.code}
                      </p>
                      <p className="text-[10px] font-mono text-spidey-white/35">
                        {r.time} · {r.door}
                      </p>
                    </div>
                    <StatusDot status={r.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Corner({ className }) {
  return (
    <span
      className={`absolute w-8 h-8 border-spidey-cyan ${className}`}
      aria-hidden
    />
  );
}

function ResultBanner({ status }) {
  const config = {
    success: {
      icon: CheckCircle2,
      cls: "text-spidey-cyan bg-spidey-cyan/10 border-spidey-cyan/40",
      label: "Checked In",
    },
    duplicate: {
      icon: AlertTriangle,
      cls: "text-spidey-red bg-spidey-red/10 border-spidey-red/40",
      label: "Already Checked In",
    },
    invalid: {
      icon: XCircle,
      cls: "text-spidey-red-light bg-spidey-red/10 border-spidey-red/40",
      label: "Invalid Pass",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-1.5 text-xs font-mono font-semibold ${config.cls}`}
    >
      <config.icon size={14} />
      {config.label}
    </span>
  );
}

function StatusDot({ status }) {
  const cls =
    status === "success"
      ? "bg-spidey-cyan"
      : status === "duplicate"
        ? "bg-spidey-red"
        : "bg-spidey-red-light";
  return (
    <span className={`w-2 h-2 rounded-full shrink-0 ${cls}`} aria-hidden />
  );
}
