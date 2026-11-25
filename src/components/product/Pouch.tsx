import type { Glyph } from "@/lib/data";

/**
 * Placeholder pouch art (SVG) until the client's printed pouch artwork
 * exists. Follows the packaging reference: one colour and one
 * illustration per product, shared label layout.
 */
export function Pouch({
  id,
  name,
  color,
  glyph,
  meta = "30 GUMMIES · 5 MG",
  className,
}: {
  id: string;
  name: string;
  color: string;
  glyph: Glyph;
  meta?: string;
  className?: string;
}) {
  const g = `pouch-${id}`;
  return (
    <svg viewBox="0 0 200 280" className={className} role="img" aria-label={`${name} pouch`}>
      <defs>
        <linearGradient id={`${g}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.72" />
        </linearGradient>
        <linearGradient id={`${g}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.45" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${g}-clip`}>
          <path d="M18 12 Q18 4 26 4 H174 Q182 4 182 12 V250 Q182 272 160 274 Q100 280 40 274 Q18 272 18 250 Z" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${g}-clip)`}>
        <rect width="200" height="280" fill="#0b0c16" />
        <rect width="200" height="280" fill={`url(#${g}-fill)`} />
        {/* zip seal */}
        <rect x="18" y="26" width="164" height="3" fill="#000" opacity="0.18" />
        <rect x="18" y="31" width="164" height="1.5" fill="#fff" opacity="0.18" />
        {/* art window */}
        <circle cx="100" cy="128" r="58" fill="var(--color-ink)" opacity="0.88" />
        <GlyphArt glyph={glyph} />
        {/* shine */}
        <rect x="-40" width="140" height="280" fill={`url(#${g}-shine)`} />
      </g>

      {/* tear notches */}
      <path d="M18 18 l5 2 -5 2 Z M182 18 l-5 2 5 2 Z" fill="var(--color-ink)" />

      {/* label */}
      <text x="100" y="54" textAnchor="middle" fill="var(--color-ink)" fontSize="11" letterSpacing="3" fontFamily="var(--font-montserrat)">
        COSMOS
      </text>
      <text x="100" y="214" textAnchor="middle" fill="var(--color-ink)" fontSize="15" fontWeight="800" fontFamily="var(--font-montserrat)">
        {name.toUpperCase()}
      </text>
      <text x="100" y="234" textAnchor="middle" fill="var(--color-ink)" fontSize="6.6" letterSpacing="1" fontFamily="var(--font-geist-mono)" opacity="0.8">
        {meta}
      </text>
      <line x1="70" y1="246" x2="130" y2="246" stroke="var(--color-ink)" strokeOpacity="0.35" />
      <text x="100" y="258" textAnchor="middle" fill="var(--color-ink)" fontSize="5.2" letterSpacing="0.6" fontFamily="var(--font-geist-mono)" opacity="0.7">
        LEAF EXTRACT · LAB TESTED
      </text>
    </svg>
  );
}

/** Just the product's celestial illustration, for large display. */
export function GlyphBadge({ glyph, className }: { glyph: Glyph; className?: string }) {
  return (
    <svg viewBox="36 64 128 128" className={className} aria-hidden>
      <circle cx="100" cy="128" r="62" fill="var(--color-ink)" />
      <GlyphArt glyph={glyph} />
    </svg>
  );
}

function GlyphArt({ glyph }: { glyph: Glyph }) {
  const stroke = "#f4f1ea";
  switch (glyph) {
    case "blackhole":
      return (
        <g transform="translate(100 128)">
          <ellipse rx="48" ry="12" fill="none" stroke="var(--color-flare-soft)" strokeWidth="1.5" transform="rotate(-14)" />
          <ellipse rx="38" ry="8" fill="none" stroke="var(--color-flare)" strokeWidth="2.5" transform="rotate(-14)" />
          <circle r="20" fill="#000" stroke="var(--color-flare-soft)" strokeWidth="1.2" />
          <path d="M-44 6 A46 12 0 0 0 44 -16" fill="none" stroke="#fbeccf" strokeWidth="1" transform="rotate(-2)" />
          <circle r="2" cx="-30" cy="-30" fill={stroke} />
          <circle r="1.2" cx="34" cy="26" fill={stroke} />
        </g>
      );
    case "elevator":
      return (
        <g transform="translate(100 128)" stroke={stroke} fill="none">
          {/* real Earth photo (NASA, public domain) at the foot of the tether */}
          <image href="/planets/earth.webp" x="-21" y="16" width="42" height="42" />
          <line x1="0" y1="16" x2="0" y2="-46" strokeWidth="1.2" strokeDasharray="2 3" />
          <rect x="-7" y="-6" width="14" height="18" rx="3" fill="#12b5a5" strokeWidth="1.2" />
          <rect x="-14" y="-54" width="28" height="10" rx="2" strokeWidth="1.2" />
          <circle cx="-32" cy="-28" r="1.6" fill={stroke} stroke="none" />
          <circle cx="30" cy="-18" r="1" fill={stroke} stroke="none" />
          <circle cx="24" cy="-40" r="1.3" fill={stroke} stroke="none" />
        </g>
      );
    case "moon":
      return (
        <g transform="translate(100 128)">
          <ellipse rx="52" ry="14" fill="none" stroke="#f2a516" strokeWidth="1.2" transform="rotate(18)" />
          {/* real Moon photo (NASA LRO, public domain) */}
          <image href="/planets/moon.webp" x="-30" y="-30" width="60" height="60" />
          <circle r="3" cx="46" cy="10" fill="#f2a516" />
        </g>
      );
    case "asteroids":
      return (
        <g transform="translate(100 128)" fill="#f4f1ea">
          <path d="M-40 -10 l8 -6 9 3 2 9 -7 7 -10 -2 Z" />
          <path d="M-6 -24 l6 -4 7 2 1 7 -6 5 -7 -2 Z" opacity="0.8" />
          <path d="M14 4 l10 -7 11 4 2 11 -9 8 -12 -3 Z" />
          <path d="M-20 22 l5 -3 6 2 0 5 -5 3 -5 -2 Z" opacity="0.7" />
          <ellipse rx="54" ry="16" fill="none" stroke="#e0567a" strokeWidth="1" transform="rotate(-10)" />
        </g>
      );
  }
}
