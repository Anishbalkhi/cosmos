import { common } from "./shaders";
import { finish } from "./sectionShaders";
import { space3d } from "./objectShaders";

/**
 * "From the cosmos to your cells": a Powers of Ten dive through four 3D scales.
 *   0 the cosmic web - a volume of filaments and knots of galaxies, flown through
 *   1 a galaxy       - tilted spiral: old gold core, blue arms, dust lanes, pink star-forming knots
 *   2 a cell         - a low flight over the membrane: amber lipid surface, receptors lighting lime as signals dock
 *   3 an atom        - the electron cloud as real orbital shapes (1s + 2p) around a nucleus
 * uStage 0..3 scrubs the dive: each scale rushes past and the next opens out of its centre.
 * uNoise: 256² random texture, green channel = red offset by (37, 17), for cheap 3D noise.
 */
export const zoomFrag =
  common +
  finish +
  space3d +
  /* glsl */ `
uniform float uStage;
uniform sampler2D uNoise;

// 3D value noise from one texture fetch (iq's offset-slice trick); bias forces the top mip
float noise3(vec3 x){
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  vec2 uv = p.xy + vec2(37.0, -17.0) * p.z + f.xy;
  vec2 rg = texture2D(uNoise, (uv + 0.5) / 256.0, -100.0).yx;
  return mix(rg.x, rg.y, f.z);
}
float ridge(float n){ return 1.0 - abs(n * 2.0 - 1.0); }
mat3 look(){ return rotY(uMouse.x * 0.08) * rotX(-uMouse.y * 0.05); }

// ---------------- 0: the cosmic web ----------------
vec3 sceneWeb(vec2 uv, float zoom){
  vec3 rd = look() * rotY(0.5 + uTime * 0.012) * rotX(0.32) * camRay(uv / zoom);
  vec3 ro = vec3(0.3, 0.1, -uTime * 0.05);
  vec3 col = vec3(0.0);
  float t = 0.05 + 0.06 * hash(gl_FragCoord.xy);
  for (int i = 0; i < 46; i++) {
    vec3 p = ro + rd * t;
    vec3 q = p * 0.85;
    // two ridged sheets crossing = a filament; a third crossing = a knot (a galaxy cluster)
    float fil = pow(ridge(noise3(q)), 70.0) * pow(ridge(noise3(q * 1.7 + 13.1)), 50.0);
    float dt = 0.06 + t * 0.035;
    if (fil > 0.001) {
      float knot = pow(ridge(noise3(q * 1.3 + 27.0)), 40.0);
      float clump = noise3(p * 6.0 + 3.3);                       // beads of galaxies along the thread
      float d = fil * (0.55 + 0.9 * clump) * (1.0 + 14.0 * knot);
      vec3 c = mix(vec3(0.42, 0.55, 1.0), vec3(1.0, 0.74, 0.4), clamp(knot * 3.0 + d * 0.4, 0.0, 1.0));
      col += c * d * dt * exp(-t * 0.28) * 9.0;
    }
    t += dt;
  }
  return col;
}

// ---------------- 1: a galaxy ----------------
vec3 sceneGalaxy(vec2 uv, float zoom){
  vec3 rd = look() * camRay(uv / zoom);
  vec3 ro = vec3(0.0, 0.0, 3.1);
  mat3 G = rotX(1.08) * rotZ(0.42);
  vec3 o = ro * G;
  vec3 d = rd * G;
  vec3 col = vec3(stars(uv / zoom + 4.1, 40.0) * 0.5 + stars(uv / zoom * 1.6, 70.0) * 0.3);
  // bulge: old stars, a flattened glow around the core
  float tb = -dot(o, d);
  vec3 cp = o + d * tb;
  float db = length(cp * vec3(1.0, 1.7, 1.0));
  vec3 bulge = vec3(1.0, 0.82, 0.58) * (2.4 * exp(-db * db / 0.004) + 0.55 * exp(-db / 0.08));
  if (abs(d.y) > 1e-4) {
    float tp = -o.y / d.y;
    if (tp > 0.0) {
      vec2 q = (o + d * tp).xz;
      float r = length(q);
      float th = atan(q.y, q.x) + uTime * 0.025;
      // arms wander and break up like a real spiral's (a perfect logarithmic swirl read as drawn)
      float wob = 1.6 * (noise3(vec3(q * 3.0, 1.7)) - 0.5) + 0.6 * (noise3(vec3(q * 7.0, 8.3)) - 0.5);
      float sp = 2.0 * (th - 2.3 * log(r + 0.02)) + wob;
      float clump = 0.45 + 1.1 * noise3(vec3(rot(q, 1.3) * 30.0, 2.2));          // star clouds along the arms
      float arm = pow(0.5 + 0.5 * cos(sp), 2.6) * clump;
      float dust = pow(0.5 + 0.5 * cos(sp + 0.7), 9.0) * smoothstep(0.06, 0.25, r)
                 + 0.5 * smoothstep(0.55, 0.8, noise3(vec3(q * 11.0, 5.1))) * smoothstep(0.08, 0.3, r) * (1.0 - smoothstep(0.6, 1.0, r));
      float disk = exp(-r / 0.3) * (1.0 - smoothstep(0.7, 1.25, r));
      float n = noise(q * 13.0 + 3.0);
      float n2 = noise3(vec3(rot(q, 0.6) * 22.0, 4.5));
      vec3 e = vec3(1.0, 0.8, 0.56) * exp(-r / 0.16) * 0.9
             + vec3(0.58, 0.74, 1.0) * arm * disk * (0.5 + 1.3 * n) * 1.5
             + vec3(1.0, 0.45, 0.65) * pow(n2, 5.0) * arm * disk * 2.4;      // star-forming knots
      float tau = 0.78 * dust * disk * 3.0;
      float beforeBulge = step(tp, tb);                                   // dust in front of the core dims it
      col = col * (1.0 - min(tau, 0.9)) + e * (1.0 - 0.6 * min(tau, 1.0));
      bulge *= 1.0 - beforeBulge * min(tau, 0.85);
    }
  }
  return col + bulge;
}

// ---------------- 2: a cell's surface ----------------
// flying low over a cell membrane as if it were a planet: warm amber lipid surface, receptors
// standing out of it; now and then one lights up lime as a signal docks, and a gold ripple spreads
const float RCELL = 0.5;
vec3 receptorAt(vec2 q){
  vec2 id = floor(q / RCELL);
  vec2 f = q - (id + 0.5) * RCELL;
  float h = hash(id);
  vec2 j = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * RCELL * 0.5;
  return vec3(length(f - j), h, step(0.3, h));   // distance, id hash, present
}
float cellH(vec2 q, vec2 cam){
  vec2 d = q - cam;
  float base = 0.09 * (noise(q * 0.7) - 0.5) + 0.04 * (noise(q * 2.1 + 5.0) - 0.5) - 0.02 * dot(d, d);   // curves away like a horizon
  vec3 r = receptorAt(q);
  return base + r.z * 0.075 * exp(-r.x * r.x / 0.0045);
}
vec3 cellHaze(vec3 rd){
  float hor = exp(-max(rd.y + 0.04, 0.0) * 6.0);
  return vec3(0.01, 0.016, 0.04) + vec3(0.36, 0.46, 0.95) * 0.3 * hor;
}
vec3 sceneCell(vec2 uv, float zoom){
  vec2 su = uv / zoom;
  vec3 rd = look() * rotX(-0.13) * camRay(su);              // horizon in the upper third, dark sky above the headline
  vec3 ro = vec3(0.0, 0.3, -uTime * 0.12);
  vec3 col = cellHaze(rd) + vec3(0.8, 0.88, 1.0) * stars(su * 0.9 + vec2(uTime * 0.004, uTime * 0.018), 22.0) * 1.1;
  float t = 0.05;
  bool hit = false;
  for (int i = 0; i < 90; i++) {
    vec3 p = ro + rd * t;
    float h = p.y - cellH(p.xz, ro.xz);
    if (h < 0.0015 * t) { hit = true; break; }
    t += max(h * 0.45, 0.003 * t + 0.002);
    if (t > 14.0) break;
  }
  if (hit) {
    vec3 p = ro + rd * t;
    vec2 q = p.xz;
    const float e = 0.004;
    float hx = cellH(q + vec2(e, 0.0), ro.xz) - cellH(q - vec2(e, 0.0), ro.xz);
    float hz = cellH(q + vec2(0.0, e), ro.xz) - cellH(q - vec2(0.0, e), ro.xz);
    vec3 n = normalize(vec3(-hx, 2.0 * e, -hz));
    // lipid heads: a fine granular sheen across the membrane
    vec2 g = q * 55.0;
    float lip = noise(g);
    n = normalize(n + 0.35 * vec3(noise(g + vec2(1.3, 0.0)) - lip, 0.0, noise(g + vec2(0.0, 1.7)) - lip) * exp(-t * 0.4));
    vec3 L = normalize(vec3(0.3, 0.75, -0.6));          // light from ahead: the membrane glows at grazing angles
    float diff = max(dot(n, L), 0.0);
    float fr = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
    vec3 mem = vec3(0.1, 0.11, 0.26) * (0.2 + 0.95 * diff) + vec3(0.62, 0.72, 1.0) * fr * 0.7;
    mem += vec3(0.45, 0.52, 0.95) * 0.22 * pow(lip, 3.0);
    // receptors: proteins standing out of the membrane; each briefly lights as a signal docks
    vec3 r = receptorAt(q);
    float body = r.z * exp(-r.x * r.x / 0.004);
    float core = r.z * exp(-r.x * r.x / 0.0009);
    float phase = fract(uTime * 0.17 + r.y * 7.0);
    float act = smoothstep(0.0, 0.04, phase) * (1.0 - smoothstep(0.22, 0.38, phase));
    mem = mix(mem, vec3(0.28, 0.5, 0.16) * (0.35 + diff) + vec3(0.6, 1.0, 0.4) * fr * 0.5, body * 0.85);
    mem += vec3(0.6, 1.0, 0.3) * core * (0.3 + 3.2 * act);
    float rip = r.z * exp(-sq((r.x - phase * 0.85) / 0.012)) * (1.0 - smoothstep(0.08, 0.42, phase));
    mem += vec3(0.7, 0.85, 1.0) * rip * 1.3;
    col = mix(mem, cellHaze(rd), 1.0 - exp(-t * 0.3));
  }
  // signalling molecules drifting down past the lens
  col += vec3(0.78, 0.88, 1.0) * stars(su * 0.6 + vec2(0.0, uTime * 0.03), 14.0) * 0.6;
  return col;
}

// ---------------- 3: an atom ----------------
vec3 sceneAtom(vec2 uv, float zoom){
  vec3 rd = look() * camRay(uv / zoom);
  vec3 ro = vec3(0.0, 0.0, 3.0);
  mat3 R = rotY(uTime * 0.14) * rotX(0.55 + 0.15 * sin(uTime * 0.1));
  vec3 o = ro * R;
  vec3 d = rd * R;
  vec3 col = vec3(stars(uv / zoom + 9.0, 36.0) * 0.25);
  vec2 bs = sphereHit(o, d, 1.35);
  if (bs.y > 0.0) {
    float t0 = max(bs.x, 0.0);
    float dt = (bs.y - t0) / 40.0;
    float t = t0 + dt * hash(gl_FragCoord.xy);
    for (int i = 0; i < 40; i++) {
      vec3 p = o + d * t;
      float r = length(p);
      float ex = exp(-r * r / 0.13);
      float s1 = exp(-r / 0.06) * 0.9;                               // 1s
      vec3 p2 = p * p * ex / 0.048;                                  // 2p orbitals: two lobes each, a node at the nucleus
      p2 *= p2;                                                      // sharpen the lobes so their shape reads
      float shimmer = 0.7 + 0.6 * noise3(p * 14.0 + vec3(0.0, 0.0, uTime * 0.8));   // probability, not orbits
      vec3 e = (vec3(0.45, 0.68, 1.0) * p2.x + vec3(0.78, 0.5, 1.0) * p2.y + vec3(1.0, 0.78, 0.5) * p2.z * 0.6) * shimmer
             + vec3(1.0, 0.86, 0.62) * s1 * 0.6;
      // the 2s shell: a faint, crisp boundary that gives the cloud a shape
      e += vec3(0.6, 0.72, 1.0) * 0.06 * exp(-sq((r - 0.62) / 0.025));
      col += e * dt * 1.6;
      t += dt;
    }
  }
  // the nucleus: a tight knot of protons and neutrons, far smaller than its cloud
  float tn = -dot(o, d);
  float dn = length(o + d * tn);
  col += vec3(1.0, 0.8, 0.5) * (2.2 * exp(-dn * dn / 0.00012) + 0.25 * exp(-dn / 0.025));
  return col;
}

vec3 scene(float i, vec2 uv, float zoom){
  if (i < 0.5) return sceneWeb(uv, zoom);
  if (i < 1.5) return sceneGalaxy(uv, zoom);
  if (i < 2.5) return sceneCell(uv, zoom);
  return sceneAtom(uv, zoom);
}

void main(){
  vec2 uv = screenUv();
  float s = clamp(uStage, 0.0, 3.0);
  float i = floor(min(s, 2.9999));
  float k = s - i;
  // the current scale rushes past while the next opens out of its centre
  float zA = 1.0 + k * k * 6.0;
  float zB = 0.06 + 0.94 * smoothstep(0.0, 1.0, k);
  // the old scale is gone (rushed past into its own centre) before the new one fills in: no double exposure
  float wA = 1.0 - smoothstep(0.25, 0.6, k);
  float wB = smoothstep(0.45, 0.85, k);
  vec3 col = vec3(0.0);
  if (wA > 0.001) col += scene(i, uv, zA) * wA;
  if (wB > 0.001) col += scene(i + 1.0, uv, zB) * wB;
  float rush = k * (1.0 - k) * 4.0;
  col += vec3(0.85, 0.88, 1.0) * rush * 0.25 * exp(-length(uv) * 4.0);
  gl_FragColor = finish(col);
}
`;

/** The random texture zoomFrag's noise3() reads: green = red at (x - 37, y - 17). */
export function zoomNoiseTexture(): HTMLCanvasElement {
  const N = 256;
  const c = document.createElement("canvas");
  c.width = c.height = N;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(N, N);
  const r = new Uint8Array(N * N);
  let s = 1234567;
  for (let i = 0; i < r.length; i++) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    r[i] = s >>> 24;
  }
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4;
      img.data[i] = r[y * N + x];
      img.data[i + 1] = r[((y - 17 + N) % N) * N + ((x - 37 + N) % N)];
      img.data[i + 2] = 0;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
