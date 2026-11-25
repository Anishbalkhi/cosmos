import { common } from "./shaders";
import { finish } from "./sectionShaders";

/**
 * 3D objects, ray-traced in the same HDR pipeline as the hero black hole
 * (ShaderCanvas `post`): the product pouch with its orbiting gummies, the
 * sativa leaf, and the leaf → extract → gummy → lab sequence on /science.
 * No meshes, no three.js: every object is a distance field or an analytic
 * surface, so it stays sharp at any size and costs one draw call.
 */

export const space3d = /* glsl */ `
const float TANH = 0.42;  // tan(half vertical fov)
// rotation matrices (GLSL ES 1.00 has no transpose(): v * M applies the inverse)
mat3 rotY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a){ float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
mat3 rotZ(float a){ float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
float sdRoundBox(vec3 p, vec3 b, float r){ vec3 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r; }
float sdRound2(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float hash3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
vec2 sphereHit(vec3 ro, vec3 rd, float r){
  float b = dot(ro, rd), c = dot(ro, ro) - r * r, h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}
vec3 camRay(vec2 uv){ return normalize(vec3(uv * 2.0 * TANH, -1.0)); }
`;

/** Gummies: sugar-coated, translucent squares. */
const gummyChunk = /* glsl */ `
uniform vec3 uGum;
float sdGummy(vec3 p){ return sdRoundBox(p, vec3(0.064, 0.064, 0.046), 0.042); }
vec3 shadeGummy(vec3 q, vec3 n, vec3 rd, vec3 Lk){
  // q: point in the gummy's own frame, so the sugar stays put as it tumbles
  vec3 v = -rd;
  float ndv = max(dot(n, v), 0.0);
  float wrap = clamp((dot(n, Lk) + 0.55) / 1.55, 0.0, 1.0);
  vec3 c = uGum * (0.05 + 1.1 * wrap * vec3(1.0, 0.9, 0.8));
  c += uGum * uGum * 1.5 * pow(1.0 - ndv, 2.5);   // light scattered inside the candy shows at the edges
  c += uGum * 0.16 * ndv;                          // translucent body, deeper toward the middle
  vec3 h = normalize(Lk + v);
  float nh = max(dot(n, h), 0.0);
  float sugar = step(0.988, hash3(floor(q * 420.0)));   // fewer, fainter sugar glints: at 2.8% they read as noise
  c += vec3(1.0, 0.95, 0.9) * (sugar * pow(nh, 8.0) * 0.9 + 0.75 * pow(nh, 48.0));
  return c;
}
`;

// ---------------------------------------------------------------------------------------
// Product pouch
// ---------------------------------------------------------------------------------------

/**
 * A stand-up pouch (soft pillow body, heat-sealed crimp at the top, press-to-close zip,
 * fuller bottom gusset, soft-touch creases) with the printed label as a texture: front on
 * the left half of uLabel, back on the right. Four gummies orbit it, passing in front and
 * behind. Behind it, the product's world: a black hole (Event Horizon), Earth from orbit
 * (Nirvana), the Moon (Moonwalk Bytes), using the real NASA photographs as textures.
 *
 * Driven from JS: uYaw, uPitch, uLift (pose), uOrbit (gummy orbit angle), uKind
 * (0 black hole, 1 Earth, 2 Moon), uCol (product colour), uWorldCol (light from the world).
 */
