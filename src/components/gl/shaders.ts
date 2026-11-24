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
  float fine = noise(vec2(r * 46.0, a2 * 1.3));
  float dens = smoothstep(2.4, 3.1, r) * (1.0 - smoothstep(6.5, 11.5, r));
  dens *= 0.25 + 1.1 * streak * streak + 0.35 * fine;

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

// ---- Arrival sequence after loading (reference pin 018011) -------------
// One continuous motion driven by s (0 → 1). The hole's position, size and
// fiery rim follow a single smooth path the whole way, and each stage grows
// out of the previous one instead of cutting:
//   streams of glowing code funnel into the hole
//   → the camera turns into the hole and the streams wrap around it as rays
//   → the rays twist into a spiral, the spiral catches fire as a vortex
//   → the vortex settles onto the hero black hole (same shadow size).

float ease(float a, float b, float x){ return smoothstep(a, b, x); }

// Point-lens mapping: the light we see at θ left its source at β = θ (1 - θE² / |θ|²).
// Inside the Einstein ring β flips to the far side, so everything behind the
// hole wraps around it and a mirrored second image hugs the shadow.
vec2 lens(vec2 p, float hr){
  float te = hr * 1.6;
  float r2 = max(dot(p, p), 1e-5);
  return p * (1.0 - te * te / r2);
}

vec3 streams(vec2 p, float s, float hr){
  // a curved horn-shaped sheet of real code text (uCode), drawn in perspective
  float zoom = 1.0 + 2.6 * ease(0.22, 0.62, s) * ease(0.22, 0.62, s);
  vec2 q = p / zoom;
  float u = q.x;
  float rh = hr * 0.9 / zoom;                            // the horizon, along the sheet
  if (u <= rh) return vec3(0.0);
  float w = hr * 0.55 / zoom + 0.64 * pow(u, 1.12);     // flares out like a horn
  float yc = 0.2 * u * u - 0.03 * u;                     // the sheet curls upward
  float v = (q.y - yc) / w;
  float inside = smoothstep(1.0, 0.8, abs(v));
  // time dilation: log(u - rh) means text slows and piles up at the horizon and never quite crosses it;
  // the bump stretches characters along the flow just before it (tidal spaghettification)
  float x = u - rh;
  float tx = log(x / hr) * 0.55 + 0.38 * exp(-sq(x / (hr * 2.6))) + uTime * (0.07 + 0.22 * s);
  float ty = (v * 0.5 + 0.5) * 1.3;
  float near = smoothstep(0.55, 0.0, u);
  // motion blur along the flow, stronger where it moves fastest on screen
  float smear = 0.012 + 0.05 * near;
  float text = 0.0;
  for (int i = 0; i < 4; i++) text += texture2D(uCode, vec2(tx + (float(i) - 1.5) * smear, ty)).r;
  text *= 0.25;
  // gravitational redshift: light climbing out of the well dims and reddens
  float gz = sqrt(clamp(1.0 - rh / u, 0.0, 1.0));
  vec3 c = mix(vec3(0.74, 0.84, 1.0), vec3(1.0, 0.8, 0.52), near * near);
  c = mix(vec3(1.0, 0.3, 0.08), c, gz);
  vec3 col = c * text * inside * (0.55 + 1.6 * near) * 1.6 * gz * gz;
  col += vec3(1.0, 0.62, 0.3) * exp(-sq((abs(v) - 0.93) / 0.035)) * near * 0.7 * gz;   // bright sheet edges
  col += vec3(0.35, 0.45, 0.75) * inside * 0.035 * (1.0 - near);
  return col * smoothstep(hr * 0.9, hr * 2.2, length(p));
}

vec3 rays(vec2 p, float s, float hr){
  float r = length(p);
  float a = atan(p.y, p.x);
  float reveal = clamp((s - 0.26) / 0.3, 0.0, 1.0);    // rays appear on the streams' side first, then wrap around
  float side = smoothstep(0.0, 0.6, cos(a) - 1.0 + 2.6 * reveal);
  float twist = 1.6 * ease(0.5, 0.88, s);               // straight rays curl into a spiral
  float fa = (a + twist * log(r + 0.05)) / 6.2831 * 56.0;
  float h = hash(vec2(floor(fa), 5.0));
  float width = 0.05 + 0.14 * h;
  float ray = smoothstep(width, width * 0.3, abs(fract(fa) - 0.5));
  float seg = fract(r * (1.1 + h) + uTime * (0.7 + 0.6 * h) + h * 7.0);
  ray *= smoothstep(0.0, 0.18, seg) * smoothstep(1.0, 0.6, seg);
  ray *= smoothstep(hr * 1.05, hr * 2.4, r) * smoothstep(1.6, 0.4, r) * step(0.22, h) * side;
  return vec3(0.9, 0.9, 0.93) * ray * (0.45 + 0.6 * h);
}

