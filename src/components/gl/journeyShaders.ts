/**
 * The shared sky behind the whole home page (UniverseStage): the colour-script gradient, a faint
 * nebula, stars in depth layers that stream outward as the camera moves forward and drift up as it
 * moves down, and the light object, one parametric shape that is every stop's light in turn: a
 * ring, an arc lit on one side, an orbit seen edge-on, three halos, a sun, a line of horizon glare,
 * a single star. Values come from lib/journey.ts.
 */
export const universeFrag = /* glsl */ `
uniform float uTime; uniform vec2 uRes;
// two lights, the one being left (A) and the one arriving (B), crossfaded by uLMix:
// pos; shape = (radius, squash, fill); line = (width, split, arc); arc angle; colour; intensity
uniform vec2 uAPos; uniform vec3 uAShape; uniform vec3 uALine; uniform float uAAng; uniform vec3 uACol; uniform float uAInt;
uniform vec2 uBPos; uniform vec3 uBShape; uniform vec3 uBLine; uniform float uBAng; uniform vec3 uBCol; uniform float uBInt;
uniform float uLMix;
uniform vec3 uSkyTop; uniform vec3 uSkyLow; uniform vec3 uNeb;
uniform float uCamZ; uniform float uScroll;
uniform float uDensity;  // 1 on a 1280x720 screen, less on small ones: the same stars per pixel, not per screen
uniform float uStars;    // how bright the star field is at this stop (it thins out behind the footer)
uniform float uMW;       // how strong the Milky Way is at this stop
uniform vec3 uVeilA; uniform vec3 uVeilB;   // the nebula veils' two tints at this stop
uniform float uVeil;     // 0..1: how present the veils are

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.0 - 2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), f.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 4; i++){ s += a*vnoise(p); p = p*2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return s;
}

// star colours by temperature, as the eye sees them: blue-white (hot) through white and yellow to orange (cool)
vec3 starTint(float t){
  vec3 c = mix(vec3(0.66, 0.78, 1.0), vec3(1.0, 0.98, 0.95), smoothstep(0.0, 0.45, t));
  c = mix(c, vec3(1.0, 0.86, 0.62), smoothstep(0.55, 0.85, t));
  return mix(c, vec3(1.0, 0.7, 0.45), smoothstep(0.9, 1.0, t));
}

// one star per cell (some cells empty), at a random spot. Brightness follows a real sky: nearly all faint,
// a rare few bright, and only the bright ones get a soft glow (the bloom does the rest).
// cellPx: how many pixels a cell spans, so the faint stars stay under a pixel and a half wide
vec3 starLayer(vec2 p, float density, float cellPx){
  vec2 c = floor(p);
  float h = hash(c);
  if (h > density) return vec3(0.0);
  vec2 o = vec2(hash(c+3.1), hash(c+7.7)) - 0.5;
  vec2 f = fract(p) - 0.5 - o*0.7;
  float d = length(f) * cellPx;                      // distance in pixels
  float m = hash(c+1.3);
  float b = 0.05 + 0.55 * pow(m, 6.0) + 3.5 * pow(m, 40.0);
  float core = exp(-d*d*1.2);
  float glow = pow(m, 30.0) * 0.06 / (1.0 + d*d*0.08);   // only the brightest few
  float tw = 0.85 + 0.15*sin(uTime*(0.6 + h*2.0) + h*40.0);
  return starTint(hash(c+5.5)) * (b * core + glow) * tw;
}

// the Milky Way: a diagonal band of unresolved starlight, warmer in the core, cut by dark dust lanes.
// Returns its glow (rgb) and its density (a), which also crowds more faint stars into it.
vec4 milkyWay(vec2 uv){
  vec2 n = normalize(vec2(-0.42, 1.0));
  float across = dot(uv - vec2(0.15, -0.1), n);
  float along = dot(uv, vec2(n.y, -n.x));
  float wob = (fbm(vec2(along * 1.4, 3.0)) - 0.5) * 0.18;
  float a = across + wob;
  float band = exp(-a*a / 0.055);
  float core = exp(-a*a / 0.012);
  float cloud = fbm(vec2(along * 3.0, a * 7.0) + 4.0);
  float fine = fbm(vec2(along * 9.0, a * 20.0) - 2.0);
  // dust lanes: dark filaments that follow the band, densest along its middle
  float lanes = smoothstep(0.48, 0.72, fbm(vec2(along * 4.5, a * 14.0) + 11.0) + 0.25 * core);
  float light = band * (0.35 + 0.9 * cloud * cloud + 0.35 * fine) * (1.0 - 0.8 * lanes * band);
  vec3 c = mix(vec3(0.42, 0.5, 0.72), vec3(1.0, 0.86, 0.66), core * 0.85 + cloud * 0.2);
  return vec4(c * light, band * (1.0 - 0.7 * lanes));
}

// the light object at offset q from its centre: s = (radius, squash, fill), ln = (width, split, arc)
float lightShape(vec2 q, vec3 s, vec3 ln, float arcAng){
  float uLR = s.x, uLFill = s.z, uLW = ln.x, uLArc = ln.z;
  float sq = max(s.y, 0.015);
  vec2 e2 = vec2(q.x, q.y/sq);
  float e = max(length(e2), 1e-4);
  // distance to the ellipse on screen (not in squashed space), so a flat orbit keeps a thin, even line
  float grad = length(vec2(q.x, q.y/(sq*sq))) / e;
  float dr = (e - uLR) / max(grad, 1e-3);
  float w = uLW;
  float ring = w*w / (dr*dr + w*w);
  // a gaussian core: a big light is a pure glow with no edge (a smoothstep disc read as a flat stain)
  float disc = exp(-e*e/(uLR*uLR)*3.0)*1.6 + (uLR*uLR*0.6)/(e*e + uLR*uLR*0.25)*0.5;
  float l = mix(ring, disc, uLFill);
  // lit on one side only (a crescent-lit arc), by uLArc
  vec2 dir = vec2(cos(arcAng), sin(arcAng));
  float side = smoothstep(-0.35, 0.95, dot(e2/e, dir));
  l *= mix(1.0, side*side, uLArc);
  // a soft wide halo so the light colours the sky around it
  l += 0.05 * uLR / (length(q) + uLR*0.8);
  return l;
}

void main(){
  float m = min(uRes.x, uRes.y);
  vec2 uv = (gl_FragCoord.xy - 0.5*uRes) / m;
  float aspect = uRes.x / uRes.y;

  // sky: the colour script, darker overhead, a glow at the horizon
  vec3 col = mix(uSkyLow, uSkyTop, smoothstep(-0.7, 0.65, uv.y));

  // faint nebula drifting with the descent
  vec2 np = uv*1.5 + vec2(0.0, uScroll*0.035) + vec2(uTime*0.004, 0.0);
  float n = fbm(np + fbm(np*0.7 + 3.0)*0.8);
  col += uNeb * pow(n, 2.6) * 3.0;

  // nebula veils: three depths of soft gas drifting up past you as you scroll, the nearer ones faster and
  // bigger (parallax), each wisp warped so it reads as gas, not noise. Tinted per section.
  if (uVeil > 0.001) {
    vec3 veil = vec3(0.0);
    for (int i = 0; i < 3; i++) {
      float d = float(i);                                  // 0 far .. 2 near
      float sc = mix(1.35, 0.55, d * 0.5);                 // near layers: larger shapes
      float sp = mix(0.12, 0.62, d * 0.5);                 // near layers: faster past
      vec2 q = uv * sc + vec2(d * 7.3 + uTime * 0.006 * (1.0 + d), uScroll * sp + d * 3.1);
      vec2 w2 = vec2(fbm(q * 0.8 + 1.7), fbm(q * 0.8 - 4.2));
      float c = fbm(q + w2 * 1.4);
      float wisp = smoothstep(0.4, 0.8, c) * (0.5 + 0.5 * fbm(q * 3.0 + w2));
      vec3 tint = mix(uVeilA, uVeilB, smoothstep(0.3, 0.7, fbm(q * 0.5 + 9.0)));
      veil += tint * wisp * mix(0.15, 0.26, d * 0.5);
    }
    col += veil * uVeil;
  }

  // the Milky Way, drifting slowly up as the page goes down (far away: it barely moves)
  vec2 mp = uv + vec2(0.0, uScroll * 0.05);
  vec4 mw = milkyWay(mp);
  col += mw.rgb * 0.12 * uMW;

  // stars: a fine, still dust of faint ones (denser inside the Milky Way), then a sparse layer of brighter
  // ones moving slowly toward the camera. Few, varied stars read as a real sky; even dots read as wallpaper.
  float dens = 0.1 + 0.45 * mw.a * uMW;
  vec3 stars = starLayer(mp*110.0*uDensity, dens, m/(110.0*uDensity)) * 0.55;
  stars += starLayer(mp*48.0*uDensity + 7.0, 0.16, m/(48.0*uDensity));
  for (int i = 0; i < 2; i++){
    float k = fract(uCamZ*0.06 + float(i)/2.0);
    float zoom = mix(1.8, 0.7, k);
    float a = smoothstep(0.0, 0.3, k) * smoothstep(1.0, 0.7, k);
    float cells = 20.0 * zoom * uDensity;
    vec2 sp = uv*cells + vec2(float(i)*17.3, float(i)*5.1 + uScroll*(1.2 + 1.6*k));
    stars += starLayer(sp, 0.07, m/cells) * a;
  }
  col += stars * uStars * (0.5 + 0.5 * uDensity);   // dimmer on small screens, where the same stars sit closer together

  // the light objects; split = two more copies either side (the three products)
  float spread = min(0.46, 0.33*max(aspect, 1.0));
  // stop positions are set for a wide screen: on a tall one, map them to the same place on screen
  // (a horizon glow at the bottom stays at the bottom, not mid-screen)
  vec2 fit = aspect < 1.0 ? vec2(0.56, 1.0 / aspect) : vec2(1.0);
  if (uAInt * (1.0 - uLMix) > 0.002){
    vec2 q = uv - uAPos * fit;
    float off = spread * uALine.y;
    float l = lightShape(q, uAShape, uALine, uAAng);
    if (uALine.y > 0.01) l += (lightShape(q - vec2(off, 0.0), uAShape, uALine, uAAng) + lightShape(q + vec2(off, 0.0), uAShape, uALine, uAAng)) * uALine.y;
    col += uACol * l * uAInt * (1.0 - uLMix);
  }
  if (uBInt * uLMix > 0.002){
    vec2 q = uv - uBPos * fit;
    float off = spread * uBLine.y;
    float l = lightShape(q, uBShape, uBLine, uBAng);
    if (uBLine.y > 0.01) l += (lightShape(q - vec2(off, 0.0), uBShape, uBLine, uBAng) + lightShape(q + vec2(off, 0.0), uBShape, uBLine, uBAng)) * uBLine.y;
    col += uBCol * l * uBInt * uLMix;
  }

#ifndef HDR
  col = col / (1.0 + col);
#endif
  gl_FragColor = vec4(col, 1.0);
}
`;
