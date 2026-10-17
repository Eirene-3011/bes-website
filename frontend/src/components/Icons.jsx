/* ============================================================
   BES Icon Set
   Minimal, consistent 24x24 stroke icons used across the About
   section in place of emoji. All accept `size` and any SVG prop
   (e.g. className, style) and inherit color via currentColor.
   ============================================================ */
import React from 'react';

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Svg = ({ size = 24, children, ...rest }) => (
  <svg width={size} height={size} {...base} {...rest} aria-hidden="true" focusable="false">
    {children}
  </svg>
);

/* Vision — a compass, for looking forward */
export const IconCompass = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M14.8 9.2 13 13l-3.8 1.8L11 11l3.8-1.8Z" />
  </Svg>
);

/* Mission — a target, for a defined objective */
export const IconTarget = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none" />
  </Svg>
);

/* Maximize / enlarge */
export const IconMaximize = (props) => (
  <Svg {...props}>
    <path d="M15 4h5v5" />
    <path d="M20 4l-6 6" />
    <path d="M9 20H4v-5" />
    <path d="M4 20l6-6" />
  </Svg>
);

/* Core Values — a faceted gem */
export const IconGem = (props) => (
  <Svg {...props}>
    <path d="M6.5 4.5h11L21 9.5 12 20 3 9.5 6.5 4.5Z" />
    <path d="M3 9.5h18M9 4.5l-2 5 5 10.5 5-10.5-2-5" />
  </Svg>
);

/* Goals & Objectives — a planted flag */
export const IconFlag = (props) => (
  <Svg {...props}>
    <path d="M5 21V4" />
    <path d="M5 4.5c2-1.2 4-1.2 6 0s4 1.2 6 0v9c-2 1.2-4 1.2-6 0s-4-1.2-6 0" />
  </Svg>
);

/* History — a clock with a sweeping hand */
export const IconClock = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3.2 1.8" />
  </Svg>
);

/* Buildings & structure */
export const IconBuilding = (props) => (
  <Svg {...props}>
    <rect x="5" y="3.5" width="10" height="17" rx="0.5" />
    <path d="M15 9.5h4v11h-4M8 7.5h1M11 7.5h1M8 10.5h1M11 10.5h1M8 13.5h1M11 13.5h1M8 16.5h1M11 16.5h1" />
  </Svg>
);

/* Hierarchy / org layers */
export const IconLayers = (props) => (
  <Svg {...props}>
    <path d="M12 3.5 21 8l-9 4.5L3 8l9-4.5Z" />
    <path d="m3 12 9 4.5 9-4.5" />
    <path d="m3 16 9 4.5 9-4.5" />
  </Svg>
);

/* Citizen's Charter — a rolled scroll */
export const IconScroll = (props) => (
  <Svg {...props}>
    <path d="M6 4.5h10.5a1.5 1.5 0 0 1 1.5 1.5v11a2 2 0 0 1-2 2H8" />
    <path d="M6 4.5a2 2 0 0 0-2 2v11.5a2 2 0 0 0 2 2" />
    <path d="M6 4.5v15" />
    <path d="M9 9h6M9 12.5h6" />
  </Svg>
);

/* People / committees */
export const IconUsers = (props) => (
  <Svg {...props}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
    <path d="M15.5 6.2a3 3 0 0 1 0 5.8" />
    <path d="M17 14.7c2.5.5 4 2.3 4 5.3" />
  </Svg>
);

/* Single person / avatar placeholder */
export const IconUser = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M4.5 20c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" />
  </Svg>
);

/* Location / address */
export const IconMapPin = (props) => (
  <Svg {...props}>
    <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </Svg>
);

/* Calendar / year established */
export const IconCalendar = (props) => (
  <Svg {...props}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="1.5" />
    <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
  </Svg>
);

/* Reference number / ID */
export const IconHash = (props) => (
  <Svg {...props}>
    <path d="M9.5 4 7 20M17 4l-2.5 16M4.5 9h15M3.5 15h15" />
  </Svg>
);

/* Region / globe */
export const IconGlobe = (props) => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.4 2.4 3.6 5.3 3.6 8.5S14.4 18.6 12 21c-2.4-2.4-3.6-5.3-3.6-8.5S9.6 5.9 12 3.5Z" />
  </Svg>
);

/* Download */
export const IconDownload = (props) => (
  <Svg {...props}>
    <path d="M12 3.5v11.5" />
    <path d="M7.5 11 12 15.5 16.5 11" />
    <path d="M4.5 17v2.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V17" />
  </Svg>
);

/* File / document */
export const IconFileText = (props) => (
  <Svg {...props}>
    <path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z" />
    <path d="M14 3.5V8h4" />
    <path d="M9 12.5h6M9 15.5h6" />
  </Svg>
);

