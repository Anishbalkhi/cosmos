"use client";

/**
 * One voyage, following the light.
 *
 * The home page is a single journey with ten stops (0 hero … 9 footer). Each stop is a section,
 * marked in the DOM with `data-stop="n"`. The journey value `t` runs 0..9: it holds still while a
 * section is on screen and moves to the next stop across each seam (from the moment the next
 * section's top enters at the bottom of the screen until it is a quarter of the way up).
 *
 * Everything shared between sections reads from here: the sky colour script and the light object
 * (UniverseStage), and the star dust in front (StarDust). Module state, not React state: it changes
 * every frame and nothing needs to re-render for it.
 */

export type Rgb = [number, number, number];

export type Stop = {
  /** the light object: centre in min-dimension units (y up, 0 = middle of the screen) */
  pos: [number, number];
  /** radius of the ring / disc */
  r: number;
  /** vertical squash: 1 = circle, small = a flat orbit seen edge-on */
  squash: number;
  /** 0 = a thin ring, 1 = a solid disc (a sun, a star) */
  fill: number;
  /** ring thickness */
  w: number;
  /** 0 = one light, 1 = three side by side */
  split: number;
  /** 0 = the whole ring lit, 1 = only the side facing `arcAng` (radians) */
  arc: number;
  arcAng: number;
  color: Rgb;
  intensity: number;
  /** sky gradient: top of the screen and the horizon (linear HDR values, kept very dark) */
  skyTop: Rgb;
  skyLow: Rgb;
  /** faint nebula tint and strength */
  neb: Rgb;
  dust: Rgb;
  /** star dust: fraction of particles shown, and how fast they come at you */
  dustDensity: number;
  dustSpeed: number;
  /** star field brightness (1 = full) */
  stars?: number;
  /** Milky Way strength (0 = none) */
  mw?: number;
  /** nebula veils' two tints (none before the Needs section) */
  veil?: [Rgb, Rgb];
  /** the light takes the brand accent (gold or the orange preview) instead of its own colour */
  accent?: boolean;
};

