import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock3,
  ImageOff,
  X,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { MOCK_PAYMENTS } from "../../data/mock/payments";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function PaymentVerificationPage() {
  // Both Super Admins and Event Coordinators can verify payments —
  // `role` is read here so a future permissions split (e.g. only
  // Super Admins can bulk-export) has a ready hook.
  useOutletContext();

  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null); // payment being rejected
  const [confirmation, setConfirmation] = useState(null); // { id, type: "approved" | "rejected" }
  const [busyId, setBusyId] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      const matchesQuery =
        !q ||
        p.studentName.toLowerCase().includes(q) ||
        p.college.toLowerCase().includes(q) ||
        p.utr.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [payments, query, statusFilter]);

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  async function handleApprove(payment) {
    setBusyId(payment.id);
    await new Promise((r) => setTimeout(r, 600)); // mock request
    setPayments((prev) =>
      prev.map((p) => (p.id === payment.id ? { ...p, status: "approved" } : p)),
    );
    setBusyId(null);
    flashConfirmation(payment.id, "approved");
  }

  async function handleReject(payment, reason) {
    setBusyId(payment.id);
    await new Promise((r) => setTimeout(r, 600)); // mock request
    setPayments((prev) =>
      prev.map((p) =>
        p.id === payment.id
          ? { ...p, status: "rejected", rejectionReason: reason }
          : p,
      ),
    );
    setBusyId(null);
    setRejectTarget(null);
    flashConfirmation(payment.id, "rejected");
  }

  function flashConfirmation(id, type) {
    setConfirmation({ id, type });
    setTimeout(() => {
      setConfirmation((current) => (current?.id === id ? null : current));
    }, 2600);
  }

  function handleExportCSV() {
    const headers = [
      "ID",
      "Timestamp",
      "Student Name",
      "College",
      "Event",
      "UTR Reference",
      "Amount",
      "Status",
      "Rejection Reason",
    ];
    const rows = filtered.map((p) => [
      p.id,
      p.timestamp,
      p.studentName,
      p.college,
      p.event,
      p.utr,
      p.amount,
      p.status,
      p.rejectionReason || "",
    ]);

    const escapeCell = (cell) => `"${String(cell).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `noesis26-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-spidey-cyan font-mono mb-1">
            Command Center
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-spidey-white tracking-tight">
            Payment Verification
          </h1>
          <p className="text-sm text-spidey-white/50 mt-1">
            {pendingCount} pending · {payments.length} total transactions
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          data-cursor="interactive"
          className="flex items-center gap-2 rounded-full bg-spidey-cyan text-spidey-canvas font-bold text-sm px-5 py-2.5 hover:scale-[1.02] active:scale-95 transition-transform shrink-0"
        >
          <Download size={16} />
          Export to CSV
        </button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-spidey-white/35"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by student name, college, or UTR..."
            className="w-full rounded-lg bg-spidey-blue/60 border border-spidey-white/15 text-spidey-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-spidey-cyan/50 transition-colors placeholder:text-spidey-white/30"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter size={14} className="text-spidey-white/40 shrink-0" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              data-cursor="interactive"
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-mono font-semibold border transition-colors ${
                statusFilter === f.key
                  ? "bg-spidey-cyan text-spidey-canvas border-spidey-cyan"
                  : "border-spidey-white/15 text-spidey-white/60 hover:text-spidey-white hover:border-spidey-white/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-brutal border border-spidey-white/10 glass overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[920px]">
              <thead>
                <tr className="border-b border-spidey-white/10 bg-spidey-white/[0.03]">
                  <Th>Timestamp</Th>
                  <Th>Student</Th>
                  <Th>College</Th>
                  <Th>Event</Th>
                  <Th>UTR Reference</Th>
                  <Th>Screenshot</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <PaymentRow
                    key={p.id}
                    payment={p}
                    busy={busyId === p.id}
                    confirmation={
                      confirmation?.id === p.id ? confirmation.type : null
                    }
                    onApprove={() => handleApprove(p)}
                    onRejectClick={() => setRejectTarget(p)}
                    onPreview={() => setLightboxUrl(p.screenshotUrl)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Screenshot lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxUrl(null)}
            className="fixed inset-0 z-[80] bg-spidey-canvas/90 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-sm w-full rounded-brutal border border-spidey-cyan/40 border-glow-cyan overflow-hidden bg-spidey-blue"
            >
              <button
                onClick={() => setLightboxUrl(null)}
                aria-label="Close preview"
                className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-spidey-canvas/80 text-spidey-white hover:text-spidey-cyan transition-colors"
              >
                <X size={16} />
              </button>
              <img
                src={lightboxUrl}
                alt="Payment screenshot"
                className="w-full h-auto"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject reason modal */}
      <RejectModal
        payment={rejectTarget}
        busy={busyId === rejectTarget?.id}
        onCancel={() => setRejectTarget(null)}
        onConfirm={(reason) => handleReject(rejectTarget, reason)}
      />
    </div>
  );
}