export const pouchFrag =
  common +
  finish +
  space3d +
  gummyChunk +
  /* glsl */ `
uniform sampler2D uLabel;
uniform sampler2D uWorld;
uniform float uYaw;
uniform float uPitch;
uniform float uLift;
uniform float uOrbit;
uniform float uKind;
uniform vec3 uCol;
uniform vec3 uWorldCol;

const float PW = 0.55;   // half width
const float PH = 0.78;   // half height
const float PT = 0.105;  // half thickness at the middle

mat3 gPR; vec3 gPC;
vec3 gGP[4]; mat3 gGR[4];

float pouchTh(vec2 p){
  float fx = clamp(1.0 - sq(p.x / PW), 0.0, 1.0);             // lens-shaped cross-section, seams at the sides
  float top = 1.0 - smoothstep(PH - 0.32, PH - 0.10, p.y);     // flattens into the top seal
  float bot = 1.0 + 0.3 * smoothstep(-PH * 0.25, -PH, p.y);    // the gusset fills the bottom out
  float th = PT * fx * top * bot;
  th += 0.007 * (noise(p * 3.6 + 2.3) - 0.5) * fx;             // soft creases in the film
  th += 0.0045 * exp(-sq((p.y - (PH - 0.2)) / 0.008)) * fx;    // zip
  th += 0.0018 * sin(p.x * 150.0) * smoothstep(PH - 0.115, PH - 0.1, p.y);  // crimped heat seal
  return th + 0.011;
}
float sdPouch(vec3 p){
  float d2 = sdRound2(p.xy, vec2(PW, PH), 0.07);
  return max(d2, abs(p.z) - pouchTh(p.xy));
}
vec2 map(vec3 p){
  float d = sdPouch((p - gPC) * gPR);
  float id = 1.0;
  for (int i = 0; i < 4; i++) {
    float g = sdGummy((p - gGP[i]) * gGR[i]);
    if (g < d) { d = g; id = 2.0 + float(i); }
  }
  return vec2(d, id);
}
vec3 calcNormal(vec3 p){
  const vec2 e = vec2(1.0, -1.0) * 0.0012;
  return normalize(e.xyy * map(p + e.xyy).x + e.yyx * map(p + e.yyx).x + e.yxy * map(p + e.yxy).x + e.xxx * map(p + e.xxx).x);
}

// studio lights, placed like the hero: warm key, ice-blue rim from behind
const vec3 KEY = vec3(0.5523, 0.5021, 0.6653);
const vec3 RIM = vec3(-0.8384, 0.3144, -0.4454);

vec3 envLight(vec3 r){
  vec3 c = vec3(0.004, 0.005, 0.008);
  c += vec3(1.0, 0.86, 0.7) * 3.2 * smoothstep(0.78, 0.97, dot(r, normalize(vec3(0.6, 0.55, 0.62))));
  c += vec3(0.55, 0.72, 1.0) * 2.2 * smoothstep(0.9, 0.99, dot(r, normalize(vec3(-0.85, 0.12, 0.3))));
  c += uWorldCol * 0.7 * smoothstep(0.1, 1.0, -r.y);
  return c;
}
vec3 worldLightDir(){
  if (uKind < 0.5) return normalize(vec3(0.0, -0.25, -1.0));  // the disk behind
  if (uKind < 1.5) return normalize(vec3(0.0, -1.0, 0.25));   // Earth below
  return normalize(vec3(0.65, -0.5, 0.3));                    // the Moon, lower right
}

vec3 shadePouch(vec3 p, vec3 n, vec3 rd){
  vec3 q = (p - gPC) * gPR;
  vec3 nl = n * gPR;
  vec2 st = clamp(q.xy / vec2(PW, PH), -1.0, 1.0);
  vec2 tuv = nl.z >= 0.0 ? vec2(0.25 + st.x * 0.249, 0.5 + st.y * 0.5) : vec2(0.75 - st.x * 0.249, 0.5 + st.y * 0.5);
  vec3 alb = texture2D(uLabel, tuv).rgb;

  vec3 v = -rd;
  float ndv = max(dot(n, v), 0.0);
  float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  vec3 Lw = worldLightDir();
  vec3 diff = alb * (vec3(1.0, 0.88, 0.74) * 1.2 * max(dot(n, KEY), 0.0)
                   + vec3(0.55, 0.72, 1.0) * 0.55 * max(dot(n, RIM), 0.0)
                   + uWorldCol * 0.6 * max(dot(n, Lw), 0.0)
                   + 0.07);
  // spot-varnished dark print is glossier than the soft-touch colour
  float lum = dot(alb, vec3(0.3, 0.59, 0.11));
  float gloss = mix(1.0, 0.5, smoothstep(0.08, 0.5, lum));
  vec3 h1 = normalize(KEY + v), h2 = normalize(RIM + v);
  vec3 spec = vec3(1.0, 0.9, 0.78) * 2.2 * pow(max(dot(n, h1), 0.0), mix(30.0, 90.0, gloss))
            + vec3(0.6, 0.75, 1.0) * 2.6 * pow(max(dot(n, h2), 0.0), 50.0);
  vec3 refl = envLight(reflect(rd, n));
  return diff * (1.0 - 0.5 * F) + (spec * (0.22 + F) + refl * F) * gloss;
}

// ---- the product's world, behind everything ----
vec3 blackHoleBg(vec2 uv, vec3 c){
  vec2 d = rot(uv - vec2(0.0, 0.09), -0.09);
  float r = length(d);
  float R = 0.165;
  vec3 hot = vec3(1.0, 0.7, 0.42);
  c *= smoothstep(R * 0.98, R * 1.1, r);                                   // the shadow swallows the stars
  float dop = 1.0 + 0.55 * clamp(-d.x * 3.0, -1.0, 1.0);                     // the approaching side is brighter
  float up = 0.45 + 0.55 * smoothstep(-0.3, 0.9, d.y / max(r, 1e-3));
  c += vec3(1.0, 0.92, 0.8) * 3.2 * exp(-sq((r - R * 1.03) / 0.0035));       // photon ring
  c += hot * 1.5 * exp(-sq((r - R * 1.22) / 0.016)) * up * dop;             // far side of the disk, lensed over the top
  float w = 0.005 + 0.014 * smoothstep(0.0, 0.5, abs(d.x));
  float disk = exp(-sq(d.y / w)) * (1.0 - smoothstep(0.16, 0.62, abs(d.x)));
  c += hot * 1.4 * disk * dop;                                               // near side crossing in front (dimmer: it slashed across the pouch)
  c += hot * 0.06 * exp(-r * 4.0);
  return c;
}
vec3 earthBg(vec2 uv, vec3 c){
  vec2 pc = vec2(0.0, -1.08);                                                  // a little lower, so the pouch clears the horizon
  float R = 0.8;
  vec2 d = (uv - pc) / R;
  float r = length(d);
  vec3 atm = vec3(0.3, 0.55, 1.0);
  c += atm * 0.9 * exp(-max(r - 1.0, 0.0) * 30.0) * step(1.0, r);
  if (r < 1.0) {
    vec4 tx = texture2D(uWorld, d * 0.5 + 0.5);
    vec3 n = vec3(d, sqrt(1.0 - r * r));
    float lit = clamp(dot(n, normalize(vec3(-0.3, 0.8, 0.6))), 0.0, 1.0);
    vec3 e = tx.rgb * (0.2 + 1.15 * lit) + atm * 0.55 * pow(1.0 - n.z, 3.0);
    c = mix(c, e, tx.a * (1.0 - smoothstep(0.994, 1.0, r)));
  }
  vec2 sp = pc + R * normalize(vec2(-0.55, 1.0));                              // sunrise on the limb
  float sd = length(uv - sp);
  c += vec3(1.0, 0.86, 0.66) * (2.0 * exp(-sd * sd / 0.00007) + 0.2 * exp(-sd / 0.05));
  return c;
}
vec3 moonBg(vec2 uv, vec3 c){
  vec2 pc = vec2(0.16, -0.42);                                                 // inside the card (cards are portrait: x spans only +-0.5)
  float R = 0.32;
  vec2 d = (uv - pc) / R;
  float r = length(d);
  if (r < 1.0) {
    vec4 tx = texture2D(uWorld, d * 0.5 + 0.5);
    vec3 n = vec3(d, sqrt(1.0 - r * r));
    float lit = clamp(dot(n, normalize(vec3(-0.75, 0.45, 0.5))), 0.0, 1.0);
    c = mix(c, tx.rgb * (0.025 + 1.25 * pow(lit, 0.8)), tx.a * (1.0 - smoothstep(0.99, 1.0, r)));
  }
  vec2 sp = vec2(-0.36, 0.4);                                                  // the Goldilocks star
  vec2 sq = uv - sp;
  float sd = length(sq);
  float spikes = exp(-abs(sq.y) * 260.0) * exp(-abs(sq.x) * 10.0) + exp(-abs(sq.x) * 260.0) * exp(-abs(sq.y) * 10.0);
  c += vec3(1.0, 0.8, 0.5) * (0.8 * exp(-sd * sd / 0.0005) + 0.25 * exp(-sd / 0.08) + 0.2 * spikes);   // a star, not a starburst
  return c;
}
vec3 background(vec2 uv){
  vec3 c = vec3(0.0025, 0.003, 0.006);
  float n = fbm(uv * 2.2 + vec2(uTime * 0.01, 0.0));
  c += uCol * 0.07 * n * n * (1.0 - smoothstep(0.0, 0.9, length(uv)));
  c += vec3(stars(uv + 0.37, 34.0) * 0.7 + stars(uv * 1.7 + 1.3, 60.0) * 0.4);
  if (uKind < 0.5) return blackHoleBg(uv, c);
  if (uKind < 1.5) return earthBg(uv, c);
  return moonBg(uv, c);
}

void main(){
  vec2 uv = screenUv();
  vec3 ro = vec3(0.0, 0.05, 3.05);
  vec3 rd = camRay(uv);

  gPC = vec3(0.0, uLift, 0.0);
  gPR = rotY(uYaw) * rotX(uPitch) * rotZ(0.04 * sin(uOrbit * 0.7));
  for (int i = 0; i < 4; i++) {
    float a = uOrbit + float(i) * 1.5708;
    gGP[i] = vec3(cos(a) * 0.98, -0.05 + 0.17 * sin(a + 0.7), sin(a) * 0.6);
    gGR[i] = rotY(a * 1.6 + float(i)) * rotX(a * 1.2 + float(i) * 2.1);
  }

  vec3 col = background(uv);
  vec2 bs = sphereHit(ro, rd, 1.3);
  if (bs.y > 0.0) {
    float t = max(bs.x, 0.0);
    float id = 0.0;
    for (int i = 0; i < 110; i++) {
      vec2 h = map(ro + rd * t);
      if (h.x < 0.0004 * t) { id = h.y; break; }
      t += h.x * 0.75;
      if (t > bs.y) break;
    }
    if (id > 0.5) {
      vec3 p = ro + rd * t;
      vec3 n = calcNormal(p);
      if (id < 1.5) col = shadePouch(p, n, rd);
      else {
        for (int i = 0; i < 4; i++) {
          if (abs(id - 2.0 - float(i)) < 0.5) col = shadeGummy((p - gGP[i]) * gGR[i], n, rd, KEY);
        }
      }
    }
  }
  gl_FragColor = finish(col);
}
`;

