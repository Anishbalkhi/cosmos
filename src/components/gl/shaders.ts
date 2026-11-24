/* Fragment shaders for the Cosmos site. All share uTime, uRes, uMouse from ShaderCanvas. */

export const common = /* glsl */ `
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1.0,0.0)), c = hash(i+vec2(0.0,1.0)), d = hash(i+vec2(1.0,1.0));
  vec2 u = f*f*(3.0-2.0*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.03; a*=0.5; } return v; }
float stars(vec2 p, float density){
  vec2 g = p*density; vec2 id = floor(g); vec2 f = fract(g)-0.5;
  float h = hash(id);
  vec2 o = vec2(hash(id+1.7), hash(id+3.1)) - 0.5;
  float d = length(f - o*0.7);
  // no twinkle: there is no atmosphere in space. A few stars are much brighter (they bloom in HDR).
  float b = 0.3 + 2.4*pow(fract(h*17.0), 6.0);
  return step(0.965, h) * smoothstep(0.06, 0.0, d) * b;
}
float sq(float x){ return x*x; }
vec2 rot(vec2 p, float a){ float c=cos(a), s=sin(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
`;

/**
 * Cinematic black hole, ray-traced: light rays are bent around a
 * Schwarzschild hole (rs = 1) so the far side of the accretion disk shows
 * above and below the shadow, as in the Interstellar reference.
 * Before it, a warp tunnel of light streaks and galaxies (hyperspace pins).
 *   uWarp  1 = in hyperspace, 0 = arrived
 *   uPush  0..1 = scroll / hold: fly into the hole
 *   uBoost 0..1 = disk spin-up
 *   uSteps ray-march steps (fewer on phones)
 */
