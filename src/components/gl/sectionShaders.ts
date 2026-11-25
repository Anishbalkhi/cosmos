/*
 * Section backdrops, one per reference pin (Nov 2026 batch). All hand-written GLSL on the
 * shared helpers in shaders.ts. Each renders linear HDR when ShaderCanvas runs its post
 * chain (#define HDR) and tone-maps itself otherwise.
 */
import { common } from "./shaders";

export const finish = /* glsl */ `
vec4 finish(vec3 col){
#ifdef HDR
  return vec4(col, 1.0);
#else
  col = 1.0 - exp(-col * 1.4);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.025;
  return vec4(col, 1.0);
#endif
}
vec2 screenUv(){ return (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y); }
`;

export const rocksChunk = /* glsl */ `
// shared by the asteroid field and the sun-drift scene; set gLight / gRockTint / gRimTint first
vec3 gLight;
vec3 gRockTint;
vec3 gRimTint;
// one layer of rocks in a jittered grid; rgb + coverage
vec4 rocks(vec2 p, float scale, float seed, vec2 drift, float lit, float aa, float thr){
  vec2 g = p * scale + drift;
  vec2 id = floor(g);
  vec3 col = vec3(0.0);
  float cov = 0.0;
  vec3 L = gLight;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 cid = id + vec2(float(i), float(j));
      float h = hash(cid + seed);
      if (h < thr) continue;
      vec2 o = vec2(hash(cid + seed + 1.3), hash(cid + seed + 7.1));
      vec2 q = g - cid - o;
      float r = 0.1 + 0.28 * pow(hash(cid + seed + 3.7), 2.0);
      q = rot(q, uTime * (hash(cid + 5.0) - 0.5) * 0.35 + h * 6.28);
      q.y *= 1.0 + 0.45 * hash(cid + 2.0);                   // elongated, potato-like
      vec2 dir = normalize(q + 1e-4);
      float rr = r * (0.7 + 0.45 * noise(dir * 1.8 + h * 10.0) + 0.18 * noise(dir * 4.5 + h * 3.0));
      float len = length(q);
      float c = smoothstep(rr + aa, rr - aa, len);
      if (c <= 0.0) continue;
      vec2 s = q / rr;
      float z = sqrt(max(0.0, 1.0 - dot(s, s)));
      // craters and lumps bend the normal
      vec2 bump = vec2(noise(q * 14.0 / r + h * 9.0), noise(q * 14.0 / r + h * 4.0)) - 0.5;
      vec3 n = normalize(vec3(s + bump * 0.7, z + 0.15));
      float diff = max(dot(n, L), 0.0);
      float rim = pow(1.0 - z, 2.5) * max(dot(normalize(s + 1e-4), normalize(L.xy)), 0.0);
      float albedo = 0.1 + 0.12 * noise(q * 30.0 / r + h * 2.0);
      // key light, a soft fill on the shadow side (so rocks read as solid, not as flat dark blobs), rim
      vec3 rc = gRockTint * albedo * (diff * 1.6 + 0.3 * (0.4 + 0.6 * z)) + gRimTint * rim * 1.4;
      rc *= lit;
      col = mix(col, rc, c * (1.0 - cov));
      cov = max(cov, c);
    }
  }
  return vec4(col, cov);
}
`;

/**
 * Pin 1 — an ice-blue black hole seen through a drifting asteroid field.
 * Three depth layers of rocks (far → near: smaller, slower, dimmer), backlit by the ring.
 *   uScroll 0..1 section progress: nearer rocks slide further (parallax)
 */
