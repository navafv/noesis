/**
 * registrations.js
 * Mock registrations — swap for a real "my registrations" query keyed
 * off the logged-in student's uid. Shape mirrors src/data/eventsData.js
 * (coordinator block) plus per-registration fields (team, verification).
 * Consumed by pages/student/StudentEventsPage.jsx.
 */
export const MOCK_REGISTRATIONS = [
  {
    id: "coding",
    title: "Coding",
    day: "Day 1",
    time: "10:30 AM",
    venue: "Computer Lab A",
    mode: "Individual / Team",
    team: { status: "solo" }, // solo | complete | incomplete
    entryStatus: "verified", // verified | pending
    coordinator: {
      name: "Rhea Kulkarni",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "hackathon",
    title: "CodeStorm — Hackathon Finals",
    day: "Day 2",
    time: "09:00 AM",
    venue: "Main Auditorium",
    mode: "Team",
    team: { status: "complete", size: "4/4 Members" },
    entryStatus: "verified",
    coordinator: {
      name: "Aditya Rao",
      phone: "+91 98220 44017",
      email: "hackathon.noesis26@gmail.com",
    },
  },
  {
    id: "web-design",
    title: "Web Designing",
    day: "Day 1",
    time: "02:00 PM",
    venue: "Design Studio, Block C",
    mode: "Team",
    team: { status: "incomplete", size: "1/2 Members" },
    entryStatus: "pending",
    coordinator: {
      name: "Neha Deshmukh",
      phone: "+91 90210 33564",
      email: "webdesign.noesis26@gmail.com",
    },
  },
  {
    id: "reel-making",
    title: "Reel Making",
    day: "Day 2",
    time: "11:00 AM",
    venue: "Media Lab",
    mode: "Individual / Team",
    team: { status: "solo" },
    entryStatus: "pending",
    coordinator: {
      name: "Kabir Shah",
      phone: "+91 97690 12245",
      email: "reels.noesis26@gmail.com",
    },
  },
];