vec3 vortex(vec2 p, float s, float hr){
  float r = length(p);
  float a = atan(p.y, p.x);
  float sw = a + log(r + 0.001) * 1.9 - uTime * 0.8;
  vec2 q = vec2(cos(sw), sin(sw)) * 1.3 + vec2(r * 3.2 - uTime * 0.35, 0.0);
  float f = fbm(q * 1.7 + 3.0);
  float f2 = fbm(q * 3.6 - uTime * 0.3);
  float band = smoothstep(hr, hr * 1.6, r) * smoothstep(1.3, 0.3, r);
  float fire = pow(f, 2.2) * 1.8 + pow(f2, 3.0) * 0.8;
  vec3 col = mix(vec3(0.95, 0.42, 0.1), vec3(1.0, 0.86, 0.62), smoothstep(0.5, 0.9, f2)) * fire * band;
  col += vec3(0.32, 0.48, 0.95) * pow(fbm(q * 2.3 + 9.0), 3.0) * band * 0.7;
  return col;
}

vec3 holeRim(vec2 p, float hr, float heat){
  float r = length(p);
  float a = atan(p.y, p.x);
  float fire = fbm(vec2(a * 3.0 - uTime * 2.2, r * 26.0 - uTime));
  float rim = exp(-sq((r - hr * 1.12) / (hr * 0.2)));
  vec3 col = vec3(1.0, 0.52, 0.16) * rim * (0.5 + 1.6 * fire) * heat;
  col += vec3(1.0, 0.82, 0.55) * exp(-sq((r - hr * 1.02) / (hr * 0.04))) * 0.9;
  col += vec3(1.0, 0.48, 0.14) * exp(-r * r / (hr * hr * 6.0)) * 0.3 * heat;
  return col;
}

vec3 arrival(vec2 uv, float s){
  // one path for the hole: drifts to centre while the camera flies toward it
  vec2 hole = mix(uHole0, vec2(0.0), ease(0.04, 0.58, s));
  float hr = mix(0.05, 0.165, ease(0.0, 0.95, s));
  vec2 p = uv - hole;
  float r = length(p);
  // the hole IS the hero black hole, seen from far away (shadow radius ≈ 4.55 / distance)
  vec3 col = blackHole(p, 4.55 / hr);

  float wS = 1.0 - ease(0.3, 0.62, s);
  float wR = ease(0.26, 0.5, s) * (1.0 - ease(0.66, 0.92, s));
  float wV = ease(0.55, 0.82, s) * (1.0 - ease(0.82, 1.0, s));
  vec3 over = vec3(0.0);
  vec2 b = lens(p, hr);                                   // everything behind the hole is seen through its lens
  if (wS > 0.0) over += streams(b, s, hr) * wS;
  if (wR > 0.0) over += rays(b, s, hr) * wR;
  if (wV > 0.0) over += vortex(b, s, hr) * wV * 0.6;     // HDR bloom already lifts it
  over += holeRim(p, hr, (0.55 + 0.6 * ease(0.3, 0.7, s)) * (1.0 - ease(0.8, 1.0, s)));
  over *= smoothstep(hr * 0.96, hr * 1.02, r);           // the event horizon swallows everything
  return col + over;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  // hand-held camera: offset + roll from JS (springy, follows the speed of the dive)
  uv = rot(uv, uShake.z) + uShake.xy;
  uv -= vec2(0.0, 0.11);
  float s = 1.0 - clamp(uWarp, 0.0, 1.0);          // 0 = start of the arrival, 1 = hero
  // the arrival ends exactly on the hero view (hole centred, distance 27.6), so no cut is needed
  vec3 col = s < 1.0 ? arrival(uv, s) : blackHole(uv, 27.6);
  col *= 1.0 - smoothstep(0.6, 1.0, uPush) * 0.95;
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