// ---------------------------------------------------------------------------------------
// Sativa leaf
// ---------------------------------------------------------------------------------------

/**
 * One Cannabis sativa fan leaf with the same seven leaflets as the Cosmos mark
 * (angles 0, ±47, ±98, ±142 degrees; lengths 90/80/64/40). Each leaflet is an analytic
 * curved blade: folded along the midrib, drooping toward the tip, serrated edges. A star
 * sits behind the leaf, so light comes through the blade and the veins show dark against
 * it, like a leaf held up to the sun. A lab scan line sweeps down it every few seconds.
 */
const leafChunk = /* glsl */ `
struct Blade { float t; float u; float v; float e; float L; vec3 a; vec3 s; vec3 n; };
const float BEND = 0.22;
const float FOLD = 0.17;

vec2 leafletDef(int k){
  if (k == 0) return vec2(0.0, 1.0);
  if (k == 1) return vec2(-0.8203, 0.889);
  if (k == 2) return vec2(0.8203, 0.889);
  if (k == 3) return vec2(-1.7104, 0.711);
  if (k == 4) return vec2(1.7104, 0.711);
  if (k == 5) return vec2(-2.4784, 0.444);
  return vec2(2.4784, 0.444);
}
float bladeWidth(float s, float L){
  float w = L * 0.24 * pow(s, 0.55) * pow(1.0 - s, 0.9);
  return w * (1.0 - 0.2 * fract(s * L * 24.0) * smoothstep(0.04, 0.2, s));   // forward-pointing teeth
}
// nearest leaflet hit along a ray in leaf space; e = distance inside the blade edge
Blade traceLeaf(vec3 ro, vec3 rd, float pixA, float size){
  Blade b;
  b.t = 1e9; b.e = -1.0; b.u = 0.0; b.v = 0.0; b.L = 1.0;
  b.a = vec3(0.0, 1.0, 0.0); b.s = vec3(1.0, 0.0, 0.0); b.n = vec3(0.0, 0.0, 1.0);
  for (int k = 0; k < 7; k++) {
    vec2 def = leafletDef(k);
    float th = def.x;
    float L = def.y * size;
    float phi = 0.2 + 0.07 * abs(th);                                       // outer leaflets cup forward more
    vec3 a = normalize(vec3(sin(th) * cos(phi), cos(th) * cos(phi), sin(phi)));
    vec3 s = normalize(vec3(cos(th), -sin(th), 0.0));
    vec3 n = cross(s, a);
    vec3 o = ro - a * 0.03 * size;
    vec3 ol = vec3(dot(o, a), dot(o, s), dot(o, n));
    vec3 dl = vec3(dot(rd, a), dot(rd, s), dot(rd, n));
    if (abs(dl.z) < 0.002) continue;
    float t = -ol.z / dl.z;
    for (int it = 0; it < 4; it++) {
      vec3 q = ol + dl * t;
      float av = sqrt(q.y * q.y + 1e-5);                                      // smooth |v|: no kink on the midrib
      float f = q.z - (-BEND / size * q.x * q.x + FOLD * av);
      float df = dl.z + 2.0 * BEND / size * q.x * dl.x - FOLD * (q.y / av) * dl.y;
      t -= f / (abs(df) < 1e-3 ? 1e-3 : df);
    }
    if (t <= 0.0 || t >= b.t) continue;
    vec3 q = ol + dl * t;
    // only accept a converged solution: a stray Newton step lands on the ray, not on the blade
    if (abs(q.z - (-BEND / size * q.x * q.x + FOLD * sqrt(q.y * q.y + 1e-5))) > 0.002) continue;
    float sN = q.x / L;
    if (sN < 0.0 || sN > 1.0) continue;
    float e = bladeWidth(sN, L) - abs(q.y);
    if (e < -pixA * t) continue;
    b.t = t; b.u = q.x; b.v = q.y; b.e = e; b.L = L; b.a = a; b.s = s; b.n = n;
  }
  return b;
}
float capsule(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float r){
  vec3 ba = pb - pa, oa = ro - pa;
  float baba = dot(ba, ba), bard = dot(ba, rd), baoa = dot(ba, oa), rdoa = dot(rd, oa), oaoa = dot(oa, oa);
  float a = baba - bard * bard, b = baba * rdoa - baoa * bard, c = baba * oaoa - baoa * baoa - r * r * baba;
  float h = b * b - a * c;
  if (h >= 0.0) {
    float t = (-b - sqrt(h)) / a;
    float y = baoa + t * bard;
    if (y > 0.0 && y < baba) return t;
    vec3 oc = (y <= 0.0) ? oa : ro - pb;
    b = dot(rd, oc); c = dot(oc, oc) - r * r; h = b * b - c;
    if (h > 0.0) return -b - sqrt(h);
  }
  return -1.0;
}
vec3 capNormal(vec3 p, vec3 a, vec3 b, float r){
  vec3 ba = b - a, pa = p - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return (pa - h * ba) / r;
}

// S: the star behind (leaf space), K: key light direction (leaf space), scan: world-y of the scan line in leaf space
vec3 shadeBlade(Blade b, vec3 rd, vec3 S, vec3 K, float scanY, float scanA){
  float sN = b.u / b.L;
  vec3 P = b.a * (b.u + 0.03) + b.s * b.v;   // close enough for lighting
  float dhdu = -2.0 * BEND * b.u, dhdv = FOLD * sign(b.v);
  vec3 n = normalize(b.n - dhdu * b.a - dhdv * b.s);
  vec3 nv = dot(n, rd) < 0.0 ? n : -n;       // the side facing us
  float mid = exp(-sq(b.v / (0.004 + 0.006 * (1.0 - sN))));
  float lat = pow(abs(sin((b.u - abs(b.v) * 1.5) * 34.0)), 22.0) * smoothstep(0.0, 0.012, b.e) * smoothstep(0.002, 0.012, abs(b.v));
  float vein = max(mid, lat * 0.6);
  vec3 Ls = normalize(S - P);
  float back = clamp(-dot(nv, Ls), 0.0, 1.0);
  float fwd = pow(clamp(dot(rd, Ls), 0.0, 1.0), 10.0);
  vec3 lime = vec3(0.42, 0.78, 0.16);
  vec3 trans = lime * (0.5 * back + 4.5 * fwd) * (1.0 - 0.65 * vein) * (0.8 + 0.4 * noise(vec2(b.u, b.v) * 42.0));
  vec3 base = mix(vec3(0.035, 0.1, 0.022), vec3(0.075, 0.16, 0.04), sN);
  float kd = max(dot(nv, K), 0.0);
  vec3 c = base * (0.18 + 1.25 * kd) * vec3(1.0, 0.93, 0.82) + vec3(0.05, 0.09, 0.02) * vein * kd;
  c += vec3(1.0, 0.92, 0.78) * 0.35 * pow(max(dot(nv, normalize(K - rd)), 0.0), 50.0);
  c += trans;
  float edge = 1.0 - smoothstep(0.0, 0.0065, b.e);
  c += vec3(1.0, 0.86, 0.55) * edge * (0.5 + 2.6 * fwd) * 1.1;   // serrated rim catching the backlight
  c += vec3(0.6, 1.0, 0.4) * 2.4 * scanA * exp(-sq((P.y - scanY) / 0.012));
  return c;
}
`;