export const asteroidFieldFrag = /* glsl */ `
${common}
${finish}
uniform float uScroll;
${rocksChunk}
// lensed ring of the black hole, upper left; .a = how much its shadow darkens what's behind
vec4 ring(vec2 p){
  vec2 c = rot(p - vec2(-0.42, 0.3), -0.2);
  float r1 = length(c / vec2(1.0, 0.5));
  float R = 0.6;
  float d = r1 - R;
  float core = exp(-sq(d / 0.01));
  float halo = exp(-sq(d / 0.08));
  float d2 = length(c / vec2(1.0, 0.44)) - R * 0.88;       // thinner photon ring just inside
  float core2 = exp(-sq(d2 / 0.006));
  float a = atan(c.y, c.x);
  vec2 dir = vec2(cos(a), sin(a));
  float gas = exp(-sq(d / 0.2)) * pow(fbm(dir * 2.5 + vec2(r1 * 6.0 - uTime * 0.05, uTime * 0.03)), 2.2);
  vec3 col = vec3(0.45, 0.68, 1.0) * halo * 0.8 + vec3(0.92, 0.97, 1.0) * core * 2.4
           + vec3(0.75, 0.88, 1.0) * core2 * 0.9 + vec3(0.22, 0.42, 0.95) * gas * 1.4;
  return vec4(col, smoothstep(R * 0.9, R * 0.78, r1));
}

void main(){
  vec2 uv = screenUv();
  vec2 m = uMouse * 0.02;
  float px = 1.0 / min(uRes.x, uRes.y);
  vec3 col = vec3(0.004, 0.008, 0.022);
  col += vec3(0.06, 0.13, 0.36) * pow(fbm(uv * 1.3 + vec2(uTime * 0.008, 0.0)), 3.0);
  col += vec3(stars(uv + 3.0, 70.0)) * 0.7;
  vec4 rg = ring(uv + m * 0.5 + vec2(0.06, -0.08));   // up and left, clear of the manifesto's opening lines
  col *= 1.0 - rg.a * 0.92;
  col += rg.rgb;
  gLight = normalize(vec3(-0.65, 0.55, 0.35));          // light from the ring
  gRockTint = vec3(0.55, 0.62, 0.72);
  gRimTint = vec3(0.55, 0.75, 1.0);
  vec4 r;
  r = rocks(uv + m * 1.0, 9.0, 1.0, vec2(uTime * 0.02, -uScroll * 1.6), 0.6, px * 9.0 * 1.5, 0.55);
  col = mix(col, r.rgb, r.a);
  r = rocks(uv + m * 2.0, 4.5, 7.0, vec2(uTime * 0.03, -uScroll * 2.6), 0.85, px * 4.5 * 1.5, 0.72);
  col = mix(col, r.rgb, r.a);
  r = rocks(uv + m * 4.0, 2.0, 13.0, vec2(uTime * 0.045, -uScroll * 4.2), 1.0, px * 2.0 * 1.5, 0.86);
  col = mix(col, r.rgb, r.a);
  col *= smoothstep(1.4, 0.25, length(uv * vec2(0.8, 1.0)));
  gl_FragColor = finish(col);
}`;

/**
 * Pin 2 — a silky blue whirlpool spiralling into a small dark eye (Event Horizon: rest).
 */
export const whirlpoolFrag = /* glsl */ `
${common}
${finish}
void main(){
  vec2 uv = screenUv();
  vec2 c = rot(uv - vec2(-0.04, 0.06) + uMouse * 0.01, 0.45);
  c.y *= 1.3;
  float r = length(c);
  float a = atan(c.y, c.x);
  float sw = a + 2.3 * log(r + 0.02) - uTime * 0.16;           // logarithmic spiral, flowing inward
  vec2 d = vec2(cos(sw), sin(sw));
  float fib = noise(d * 42.0 + r * 2.0) * 0.45 + noise(d * 95.0 + r * 3.0) * 0.25 + noise(d * 11.0 + r * 1.2) * 0.6;
  float b = smoothstep(0.05, 0.16, r) * exp(-r * 1.5) * (0.35 + fib);
  vec3 col = mix(vec3(0.08, 0.2, 0.62), vec3(0.86, 0.93, 1.0), clamp(b * 1.3, 0.0, 1.0)) * b * 2.2;
  col *= smoothstep(0.06, 0.085, r);                            // the eye
  col += vec3(0.75, 0.88, 1.0) * exp(-sq((r - 0.085) / 0.01)) * 0.8;
  col += vec3(0.01, 0.03, 0.09) * (1.0 - smoothstep(0.0, 1.2, r));
  gl_FragColor = finish(col);
}`;

/**
 * Pin 6 — two black holes in balance, wrapped in gold light (Nirvana: balance).
 * The filaments are contours of their combined gravity well, so they form Cassini-oval loops.
 */
