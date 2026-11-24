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
uniform vec2 uHoleL;   // where it rests while the code pours in (set per aspect in BlackHoleHero)

vec3 camPos;
float gStreak = 0.0;   // starlight stretching into streaks as the camera dives
float gClose = 0.0;    // 1 when the camera is low over the disk: fine turbulence and temperature mottling
vec3 gFwd = vec3(0.0, 0.0, 1.0);
vec3 gU = vec3(1.0, 0.0, 0.0);
vec3 gV = vec3(0.0, 1.0, 0.0);

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
  if (gClose > 0.001) {
    // from above the seam where the angle wraps (behind the hole on the hero) is in view: blend across it
    float sw0 = (ang + 3.14159) / 6.28318;
    float b2 = a2 - 6.28318;
    streak = mix(streak, fbm(vec2(r * 7.0, b2 * 2.0)), sw0);
    fine = mix(fine, noise(vec2(r * 26.0, b2 * 1.3)), sw0);
  }
  float dens = smoothstep(2.4, 3.1, r) * (1.0 - smoothstep(6.5, 11.5, r));
  dens *= 0.25 + 1.1 * streak * streak + 0.18 * fine;
  float turb = 0.5;
  if (gClose > 0.001) {
    // seen from close, the gas is turbulent: knots and filaments sheared along the orbit
    // seamless round the disk: blend the pattern with itself one turn back across the atan seam
    float sw = (ang + 3.14159) / 6.28318;
    float tA = fbm(vec2(r * 9.0, a2 * 16.0) + fbm(vec2(r * 4.0, a2 * 6.0)) * 2.0);
    float a3 = a2 - 6.28318;
    float tB = fbm(vec2(r * 9.0, a3 * 16.0) + fbm(vec2(r * 4.0, a3 * 6.0)) * 2.0);
    turb = mix(tA, tB, sw);
    dens *= mix(1.0, 0.2 + 1.9 * turb * turb, gClose);
  }

  const float rin = 2.6;
  float x = r / rin;
  float prof = pow(x, -0.75) * pow(max(1.0 - inversesqrt(x), 0.0), 0.25) / 0.488;   // 1 at the hottest ring

  vec3 vdir = normalize(vec3(-p.z, 0.0, p.x));
  float v = min(sqrt(0.5 / max(r - 1.0, 0.05)), 0.7);
  float gamma = inversesqrt(1.0 - v * v);
  float cosT = dot(vdir, -rayDir);                 // toward the camera along the bent ray
  float D = 1.0 / (gamma * (1.0 - v * cosT));
  float gfac = D * sqrt(max(1.0 - 1.0 / r, 0.0));

  float K = 5600.0 * prof * gfac * mix(1.0, 0.62 + 0.6 * turb, gClose);   // hotter knots, cooler orange lanes
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
  vec3 c = vec3(s) + mw + neb;
  if (gStreak > 0.001) {
    // the dive: stars stretch into streaks radiating from straight ahead (seen through the lens like everything else)
    float th = acos(clamp(dot(d, gFwd), -1.0, 1.0));
    float ph = atan(dot(d, gV), dot(d, gU));
    float k = 1.0 + gStreak * 60.0;
    vec2 g = vec2(ph * 0.42, log(th + 1e-3) * 0.42 / k);
    float st = stars(g, 36.0) + 0.8 * stars(g * 1.37 + 5.0, 44.0) + 0.6 * stars(g * 1.9 + 9.0, 52.0);
    st += 0.7 * stars(g * 2.6 + 13.0, 60.0) + 0.5 * stars(g * 3.3 + 21.0, 70.0);
    c = c * (1.0 - 0.6 * gStreak) + vec3(0.86, 0.92, 1.0) * st * gStreak * 6.0 * smoothstep(0.02, 0.3, th);
  }
  return c;
}

