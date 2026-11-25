"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { ORDER_STEPS } from "./StatusSteps";

// a quadratic arc, like a transfer orbit, from the lab (left) to your door (right)
const P0 = [34, 168] as const;
const P1 = [200, -26] as const;
const P2 = [366, 168] as const;
const PATH = `M${P0[0]} ${P0[1]} Q${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`;
const point = (t: number) => {
  const u = 1 - t;
  return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
};
const STOPS = [0, 0.36, 0.68, 1];

/**
 * Where the order is, as an orbit (the planet and orbit pins): from the lab in Bangalore to your
 * door, the four stages as small worlds along the way, the path lit up to the current one and a
 * comet waiting there. current = -1 shows the route dimmed, before an order is looked up.
 */
export function OrbitJourney({ current, notes }: { current: number; notes?: Partial<Record<number, string>> }) {
  // draw the lit path in after mount, so it travels rather than appearing
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDrawn(current < 0 ? 0 : STOPS[current]));
    return () => cancelAnimationFrame(id);
  }, [current]);
  const [cx, cy] = point(current < 0 ? 0 : STOPS[current]);

  return (
    <div className={clsx("transition-opacity duration-700", current < 0 && "opacity-60")}>
      <svg viewBox="0 0 400 210" className="w-full overflow-visible" role="img" aria-label={current < 0 ? "Order route" : `Order is ${ORDER_STEPS[current].toLowerCase()}`}>
        <path d={PATH} fill="none" stroke="rgb(243 238 230 / 0.16)" strokeWidth="1" strokeDasharray="2 5" />
        <path
          d={PATH}
          pathLength={1}
          fill="none"
          stroke="var(--color-flare)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="1"
          strokeDashoffset={1 - drawn}
          style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(0.22,1,0.36,1)", filter: "drop-shadow(0 0 4px var(--color-flare))" }}
        />
        {STOPS.map((t, i) => {
          const [x, y] = point(t);
          const done = current >= 0 && i <= current;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={i === 0 || i === 3 ? 9 : 6.5} fill="var(--color-ink)" stroke={done ? "var(--color-flare)" : "rgb(243 238 230 / 0.3)"} strokeWidth="1.2" />
              {done && <circle cx={x} cy={y} r={i === 0 || i === 3 ? 4 : 3} fill="var(--color-flare)" />}
              <text x={x} y={y + 26} textAnchor="middle" fontSize="9.5" letterSpacing="1.4" fill={done ? "var(--color-star)" : "var(--color-dust)"} fontFamily="var(--font-montserrat)">
                {ORDER_STEPS[i].toUpperCase()}
              </text>
              {notes?.[i] && (
                <text x={x} y={y + 39} textAnchor="middle" fontSize="8.5" fill="var(--color-dust)" fontFamily="var(--font-geist)">
                  {notes[i]}
                </text>
              )}
            </g>
          );
        })}
        <text x={P0[0]} y={P0[1] - 18} textAnchor="middle" fontSize="8" letterSpacing="1.2" fill="var(--color-dust)" fontFamily="var(--font-montserrat)">
          BANGALORE
        </text>
        <text x={P2[0]} y={P2[1] - 18} textAnchor="middle" fontSize="8" letterSpacing="1.2" fill="var(--color-dust)" fontFamily="var(--font-montserrat)">
          YOUR DOOR
        </text>
        {current >= 0 && (
          <g style={{ transform: `translate(${cx}px, ${cy}px)`, transition: "transform 1.6s cubic-bezier(0.22,1,0.36,1)" }}>
            <circle r="14" fill="var(--color-flare)" opacity="0.18" className="animate-ping" style={{ transformOrigin: "0 0" }} />
            <circle r="5" fill="var(--color-flare-soft)" style={{ filter: "drop-shadow(0 0 6px var(--color-flare))" }} />
          </g>
        )}
      </svg>
    </div>
  );
}
