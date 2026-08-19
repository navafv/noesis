import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#________";

/**
 * A small uppercase eyebrow/tag label that glitch-scrambles into its final
 * text the moment it enters the viewport. Falls back to the plain string
 * for reduced-motion users.
 */
export default function LiveTag({ children, className = "", as: Tag = "p" }) {
  const text = typeof children === "string" ? children : String(children);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(text);
      return;
    }

    let frame = 0;
    let raf;
    const totalFrames = 16;

    const tick = () => {
      frame++;
      const revealed = Math.floor((frame / totalFrames) * text.length);
      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealed) return char;
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join("");
      setDisplay(next);
      if (frame < totalFrames) {
        raf = requestAnimationFrame(() => setTimeout(tick, 22));
      } else {
        setDisplay(text);
      }
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [inView, text]);

  return (
    <Tag ref={ref} className={`relative inline-block ${className}`}>
      {display}
    </Tag>
  );
}
