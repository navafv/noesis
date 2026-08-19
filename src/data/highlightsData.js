import { Trophy, Users, Building2, Layers, Presentation } from "lucide-react";

export const STATS = [
  {
    id: "prize",
    value: 50000,
    prefix: "₹",
    suffix: "+",
    label: "Total Prize Pool",
    icon: Trophy,
  },
  {
    id: "footfall",
    value: 1500,
    prefix: "",
    suffix: "+",
    label: "Expected Footfall",
    icon: Users,
  },
  {
    id: "colleges",
    value: 40,
    prefix: "",
    suffix: "+",
    label: "Colleges & Universities",
    icon: Building2,
  },
  {
    id: "events",
    value: 9,
    prefix: "",
    suffix: "",
    label: "Flagship Events & Tracks",
    icon: Layers,
  },
  {
    id: "workshops",
    value: 2,
    prefix: "",
    suffix: "",
    label: "Keynote Tech Workshops",
    icon: Presentation,
  },
];

export const FEATURES = [
  {
    id: "keynote",
    title: "Keynote Speakers",
    description:
      "Industry leaders and researchers share real-world insight on where tech is heading next — from AI systems to product engineering.",
  },
  {
    id: "workshops",
    title: "Technical Workshops",
    description:
      "Two hands-on interactive sessions covering practical, in-demand skills — build something real, not just watch slides.",
  },
  {
    id: "networking",
    title: "Networking Sessions",
    description:
      "Meet 1500+ students from 40+ colleges, swap ideas, form teams for future hackathons, and build your tech circle beyond campus.",
  },
];

export const PARTNERS = [
  "TechNova",
  "CodeCraft Labs",
  "ByteForge",
  "CloudSphere",
  "Devstream",
  "Pixel & Co.",
  "Quantum Hub",
  "InnovateX",
];