/* Legal basis / balance scale */
export const IconScale = (props) => (
  <Svg {...props}>
    <path d="M12 3.5v17M8 20.5h8" />
    <path d="M12 6 5 8l3.2 6.5a3.4 3.4 0 0 0 3.6 0L5 8" />
    <path d="M12 6l7 2-3.2 6.5a3.4 3.4 0 0 1-3.6 0L19 8" />
    <path d="M12 6a1.3 1.3 0 1 0 0-2.6A1.3 1.3 0 0 0 12 6Z" fill="currentColor" stroke="none" />
  </Svg>
);

/* Directional / navigation */
export const IconChevronRight = (props) => (
  <Svg {...props}>
    <path d="m9 5.5 7 6.5-7 6.5" />
  </Svg>
);

export const IconExternalLink = (props) => (
  <Svg {...props}>
    <path d="M9 5.5H6a2 2 0 0 0-2 2v10.5A2 2 0 0 0 6 20h10.5a2 2 0 0 0 2-2v-3" />
    <path d="M14 4h6v6M20 4l-9.5 9.5" />
  </Svg>
);

/* Grade levels — an open book */
export const IconBook = (props) => (
  <Svg {...props}>
    <path d="M12 6.5c-1.6-1.2-3.6-1.7-6-1.5v13c2.4-.2 4.4.3 6 1.5 1.6-1.2 3.6-1.7 6-1.5v-13c-2.4-.2-4.4.3-6 1.5Z" />
    <path d="M12 6.5V19" />
  </Svg>
);

/* Tuition / fees — stacked coins */
export const IconCoins = (props) => (
  <Svg {...props}>
    <ellipse cx="9" cy="7" rx="5.5" ry="3" />
    <path d="M3.5 7v9c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3V7" />
    <path d="M3.5 11.5c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3" />
    <path d="M14.5 6a5.4 5.4 0 0 1 5.5 3c0 1.5-1.7 2.7-4 2.9M14.5 16v.9c0 1.4-1.7 2.5-3.8 2.9M20 9v6.4c0 1.5-1.7 2.6-4 2.9" />
  </Svg>
);

/* Contact — phone receiver */
export const IconPhone = (props) => (
  <Svg {...props}>
    <path d="M5.5 4.5h3l1.3 4-2 1.4a12.5 12.5 0 0 0 6.3 6.3l1.4-2 4 1.3v3c0 1-.9 1.7-1.8 1.5A16.5 16.5 0 0 1 4 6.3c-.2-.9.5-1.8 1.5-1.8Z" />
  </Svg>
);

/* Requirements — clipboard */
export const IconClipboard = (props) => (
  <Svg {...props}>
    <rect x="5.5" y="5" width="13" height="16" rx="1.5" />
    <rect x="9" y="3.2" width="6" height="3.2" rx="1" fill="var(--white)" />
    <path d="M9 11h6M9 14.5h6M9 18h4" />
  </Svg>
);

/* Online portal — monitor */
export const IconMonitor = (props) => (
  <Svg {...props}>
    <rect x="3.5" y="4.5" width="17" height="12" rx="1.5" />
    <path d="M9 20.5h6M12 16.5v4" />
  </Svg>
);

/* Checklist mark */
export const IconCheck = (props) => (
  <Svg {...props}>
    <path d="M5 12.5 9.5 17 19 6.5" />
  </Svg>
);

/* Ordered steps / process */
export const IconListOrdered = (props) => (
  <Svg {...props}>
    <path d="M9.5 6h11M9.5 12h11M9.5 18h11" />
    <path d="M4 5v3M4 8H3M4 8h1.3M3.5 14.2c0-.9.7-1.4 1.5-1.4s1.5.5 1.5 1.3c0 .6-.4 1-.9 1.4L3.5 17h3" />
  </Svg>
);

/* Programs & learning — graduation cap */
export const IconGraduationCap = (props) => (
  <Svg {...props}>
    <path d="M2.5 9.5 12 5l9.5 4.5L12 14 2.5 9.5Z" />
    <path d="M6.5 11.6v4.3c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-4.3" />
    <path d="M21.5 9.5v5.5" />
  </Svg>
);

/* Frequency / recurring cadence */
export const IconRepeat = (props) => (
  <Svg {...props}>
    <path d="M4.5 11a7.5 7.5 0 0 1 12.6-5.5L19.5 8" />
    <path d="M19.5 8V4M19.5 8h-4" />
    <path d="M19.5 13a7.5 7.5 0 0 1-12.6 5.5L4.5 16" />
    <path d="M4.5 16v4M4.5 16h4" />
  </Svg>
);

