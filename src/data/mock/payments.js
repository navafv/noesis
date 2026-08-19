/**
 * payments.js
 * Mock payment queue — swap for a real "pending verifications" query.
 * `screenshotUrl` would normally be a signed storage URL; placeholder
 * images are used here so the preview/lightbox UI has something to show.
 * Consumed by pages/admin/PaymentVerificationPage.jsx.
 */
export const MOCK_PAYMENTS = [
  {
    id: "PAY-10231",
    timestamp: "2026-08-18T09:42:00",
    studentName: "Aarav Mehta",
    college: "Vishwakarma Institute of Technology",
    event: "CodeStorm — Hackathon Finals",
    utr: "UTR2608180942771",
    amount: "₹500",
    screenshotUrl:
      "https://placehold.co/480x640/0b1f3a/00d2ff?text=UPI+Receipt",
    status: "pending",
  },
  {
    id: "PAY-10232",
    timestamp: "2026-08-18T10:05:00",
    studentName: "Ishita Rao",
    college: "Pune Institute of Computer Technology",
    event: "Web Designing",
    utr: "UTR2608181005114",
    amount: "₹300",
    screenshotUrl:
      "https://placehold.co/480x640/0b1f3a/00d2ff?text=UPI+Receipt",
    status: "pending",
  },
  {
    id: "PAY-10233",
    timestamp: "2026-08-18T11:20:00",
    studentName: "Devansh Patel",
    college: "COEP Technological University",
    event: "Coding",
    utr: "UTR2608181120998",
    amount: "₹200",
    screenshotUrl:
      "https://placehold.co/480x640/0b1f3a/00d2ff?text=UPI+Receipt",
    status: "approved",
  },
  {
    id: "PAY-10234",
    timestamp: "2026-08-18T12:10:00",
    studentName: "Sana Iyer",
    college: "MIT World Peace University",
    event: "Reel Making",
    utr: "UTR2608181210556",
    amount: "₹150",
    screenshotUrl: null,
    status: "pending",
  },
  {
    id: "PAY-10235",
    timestamp: "2026-08-18T13:35:00",
    studentName: "Kabir Shah",
    college: "Symbiosis Institute of Technology",
    event: "Debugging",
    utr: "UTR2608181335340",
    amount: "₹200",
    screenshotUrl:
      "https://placehold.co/480x640/0b1f3a/00d2ff?text=UPI+Receipt",
    status: "rejected",
    rejectionReason: "UTR does not match bank statement.",
  },
  {
    id: "PAY-10236",
    timestamp: "2026-08-18T14:02:00",
    studentName: "Neha Deshmukh",
    college: "Vishwakarma Institute of Technology",
    event: "Web Designing",
    utr: "UTR2608181402881",
    amount: "₹300",
    screenshotUrl:
      "https://placehold.co/480x640/0b1f3a/00d2ff?text=UPI+Receipt",
    status: "pending",
  },
];
