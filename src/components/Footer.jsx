import { Link } from "react-router-dom";
import {
  Instagram,
  Linkedin,
  Github,
  Youtube,
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

// Internal routes (react-router). Home-page-only sections (Highlights,
// Gallery, FAQs) stay as hash links back to "/" so they still resolve
// correctly from any page in the app.
const QUICK_LINKS = [
  { label: "Events", to: "/events" },
  { label: "Schedule", to: "/schedule" },
  { label: "Highlights", to: "/#highlights" },
  { label: "Gallery", to: "/#gallery" },
  { label: "FAQs", to: "/#faqs" },
  { label: "Register", to: "/register" },
  { label: "Login", to: "/login" },
];

const SOCIALS = [
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://instagram.com/noesis.26",
  },
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com" },
  { icon: Github, label: "GitHub", href: "https://github.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
];

// Campus map — kept as a real external Google Maps link, not a router route.
const CAMPUS_MAP_URL = "https://maps.google.com/?q=Jamia+Hamdard+Kannur+Campus";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative border-t border-spidey-white/10 px-4 pt-16 pb-8 overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-10 grid-overlay opacity-10"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Branding */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 w-fit group">
              <div className="relative w-10 h-10 rounded-lg bg-spidey-blue border-2 border-spidey-red flex items-center justify-center overflow-hidden">
                <span className="font-mono font-black text-spidey-red text-sm tracking-tighter">
                  N26
                </span>
                <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-spidey-cyan/70" />
                <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-spidey-cyan/70" />
                <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-spidey-cyan/70" />
                <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-spidey-cyan/70" />
              </div>
              <div>
                <p className="font-bold text-spidey-white text-base">
                  Noesis <span className="text-spidey-cyan">'26</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-spidey-white/50 font-mono">
                  by Neura IT Club
                </p>
              </div>
            </Link>
            <p className="text-spidey-white/55 text-sm leading-relaxed max-w-sm mb-4">
              A National-Level Inter-College IT Fest hosted by the Neura IT
              Club, Department of Computer Science, Jamia Hamdard Kannur Campus.
              Where Curiosity Becomes Innovation.
            </p>
            <a
              href={CAMPUS_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-spidey-cyan hover:gap-2.5 transition-all"
            >
              <MapPin size={13} />
              View Campus on Map
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-spidey-white/40 mb-4">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-spidey-white/65 hover:text-spidey-cyan transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-spidey-white/40 mb-4">
              Contact
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:noesisitfest@gmail.com"
                  className="flex items-center gap-2 text-sm text-spidey-white/65 hover:text-spidey-cyan transition-colors"
                >
                  <Mail size={14} className="text-spidey-cyan shrink-0" />
                  noesisitfest@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919995061050"
                  className="flex items-center gap-2 text-sm text-spidey-white/65 hover:text-spidey-cyan transition-colors"
                >
                  <Phone size={14} className="text-spidey-cyan shrink-0" />
                  +91 99950 61050
                </a>
              </li>
              <li>
                <a
                  href={CAMPUS_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-spidey-white/65 hover:text-spidey-cyan transition-colors"
                >
                  <MapPin
                    size={14}
                    className="text-spidey-cyan shrink-0 mt-0.5"
                  />
                  Jamia Hamdard Kannur Campus, Kannur City, Kerala 670003
                </a>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg border border-spidey-white/15 flex items-center justify-center text-spidey-white/60 hover:text-spidey-cyan hover:border-spidey-cyan/40 transition-colors"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-spidey-white/10 text-xs text-spidey-white/40 font-mono">
          <p>
            © 2026 Neura IT Club, Jamia Hamdard Kannur Campus. All rights
            reserved.
          </p>
          <p>Built with curiosity, for curiosity.</p>
        </div>
      </div>
    </footer>
  );
}