// the colour script: night, ice, deep blue, warm halos, the Sun, a horizon at golden hour, a green
// star, the deepest night, dawn, and then dark
export const STOPS: Stop[] = [
  // 0 hero: the hero paints its own black hole, so the shared light is off here (a gold ring drawn by the shared
  // sky showed behind the Needs titles whenever the journey value lagged near 0)
  { pos: [0, 0.11], r: 0.17, squash: 1, fill: 0, w: 0.012, split: 0, arc: 0, arcAng: 0, color: [1, 0.72, 0.38], intensity: 0,
    skyTop: [0.004, 0.004, 0.01], skyLow: [0.02, 0.012, 0.01], neb: [0.05, 0.03, 0.02], dust: [1, 0.85, 0.62], dustDensity: 0.6, dustSpeed: 1 },
  // 1 manifesto: a great ice-blue arc, lit on one side
  { pos: [-0.72, 0.42], r: 0.55, squash: 0.5, fill: 0, w: 0.006, split: 0, arc: 0.85, arcAng: -0.6, color: [0.55, 0.75, 1], intensity: 0.8,
    skyTop: [0.004, 0.008, 0.02], skyLow: [0.01, 0.02, 0.042], neb: [0.02, 0.04, 0.08], dust: [0.75, 0.86, 1], dustDensity: 0.7, dustSpeed: 0.8, mw: 0.8 },
  // 2 needs: a low blue glow on the horizon, under the rising world (no ring: it crossed the text and never went in front of a planet)
  { pos: [0, -0.62], r: 0.75, squash: 0.18, fill: 1, w: 0.01, split: 0, arc: 0, arcAng: 0, color: [0.55, 0.7, 1], intensity: 0.12,
    skyTop: [0.006, 0.006, 0.018], skyLow: [0.028, 0.028, 0.05], neb: [0.03, 0.03, 0.06], dust: [0.92, 0.94, 1], dustDensity: 0.8, dustSpeed: 0.9, mw: 1, veil: [[0.32, 0.42, 1.0], [0.62, 0.36, 0.95]] },
  // 3 range: a soft warm bloom behind the cards (halos fixed to the screen drifted off the cards as they scrolled)
  { pos: [0, -0.2], r: 0.55, squash: 0.5, fill: 1, w: 0.02, split: 0, arc: 0, arcAng: 0, color: [1, 0.78, 0.5], intensity: 0.1,
    skyTop: [0.008, 0.006, 0.012], skyLow: [0.03, 0.02, 0.02], neb: [0.05, 0.03, 0.025], dust: [1, 0.88, 0.7], dustDensity: 0, dustSpeed: 0.8, veil: [[0.42, 0.4, 1.0], [0.3, 0.5, 0.95]], accent: true },
  // 4 how it works: moonlit night round the section's waxing Moon (a faint cool glow behind it, no warm wash)
  { pos: [0.34, 0.02], r: 0.45, squash: 1, fill: 1, w: 0.02, split: 0, arc: 0, arcAng: 0, color: [0.7, 0.8, 1], intensity: 0.06,
    skyTop: [0.003, 0.005, 0.014], skyLow: [0.01, 0.014, 0.034], neb: [0.02, 0.03, 0.07], dust: [0.86, 0.91, 1], dustDensity: 0, dustSpeed: 0.8, mw: 0.5, veil: [[0.3, 0.42, 0.95], [0.42, 0.52, 0.88]] },
  // 5 (shares its seam with 6 since the proof strip and the plant became one section): no light of its own
  { pos: [0, -0.34], r: 0.8, squash: 0.015, fill: 0, w: 0.003, split: 0, arc: 0, arcAng: 0, color: [0.78, 0.86, 1], intensity: 0,
    skyTop: [0.003, 0.005, 0.013], skyLow: [0.012, 0.015, 0.032], neb: [0.02, 0.028, 0.06], dust: [0.86, 0.91, 1], dustDensity: 0, dustSpeed: 0.8, mw: 0.5, veil: [[0.36, 0.42, 0.95], [0.55, 0.4, 0.9]] },
  // 6 plant: a single sharp green-white star, up and to the right of the leaf (clear of its labels)
  { pos: [0.72, 0.28], r: 0.004, squash: 1, fill: 1, w: 0.01, split: 0, arc: 0, arcAng: 0, color: [0.75, 1, 0.55], intensity: 2.2,
    skyTop: [0.003, 0.006, 0.012], skyLow: [0.008, 0.02, 0.03], neb: [0.015, 0.035, 0.045], dust: [0.78, 0.92, 0.62], dustDensity: 0, dustSpeed: 0.8, veil: [[0.3, 0.62, 0.88], [0.36, 0.74, 0.62]] },
  // 7 journal: the pole star, the deepest night, in the empty left margin (clear of the header and the cover)
  { pos: [-0.75, 0.3], r: 0.004, squash: 1, fill: 1, w: 0.008, split: 0, arc: 0, arcAng: 0, color: [0.85, 0.9, 1], intensity: 2.2,
    skyTop: [0.002, 0.003, 0.01], skyLow: [0.008, 0.012, 0.03], neb: [0.015, 0.02, 0.05], dust: [0.82, 0.88, 1], dustDensity: 0, dustSpeed: 0.6, mw: 0.7, veil: [[0.34, 0.44, 1.0], [0.55, 0.34, 0.9]] },
  // 8 closing: the section paints its own eclipse (Earth across the Sun); the shared light goes out and the sky
  // stays night-dark around it (it was a warm dawn for the old sunrise)
  { pos: [-0.75, 0.3], r: 0.004, squash: 1, fill: 1, w: 0.01, split: 0, arc: 0, arcAng: 0, color: [1, 0.75, 0.45], intensity: 0,
    skyTop: [0.01, 0.01, 0.03], skyLow: [0.03, 0.022, 0.035], neb: [0.025, 0.02, 0.035], dust: [1, 0.85, 0.65], dustDensity: 0, dustSpeed: 0.6, stars: 0.8, accent: true, veil: [[0.6, 0.45, 0.7], [0.4, 0.42, 0.85]] },
  // 9 footer: the light is gone, only dark sky and a little dust
  { pos: [-0.75, 0.3], r: 0.004, squash: 1, fill: 1, w: 0.01, split: 0, arc: 0, arcAng: 0, color: [1, 0.75, 0.45], intensity: 0,
    skyTop: [0.004, 0.004, 0.008], skyLow: [0.006, 0.006, 0.012], neb: [0.01, 0.01, 0.015], dust: [0.9, 0.88, 0.85], dustDensity: 0, dustSpeed: 0.4, stars: 0.4, mw: 0.15 },
];

export const LAST = STOPS.length - 1;