export const binaryFrag = /* glsl */ `
${common}
${finish}
void main(){
  vec2 uv = screenUv();
  vec2 p = (uv + uMouse * 0.01) * 0.6;                           // framed close: the pair fills its circle
  p.y *= 0.62;                                                   // stretched along the orbit axis
  float th = uTime * 0.3;
  vec2 A = vec2(0.05 * sin(th), 0.105 + 0.01 * cos(th));
  vec2 B = -A;
  float da = length(p - A), db = length(p - B);
  float phi = 0.04 / da + 0.04 / db;
  float lp = log(phi);
  float flow = fbm(vec2(atan(p.y, p.x) * 2.0, lp * 3.0) + uTime * 0.05);
  float c = fract(lp * 6.0 - uTime * 0.12 + flow * 0.4);
  float line = exp(-sq((c - 0.5) / 0.09));
  float fine = exp(-sq((fract(lp * 14.0 + flow) - 0.5) / 0.08)) * 0.35;   // finer strands between the main loops
  float env = smoothstep(-1.1, -0.2, lp) * smoothstep(1.9, 0.7, lp);
  float side = 0.55 + 0.45 * smoothstep(0.2, -0.2, p.x);          // Doppler: one side brighter
  vec3 gold = mix(vec3(0.95, 0.55, 0.22), vec3(1.0, 0.92, 0.78), line);
  vec3 col = gold * (line + fine) * env * side * (0.7 + flow) * 2.6;
  col += vec3(1.0, 0.72, 0.4) * env * env * 0.22;                 // warm glow filling the well
  // shadows + thin photon rings
  col *= smoothstep(0.034, 0.042, da) * smoothstep(0.034, 0.042, db);
  col += vec3(1.0, 0.9, 0.75) * (exp(-sq((da - 0.043) / 0.004)) + exp(-sq((db - 0.043) / 0.004))) * 0.9;
  // faint blue lensing ring around the pair
  float rr = length(uv / vec2(1.0, 1.15));
  col += vec3(0.3, 0.45, 0.85) * exp(-sq((rr - 0.42) / 0.05)) * 0.12;
  col += vec3(stars(uv + 4.0, 80.0)) * 0.5 * (1.0 - env);
  gl_FragColor = finish(col);
}`;

/**
 * Pin 7 — a dark accretion spiral with copper and ember streaks under a teal smoke nebula.
 */
export const copperSpiralFrag = /* glsl */ `
${common}
${finish}
void main(){
  vec2 uv = screenUv();
  vec2 c = uv - vec2(-0.15, -0.22) + uMouse * 0.01;
  vec2 d = vec2(c.x, c.y / 0.36);                                // disk plane, seen at a tilt
  float r = length(d);
  float a = atan(d.y, d.x);
  float sw = a - 2.0 * log(r + 0.01) + uTime * 0.05;
  vec2 dir = vec2(cos(sw), sin(sw));
  float streak = noise(dir * 16.0 + r * 3.0) * 0.6 + noise(dir * 40.0 + r * 6.0) * 0.4;
  float disk = smoothstep(0.1, 0.2, r) * exp(-r * 1.3);
  vec3 col = vec3(0.012, 0.014, 0.02);
  col += vec3(0.85, 0.42, 0.2) * disk * pow(streak, 2.0) * 1.8;
  col += vec3(1.0, 0.6, 0.35) * pow(noise(dir * 70.0 + vec2(r * 22.0, uTime * 0.4)), 14.0) * disk * 3.0;   // embers
  col += vec3(1.0, 0.85, 0.7) * exp(-sq((r - 0.12) / 0.012)) * 0.5;
  col *= smoothstep(0.08, 0.11, r);
  // teal smoke above
  float smoke = pow(fbm(uv * 1.5 + vec2(uTime * 0.006, 2.0)), 2.6);
  col += vec3(0.08, 0.3, 0.32) * smoke * smoothstep(-0.25, 0.55, uv.y) * 1.2;
  col += vec3(stars(uv + 6.0, 70.0)) * 0.45;
  col *= smoothstep(1.5, 0.3, length(uv));
  gl_FragColor = finish(col);
}`;

/**
 * Pin 5 — the Milky Way band behind the solar system: a diagonal river of light with dust lanes.
 */
export const milkyWayFrag = /* glsl */ `
${common}
${finish}
void main(){
  vec2 uv = screenUv();
  vec2 p = rot(uv + uMouse * 0.01, -0.5);
  float band = exp(-sq(p.y / 0.24));
  float glow = fbm(p * vec2(1.4, 4.0) + vec2(uTime * 0.002, 0.0));
  float dust = smoothstep(0.45, 0.75, fbm(p * vec2(3.0, 9.0) + 4.0)) * exp(-sq((p.y + 0.02) / 0.09));
  vec3 col = mix(vec3(0.45, 0.5, 0.7), vec3(1.0, 0.84, 0.62), glow) * band * (0.06 + 0.22 * glow * glow) * (1.0 - 0.85 * dust);
  col += vec3(stars(uv + 2.0, 130.0)) * band * 0.7 + vec3(stars(uv + 9.0, 60.0)) * 0.35;
  gl_FragColor = finish(col);
}`;

