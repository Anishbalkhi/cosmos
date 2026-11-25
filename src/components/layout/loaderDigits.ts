/**
 * The loading bar's number as rolling digit strips (an odometer), moved only by transforms on exactly the same
 * timing as Jupiter's glide. Compositor animations keep running while the page's first 3D scene starts the GPU
 * up (a one-off block of half a second or more); a number drawn by script or by a CSS counter froze at 0 there
 * and then jumped. The keyframes are worked out here once: each digit changes at the moment the eased bar
 * crosses that value.
 */

// the same curves as the glide (globals.css, "Loading bar"): power2.out for 0 to 90, ease-in-out for 90 to 100
const A: [number, number, number, number] = [0.33, 1, 0.68, 1];
const B: [number, number, number, number] = [0.45, 0, 0.55, 1];

/** time fraction at which a cubic-bezier easing first reaches each progress value in `targets` */
function crossings([x1, y1, x2, y2]: [number, number, number, number], targets: number[]) {
  const at = (a: number, b: number, s: number) => 3 * a * s * (1 - s) ** 2 + 3 * b * s * s * (1 - s) + s ** 3;
  const out: number[] = [];
  let s = 0;
  for (const t of targets) {
    while (s < 1 && at(y1, y2, s) < t) s += 1 / 4000;
    out.push(Math.min(1, at(x1, x2, s)));
  }
  return out;
}

const pct = (f: number) => `${(f * 100).toFixed(3)}%`;
// the tens strip holds blank, 1…9 and "10" (11 rows); the ones strip 0…9 (10 rows)
const tens = (n: number) => `translateY(-${((Math.floor(n / 10) / 11) * 100).toFixed(4)}%)`;
const ones = (n: number) => `translateY(-${(n % 10) * 10}%)`;

function frames(name: string, from: number, to: number, curve: [number, number, number, number], place: (n: number) => string) {
  const values = Array.from({ length: to - from }, (_, i) => from + i + 1);
  const offs = crossings(
    curve,
    values.map((v) => (v - from) / (to - from)),
  );
  const stops = values.map((v, i) => `${pct(offs[i])}{transform:${place(v)}}`).join("");
  return `@keyframes ${name}{0%{transform:${place(from)}}${stops}}`;
}

export const LOADER_DIGIT_CSS = [
  frames("ld-tens-a", 0, 90, A, tens),
  frames("ld-ones-a", 0, 90, A, ones),
  frames("ld-tens-b", 90, 100, B, tens),
  frames("ld-ones-b", 90, 100, B, ones),
].join("");

export const TENS = [" ", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
export const ONES = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