/* Commendations — a medal */
export const IconMedal = (props) => (
  <Svg {...props}>
    <path d="M8.5 3.5 12 9.5l3.5-6" />
    <path d="M9.5 3.5h5M8.5 3.5 6.8 6.6M15.5 3.5l1.7 3.1" />
    <circle cx="12" cy="14.5" r="6" />
    <path d="M12 11.3 13 14l2.7.2-2.1 1.7.7 2.6-2.3-1.5-2.3 1.5.7-2.6-2.1-1.7L11 14l1-2.7Z" />
  </Svg>
);

/* Featured — a star */
export const IconStar = (props) => (
  <Svg {...props}>
    <path d="M12 3.5 14.7 9l6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.9l6-.9L12 3.5Z" />
  </Svg>
);

/* Accomplishments — a trophy */
export const IconTrophy = (props) => (
  <Svg {...props}>
    <path d="M7 4.5h10v5a5 5 0 0 1-10 0v-5Z" />
    <path d="M7 5.5H4.5v1.5A3.5 3.5 0 0 0 8 10.5M17 5.5h2.5V7A3.5 3.5 0 0 1 16 10.5" />
    <path d="M12 14.5v3M9 20.5h6M9.5 20.5c0-1.7.7-2.5 2.5-2.5s2.5.8 2.5 2.5" />
  </Svg>
);

/* Key Stage 1 — early literacy, rendered as alphabet tiles */
export const IconAbc = (props) => (
  <Svg {...props}>
    <rect x="3" y="7" width="5.5" height="10" rx="1.3" />
    <rect x="9.3" y="7" width="5.5" height="10" rx="1.3" />
    <rect x="15.6" y="7" width="5.5" height="10" rx="1.3" />
    <path d="M5 14v-3l1.7 3v-3" />
    <path d="M11.3 11h2M11.3 12h2M11.3 14h2" />
    <path d="M17.6 11.3a1.3 1.3 0 1 1 0 2.6M17.6 13.9a1.3 1.3 0 1 1 0 2.6" />
  </Svg>
);

/* Key Stage 2 — numeracy, rendered as a ruler */
export const IconRuler = (props) => (
  <Svg {...props}>
    <rect x="3" y="9.5" width="18" height="5.5" rx="1" transform="rotate(-18 12 12.25)" />
    <path d="m8.3 10 .8 2M11 9l.8 2M13.7 8l.8 2M16.4 7l.8 2" />
  </Svg>
);

/* Supplementary materials — a small library */
export const IconLibrary = (props) => (
  <Svg {...props}>
    <path d="M4 20.5V5a1 1 0 0 1 1-1h2.5a1 1 0 0 1 1 1v15.5" />
    <path d="M4 17.5h4.5" />
    <path d="M11 20.5 12.7 5a1 1 0 0 1 1.1-.9l2.5.3a1 1 0 0 1 .9 1.1l-1.7 15.5" />
    <path d="m11.6 15 4.4.6" />
    <path d="M19 20.5V8a1 1 0 0 1 1-1h.5a1 1 0 0 1 1 1v12.5" />
  </Svg>
);

/* Notices — a megaphone */
export const IconMegaphone = (props) => (
  <Svg {...props}>
    <path d="M3.5 10v4a1.5 1.5 0 0 0 1.5 1.5h1l1.3 4.5" />
    <path d="M6 10 16.5 5v14L6 14" />
    <path d="M16.5 8.3a3.2 3.2 0 0 1 0 7.4" />
  </Svg>
);

/* Forms — a paperclip */
export const IconPaperclip = (props) => (
  <Svg {...props}>
    <path d="M8 12.5 15 5.4a3 3 0 0 1 4.2 4.2L10 18.9a4.6 4.6 0 0 1-6.5-6.5L12.4 3.5" />
  </Svg>
);

/* Clear / close */
export const IconX = (props) => (
  <Svg {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Svg>
);

/* Search */
export const IconSearch = (props) => (
  <Svg {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="m19.5 19.5-4.3-4.3" />
  </Svg>
);

/* Email */
export const IconMail = (props) => (
  <Svg {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="1.8" />
    <path d="m4 7 8 6.5L20 7" />
  </Svg>
);

/* Send message */
export const IconSend = (props) => (
  <Svg {...props}>
    <path d="M20.5 3.5 3 10.3l6.7 2.7M20.5 3.5 13.7 20l-2.7-6.7M20.5 3.5 10 13.5" />
  </Svg>
);

/* Feedback / conversation */
export const IconMessageSquare = (props) => (
  <Svg {...props}>
    <path d="M4 5.5h16v11H9.5L5.5 20v-3.5H4v-11Z" />
  </Svg>
);


/* Survey results — bar chart */
export const IconBarChart = (props) => (
  <Svg {...props}>
    <path d="M4 20.5V10M10 20.5V4M16 20.5v-7M4 20.5h16" />
  </Svg>
);

/* Accordion toggle */
export const IconChevronDown = (props) => (
  <Svg {...props}>
    <path d="m5.5 9 6.5 7 6.5-7" />
  </Svg>
);