/**
 * The sky behind the Science page: one still stop, the deep night of the home page's lower half
 * (Milky Way, faint blue-violet veils, no light object), so its scenes float in the same space.
 */
export const SCIENCE_SKY: Stop = {
  pos: [0, 0], r: 0.004, squash: 1, fill: 1, w: 0.01, split: 0, arc: 0, arcAng: 0, color: [0.8, 0.88, 1], intensity: 0,
  skyTop: [0.002, 0.003, 0.01], skyLow: [0.008, 0.011, 0.028], neb: [0.015, 0.02, 0.05], dust: [0.86, 0.91, 1],
  dustDensity: 0, dustSpeed: 0.6, stars: 0.9, mw: 0.6, veil: [[0.3, 0.42, 0.95], [0.5, 0.36, 0.9]],
};

// The far sky rolls slowly as you go down the page, like a camera turning on its axis (reference: an
// edge-on galaxy tilting ~15° over a few seconds): the Milky Way and the still stars swing a few degrees
// per section, so the same sky never sits at the same angle twice. Radians, per stop. 0 at the hero and
// the Manifesto, which stay exactly as they are.
const ROLL = [0, 0, 0.05, 0.13, 0.2, 0.25, 0.29, 0.35, 0.41, 0.44];
// A film grade, warm cream in the highlights and teal in the shadows (reference: Interstellar's look),
// 0..1 per stop: off at the hero and the Manifesto, eased in from the Needs wheel down.
const GRADE = [0, 0, 0.45, 1, 1, 1, 1, 1, 1, 0.7];
const NO_VEIL: [Rgb, Rgb] = [[0.32, 0.42, 1.0], [0.62, 0.36, 0.95]];

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const mix3 = (a: Rgb, b: Rgb, k: number): Rgb => [mix(a[0], b[0], k), mix(a[1], b[1], k), mix(a[2], b[2], k)];
const smooth = (lo: number, hi: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - lo) / (hi - lo)));
  return k * k * (3 - 2 * k);
};

/** the stop keyframes blended at journey value t (0..9) */
export function stopAt(t: number): Stop & { veilAmt: number; accentAmt: number; roll: number; grade: number } {
  const c = Math.min(LAST, Math.max(0, t));
  const i = Math.min(LAST - 1, Math.floor(c));
  const k = c - i;
  const a = STOPS[i];
  const b = STOPS[i + 1];
  return {
    pos: [mix(a.pos[0], b.pos[0], k), mix(a.pos[1], b.pos[1], k)],
    r: mix(a.r, b.r, k),
    squash: mix(a.squash, b.squash, k),
    fill: mix(a.fill, b.fill, k),
    w: mix(a.w, b.w, k),
    split: mix(a.split, b.split, k),
    arc: mix(a.arc, b.arc, k),
    arcAng: mix(a.arcAng, b.arcAng, k),
    color: mix3(a.color, b.color, k),
    intensity: mix(a.intensity, b.intensity, k),
    skyTop: mix3(a.skyTop, b.skyTop, k),
    skyLow: mix3(a.skyLow, b.skyLow, k),
    neb: mix3(a.neb, b.neb, k),
    dust: mix3(a.dust, b.dust, k),
    dustDensity: mix(a.dustDensity, b.dustDensity, k),
    dustSpeed: mix(a.dustSpeed, b.dustSpeed, k),
    stars: mix(a.stars ?? 1, b.stars ?? 1, k),
    mw: mix(a.mw ?? 0.35, b.mw ?? 0.35, k),
    veil: [mix3((a.veil ?? b.veil ?? NO_VEIL)[0], (b.veil ?? a.veil ?? NO_VEIL)[0], k), mix3((a.veil ?? b.veil ?? NO_VEIL)[1], (b.veil ?? a.veil ?? NO_VEIL)[1], k)],
    /** 0..1: how present the veils are (they fade in across the seam into the Needs section, out at the footer) */
    veilAmt: mix(a.veil ? 1 : 0, b.veil ? 1 : 0, k),
    accentAmt: mix(a.accent ? 1 : 0, b.accent ? 1 : 0, k),
    // leaving the Manifesto they wait for the second half of the seam, so the Manifesto itself never changes
    roll: mix(ROLL[i], ROLL[i + 1], i < 2 ? smooth(0.5, 1, k) : smooth(0, 1, k)),
    grade: mix(GRADE[i], GRADE[i + 1], i < 2 ? smooth(0.5, 1, k) : k),
  };
}