const leafSpace = /* glsl */ `
vec3 leafSpaceBg(vec2 uv, vec2 sUv, float warm){
  vec3 c = vec3(0.003, 0.004, 0.005);
  float n = fbm(uv * 1.8 + vec2(0.0, uTime * 0.008));
  c += mix(vec3(0.04, 0.1, 0.02), vec3(0.15, 0.1, 0.04), n) * n * n * 0.6 * (1.0 - smoothstep(0.0, 1.0, length(uv - sUv)));
  c += vec3(stars(uv + vec2(uTime * 0.004, 0.0), 40.0)) * 0.6;
  c += vec3(stars(uv * 1.3 + vec2(uTime * 0.01, 0.3) + uMouse * 0.01, 70.0)) * 0.35;
  float d = length(uv - sUv);
  c += vec3(1.0, 0.88, 0.68) * warm * (14.0 * exp(-d * d / 0.00015) + 0.9 * exp(-d / 0.045) + 0.16 * exp(-d / 0.22));
  return c;
}
`;

export const leafFrag =
  common +
  finish +
  space3d +
  leafChunk +
  leafSpace +
  /* glsl */ `
void main(){
  vec2 uv = screenUv();
  float pixA = 2.0 * TANH / min(uRes.x, uRes.y);
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = camRay(uv);

  float yaw = sin(uTime * 0.27) * 0.38 + uMouse.x * 0.25;
  float pitch = -0.3 + sin(uTime * 0.21) * 0.07 - uMouse.y * 0.1;
  float roll = sin(uTime * 0.17) * 0.06;
  mat3 R = rotY(yaw) * rotX(pitch) * rotZ(roll);
  vec3 C = vec3(0.0, -0.24, 0.0);
  vec3 rol = (ro - C) * R;
  vec3 rdl = rd * R;

  vec3 S = vec3(0.05, 0.3, -1.4);                    // the star, world space
  vec3 Sv = S - ro;
  vec2 sUv = Sv.xy / (-Sv.z) / (2.0 * TANH);
  vec3 col = leafSpaceBg(uv, sUv, 1.0);
  vec3 Sl = (S - C) * R;
  vec3 Kl = normalize(vec3(0.5, 0.55, 0.9)) * R;

  float ph = fract(uTime / 7.0);
  float scanY = mix(1.12, -0.6, smoothstep(0.0, 0.55, ph));
  float scanA = 1.0 - smoothstep(0.5, 0.6, ph);

  Blade b = traceLeaf(rol, rdl, pixA, 1.0);
  vec3 pa = vec3(0.0, 0.02, 0.0), pb = vec3(0.04, -0.95, 0.16);
  float tc = capsule(rol, rdl, pa, pb, 0.013);
  if (tc > 0.0 && tc < b.t) {
    vec3 p = rol + rdl * tc;
    vec3 n = capNormal(p, pa, pb, 0.013);
    float rim = pow(1.0 - abs(dot(n, rdl)), 3.0);
    col = vec3(0.05, 0.12, 0.03) * (0.25 + max(dot(n, Kl), 0.0)) + vec3(0.45, 0.8, 0.2) * rim * 0.9;
  } else if (b.e > -1.0) {
    float cov = clamp(b.e / (pixA * b.t) + 0.5, 0.0, 1.0);
    col = mix(col, shadeBlade(b, rdl, Sl, Kl, scanY, scanA), cov);
  }
  gl_FragColor = finish(col);
}
`;

