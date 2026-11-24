"use client";

import { useState } from "react";
import { getProduct } from "@/lib/data";
import { ShaderCanvas, type PostSettings } from "@/components/gl/ShaderCanvas";
import { gummyFrag } from "@/components/gl/objectShaders";
import { GUMMY, rgb } from "./colors";

const POST: PostSettings = { threshold: 0.9, bloom: 0.4, streak: 0.08, aberration: 0.004, exposure: 1.0, grain: 0.03, vignette: 0.2 };

// orbit radii (viewBox 0..100) and where each ingredient sits on its ring
const RINGS = [22, 31, 40, 48];
const ANGLES = [-38, 148, 32, 212];

/** mg → a 0..1 bar length on a log scale, so 5 mg and 100 mg both read */
function doseBar(amount: string) {
  const mg = parseFloat(amount);
  if (!Number.isFinite(mg) || mg <= 0) return 0;
  return Math.min(1, Math.max(0.12, Math.log10(mg) / Math.log10(200)));
}

/**
 * "What's inside" as a small solar system: the gummy itself, in 3D, at the centre, and each active
 * ingredient on its own orbit, numbered and keyed to the dose list beside it (log-scaled bars).
 */
export function IngredientOrbit({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const actives = p.ingredients.filter((i) => i.amount !== "—").slice(0, 4);
  const base = p.ingredients.find((i) => i.amount === "—");
  // fixed per product page: built once (a product page never changes its slug in place)
  const [uniforms] = useState(() => {
    const u = { uGum: GUMMY[p.slug] ?? rgb(p.color), uGlow: rgb(p.color) };
    return () => u;
  });

  return (
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
      <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
        <div className="absolute inset-[20%] overflow-hidden rounded-full" aria-hidden>
          <ShaderCanvas frag={gummyFrag} uniforms={uniforms} scale={0.9} maxDpr={1.75} post={POST} />
        </div>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {actives.map((_, i) => {
            const r = RINGS[i];
            const a = (ANGLES[i] * Math.PI) / 180;
            const x = 50 + r * Math.cos(a);
            const y = 50 + r * Math.sin(a);
            return (
              <g key={i}>
                <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(243 238 230 / 0.12)" strokeWidth="0.25" />
                {/* a glint running round each ring, each at its own pace */}
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="none"
                  stroke={p.color}
                  strokeOpacity="0.7"
                  strokeWidth="0.45"
                  strokeLinecap="round"
                  strokeDasharray={`${r * 0.5} ${r * 6.3}`}
                  className="origin-center animate-spin"
                  style={{ animationDuration: `${14 + i * 7}s`, animationDirection: i % 2 ? "reverse" : "normal" }}
                />
                <circle cx={x} cy={y} r="3.6" fill="#07080f" stroke={p.color} strokeWidth="0.5" />
                <circle cx={x} cy={y} r="5.5" fill={p.color} opacity="0.12" />
                <text x={x} y={y + 1.25} textAnchor="middle" fontSize="3.4" fill="#f3eee6" fontFamily="var(--font-geist-mono)">
                  {String(i + 1).padStart(2, "0")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div>
        <ol className="divide-y divide-line border-y border-line">
          {actives.map((ing, i) => (
            <li key={ing.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 py-5">
              <span className="font-mono text-xs tracking-[0.16em]" style={{ color: p.color }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-base text-star/90">{ing.name}</span>
              <span className="font-mono text-sm text-star tabular-nums">{ing.amount}</span>
              <span className="col-start-2 col-end-4 h-[3px] overflow-hidden rounded-full bg-white/8">
                <span className="block h-full rounded-full" style={{ width: `${doseBar(ing.amount) * 100}%`, background: p.color, boxShadow: `0 0 12px ${p.color}` }} />
              </span>
            </li>
          ))}
        </ol>
        {base && <p className="mt-5 text-sm text-dust">Base: {base.name.toLowerCase()}.</p>}
        <p className="mt-2 text-xs text-dust">Vegan. No artificial colours. Contains no flower or resin. Amounts are per gummy.</p>
      </div>
    </div>
  );
}
