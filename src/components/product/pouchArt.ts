import type { Glyph, Product } from "@/lib/data";

/**
 * The printed artwork for the 3D pouch, drawn once per product on a 1024×1024 canvas:
 * front label on the left half, back label on the right half (the shader wraps them on).
 * Placeholder art until the client's real pouch print exists, following the packaging
 * reference: one colour and one celestial illustration per product, shared layout.
 */
export type PouchTextures = { label: HTMLCanvasElement; world: HTMLCanvasElement };

const INK = "#07080f";
// the Cosmos mark, same geometry as components/brand/LeafStar.tsx: [angle from up, length]
const LEAFLETS: [number, number][] = [
  [0, 90],
  [-47, 80],
  [47, 80],
  [-98, 64],
  [98, 64],
  [-142, 40],
  [142, 40],
];
// real NASA photographs (public domain), also used as the world behind the pouch
const WORLD_IMG: Record<Glyph, string | null> = {
  blackhole: null,
  elevator: "/planets/earth.webp",
  moon: "/planets/moon.webp",
  asteroids: "/planets/mars.webp",
};

const cache = new Map<string, Promise<PouchTextures>>();

export function pouchTextures(p: Product): Promise<PouchTextures> {
  let job = cache.get(p.slug);
  if (!job) {
    job = build(p);
    cache.set(p.slug, job);
    job.catch(() => cache.delete(p.slug));
  }
  return job;
}

type Fonts = { mont: string; sync: string; man: string; mono: string };