/**
 * Pin 880313058437018080 ("Ascension") — an endless slow glide forward through nebula clouds.
 * Five cloud layers at different depths each drift toward the camera and fade in and out, so
 * the flight never loops visibly. The two palette colours are uniforms, so the journal can
 * retint the nebula for the article you're looking at.
 *   uColA, uColB  the nebula's two colours (eased in JS)
 *   uBoost        0..1 speeds the glide a little while an article is hovered
 */
export const nebulaFlightFrag = /* glsl */ `
${common}
${finish}
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uBoost;

float cloud(vec2 p){
  float f = fbm(p);
  return f * fbm(p * 2.2 + f * 1.6 + 7.0);      // domain-warped billows
}

void main(){
  vec2 uv = screenUv() + uMouse * 0.015;
  vec3 col = vec3(0.004, 0.006, 0.016);
  float t = uTime * 0.03 * (1.0 + uBoost * 0.8);
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float k = t + fi / 5.0;
    float d = fract(k);                           // 0 = far away, 1 = passing the camera
    float cyc = floor(k);
    float fade = smoothstep(0.0, 0.3, d) * smoothstep(1.0, 0.65, d);
    float scale = mix(4.5, 0.55, d);
    vec2 off = vec2(hash(vec2(cyc, fi)), hash(vec2(fi, cyc + 3.0))) * 40.0;   // fresh clouds every pass
    vec2 p = rot(uv, fi * 1.3) * scale + off;
    float c = cloud(p);
    float dens = smoothstep(0.12, 0.5, c);
    vec3 tint = mix(uColA, uColB, smoothstep(0.35, 0.7, fbm(p * 0.6 + 11.0)));
    float core = pow(noise(p * 1.2 + 5.0), 7.0) * 3.0;                         // bright star-forming knots
    float dust = smoothstep(0.55, 0.8, fbm(p * 1.7 + 3.0));                     // dark lanes
    col += tint * dens * (0.5 + core) * fade * (1.0 - 0.75 * dust) * 0.55;
  }
  col += vec3(stars(uv + 2.0, 90.0)) * 0.55;
  col *= smoothstep(1.6, 0.35, length(uv));
  gl_FragColor = finish(col);
}`;

/** The same nebula flight with Ascension's resting blue/magenta baked in, for places that pass no uniforms (page headers). */
export const nebulaFlightRestFrag = nebulaFlightFrag
  .replace("uniform vec3 uColA;", "const vec3 uColA = vec3(0.22, 0.32, 0.95);")
  .replace("uniform vec3 uColB;", "const vec3 uColB = vec3(0.85, 0.22, 0.55);")
  .replace("uniform float uBoost;", "const float uBoost = 0.0;");

/**
 * Journal index background: a long-exposure night sky. Every star draws a circular trail round the
 * celestial pole (off the top-right corner), heads brighter than tails, slowly turning. One calm
 * palette (ice-white and warm gold), dim enough to sit behind editorial type.
 *   uFocus 0..1  a reader is hovering a story: the sky brightens a touch and turns a little faster
 */
export const starTrailsFrag = /* glsl */ `
${common}
${finish}
uniform float uFocus;
void main(){
  vec2 uv = screenUv();
  float px = 1.0 / min(uRes.x, uRes.y);
  vec3 col = vec3(0.004, 0.005, 0.011);
  col += vec3(0.05, 0.035, 0.02) * (1.0 - smoothstep(-0.6, 0.2, uv.y));  // faint warm sky glow low down
  vec2 pole = vec2(1.0, 0.72);
  vec2 d = uv - pole;
  float r = length(d);
  float a = atan(d.y, d.x);
  float turn = uTime * (0.018 + 0.012 * uFocus);
  const float RING = 0.0042;                                              // one trail per ring
  float idx = floor(r / RING);
  float h = hash(vec2(idx, 1.3));
  if (h > 0.42) {
    float fr = fract(r / RING) - 0.5;
    float line = exp(-sq(fr * RING / (px * 0.75)));                       // ~1.5 px wide, anti-aliased
    float L = 0.18 + 0.55 * hash(vec2(idx, 4.1));                         // trail length (radians)
    float ph = hash(vec2(idx, 7.7)) * 6.2831 + turn;
    float t = mod(a - ph, 6.2831);
    float arc = step(t, L) * pow(t / L, 1.6);                             // the head is brightest
    float head = exp(-sq((t - L) / 0.01)) * step(t, L + 0.03);
    float bright = 0.12 + 0.9 * pow(hash(vec2(idx, 9.9)), 3.0);
    vec3 tint = mix(vec3(0.72, 0.84, 1.0), vec3(1.0, 0.82, 0.58), step(0.7, hash(vec2(idx, 2.2))));
    col += tint * line * (arc + head * 1.5) * bright * (0.55 + 0.35 * uFocus);
  }
  col += vec3(stars(uv * 0.9 + 2.0, 50.0)) * 0.25;
  col *= 1.0 - smoothstep(0.35, 1.5, length(uv * vec2(0.85, 1.0)));
  gl_FragColor = finish(col);
}`;

