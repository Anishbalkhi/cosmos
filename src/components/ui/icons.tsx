import type { SVGProps } from "react";

/**
 * Thin line icons for trust badges and commerce (24px grid, 1.5px stroke, currentColor).
 * Drawn to sit beside Geist Mono labels: simple, geometric, no fills.
 */
type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const IconFlask = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 3h6M10 3v6.2L4.8 18.3A1.8 1.8 0 0 0 6.4 21h11.2a1.8 1.8 0 0 0 1.6-2.7L14 9.2V3" />
    <path d="M7.2 15h9.6" />
  </svg>
);
export const IconLeaf = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21V11" />
    <path d="M12 11 12 3M12 11 6.5 5.5M12 11l5.5-5.5M12 11 4 10M12 11l8-1M12 11l-5.5 4M12 11l5.5 4" />
  </svg>
);
export const IconSeal = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="10" r="6" />
    <path d="m9.5 10 1.7 1.7L14.5 8.4" />
    <path d="M8.5 15.2 7 21l5-2.5 5 2.5-1.5-5.8" />
  </svg>
);
export const IconDrop = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3s6 6.4 6 10.5a6 6 0 0 1-12 0C6 9.4 12 3 12 3Z" />
    <path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.4" />
  </svg>
);
export const IconSprout = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21v-8" />
    <path d="M12 13c0-4-3-6.5-7-6.5 0 4 3 6.5 7 6.5ZM12 11c0-3.4 2.6-6 6.5-6 0 3.4-2.6 6-6.5 6Z" />
  </svg>
);
export const IconNoFlower = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8.2c1.6 0 2.6 1.3 2.6 2.6 0 1.6-1.2 2.6-2.6 2.6s-2.6-1-2.6-2.6c0-1.3 1-2.6 2.6-2.6ZM12 13.4V17" />
    <path d="m6 6 12 12" />
  </svg>
);
export const IconTag = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12.2V4.5A1.5 1.5 0 0 1 4.5 3h7.7l8.8 8.8a1.5 1.5 0 0 1 0 2.1l-7.1 7.1a1.5 1.5 0 0 1-2.1 0L3 12.2Z" />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);
export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const IconBox = (p: P) => (
  <svg {...base(p)}>
    <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
    <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
  </svg>
);
export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2" />
  </svg>
);
export const IconTruck = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 6.5h11v10H3zM14 9.5h4l3 3.2v3.8h-7" />
    <circle cx="7" cy="17.5" r="1.8" />
    <circle cx="17.5" cy="17.5" r="1.8" />
  </svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);