function family(v: string, fallback: string) {
  return getComputedStyle(document.body).getPropertyValue(v).trim() || fallback;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

async function build(p: Product): Promise<PouchTextures> {
  const f: Fonts = {
    mont: family("--font-montserrat", "sans-serif"),
    sync: family("--font-syncopate", "sans-serif"),
    man: family("--font-manrope", "sans-serif"),
    mono: family("--font-plex-mono", "monospace"),
  };
  await Promise.all(
    [`800 48px ${f.mont}`, `700 36px ${f.mont}`, `700 15px ${f.sync}`, `400 11px ${f.sync}`, `600 16px ${f.man}`, `400 14px ${f.mono}`].map((font) =>
      document.fonts.load(font).catch(() => []),
    ),
  );
  const src = WORLD_IMG[p.glyph];
  const planet = src ? await loadImage(src) : null;

  const label = document.createElement("canvas");
  label.width = label.height = 1024;
  const ctx = label.getContext("2d")!;
  // each half is laid out at the pouch's proportions (512 × 726) and stretched to 512 × 1024
  const sy = 1024 / 726;
  ctx.save();
  ctx.scale(1, sy);
  drawFront(ctx, p, planet, f);
  ctx.restore();
  ctx.save();
  ctx.translate(512, 0);
  ctx.scale(1, sy);
  drawBack(ctx, p, f);
  ctx.restore();

  // power-of-two copy of the planet photo, so the GPU can mipmap it
  const world = document.createElement("canvas");
  world.width = world.height = planet ? 1024 : 2;
  if (planet) world.getContext("2d")!.drawImage(planet, 0, 0, 1024, 1024);
  return { label, world };
}

const W = 512;
const H = 726;

function seal(ctx: CanvasRenderingContext2D) {
  // heat seal (top 56px = the crimped strip on the 3D pouch), tear notches, zip
  ctx.fillStyle = "rgba(0,0,0,0.13)";
  ctx.fillRect(0, 0, W, 56);
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  for (let x = 2; x < W; x += 6) ctx.fillRect(x, 8, 2, 40);
  ctx.fillStyle = INK;
  for (const [x, d] of [
    [0, 1],
    [W, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x, 62);
    ctx.lineTo(x + d * 11, 69);
    ctx.lineTo(x, 76);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(0,0,0,0.26)";
  ctx.fillRect(0, 91, W, 3);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(0, 95, W, 1.5);
}

function leafStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, height: number, color: string) {
  const k = height / 125; // the mark spans about 125 units from top leaflet to bottom ones
  ctx.save();
  ctx.translate(cx, cy + 30 * k);
  ctx.scale(k, k);
  ctx.fillStyle = color;
  for (const [a, len] of LEAFLETS) {
    const w = len * 0.06;
    ctx.save();
    ctx.rotate((a * Math.PI) / 180);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(w, -len * 0.5, 0, -len);
    ctx.quadraticCurveTo(-w, -len * 0.5, 0, 0);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function wordmark(ctx: CanvasRenderingContext2D, cx: number, y: number, size: number, f: Fonts) {
  ctx.font = `700 ${size}px ${f.mont}`;
  ctx.letterSpacing = `${size * 0.12}px`;
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  const wc = ctx.measureText("C").width;
  const ws = ctx.measureText("SMOS").width;
  const gap = size * 0.95;
  const x = cx - (wc + gap + ws) / 2;
  ctx.fillText("C", x, y);
  leafStar(ctx, x + wc + gap / 2 - size * 0.06, y - size * 0.37, size * 0.95, INK);
  ctx.fillText("SMOS", x + wc + gap, y);
  ctx.letterSpacing = "0px";
}

function art(ctx: CanvasRenderingContext2D, p: Product, planet: HTMLImageElement | null, cx: number, cy: number, r: number) {
  const rand = rng(p.slug);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = INK;
  ctx.fill();
  ctx.clip();
  for (let i = 0; i < 46; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.25 + rand() * 0.75})`;
    const s = rand() < 0.15 ? 2.4 : 1.4;
    ctx.fillRect(cx - r + rand() * 2 * r, cy - r + rand() * 2 * r, s, s);
  }

  if (p.glyph === "blackhole") {
    const glow = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r);
    glow.addColorStop(0, "rgba(232,184,109,0.5)");
    glow.addColorStop(1, "rgba(232,184,109,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.translate(cx, cy);
    ctx.rotate(-0.14);
    const disk = ctx.createLinearGradient(-r * 0.9, 0, r * 0.9, 0);
    disk.addColorStop(0, "#fff4df");
    disk.addColorStop(0.5, "#f0c27f");
    disk.addColorStop(1, "rgba(232,184,109,0.35)");
    ctx.strokeStyle = disk;
    ctx.lineWidth = r * 0.07;
    // far half of the disk, then the hole, then the near half crossing in front
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.82, r * 0.14, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    ctx.shadowColor = "#f0c27f";
    ctx.shadowBlur = r * 0.25;
    ctx.strokeStyle = "#ffeccc";
    ctx.lineWidth = r * 0.045;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.37, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.345, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = disk;
    ctx.lineWidth = r * 0.07;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.82, r * 0.14, 0, 0, Math.PI);
    ctx.stroke();
  } else if (p.glyph === "elevator" && planet) {
    // a tether rising from Earth to a station: the space elevator
    ctx.drawImage(planet, cx - r * 0.8, cy + r * 0.22, r * 1.6, r * 1.6);
    const atm = ctx.createRadialGradient(cx, cy + r * 1.02, r * 0.78, cx, cy + r * 1.02, r * 0.95);
    atm.addColorStop(0, "rgba(120,170,255,0)");
    atm.addColorStop(0.5, "rgba(120,170,255,0.45)");
    atm.addColorStop(1, "rgba(120,170,255,0)");
    ctx.fillStyle = atm;
    ctx.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    ctx.strokeStyle = "rgba(244,241,234,0.85)";
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 7]);
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.26);
    ctx.lineTo(cx, cy - r * 0.66);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = p.color;
    ctx.strokeStyle = "#f4f1ea";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 13, cy - 26, 26, 34, 7);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(cx - 38, cy - r * 0.78, 76, 20, 5);
    ctx.stroke();
  } else if (planet) {
    // the Moon on a gold orbit (Goldilocks); Mars for anything else
    const orbit = (from: number, to: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(0.32);
      ctx.strokeStyle = "#f2a516";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.86, r * 0.22, 0, from, to);
      ctx.stroke();
      ctx.restore();
    };
    orbit(Math.PI, Math.PI * 2);
    ctx.drawImage(planet, cx - r * 0.52, cy - r * 0.52, r * 1.04, r * 1.04);
    const shade = ctx.createLinearGradient(cx - r * 0.5, cy - r * 0.3, cx + r * 0.5, cy + r * 0.3);
    shade.addColorStop(0, "rgba(0,0,0,0)");
    shade.addColorStop(1, "rgba(0,0,0,0.6)");
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.52, 0, Math.PI * 2);
    ctx.fill();
    orbit(0, Math.PI);
    ctx.fillStyle = "#f2a516";
    ctx.beginPath();
    ctx.arc(cx + r * 0.74, cy + r * 0.42, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.stroke();
}

function drawFront(ctx: CanvasRenderingContext2D, p: Product, planet: HTMLImageElement | null, f: Fonts) {
  ctx.fillStyle = p.color;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "rgba(255,255,255,0.16)");
  g.addColorStop(0.5, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  seal(ctx);
  wordmark(ctx, W / 2, 158, 36, f);
  art(ctx, p, planet, W / 2, 352, 146);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  const name = p.short.toUpperCase();
  let size = 50;
  ctx.letterSpacing = "1px";
  do {
    ctx.font = `800 ${size}px ${f.mont}`;
    size -= 2;
  } while (ctx.measureText(name).width > 440 && size > 24);
  ctx.fillText(name, W / 2, 588);
  ctx.globalAlpha = 0.85;
  ctx.font = `700 15px ${f.sync}`;
  ctx.letterSpacing = "4px";
  ctx.fillText(`${p.count} GUMMIES · ${p.mgPerGummy} MG`, W / 2, 628);
  ctx.globalAlpha = 0.4;
  ctx.fillRect(W / 2 - 60, 650, 120, 2);
  ctx.globalAlpha = 0.75;
  ctx.font = `400 11px ${f.sync}`;
  ctx.letterSpacing = "2px";
  ctx.fillText("LEAF EXTRACT · LAB TESTED", W / 2, 680);
  ctx.globalAlpha = 1;
  ctx.letterSpacing = "0px";
}

function fit(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function drawBack(ctx: CanvasRenderingContext2D, p: Product, f: Fonts) {
  const rand = rng(`${p.slug}-back`);
  ctx.fillStyle = p.color;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.fillRect(0, 0, W, H);
  seal(ctx);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.font = `700 13px ${f.sync}`;
  ctx.letterSpacing = "4px";
  ctx.fillText("COSMOS CANNABIS CURE", W / 2, 140);
  ctx.letterSpacing = "0px";
  ctx.globalAlpha = 0.85;
  ctx.font = `600 15px ${f.man}`;
  ctx.fillText(fit(ctx, p.tagline, W - 100), W / 2, 172);
  ctx.globalAlpha = 1;

  // supplement-facts style panel
  ctx.fillStyle = "rgba(244,241,234,0.94)";
  ctx.beginPath();
  ctx.roundRect(52, 205, W - 104, 300, 18);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.textAlign = "left";
  ctx.font = `700 12px ${f.sync}`;
  ctx.letterSpacing = "3px";
  ctx.fillText("PER GUMMY", 78, 246);
  ctx.letterSpacing = "0px";
  let y = 290;
  for (const row of p.ingredients.filter((i) => i.amount !== "—").slice(0, 4)) {
    ctx.textAlign = "left";
    ctx.font = `600 16px ${f.man}`;
    ctx.fillText(fit(ctx, row.name, 270), 78, y);
    ctx.textAlign = "right";
    ctx.font = `400 15px ${f.mono}`;
    ctx.fillText(row.amount, W - 78, y);
    ctx.fillStyle = "rgba(7,8,15,0.15)";
    ctx.fillRect(78, y + 16, W - 156, 1.5);
    ctx.fillStyle = INK;
    y += 46;
  }
  ctx.textAlign = "left";
  ctx.globalAlpha = 0.7;
  ctx.font = `400 13px ${f.man}`;
  ctx.fillText("Fruit pectin, cane sugar. Vegan.", 78, y + 8);
  ctx.fillText("Contains no flower or resin.", 78, y + 28);
  ctx.globalAlpha = 1;

  ctx.textAlign = "center";
  ctx.font = `600 15px ${f.man}`;
  ctx.fillText("Start with one. Wait two hours.", W / 2, 550);
  ctx.globalAlpha = 0.8;
  ctx.font = `400 12px ${f.mono}`;
  ctx.fillText(`BATCH ${p.batch} · FOR ADULTS 18+`, W / 2, 576);
  ctx.globalAlpha = 1;
  let x = W / 2 - 84;
  while (x < W / 2 + 84) {
    const w = 1 + Math.floor(rand() * 3);
    ctx.fillRect(x, 600, w, 52);
    x += w + 1 + Math.floor(rand() * 3);
  }
  ctx.font = `400 11px ${f.mono}`;
  ctx.fillText(`8 906000 ${String(Math.floor(rand() * 900000) + 100000)}`, W / 2, 672);
}
