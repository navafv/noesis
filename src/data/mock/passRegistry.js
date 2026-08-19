/**
 * passRegistry.js
 * Mock pass registry — swap for a real lookup against the
 * registrations/tickets table once the backend is wired up. Keys are
 * the payload a participant's QR pass would encode. Consumed by
 * pages/admin/QrScannerPage.jsx.
 */
export const MOCK_PASS_REGISTRY = {
  "N26-PASS-10231": {
    name: "Aarav Mehta",
    event: "Coding — Hackathon Finals",
    college: "Vishwakarma Institute of Technology",
    ticket: "Team",
  },
  "N26-PASS-10232": {
    name: "Ishita Rao",
    event: "Web Designing",
    college: "Pune Institute of Computer Technology",
    ticket: "Individual",
  },
  "N26-PASS-10236": {
    name: "Neha Deshmukh",
    event: "Web Designing",
    college: "Vishwakarma Institute of Technology",
    ticket: "Individual",
  },
  "N26-PASS-DUPLICATE": {
    name: "Kabir Shah",
    event: "Debugging",
    college: "Symbiosis Institute of Technology",
    ticket: "Individual",
    _alreadyCheckedIn: true,
  },
};