vec3 traceHole(vec2 uv, float dist, float elev, float yaw){
  camPos = vec3(sin(yaw) * dist, elev * dist / 27.0, -cos(yaw) * dist);
  vec3 ww = normalize(-camPos);
  vec3 uu = normalize(cross(vec3(0.0, 1.0, 0.0), ww));
  vec3 vv = cross(ww, uu);
  gFwd = ww; gU = uu; gV = vv;
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

vec3 blackHole(vec2 uv, float baseDist){
  float push = uPush * uPush;
  float dist = mix(baseDist, 4.5, push);
  return traceHole(uv, dist, 1.9 + uMouse.y * 0.6, uMouse.x * 0.18);
}

// ---- Arrival sequence after loading (timed to reference pin 880313058437018011) ----
// One camera flight through the same ray-traced black hole as the hero, so every beat is lit and lensed
// physically. s runs 0 → 1:
//   0.00–0.34  far out: a stream of gas carrying streaks of code spirals into a small black hole on the left
//   0.30–0.52  the dive: the camera turns onto the hole and rushes in; starlight stretches into streaks
//   0.45–0.80  low over the accretion disk: turbulent plasma all round the shadow (the "fire")
//   0.80–1.00  the camera pulls back up to exactly the hero's view (no cut)

float ease(float a, float b, float x){ return smoothstep(a, b, x); }

void arrivalCam(float s, out vec2 off, out float dist, out float elev, out float yaw){
  // where the hole sits on screen: from the portal, to the left third, then centred as the camera turns onto it
  off = mix(mix(uHole0, uHoleL, ease(0.0, 0.2, s)), vec2(0.0), smoothstep(0.24, 0.56, s));
  off.y -= 0.15 * (1.0 - smoothstep(0.24, 0.56, s));   // mid-height while far out; the hero's own lift after
  // distance in Schwarzschild radii: a slow push, the dive (accelerating), close over the disk, back to the hero
  // (the dive runs from about 2.0 s to 4.0 s and is eased on log(distance): a steady fall, never a jump)
  float dive = ease(0.16, 0.6, s);
  dist = exp(mix(log(mix(95.0, 72.0, ease(0.0, 0.16, s))), log(10.0), dive));
  dist = mix(dist, 27.6, ease(0.82, 1.0, s));
  // height: low far out (the stream reads as a long fan), high over the disk at the bottom of the dive so the
  // hot disk rings the shadow, then down to the hero's view
  elev = mix(0.7, 1.0, ease(0.0, 0.3, s));
  elev = mix(elev, 30.0, ease(0.42, 0.66, s));
  elev = mix(elev, 1.9 + uMouse.y * 0.6, ease(0.82, 1.0, s));
  yaw = uMouse.x * 0.18 * ease(0.82, 1.0, s);
  gStreak = ease(0.3, 0.45, s) * (1.0 - ease(0.55, 0.68, s));
  gClose = ease(0.5, 0.65, s) * (1.0 - ease(0.85, 0.97, s));
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  // hand-held camera: offset + roll from JS (springy, follows the speed of the dive)
  uv = rot(uv, uShake.z) + uShake.xy;
  float s = 1.0 - clamp(uWarp, 0.0, 1.0);          // 0 = start of the arrival, 1 = hero
  // the whip: the camera banks as it turns onto the hole, and levels out again
  if (s < 1.0) uv = rot(uv, sin(3.14159 * ease(0.24, 0.56, s)) * 0.26);
  uv -= vec2(0.0, 0.15);   // the hole sits a little high, so its lower ring clears the headline
  // the arrival ends exactly on the hero view (hole centred, distance 27.6), so no cut is needed
  vec2 off = vec2(0.0);
  float dist, elev, yaw;
  if (s < 1.0) arrivalCam(s, off, dist, elev, yaw);
  else {
    float push = uPush * uPush;
    dist = mix(27.6, 4.5, push);
    elev = 1.9 + uMouse.y * 0.6;
    yaw = uMouse.x * 0.18;
  }
  vec3 col = traceHole(uv - off, dist, elev, yaw);
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
