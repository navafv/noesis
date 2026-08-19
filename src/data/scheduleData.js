/**
 * Two-day chronological schedule for Noesis '26.
 * `linkedEventId` (when present) maps a timeline entry back to
 * eventsData.js so the ScheduleSection can deep-link into EventModal.
 */

export const SCHEDULE = {
  day1: {
    label: "Day 01",
    date: "Sept 30, 2026",
    items: [
      {
        time: "09:00 AM",
        title: "Inauguration & Keynote Ceremony",
        venue: "Main Auditorium",
        tag: "Ceremony",
        linkedEventId: null,
      },
      {
        time: "10:30 AM",
        title: "Coding Sprint — Prelims & Finals",
        venue: "Computer Lab A",
        tag: "Technical",
        linkedEventId: "coding",
      },
      {
        time: "01:30 PM",
        title: "Debugging Arena",
        venue: "Computer Lab B",
        tag: "Technical",
        linkedEventId: "debugging",
      },
      {
        time: "02:30 PM",
        title: "Web Designing Challenge",
        venue: "Multimedia Lab",
        tag: "Design",
        linkedEventId: "web-designing",
      },
      {
        time: "04:00 PM",
        title: "Online Treasure Hunt — Kickoff",
        venue: "Campus-wide / Hybrid",
        tag: "Fun/Tech",
        linkedEventId: "treasure-hunt",
      },
      {
        time: "05:30 PM",
        title: "Day 1 Wrap-up & Networking",
        venue: "Main Auditorium",
        tag: "Ceremony",
        linkedEventId: null,
      },
    ],
  },
  day2: {
    label: "Day 02",
    date: "Oct 01, 2026",
    items: [
      {
        time: "09:30 AM",
        title: "Day 2 Opening & Tech Talk",
        venue: "Main Auditorium",
        tag: "Ceremony",
        linkedEventId: null,
      },
      {
        time: "10:00 AM",
        title: "AI Prompt Engineering Contest",
        venue: "Seminar Hall",
        tag: "AI/Tech",
        linkedEventId: "prompting",
      },
      {
        time: "11:30 AM",
        title: "Mega IT Quiz — Prelims & Buzzer Round",
        venue: "Main Auditorium",
        tag: "Knowledge",
        linkedEventId: "it-quiz",
      },
      {
        time: "01:30 PM",
        title: "Esports & Gaming Showdown",
        venue: "Audi Arena",
        tag: "Gaming",
        linkedEventId: "gaming",
      },
      {
        time: "03:00 PM",
        title: "Blind Typing Sprint",
        venue: "Computer Lab A",
        tag: "Speed",
        linkedEventId: "blind-typing",
      },
      {
        time: "04:00 PM",
        title: "Valedictory Function & Grand Prize Distribution",
        venue: "Main Auditorium",
        tag: "Ceremony",
        linkedEventId: null,
      },
    ],
  },
};