// ---------------------------------------------------------------------------------------
// From leaf to gummy (/science): uStage 0..3 = Source, Extract, Dose, Test
// ---------------------------------------------------------------------------------------

/**
 * One continuous object story, scrubbed by scroll:
 *  0 Source  - the fan leaf
 *  1 Extract - the leaf dissolves into a single golden drop of extract
 *  2 Dose    - the drop sets into a gummy
 *  3 Test    - the gummy turns inside a ring of lab scan lines, then a certified halo
 * Objects fade/scale through each other; the camera keeps drifting.
 */
export const processFrag =
  common +
  finish +
  space3d +
  gummyChunk +
  leafChunk +
  leafSpace +
  /* glsl */ `
uniform float uStage;
uniform float uZoom;     // > 1 draws the object larger (phones, where it sits in a short band under the steps)
mat3 gR;

float sdDrop(vec3 p){
  // a falling drop: sphere with the top pulled into a point
  p.y += 0.05;
  float k = clamp(p.y / 0.5, 0.0, 1.0);
  return length(vec3(p.x, p.y * (1.0 - 0.25 * k), p.z)) - 0.26 * (1.0 - 0.85 * k * k);
}
float sdObj(vec3 p, float morph){
  vec3 q = p * gR;
  float drop = sdDrop(q);
  float gum = sdGummy(q / 3.4) * 3.4;
  return mix(drop, gum, morph);
}
vec3 objNormal(vec3 p, float morph){
  const vec2 e = vec2(1.0, -1.0) * 0.0015;
  return normalize(e.xyy * sdObj(p + e.xyy, morph) + e.yyx * sdObj(p + e.yyx, morph) + e.yxy * sdObj(p + e.yxy, morph) + e.xxx * sdObj(p + e.xxx, morph));
}

void main(){
  vec2 uv = screenUv() / uZoom;
  float pixA = 2.0 * TANH / min(uRes.x, uRes.y) / uZoom;
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = camRay(uv);
  float st = uStage;

  // the star that backlights the leaf moves up and away once the drop forms (sitting right behind the
  // drop and the gummy it bloomed into a white blotch on their top edge)
  vec3 S = mix(vec3(0.05, 0.3, -1.4), vec3(0.75, 1.05, -2.6), smoothstep(0.55, 1.2, st));
  vec3 Sv = S - ro;
  vec2 sUv = Sv.xy / (-Sv.z) / (2.0 * TANH);
  float warm = mix(1.0, 0.35, smoothstep(0.6, 1.4, st));
  vec3 col = leafSpaceBg(uv, sUv, warm);

  // ---- stage 0 -> 1: the leaf ----
  float leafA = 1.0 - smoothstep(0.45, 1.0, st);
  if (leafA > 0.0) {
    float sc = mix(1.0, 0.25, smoothstep(0.4, 1.0, st));
    mat3 R = rotY(sin(uTime * 0.27) * 0.38 + st * 2.4) * rotX(-0.3 + sin(uTime * 0.21) * 0.07) * rotZ(sin(uTime * 0.17) * 0.06);
    vec3 C = vec3(0.0, mix(-0.24, 0.0, smoothstep(0.4, 1.0, st)), 0.0);
    vec3 rol = (ro - C) * R / sc;
    vec3 rdl = rd * R;
    Blade b = traceLeaf(rol, rdl, pixA, 1.0);   // ray parameter is in leaf units, so is the pixel footprint
    if (b.e > -1.0) {
      float cov = clamp(b.e / (pixA * b.t) + 0.5, 0.0, 1.0);
      // dissolve from the tips inward, toward where the drop forms
      float k = smoothstep(0.35, 0.95, st);
      float dis = smoothstep(0.0, 0.15, (1.0 - b.u / b.L) + 0.15 - k * 1.25 + 0.1 * noise(vec2(b.u, b.v) * 30.0));
      vec3 c = shadeBlade(b, rdl, (S - C) * R / sc, normalize(vec3(0.5, 0.55, 0.9)) * R, 9.0, 0.0);
      c += vec3(1.0, 0.75, 0.3) * 12.0 * dis * (1.0 - dis) * step(0.001, k);   // the dissolving edge burns gold
      col = mix(col, c, cov * leafA * dis);
    }
  }

  // ---- stages 1..3: drop -> gummy ----
  float objA = smoothstep(0.55, 0.95, st);
  if (objA > 0.0) {
    float morph = smoothstep(1.35, 2.0, st);
    float spin = uTime * 0.5 + st * 1.4;
    gR = rotY(spin) * rotX(0.35 + morph * (0.4 * sin(uTime * 0.4))) * rotZ(0.25 * morph);
    float sc = mix(0.6, 1.0, smoothstep(0.55, 1.1, st));
    vec2 bs = sphereHit(ro, rd, 0.62 * sc);
    if (bs.y > 0.0) {
      float t = max(bs.x, 0.0);
      bool hit = false;
      for (int i = 0; i < 80; i++) {
        float d = sdObj((ro + rd * t) / sc, morph) * sc;
        if (d < 0.0005 * t) { hit = true; break; }
        t += d * 0.8;
        if (t > bs.y) break;
      }
      if (hit) {
        vec3 p = ro + rd * t;
        vec3 n = objNormal(p / sc, morph);
        vec3 K = normalize(vec3(0.5, 0.55, 0.9));
        vec3 v = -rd;
        float ndv = max(dot(n, v), 0.0);
        float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
        // extract: clear golden oil, glowing from inside
        vec3 gold = vec3(1.0, 0.68, 0.22);
        vec3 drop = gold * (0.35 + 1.6 * pow(1.0 - ndv, 1.6)) + gold * 0.6 * max(dot(n, K), 0.0);
        drop += vec3(1.0, 0.95, 0.85) * 1.4 * pow(max(dot(n, normalize(K + v)), 0.0), 90.0);
        drop += vec3(0.55, 0.72, 1.0) * 1.6 * F;
        vec3 gum = shadeGummy((p / sc) * gR / 3.4, n, rd, K);
        vec3 c = mix(drop, gum, morph);
        col = mix(col, c, objA);
      }
    }
    // ---- stage 3: lab scan rings around the gummy, then a certified halo ----
    float test = smoothstep(2.4, 2.95, st);
    if (test > 0.0) {
      float r = length(uv);
      float ang = atan(uv.y, uv.x);
      float ring1 = exp(-sq((r - 0.33) / 0.0025)) * (0.5 + 0.5 * step(0.0, sin(ang * 36.0 + uTime * 2.0)));
      float ring2 = exp(-sq((r - 0.38) / 0.0018)) * smoothstep(0.2, 1.0, sin(ang * 3.0 - uTime * 1.3));
      col += vec3(0.6, 1.0, 0.45) * test * (1.4 * ring1 + 1.6 * ring2);
      col += vec3(1.0, 0.85, 0.55) * test * 0.06 * exp(-abs(r - 0.36) * 30.0);
    }
  }
  gl_FragColor = finish(col);
}
`;