export const blackHoleFrag = /* glsl */ `
${common}
uniform float uPush;
uniform float uBoost;
uniform float uWarp;
uniform float uSteps;
uniform vec3 uShake;
uniform vec2 uHole0;   // where the arrival's black hole starts (the intro portal), in uv
uniform sampler2D uCode;
uniform sampler2D uNoise;  // 256² random texture for cheap 3D noise (see zoomNoiseTexture)

vec3 camPos;

// colour of a black body at temperature K (fit of the Planckian locus, display RGB)
vec3 blackbody(float K){
  float t = K / 100.0;
  vec3 c;
  c.r = t <= 66.0 ? 1.0 : 1.292936 * pow(max(t - 60.0, 1.0), -0.1332048);
  c.g = t <= 66.0 ? 0.3900816 * log(t) - 0.6318414 : 1.129891 * pow(max(t - 60.0, 1.0), -0.0755148);
  c.b = t >= 66.0 ? 1.0 : (t <= 19.0 ? 0.0 : 0.5432068 * log(max(t - 10.0, 1.0)) - 1.1962541);
  return clamp(c, 0.0, 1.0);
}

// Thin accretion disk around a Schwarzschild hole (rs = 1, ISCO = 3):
//  - temperature T ∝ r^-3/4 (1 - √(rin/r))^1/4 (Shakura–Sunyaev / Novikov–Thorne profile)
//  - orbital speed v = √(0.5 / (r - 1)), Doppler factor D = 1 / (γ (1 - v cosθ))
//  - gravitational redshift √(1 - 1/r); observed T × g and intensity × g³
vec4 diskSample(vec3 p, float r, vec3 rayDir){
  float ang = atan(p.z, p.x);
  float omega = 1.0 / pow(r, 1.5);
  // gas orbits toward increasing angle, the same way the Doppler velocity points
  float a2 = ang - uTime * omega * (1.6 + uBoost * 7.0);
  float streak = fbm(vec2(r * 7.0, a2 * 2.0));
  float fine = noise(vec2(r * 26.0, a2 * 1.3));   // fine enough for texture, coarse enough not to alias into grooves
  float dens = smoothstep(2.4, 3.1, r) * (1.0 - smoothstep(6.5, 11.5, r));
  dens *= 0.25 + 1.1 * streak * streak + 0.18 * fine;

  const float rin = 2.6;
  float x = r / rin;
  float prof = pow(x, -0.75) * pow(max(1.0 - inversesqrt(x), 0.0), 0.25) / 0.488;   // 1 at the hottest ring

  vec3 vdir = normalize(vec3(-p.z, 0.0, p.x));
  float v = min(sqrt(0.5 / max(r - 1.0, 0.05)), 0.7);
  float gamma = inversesqrt(1.0 - v * v);
  float cosT = dot(vdir, -rayDir);                 // toward the camera along the bent ray
  float D = 1.0 / (gamma * (1.0 - v * cosT));
  float gfac = D * sqrt(max(1.0 - 1.0 / r, 0.0));

  float K = 5600.0 * prof * gfac;
  vec3 c = blackbody(K);
  float I = dens * prof * prof * 2.4 * gfac * gfac * gfac;
  return vec4(c * I, clamp(dens * 1.4, 0.0, 0.95));
}

vec3 sky(vec3 d){
  vec2 sp = vec2(atan(d.z, d.x), asin(clamp(d.y, -1.0, 1.0)));
  // Milky Way: a tilted band of unresolved stars with dark dust lanes
  vec3 gn = normalize(vec3(0.32, 0.86, 0.4));
  float lat = dot(d, gn);
  float band = exp(-lat * lat / 0.035);
  float glow = fbm(sp * 5.0 + 11.0);
  float dust = smoothstep(0.42, 0.7, fbm(sp * 9.0 - 4.0) + lat * 1.5);
  vec3 mw = mix(vec3(0.55, 0.6, 0.78), vec3(1.0, 0.86, 0.66), glow) * band * (0.08 + 0.22 * glow * glow) * (1.0 - 0.85 * dust);
  float s = stars(sp * 4.0, 36.0) + 0.7 * stars(sp * 7.0 + 3.0, 52.0) + band * 0.8 * stars(sp * 11.0 + 7.0, 64.0);
  vec3 neb = vec3(0.30, 0.42, 0.95) * pow(fbm(sp * 2.2 + 1.7), 3.2) * 0.3
           + vec3(0.95, 0.65, 0.35) * pow(fbm(sp * 3.0 + 8.0), 4.0) * 0.22;
  return vec3(s) + mw + neb;
}

vec3 blackHole(vec2 uv, float baseDist){
  float push = uPush * uPush;
  float dist = mix(baseDist, 4.5, push);
  float yaw = uMouse.x * 0.18;
  camPos = vec3(sin(yaw) * dist, (1.9 + uMouse.y * 0.6) * dist / 27.0, -cos(yaw) * dist);
  vec3 ww = normalize(-camPos);
  vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
  vec3 vv = cross(ww, uu);
  vec2 q = rot(uv, 0.12);
  vec3 vel = normalize(q.x * uu + q.y * vv + 1.75 * ww);
  vec3 pos = camPos;
  vec3 hv = cross(pos, vel);
  float h2 = dot(hv, hv);
  vec3 col = vec3(0.0);
  float alpha = 0.0;
  float hit = 0.0;
  for (int i = 0; i < 140; i++) {
    if (float(i) > uSteps) break;
    float r = length(pos);
    float dt = clamp(0.09 * r, 0.03, 8.0);
    vel += -1.5 * h2 * pos / pow(r, 5.0) * dt;
    vec3 np = pos + vel * dt;
    if (pos.y * np.y < 0.0) {
      vec3 p = mix(pos, np, pos.y / (pos.y - np.y));
      float dr = length(p.xz);
      if (dr > 2.2 && dr < 12.0) {
        vec4 dc = diskSample(p, dr, normalize(vel));
        col += (1.0 - alpha) * dc.rgb;
        alpha += (1.0 - alpha) * dc.a;
      }
    }
    pos = np;
    float rr = dot(pos, pos);
    if (rr < 1.0) { hit = 1.0; break; }
    if ((rr > 1600.0 && dot(pos, vel) > 0.0) || alpha > 0.98) break;
  }
  vec3 bg = sky(normalize(vel)) * (1.0 - hit);
  return col + (1.0 - alpha) * bg;
}

// ---- Arrival sequence after loading (reference pin 880313058437018011) ----
// One continuous motion driven by s (0 → 1), timed like the reference video:
//   0.00–0.34  a fan of readable code lanes pours into a small fiery hole on the left
//   0.24–0.56  the camera banks and pans to face the hole (one long eased turn, no jump)
//   0.36–0.72  crisp light rays grow out from the hole and stream into it, in two depth layers
//   0.62–0.88  the rays thin away; turbulent fire swirls round a pure black centre
//   0.86–1.00  the fire fades while the disk returns and the hole eases back to the hero's size

float ease(float a, float b, float x){ return smoothstep(a, b, x); }
float pixUv(){ return 1.0 / min(uRes.x, uRes.y); }    // one screen pixel, in uv units

// 3D value noise from one texture fetch (green = red at (x-37, y-17)); the bias pins the top mip
float noise3(vec3 x){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  vec2 uv = i.xy + vec2(37.0, -17.0) * i.z + f.xy;
  vec2 rg = texture2D(uNoise, (uv + 0.5) / 256.0, -100.0).yx;
  return mix(rg.x, rg.y, f.z);
}
float fbm3(vec3 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise3(p); p = p * 2.02 + vec3(1.7, -2.3, 0.9); a *= 0.5; }
  return v;
}

// Point-lens mapping: the light we see at θ left its source at β = θ (1 - θE² / |θ|²).
// Inside the Einstein ring β flips to the far side, so everything behind the
// hole wraps around it and a mirrored second image hugs the shadow.
vec2 lens(vec2 p, float hr){
  float te = hr * 1.6;
  float r2 = max(dot(p, p), 1e-5);
  return p * (1.0 - te * te / r2);
}

vec3 streams(vec2 p, float s, float hr){
  // the camera speeds up: the fan stretches toward the hole and its glyphs smear into streaks
  float zoom = 1.0 + 1.4 * ease(0.22, 0.5, s);
  vec2 q = p / zoom;
  float u = q.x;
  float rh = hr * 0.9 / zoom;
  if (u <= rh) return vec3(0.0);
  float w = hr * 0.5 / zoom + 0.78 * u;                  // straight-sided fan, centred on the hole
  float v = (q.y - 0.04 * u * u) / w;
  float inside = 1.0 - smoothstep(0.86, 1.0, abs(v));
  // 36 lanes, each a readable line of code, anti-aliased against the pixel size
  const float LANES = 36.0;
  float lv = (v * 0.5 + 0.5) * LANES;
  float lane = floor(lv);
  float lh = hash(vec2(lane, 3.7));
  float fw = LANES / (2.0 * w) * pixUv() * zoom * 1.5;  // lane fraction covered by one pixel
  float inLane = 1.0 - smoothstep(0.36 - fw, 0.44 + fw, abs(fract(lv) - 0.5));
  inLane = mix(inLane, 0.8, smoothstep(0.12, 0.35, fw)); // lanes thinner than ~3px blend to their average: no moiré
  // time dilation: log(u - rh) piles the text up at the horizon; each lane flows at its own speed
  float x = u - rh;
  float tx = log(x / hr) * 0.55 + 0.38 * exp(-sq(x / (hr * 2.6))) + uTime * (0.07 + 0.22 * s) * (0.7 + 0.6 * lh) + lh * 5.0;
  float ty = (lane + 0.5 + (fract(lv) - 0.5) * 0.86) / 32.0;
  float near = 1.0 - smoothstep(0.0, 0.55, u);
  float smear = 0.006 + 0.04 * near + 0.1 * ease(0.16, 0.34, s) + 0.25 * ease(0.34, 0.48, s);
  float text = 0.0;
  for (int i = 0; i < 6; i++) text += texture2D(uCode, vec2(tx + (float(i) - 2.5) * smear, ty)).r;
  text = text / 6.0 * inLane * (0.55 + 0.75 * lh);
  // gravitational redshift: light climbing out of the well dims and reddens
  float gz = sqrt(clamp(1.0 - rh / u, 0.0, 1.0));
  vec3 c = mix(vec3(0.78, 0.88, 1.0), vec3(1.0, 0.8, 0.55), near * near);
  c = mix(vec3(1.0, 0.32, 0.08), c, gz);
  vec3 col = c * text * inside * (1.0 + 2.2 * near) * 1.9 * gz * gz;
  col += vec3(1.0, 0.62, 0.3) * exp(-sq((abs(v) - 0.94) / 0.06)) * near * 0.15 * gz;  // soft glow along the edges
  return col * smoothstep(hr * 0.9, hr * 2.2, length(p));
}

float rayLayer(float a, float r, float n, float seed, float widthMul, float speed, float pa){
  float fa = a / 6.2831 * n + seed;
  float id = mod(floor(fa), n);                          // same ray on both sides of the atan seam
  float h = hash(vec2(id, seed));
  float h2 = hash(vec2(id, seed + 4.1));
  float edge = abs(fract(fa) - 0.5);
  float width = (0.14 + 0.3 * h) * widthMul;
  float fw = n / 6.2831 * pa;                            // one pixel, in fractions of a ray slot
  float ray = 1.0 - smoothstep(width - fw, width + fw, edge);
  // speed lines along each ray, rushing inward
  float dash = fract(r * (1.2 + h2) * 2.0 + uTime * speed * (0.8 + h) + h * 7.0);
  float streak = 0.55 + 0.45 * noise(vec2(id * 13.1 + floor(edge * 18.0), r * 6.0 + uTime * speed * 2.0));
  ray *= (0.6 + 0.4 * smoothstep(0.0, 0.3, dash) * (1.0 - smoothstep(0.6, 1.0, dash))) * streak;
  return ray * step(0.18, h2) * (0.6 + 0.6 * h);
}

vec3 rays(vec2 p, float s, float hr){
  float r = length(p);
  float a = atan(p.y, p.x);
  float pa = pixUv() / max(r, 1e-3);                     // one pixel, in radians, at this radius
  float thin = 1.0 - 0.85 * ease(0.62, 0.76, s);         // they thin to slivers before the fire takes over
  float nearL = rayLayer(a, r, 46.0, 1.3, thin, 1.6, pa);
  float farL = rayLayer(a + 0.04, r, 90.0, 7.9, thin * 0.6, 0.9, pa);
  // they grow outward from the hole as the camera turns into it, instead of popping in
  float reach = mix(hr * 1.3, 1.9, ease(0.36, 0.58, s));
  float grow = 1.0 - smoothstep(reach - 0.3, reach, r);
  float base = smoothstep(hr * 1.15, hr * 2.0, r) * grow;
  vec3 c = vec3(0.92, 0.94, 1.0) * nearL + vec3(0.55, 0.66, 0.95) * farL * 0.6;
  c = mix(vec3(1.0, 0.62, 0.34) * (nearL + farL * 0.5), c, smoothstep(hr * 1.4, hr * 4.0, r));
  return c * base * (0.5 + 0.7 * smoothstep(0.2, 1.2, r));   // brighter toward the edges: perspective
}

vec3 vortex(vec2 p, float s, float hr){
  float r = length(p);
  float a = atan(p.y, p.x);
  float lr = log(max(r, 1e-4) / hr);
  // a log spiral flowing inward, sampled on a cylinder in 3D noise so the angle has no seam
  float sw = a + lr * 1.5 - uTime * 0.6;
  vec3 q = vec3(cos(sw) * 1.6, sin(sw) * 1.6, lr * 2.2 - uTime * 0.9);
  vec3 wq = vec3(fbm3(q * 0.8 + 3.1), fbm3(q * 0.8 - 1.7), 0.0);
  float f = fbm3(q * 1.3 + wq * 1.6);
  // ridged turbulence: tongues of flame with dark gaps between them
  float tongue = 1.0 - abs(fbm3(q * 2.6 + wq * 2.0 + 7.0) * 2.0 - 1.0);
  float fire = smoothstep(0.35, 0.75, f) * (0.35 + 0.9 * pow(tongue, 3.0));
  float band = smoothstep(hr * 0.98, hr * 1.2, r) * (1.0 - smoothstep(hr * 1.7, hr * 3.6, r));
  vec3 c = mix(vec3(0.0), vec3(0.45, 0.06, 0.01), smoothstep(0.0, 0.25, fire));
  c = mix(c, vec3(1.0, 0.36, 0.05), smoothstep(0.2, 0.55, fire));
  c = mix(c, vec3(1.0, 0.72, 0.36), smoothstep(0.6, 0.95, fire));
  c *= 1.6 * band;
  c += vec3(1.0, 0.62, 0.3) * exp(-sq((r - hr * 1.04) / (hr * 0.05))) * 0.9;   // hot inner edge
  return c;
}

vec3 holeRim(vec2 p, float hr, float heat){
  float r = length(p);
  float a = atan(p.y, p.x);
  float fire = noise3(vec3(cos(a) * 3.0, sin(a) * 3.0, r * 18.0 - uTime * 1.5));   // seamless round the ring
  float rim = exp(-sq((r - hr * 1.1) / (hr * 0.18)));
  vec3 col = vec3(1.0, 0.48, 0.12) * rim * (0.45 + 1.2 * fire) * heat;
  col += vec3(1.0, 0.8, 0.52) * exp(-sq((r - hr * 1.02) / (hr * 0.035))) * 0.7;
  col += vec3(1.0, 0.42, 0.1) * exp(-r * r / (hr * hr * 5.0)) * 0.15 * heat;
  return col;
}

vec3 arrival(vec2 uv, float s){
  // the camera: from the portal, a drift left so the fan fills the frame, then one long eased turn onto the hole
  vec2 left = vec2(-0.34, 0.02);
  vec2 hole = mix(mix(uHole0, left, ease(0.0, 0.2, s)), vec2(0.0), smoothstep(0.24, 0.56, s));
  // its size: approach, rush in through the rays and the fire, then ease back to the hero's size
  float hr = 0.04 + 0.03 * ease(0.0, 0.34, s) + 0.02 * ease(0.34, 0.5, s) + 0.07 * ease(0.5, 0.72, s)
           + 0.11 * ease(0.72, 0.86, s) - 0.105 * smoothstep(0.86, 1.0, s);
  vec2 p = uv - hole;
  float r = length(p);

  float wS = 1.0 - ease(0.36, 0.5, s);
  float wR = ease(0.36, 0.48, s) * (1.0 - ease(0.66, 0.78, s));
  float wV = ease(0.62, 0.78, s) * (1.0 - ease(0.88, 1.0, s));
  // the hero's disk: seen small at the start, gone while the rays and the fire fill the frame
  // (so no belt crosses the black centre, and the costly ray-march is skipped), back as the fire fades
  float disk = min(1.0, (1.0 - ease(0.3, 0.44, s)) + ease(0.86, 0.98, s));
  vec3 col = vec3(0.0);
  if (disk > 0.001) col = blackHole(p, 4.55 / hr) * disk;

  vec3 over = vec3(0.0);
  vec2 b = lens(p, hr);                                   // everything behind the hole is seen through its lens
  if (wS > 0.0) over += streams(b, s, hr) * wS;
  if (wR > 0.0) over += rays(b, s, hr) * wR;
  if (wV > 0.0) over += vortex(p, s, hr) * wV;
  over += holeRim(p, hr, (0.7 + 0.6 * ease(0.3, 0.7, s)) * (1.0 - ease(0.86, 1.0, s)));
  over *= smoothstep(hr * 0.96, hr * 1.02, r);           // the event horizon swallows everything
  return col + over;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  // hand-held camera: offset + roll from JS (springy, follows the speed of the dive)
  uv = rot(uv, uShake.z) + uShake.xy;
  float s = 1.0 - clamp(uWarp, 0.0, 1.0);          // 0 = start of the arrival, 1 = hero
  // the whip: the camera banks as it turns onto the hole, and levels out again
  if (s < 1.0) uv = rot(uv, sin(3.14159 * ease(0.24, 0.56, s)) * 0.26);
  uv -= vec2(0.0, 0.11);
  // the arrival ends exactly on the hero view (hole centred, distance 27.6), so no cut is needed
  vec3 col = s < 1.0 ? arrival(uv, s) : blackHole(uv, 27.6);
  col *= 1.0 - smoothstep(0.5, 0.95, uPush) * 0.97;   // fully dark before the manifesto surfaces
  col *= smoothstep(1.5, 0.3, length(uv));
#ifdef HDR
  gl_FragColor = vec4(col, 1.0);                   // linear HDR: bloom + tone map happen in post
#else
  col = 1.0 - exp(-col * 1.5);
  col = pow(col, vec3(0.95, 1.0, 1.04));
  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
#endif
}`;