function PaymentRow({
  payment,
  busy,
  confirmation,
  onApprove,
  onRejectClick,
  onPreview,
}) {
  const isPending = payment.status === "pending";

  return (
    <tr className="border-b border-spidey-white/5 last:border-b-0 hover:bg-spidey-white/[0.02] align-middle">
      <Td>
        <span className="font-mono text-xs text-spidey-white/60 whitespace-nowrap">
          {new Date(payment.timestamp).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      </Td>
      <Td>
        <span className="font-semibold text-spidey-white">
          {payment.studentName}
        </span>
      </Td>
      <Td>
        <span className="text-spidey-white/70 truncate block max-w-[220px]">
          {payment.college}
        </span>
      </Td>
      <Td>
        <span className="text-spidey-white/70">{payment.event}</span>
      </Td>
      <Td>
        <span className="font-mono text-xs text-spidey-cyan">
          {payment.utr}
        </span>
        <span className="block text-[10px] text-spidey-white/40 font-mono mt-0.5">
          {payment.amount}
        </span>
      </Td>
      <Td>
        {payment.screenshotUrl ? (
          <button
            onClick={onPreview}
            data-cursor="interactive"
            className="relative w-11 h-14 rounded-md overflow-hidden border border-spidey-white/15 hover:border-spidey-cyan/50 transition-colors group"
            aria-label="Preview payment screenshot"
          >
            <img
              src={payment.screenshotUrl}
              alt="Payment screenshot thumbnail"
              className="w-full h-full object-cover"
            />
            <span className="absolute inset-0 bg-spidey-canvas/0 group-hover:bg-spidey-canvas/40 flex items-center justify-center transition-colors">
              <ExternalLink
                size={12}
                className="text-spidey-cyan opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </span>
          </button>
        ) : (
          <span className="w-11 h-14 rounded-md border border-dashed border-spidey-white/15 flex items-center justify-center text-spidey-white/25">
            <ImageOff size={16} />
          </span>
        )}
      </Td>
      <Td align="right">
        <div className="flex items-center justify-end gap-2 min-w-[168px]">
          <AnimatePresence mode="wait">
            {confirmation ? (
              <motion.span
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-mono font-semibold ${
                  confirmation === "approved"
                    ? "bg-spidey-cyan/15 text-spidey-cyan border border-spidey-cyan/40"
                    : "bg-spidey-red/15 text-spidey-red-light border border-spidey-red/40"
                }`}
              >
                {confirmation === "approved" ? (
                  <CheckCircle2 size={13} />
                ) : (
                  <XCircle size={13} />
                )}
                {confirmation === "approved" ? "Approved" : "Rejected"}
              </motion.span>
            ) : isPending ? (
              <motion.div
                key="actions"
                className="flex items-center gap-2"
                initial={{ opacity: 1 }}
              >
                <button
                  onClick={onApprove}
                  disabled={busy}
                  data-cursor="interactive"
                  aria-label="Approve payment"
                  className="flex items-center gap-1 rounded-full bg-spidey-cyan/15 border border-spidey-cyan/40 text-spidey-cyan px-3 py-1.5 text-[11px] font-mono font-semibold hover:bg-spidey-cyan/25 transition-colors disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={12} />
                  )}
                  Approve
                </button>
                <button
                  onClick={onRejectClick}
                  disabled={busy}
                  data-cursor="interactive"
                  aria-label="Reject payment"
                  className="flex items-center gap-1 rounded-full bg-spidey-red/15 border border-spidey-red/40 text-spidey-red-light px-3 py-1.5 text-[11px] font-mono font-semibold hover:bg-spidey-red/25 transition-colors disabled:opacity-60"
                >
                  <XCircle size={12} />
                  Reject
                </button>
              </motion.div>
            ) : (
              <StatusBadge
                status={payment.status}
                reason={payment.rejectionReason}
              />
            )}
          </AnimatePresence>
        </div>
      </Td>
    </tr>
  );
}

function StatusBadge({ status, reason }) {
  const config = {
    approved: {
      icon: CheckCircle2,
      cls: "border-spidey-cyan/50 bg-spidey-cyan/10 text-spidey-cyan",
      label: "Approved",
    },
    rejected: {
      icon: XCircle,
      cls: "border-spidey-red/50 bg-spidey-red/10 text-spidey-red-light",
      label: "Rejected",
    },
    pending: {
      icon: Clock3,
      cls: "border-spidey-white/15 bg-spidey-white/5 text-spidey-white/50",
      label: "Pending",
    },
  }[status];

  return (
    <span
      title={reason || undefined}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-mono font-semibold whitespace-nowrap ${config.cls}`}
    >
      <config.icon size={12} />
      {config.label}
    </span>
  );
}

function RejectModal({ payment, busy, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("A rejection reason is required.");
      return;
    }
    setError("");
    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <AnimatePresence>
      {payment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 z-[80] bg-spidey-canvas/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-brutal border border-spidey-red/40 border-glow-red glass p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-spidey-red-light font-mono mb-1">
                  Reject Payment
                </p>
                <h3 className="font-bold text-spidey-white">
                  {payment.studentName}
                </h3>
                <p className="text-xs text-spidey-white/50 font-mono mt-0.5">
                  {payment.utr}
                </p>
              </div>
              <button
                onClick={onCancel}
                aria-label="Close"
                className="p-1.5 rounded-full text-spidey-white/50 hover:text-spidey-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <label className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.1em] text-spidey-white/50 mb-2">
              Reason for rejection
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError("");
              }}
              rows={3}
              placeholder="e.g. UTR does not match bank statement"
              className="w-full rounded-lg bg-spidey-blue/60 border border-spidey-white/15 text-spidey-white text-sm px-4 py-3 outline-none focus:border-spidey-red/50 transition-colors placeholder:text-spidey-white/30 resize-none"
            />
            {error && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
                <AlertCircle size={12} />
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 mt-5">
              <button
                onClick={onCancel}
                className="rounded-full px-4 py-2.5 text-sm font-semibold text-spidey-white/70 hover:text-spidey-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={busy}
                data-cursor="interactive"
                className="flex items-center gap-2 rounded-full bg-spidey-red text-spidey-white font-bold text-sm px-5 py-2.5 hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-70"
              >
                {busy ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <XCircle size={15} />
                )}
                Confirm Rejection
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th
      className={`px-4 py-3 text-[10px] uppercase tracking-[0.12em] text-spidey-white/45 font-mono font-semibold whitespace-nowrap ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left" }) {
  return (
    <td
      className={`px-4 py-3.5 ${align === "right" ? "text-right" : "text-left"}`}
    >
      {children}
    </td>
  );
}

function EmptyState() {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-center">
      <Search size={28} className="text-spidey-white/30" />
      <p className="text-spidey-white/60 text-sm">
        No transactions match your search.
      </p>
    </div>
  );
}