/**
 * One gummy, close up and turning slowly in a soft glow of its formula's colour: the centre of
 * the "What's inside" ingredient orbit on product pages.
 *   uGum   candy colour   uGlow  light behind it
 */
export const gummyFrag =
  common +
  finish +
  space3d +
  gummyChunk +
  /* glsl */ `
uniform vec3 uGlow;
void main(){
  vec2 uv = screenUv();
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = camRay(uv);
  mat3 R = rotY(uTime * 0.45) * rotX(0.5 + 0.18 * sin(uTime * 0.37)) * rotZ(0.22);
  vec3 col = vec3(0.004, 0.004, 0.008);
  col += uGlow * 0.22 * exp(-length(uv) * 3.2) + uGlow * 0.05 * exp(-length(uv) * 1.2);
  col += vec3(stars(uv + 3.0, 46.0)) * 0.35;
  const float SC = 5.6;                                          // the gummy fills most of the orbit's centre
  vec2 bs = sphereHit(ro, rd, 0.78);
  if (bs.y > 0.0) {
    float t = max(bs.x, 0.0);
    bool hit = false;
    for (int i = 0; i < 64; i++) {
      float d = sdGummy((ro + rd * t) * R / SC) * SC;
      if (d < 0.0004 * t) { hit = true; break; }
      t += d * 0.9;
      if (t > bs.y) break;
    }
    if (hit) {
      vec3 p = ro + rd * t;
      const vec2 e = vec2(1.0, -1.0) * 0.0015;
      vec3 n = normalize(e.xyy * sdGummy((p + e.xyy) * R / SC) + e.yyx * sdGummy((p + e.yyx) * R / SC)
                       + e.yxy * sdGummy((p + e.yxy) * R / SC) + e.xxx * sdGummy((p + e.xxx) * R / SC));
      col = shadeGummy(p * R / SC, n, rd, normalize(vec3(0.5, 0.6, 0.7)));
      col += uGlow * 0.25 * pow(1.0 - max(dot(n, -rd), 0.0), 3.0);   // rim from the glow behind
    }
  }
  gl_FragColor = finish(col);
}
`;
