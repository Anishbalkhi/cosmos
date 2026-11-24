/**
 * The Cosmos mark: a 7-leaflet sativa leaf drawn as thin needles from
 * one point, so it reads as both a leaf and a star. Rebuilt as SVG from
 * the client's PNG logo so it stays sharp at every size.
 */

// [angle from straight up in degrees, length]
const LEAFLETS: [number, number][] = [
  [0, 90],
  [-47, 80],
  [47, 80],
  [-98, 64],
  [98, 64],
  [-142, 40],
  [142, 40],
];

// idle life for the large mark (motion notes in ./MOTION.md): each leaflet sways around the point where the
// leaflets meet, like a plant around its stem; longer leaflets a little more, every one on its own period
// and phase (seeded by index, never random), so they never move in sync. Amplitudes in degrees, ms.
const SWAY = { amp: [1.4, 1.0], period: [3600, 1600] } as const;
const seeded = (i: number, k = 0) => {
  const x = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};
function swayStyle(i: number, len: number) {
  const period = SWAY.period[0] + seeded(i) * SWAY.period[1];
  return {
    "--amp": `${(SWAY.amp[0] + (len / 90) * SWAY.amp[1]).toFixed(2)}deg`,
    "--dur": `${Math.round(period)}ms`,
    "--delay": `${Math.round(-seeded(i, 1) * period)}ms`,
  } as React.CSSProperties;
}

function leafletPath(len: number) {
  const w = len * 0.055;
  // thin lens from the origin pointing up
  return `M0 0 Q ${w} ${-len * 0.5} 0 ${-len} Q ${-w} ${-len * 0.5} 0 0 Z`;
}

/** The mark as an SVG <g>, for use inside other drawings. Origin = where leaflets meet. */
export function LeafGroup({ color, transform }: { color: string; transform?: string }) {
  return (
    <g fill={color} transform={transform}>
      {LEAFLETS.map(([angle, len]) => (
        <path key={angle} d={leafletPath(len)} transform={`rotate(${angle})`} />
      ))}
    </g>
  );
}

export function LeafStar({
  className,
  color = "var(--color-leaf)",
  title,
  live = false,
}: {
  className?: string;
  color?: string;
  title?: string;
  /** calm idle sway, for the mark as artwork (never in the header or other chrome) */
  live?: boolean;
}) {
  return (
    <svg
      viewBox="-70 -94 140 130"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <g fill={color}>
        {LEAFLETS.map(([angle, len], i) =>
          live ? (
            <g key={angle} className="leaf-sway" style={swayStyle(i, len)}>
              <path d={leafletPath(len)} transform={`rotate(${angle})`} />
            </g>
          ) : (
            <path key={angle} d={leafletPath(len)} transform={`rotate(${angle})`} />
          ),
        )}
      </g>
    </svg>
  );
}
