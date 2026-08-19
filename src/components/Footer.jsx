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

const QUICK_LINKS = [
  { label: "Events", href: "#events" },
  { label: "Schedule", href: "#schedule" },
  { label: "Highlights", href: "#highlights" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQs", href: "#faqs" },
  { label: "Register", href: "#register" },
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

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative border-t border-sand/10 px-4 pt-16 pb-8 overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-10 grid-overlay opacity-10"
        aria-hidden
      />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          {/* Branding */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-cyprus border border-emerald/30 flex items-center justify-center">
                <span className="font-mono font-bold text-emerald text-sm">
                  <img src="logo.png" alt="Noesis Logo" />
                </span>
              </div>
              <div>
                <p className="font-bold text-sand text-base">
                  Noesis <span className="text-emerald">'26</span>
                </p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-sand/50 font-mono">
                  by Neura IT Club
                </p>
              </div>
            </div>
            <p className="text-sand/55 text-sm leading-relaxed max-w-sm mb-4">
              A National-Level Inter-College IT Fest hosted by the Neura IT
              Club, Department of Computer Science, Jamia Hamdard Kannur Campus.
              Where Curiosity Becomes Innovation.
            </p>
            <a
              href="https://maps.google.com/?q=Jamia+Hamdard+Kannur+Campus"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald hover:gap-2.5 transition-all"
            >
              <MapPin size={13} />
              View Campus on Map
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sand/40 mb-4">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-sand/65 hover:text-emerald transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sand/40 mb-4">
              Contact
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:noesisitfest@gmail.com"
                  className="flex items-center gap-2 text-sm text-sand/65 hover:text-emerald transition-colors"
                >
                  <Mail size={14} className="text-emerald shrink-0" />
                  noesisitfest@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+919995061050"
                  className="flex items-center gap-2 text-sm text-sand/65 hover:text-emerald transition-colors"
                >
                  <Phone size={14} className="text-emerald shrink-0" />
                  +91 99950 61050
                </a>
              </li>
              <li className="flex items-start gap-2 text-sm text-sand/65">
                <MapPin size={14} className="text-emerald shrink-0 mt-0.5" />
                Jamia Hamdard Kannur Campus, Kannur City, Kerala 670003
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
                  className="w-9 h-9 rounded-lg border border-sand/15 flex items-center justify-center text-sand/60 hover:text-emerald hover:border-emerald/40 transition-colors"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-sand/10 text-xs text-sand/40 font-mono">
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