/**
 * The light across a move: the shape we're leaving (a) and the one we're heading for (b), with
 * `k` the crossfade. Shapes never interpolate parameter by parameter (a flat horizon line half way
 * to a point star is a huge bright disc); instead the old light drifts and resizes a third of the
 * way toward the new one as it fades, and the new one grows in from a third of the way back.
 */
export function lightsAt(t: number): { a: Stop; b: Stop; k: number } {
  const c = Math.min(LAST, Math.max(0, t));
  const i = Math.min(LAST - 1, Math.floor(c));
  const k = c - i;
  const from = STOPS[i];
  const to = STOPS[i + 1];
  const toward = (s: Stop, o: Stop, amt: number): Stop => ({
    ...s,
    pos: [mix(s.pos[0], o.pos[0], amt), mix(s.pos[1], o.pos[1], amt)],
    // radius moves geometrically, so a big ring and a point star meet half way in scale, not in size
    r: s.r * Math.pow(o.r / s.r, amt),
    // the shape keeps its own squash: bending a flat horizon line toward a round star drew a ring
  });
  return { a: toward(from, to, k * 0.35), b: toward(to, from, (1 - k) * 0.35), k: smooth(0.15, 0.85, k) };
}

/** live journey state, updated every frame while a driver runs */
export const journey = {
  /** smoothed journey value 0..9 */
  t: 0,
  /** the raw value scroll position maps to */
  target: 0,
  /** scroll position in screen heights */
  y: 0,
  /** scroll velocity in screen heights per second, smoothed (signed: + going down) */
  v: 0,
  /** where each seam's move starts and ends (document px), for checks */
  seams: [] as { lo: number; hi: number }[],
  /** document y (px) where the first seam begins: before it only the hero is on screen */
  start: 0,
};

function measure() {
  const vh = window.innerHeight;
  const sy = window.scrollY;
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"));
  const tops = new Map<number, number>();
  for (const el of els) {
    const n = Number(el.dataset.stop);
    if (!Number.isFinite(n) || n < 1) continue;
    tops.set(n, el.getBoundingClientRect().top + sy);
  }
  const max = Math.max(0, document.documentElement.scrollHeight - vh);
  const seams: { lo: number; hi: number }[] = [];
  for (let n = 1; n <= LAST; n++) {
    const top = tops.get(n);
    if (top === undefined) {
      // a stop that isn't on this page: pass straight through it at the previous seam
      const prev = seams[seams.length - 1] ?? { lo: 0, hi: 1 };
      seams.push({ ...prev });
      continue;
    }
    // from the moment its top enters at the bottom until it is a quarter of the way up; never past the end of the page
    const hi = Math.min(top - vh * 0.25, max);
    const lo = Math.min(top - vh, hi - vh * 0.3);
    seams.push({ lo, hi });
  }
  journey.seams = seams;
  journey.start = seams[0]?.lo ?? 0;
}

/** the journey value a scroll position maps to: one smoothstep per seam, summed (overlapping seams just add) */
function valueAt(y: number) {
  let t = 0;
  for (const s of journey.seams) t += smooth(s.lo, s.hi, y);
  return Math.min(LAST, t);
}

let users = 0;
let stopDriver: (() => void) | null = null;

/**
 * Start following the scroll (ref-counted, so the stage and the dust can both ask).
 * Returns a function that releases it.
 */
export function driveJourney(): () => void {
  users += 1;
  if (users === 1) {
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    journey.target = valueAt(lastY);
    journey.t = journey.target;
    const tick = (now: number) => {
      const dt = Math.min(0.1, Math.max(0.001, (now - last) / 1000));
      last = now;
      const vh = window.innerHeight || 1;
      const y = window.scrollY;
      journey.y = y / vh;
      const v = (y - lastY) / vh / dt;
      lastY = y;
      journey.v += (v - journey.v) * (1 - Math.exp(-dt * 6));
      journey.target = valueAt(y);
      // Lenis already smooths the scroll; this only takes the edge off jumps (anchor links, resize)
      journey.t += (journey.target - journey.t) * (1 - Math.exp(-dt * 8));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    if (process.env.NODE_ENV !== "production") (window as Window & { __journey?: typeof journey }).__journey = journey;
    stopDriver = () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }
  return () => {
    users -= 1;
    if (users === 0) {
      stopDriver?.();
      stopDriver = null;
    }
  };
}
