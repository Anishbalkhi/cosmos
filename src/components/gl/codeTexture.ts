"use client";

/**
 * Lines of glowing code, drawn once into a 2048×1024 canvas and used as a
 * repeating texture for the stream that pours into the black hole
 * (reference pin 018011). A little brand easter egg is hidden in the code.
 */
const LINES = [
  "function cure(dose) { return leaf.extract(dose).calm(); }",
  "const orbit = needs.map((n) => ({ ...n, gravity: 9.81 }));",
  "while (noise > 0) { noise -= rest.depth * 0.7; }",
  "export default async function Cosmos({ params }) {",
  "  const batch = await lab.test(CC_EH_001, { strict: true });",
  "  if (!batch.ok) throw new Error('re-run the assay');",
  "return <EventHorizon mg={5} count={30} />;",
  "let focus = Math.min(attention, 1) * goldilocks.zone;",
  "for (const star of galaxy) { star.twinkle(Math.random()); }",
  "const balance = ['rest', 'focus', 'ease'].reduce(align);",
  "/* the right dose at the right moment */",
  "if (age < 18) return redirect('/see-you-soon');",
  "const singularity = mass / (radius ** 2) * c;",
  "spaceElevator.climb({ from: 'earth', to: 'nirvana' });",
  "useEffect(() => { breathe(); return () => exhale(); }, []);",
  "const leaf = plant.parts.filter((p) => p !== 'flower');",
  "router.push(`/products/${slug}`); // into the cosmos",
  "await sleep(EIGHT_HOURS); wake({ refreshed: true });",
  "const glow = vec3(1.0, 0.72, 0.38) * fire(uTime);",
  "export const dosing = { start: 'low', go: 'slow' };",
  "lensing.bend(light, { around: horizon, angle: 1.75 });",
  "console.log('past the event horizon, the noise can\\'t follow');",
  "const ritual = night.then(gummy).then(stillness);",
  "if (stress) { cosmos.zoomOut(); perspective += 1; }",
];

export function makeCodeTexture() {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 1024;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, c.width, c.height);
  const rows = 32;
  const lh = c.height / rows;
  const mono = getComputedStyle(document.body).getPropertyValue("--font-geist-mono").trim() || "ui-monospace, Menlo, Consolas, monospace";
  g.font = `500 ${Math.round(lh * 0.62)}px ${mono}`;
  g.textBaseline = "middle";
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let r = 0; r < rows; r++) {
    // each row is a long run of code so it repeats seamlessly along x
    let x = -rnd() * 400;
    while (x < c.width) {
      const text = LINES[Math.floor(rnd() * LINES.length)];
      const a = 0.45 + rnd() * 0.55;
      g.fillStyle = `rgba(${215 + rnd() * 40}, ${228 + rnd() * 27}, 255, ${a})`;
      g.fillText(text, x, r * lh + lh / 2);
      x += g.measureText(text).width + lh * (1 + rnd() * 3);
    }
  }
  return c;
}
