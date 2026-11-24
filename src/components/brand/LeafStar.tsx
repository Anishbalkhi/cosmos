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
}: {
  className?: string;
  color?: string;
  title?: string;
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
        {LEAFLETS.map(([angle, len]) => (
          <path key={angle} d={leafletPath(len)} transform={`rotate(${angle})`} />
        ))}
      </g>
    </svg>
  );
}
