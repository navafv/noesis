import {
  Code2,
  Bug,
  Layout,
  Sparkles,
  HelpCircle,
  Compass,
  Gamepad2,
  Keyboard,
  Video,
} from "lucide-react";

/**
 * Central data store for all Noesis '26 events.
 * `id` is used as the anchor/query key for deep-linking from
 * EventsSection -> EventModal -> #register (pre-selection).
 */
export const CATEGORIES = [
  "All",
  "Technical",
  "Design",
  "AI/Tech",
  "Gaming",
  "Creative",
];

export const EVENTS = [
  {
    id: "coding",
    title: "Coding",
    tag: "Technical",
    icon: Code2,
    mode: "Individual / Team",
    teamSize: "1-2 Members",
    prizePool: "₹10,000",
    day: "Day 1",
    time: "10:30 AM",
    venue: "Computer Lab A",
    description:
      "High-octane algorithmic problem solving in C/C++/Java/Python.",
    longDescription:
      "A multi-round competitive programming challenge testing data structures, algorithms, and optimization under strict time pressure. Prelims narrow the field; finals are a live, projected coding sprint.",
    guidelines: [
      "Languages allowed: C, C++, Java, Python.",
      "Internet access restricted to official judge/compiler docs only.",
      "Plagiarism or code-sharing results in immediate disqualification.",
      "Bring your own laptop or use the lab systems provided.",
    ],
    judgingCriteria: [
      "Correctness across all test cases",
      "Time & space complexity",
      "Code readability (finals round only)",
    ],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "debugging",
    title: "Debugging",
    tag: "Technical",
    icon: Bug,
    mode: "Individual",
    teamSize: "1 Member",
    prizePool: "₹7,000",
    day: "Day 1",
    time: "01:30 PM",
    venue: "Computer Lab B",
    description:
      "Hunt down syntax errors, memory leaks, and logical bottlenecks against the clock.",
    longDescription:
      "Participants are handed intentionally broken codebases across multiple difficulty tiers. Score points for every bug correctly identified and fixed within the time limit — precision matters as much as speed.",
    guidelines: [
      "Buggy code will be provided in C/C++/Java.",
      "No external debugging tools beyond the language's native compiler.",
      "Each fixed bug is verified against a hidden test suite.",
      "Time penalties apply for incorrect submissions.",
    ],
    judgingCriteria: [
      "Number of bugs correctly resolved",
      "Time taken per round",
      "Minimal unintended side-effects to working code",
    ],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "web-designing",
    title: "Web Designing",
    tag: "Design",
    icon: Layout,
    mode: "Team (2)",
    teamSize: "2 Members",
    prizePool: "₹8,000",
    day: "Day 1",
    time: "02:30 PM",
    venue: "Multimedia Lab",
    description:
      "Transform a surprise theme into a responsive, accessible, and stunning web UI.",
    longDescription:
      "Teams receive a surprise theme at the start of the event and have a fixed window to design and build a fully responsive landing page from scratch — HTML/CSS/JS or any framework of choice.",
    guidelines: [
      "Theme revealed only at event start — no pre-built templates.",
      "Any framework/library permitted (React, Tailwind, plain CSS, etc.).",
      "Must be responsive across mobile, tablet, and desktop breakpoints.",
      "Final submission via GitHub repo link or ZIP upload.",
    ],
    judgingCriteria: [
      "Visual design & creativity",
      "Responsiveness & accessibility",
      "Code structure & theme relevance",
    ],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "prompting",
    title: "Prompting / AI Prompt Engineering",
    tag: "AI/Tech",
    icon: Sparkles,
    mode: "Individual",
    teamSize: "1 Member",
    prizePool: "₹6,000",
    day: "Day 2",
    time: "10:00 AM",
    venue: "Seminar Hall",
    description:
      "Craft master prompts across LLMs and generative image models to solve complex scenario challenges.",
    longDescription:
      "A scenario-based challenge where participants must engineer precise prompts across text and image generation models to hit exact target outputs — testing creativity, model intuition, and iteration speed.",
    guidelines: [
      "Access provided to a fixed set of approved AI tools.",
      "Each round has a scoring rubric revealed only after submission.",
      "No pre-written prompt libraries allowed.",
      "Limited attempts per challenge round.",
    ],
    judgingCriteria: [
      "Accuracy to target output",
      "Prompt efficiency (fewer iterations)",
      "Creative problem framing",
    ],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "it-quiz",
    title: "IT Quiz",
    tag: "Knowledge",
    icon: HelpCircle,
    mode: "Team (2)",
    teamSize: "2 Members",
    prizePool: "₹8,000",
    day: "Day 2",
    time: "11:30 AM",
    venue: "Main Auditorium",
    description:
      "Fast-paced battle of tech trivia, computing history, and modern AI paradigms.",
    longDescription:
      "A multi-round general + specialized IT quiz spanning computing history, current tech news, product logos, and a rapid-fire buzzer finale for the top teams.",
    guidelines: [
      "Prelims: written round, top teams advance to buzzer finals.",
      "No electronic devices allowed during any round.",
      "Quizmaster's decision is final in case of disputes.",
      "Negative marking applies in the buzzer round.",
    ],
    judgingCriteria: [
      "Total points across prelims & finals",
      "Buzzer speed and accuracy",
    ],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "treasure-hunt",
    title: "Online Treasure Hunt",
    tag: "Fun/Tech",
    icon: Compass,
    mode: "Individual / Team",
    teamSize: "1-3 Members",
    prizePool: "₹6,000",
    day: "Day 1",
    time: "04:00 PM",
    venue: "Online / Campus-wide",
    description:
      "Decode encrypted ciphers, steganography clues, and web mysteries.",
    longDescription:
      "A hybrid hunt combining online clue-solving with physical campus checkpoints. Expect cryptography, steganography, OSINT-style puzzles, and QR-linked physical trails.",
    guidelines: [
      "Clues released progressively via the official hunt portal.",
      "Physical checkpoints must be verified in-person on campus.",
      "Sharing solutions between teams is strictly prohibited.",
      "First team to complete all stages wins; time is the tiebreaker.",
    ],
    judgingCriteria: [
      "Completion time",
      "Number of stages cleared",
      "Hint penalties",
    ],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "gaming",
    title: "Gaming / Esports",
    tag: "Gaming",
    icon: Gamepad2,
    mode: "Squad / Solo",
    teamSize: "1-4 Members",
    prizePool: "₹12,000",
    day: "Day 2",
    time: "01:30 PM",
    venue: "Gaming Arena / Audi",
    description:
      "High-intensity competitive esports tournament (Valorant / BGMI / FIFA).",
    longDescription:
      "A bracket-style esports showdown across multiple titles. Squad up or go solo across Valorant, BGMI, and FIFA brackets, with live-streamed finals on the main screen.",
    guidelines: [
      "Choose one title per participant/squad at registration.",
      "Bring your own peripherals (mouse/controller) if preferred.",
      "Standard competitive ruleset & anti-cheat checks apply.",
      "Match schedules released 24 hours prior via Instagram.",
    ],
    judgingCriteria: ["Bracket win/loss progression", "Fair-play conduct"],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "blind-typing",
    title: "Blind Typing",
    tag: "Speed",
    icon: Keyboard,
    mode: "Individual",
    teamSize: "1 Member",
    prizePool: "₹4,000",
    day: "Day 2",
    time: "03:00 PM",
    venue: "Lab A",
    description:
      "High-WPM typing test with turned-off monitors. Pure muscle memory and precision.",
    longDescription:
      "Monitors go dark and it's just you, the keyboard, and the passage. Ranked on words-per-minute and accuracy across two timed rounds — no peeking, no autocorrect.",
    guidelines: [
      "Monitors will be switched off for the duration of each round.",
      "Standard QWERTY keyboards provided; no custom layouts.",
      "Two rounds — best WPM with accuracy weighting counts.",
      "Any monitor tampering results in disqualification.",
    ],
    judgingCriteria: ["Words per minute (WPM)", "Accuracy percentage"],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
  {
    id: "reel-making",
    title: "Reel Making",
    tag: "Creative",
    icon: Video,
    mode: "Individual / Duo",
    teamSize: "1-2 Members",
    prizePool: "₹5,000",
    day: "Both Days",
    time: "Submission by Day 2, 03:30 PM",
    venue: "Campus-wide",
    description:
      "Capture the high energy of Noesis '26 in a creative 60-second Instagram reel.",
    longDescription:
      "Shoot and edit an original 60-second reel capturing the spirit of Noesis '26 — candid moments, event highlights, or a creative concept piece. Submitted reels are shared on the official Instagram for a public engagement round.",
    guidelines: [
      "Max duration: 60 seconds. Original footage only (shot during the fest).",
      "Must tag @noesis.26 and use the official event hashtag.",
      "Submission deadline: Day 2, 03:30 PM sharp via the submission form.",
      "Any editing app/software is allowed.",
    ],
    judgingCriteria: [
      "Creativity & storytelling",
      "Editing quality",
      "Public engagement (likes/shares) + jury score",
    ],
    coordinator: {
      name: "Event Coordinator",
      phone: "+91 99950 61050",
      email: "noesisitfest@gmail.com",
    },
  },
];

export const getEventById = (id) => EVENTS.find((e) => e.id === id);