/**
 * Closing call to action: sunrise seen from orbit. A real photograph of Earth (uEarth, Apollo 17)
 * forms a huge curved horizon low in the frame; its night side stays dark, a thin atmosphere glows
 * along the limb, and the sun climbs over the edge as the section scrolls in (uRise 0..1), throwing
 * a soft fan of rays into the dark above the headline.
 */
export const dawnFrag = /* glsl */ `
${common}
${finish}
uniform sampler2D uEarth;
uniform float uRise;
void main(){
  vec2 uv = screenUv();
  const float R = 2.1;
  // the limb sits 0.2 above the bottom edge whatever the shape (on a tall phone section the centre
  // would put the planet behind the form); on a landscape screen that is y = -0.3
  float limbY = -0.5 * uRes.y / min(uRes.x, uRes.y) + 0.2 + 0.14 * clamp(uRes.y / uRes.x - 1.0, 0.0, 1.0);
  vec2 c = vec2(0.0, limbY - R);
  vec2 d = (uv - c) / R;
  float r = length(d);
  float h = (r - 1.0) * R;                             // height above the limb, in uv
  vec2 sun = vec2(0.0, limbY + mix(-0.05, 0.03, uRise));
  float sd = length(uv - sun);
  float toward = exp(-sq(uv.x - sun.x) / 0.5);         // light gathers where the sun breaks through

  // space: stars that fade as the dawn brightens
  vec3 col = vec3(0.003, 0.004, 0.009);
  col += vec3(stars(uv + 1.7, 60.0) * 0.7 + stars(uv * 1.6 + 4.0, 90.0) * 0.4) * (1.0 - 0.6 * uRise * toward);

  float px = 1.0 / min(uRes.x, uRes.y);
  float hs = max(h, 0.0);
  // the atmosphere: a thin glowing shell, blue far from the sun, gold where it breaks through.
  // Computed on both sides of the limb, so the planet's anti-aliased edge blends into it (no dark seam).
  vec3 atm = mix(vec3(0.28, 0.52, 1.0), vec3(1.0, 0.68, 0.38), toward * 0.85);
  // (wide enough to stay smooth at render scale: a sub-pixel band aliased into a dotted line)
  col += atm * exp(-hs / max(0.016, 4.0 * px)) * (0.25 + 1.6 * toward * uRise);
  col += atm * exp(-hs / 0.07) * 0.22 * (0.4 + toward * uRise);

  if (h > 0.0) {
    // the sun and its glow, only above the horizon
    col += vec3(1.0, 0.97, 0.9) * 10.0 * exp(-sd * sd / 0.00035) * uRise;
    col += vec3(1.0, 0.8, 0.52) * (0.9 * exp(-sd / 0.05) + 0.22 * exp(-sd / 0.28)) * (0.25 + 0.75 * uRise);
    // a soft fan of rays climbing from the sun
    float ang = atan(uv.x - sun.x, uv.y - sun.y);
    float fan = pow(0.5 + 0.5 * sin(ang * 26.0 + 3.0 * noise(vec2(ang * 5.0, uTime * 0.08))), 5.0);
    col += vec3(1.0, 0.82, 0.58) * fan * exp(-sd / 0.4) * 0.08 * uRise * smoothstep(-0.2, 0.6, uv.y + 0.3);
  } else {
    // the planet: the photograph, on its night side, with a thin lit crescent along the limb
    // (sampled a little inside the photo's disc: its very edge is the transparent cut-out)
    vec3 tx = texture2D(uEarth, d * 0.42 + 0.5).rgb;
    float limb = smoothstep(-0.06, 0.0, h);
    float lit = limb * limb * (0.06 + 0.8 * toward * uRise) + 0.022;
    vec3 surf = tx * lit + vec3(0.2, 0.4, 0.9) * 0.07 * limb;
    surf += vec3(1.0, 0.72, 0.4) * exp(h / 0.005) * toward * uRise * 0.7;   // the bright rim right at the edge
    col = mix(col, surf, 1.0 - smoothstep(-2.0 * px, 0.0, h));           // anti-aliased edge against the glow
  }
  gl_FragColor = finish(col);
}`;
