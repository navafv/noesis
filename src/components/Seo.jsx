import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * SEO.jsx
 * Route-aware SEO manager for Noesis'26.
 *
 * Since the site is server-rendered as a single static index.html (with a
 * noscript-safe fallback for crawlers), this component keeps the *client-side*
 * <title>, canonical link, and Open Graph / Twitter tags in sync whenever the
 * user navigates between routes with react-router. It mutates the existing
 * tags already declared in index.html rather than duplicating them, so there
 * is never more than one of each tag in <head>.
 *
 * Usage: render <SEO {...page-specific overrides} /> once near the top of
 * each page component (HomePage, EventsPage, SchedulePage, etc).
 */

const SITE_NAME = "Noesis'26";
const SITE_URL = "https://noesis26.vercel.app";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
const TWITTER_HANDLE = "@noesis.26";

// Central per-route registry. Pages can still override any field via props.
const ROUTE_META = {
  "/": {
    title:
      "Noesis'26 | Best IT Fest in Kerala 2026 — Jamia Hamdard Kannur | Neura IT Club",
    description:
      "Noesis'26 is the National-Level Inter-College IT Fest hosted by Neura IT Club, Dept. of Computer Science, Jamia Hamdard Kannur Campus. Sept 30 - Oct 01, 2026. Register now for hackathons, workshops & tech competitions.",
  },
  "/events": {
    title: "Events | Noesis'26 — Coding, Hackathons, Gaming & More",
    description:
      "Explore all Noesis'26 events — Coding, Debugging, Web Designing, AI Prompting, IT Quiz, Esports and more. Compete for prize pools worth over ₹65,000 at Jamia Hamdard Kannur Campus.",
  },
  "/schedule": {
    title: "Schedule | Noesis'26 — Full Two-Day Event Timeline",
    description:
      "Full Day 1 & Day 2 schedule for Noesis'26 at Jamia Hamdard Kannur Campus, Sept 30 - Oct 01, 2026 — from the inaugural keynote to the valedictory ceremony.",
  },
  "/register": {
    title: "Register | Noesis'26 — Secure Your Spot",
    description:
      "Register now for Noesis'26, the National-Level Inter-College IT Fest at Jamia Hamdard Kannur Campus. Limited seats across all events — sign up today.",
  },
  "/login": {
    title: "Login | Noesis'26 Participant Portal",
    description:
      "Log in to your Noesis'26 participant account to manage your registrations and event passes.",
    robots: "noindex, nofollow",
  },
};

const NOT_FOUND_META = {
  title: "Page Not Found | Noesis'26",
  description:
    "The page you're looking for doesn't exist. Head back to Noesis'26 home to explore events, schedule, and registration.",
  robots: "noindex, follow",
};

function upsertMetaByName(name, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertMetaByProperty(property, content) {
  if (!content) return;
  let tag = document.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertCanonical(href) {
  let tag = document.querySelector('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/**
 * @param {Object} props
 * @param {string} [props.title] - Overrides the route-derived title.
 * @param {string} [props.description] - Overrides the route-derived description.
 * @param {string} [props.image] - Absolute URL for og:image / twitter:image.
 * @param {string} [props.robots] - e.g. "noindex, nofollow". Defaults to "index, follow".
 * @param {boolean} [props.notFound] - Set true on the 404 page to force noindex + generic copy.
 */
export default function SEO({
  title,
  description,
  image,
  robots,
  notFound = false,
}) {
  const location = useLocation();

  useEffect(() => {
    const routeMeta = notFound
      ? NOT_FOUND_META
      : (ROUTE_META[location.pathname] ?? {
          title: `${SITE_NAME}`,
          description: ROUTE_META["/"].description,
        });

    const resolvedTitle = title || routeMeta.title;
    const resolvedDescription = description || routeMeta.description;
    const resolvedRobots =
      robots || routeMeta.robots || "index, follow, max-image-preview:large";
    const resolvedImage = image || DEFAULT_OG_IMAGE;
    const canonicalUrl = `${SITE_URL}${location.pathname === "/" ? "/" : location.pathname.replace(/\/$/, "")}`;

    // Document title
    document.title = resolvedTitle;

    // Standard meta
    upsertMetaByName("description", resolvedDescription);
    upsertMetaByName("robots", resolvedRobots);

    // Canonical
    upsertCanonical(canonicalUrl);

    // Open Graph
    upsertMetaByProperty("og:title", resolvedTitle);
    upsertMetaByProperty("og:description", resolvedDescription);
    upsertMetaByProperty("og:url", canonicalUrl);
    upsertMetaByProperty("og:image", resolvedImage);
    upsertMetaByProperty("og:type", "website");
    upsertMetaByProperty("og:site_name", SITE_NAME);

    // Twitter
    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", resolvedTitle);
    upsertMetaByName("twitter:description", resolvedDescription);
    upsertMetaByName("twitter:image", resolvedImage);
    upsertMetaByName("twitter:site", TWITTER_HANDLE);
  }, [location.pathname, title, description, image, robots, notFound]);

  // Renders nothing — purely a side-effect component.
  return null;
}

export { ROUTE_META, SITE_NAME, SITE_URL };