/** Monochrome star trails swirling around a dark dome (pin: black & white live wallpaper). */
export const starTrailFrag = /* glsl */ `
${common}
uniform float uOpacity;
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
  vec2 p = uv - vec2(0.15, 0.32);
  p.y *= 2.6;
  float r = length(p);
  float a = atan(p.y, p.x);
  float rings = 140.0;
  float k = floor(r*rings);
  float h = hash(vec2(k, 7.0));
  float speed = (0.03 + 0.05*h) / (0.3 + r);
  float seg = 2.0 + floor(h*5.0);
  float s = fract((a/6.2831 + uTime*speed) * seg + h*13.0);
  float len = 0.25 + 0.55*fract(h*31.0);
  float line = smoothstep(0.0, 0.03, s) * smoothstep(len, len - 0.15, s);
  float lane = smoothstep(0.5, 0.15, abs(fract(r*rings) - 0.5));
  float b = line * lane * (0.35 + 0.65*fract(h*91.0)) * smoothstep(0.08, 0.2, r);
  float dome = smoothstep(0.205, 0.2, length(uv - vec2(0.15, 0.36)));
  b *= 1.0 - dome;
  vec3 col = vec3(b) * vec3(1.0, 0.95, 0.9);
  col *= smoothstep(1.3, 0.2, length(uv));
  gl_FragColor = vec4(col * uOpacity, 1.0);
}`;

/** Drifting nebula clouds in two colours with bright cores (pin: red/blue nebula). */
export const nebulaFrag = /* glsl */ `
${common}
uniform vec3 uColA;
uniform vec3 uColB;
uniform float uGlow;
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / min(uRes.x, uRes.y);
  vec2 p = uv*1.6 + uMouse*0.04;
  float t = uTime*0.03;
  vec2 w = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
  float n = fbm(p + 1.8*w + vec2(t, -t));
  float m = fbm(p*1.3 - w + 3.0);
  vec3 col = mix(uColA, uColB, smoothstep(0.3, 0.75, m));
  col *= pow(n, 2.2) * 2.6;
  float core = exp(-6.0*length(uv - vec2(0.12, 0.05) - w*0.15));
  col += mix(uColB, vec3(1.0), 0.6) * core * uGlow;
  col += vec3(stars(uv + 2.0, 90.0));
  col *= smoothstep(1.5, 0.2, length(uv));
  col = 1.0 - exp(-col*1.3);
  col += (hash(gl_FragCoord.xy + fract(uTime)*50.0) - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}`;
