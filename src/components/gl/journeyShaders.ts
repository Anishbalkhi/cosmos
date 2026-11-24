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

// one star per cell (some cells empty), at a random spot, with a random brightness and colour.
// cellPx: how many pixels a cell spans, so every star is about a pixel and a half wide
vec3 starLayer(vec2 p, float density, float cellPx){
  vec2 c = floor(p);
  float h = hash(c);
  if (h > density) return vec3(0.0);
  vec2 o = vec2(hash(c+3.1), hash(c+7.7)) - 0.5;
  vec2 f = fract(p) - 0.5 - o*0.7;
  float d = length(f) * cellPx;                      // distance in pixels
  float b = pow(hash(c+1.3), 5.0)*2.6 + 0.12;
  float tw = 0.75 + 0.25*sin(uTime*(0.8 + h*3.0) + h*40.0);
  vec3 tint = mix(vec3(0.72, 0.84, 1.0), vec3(1.0, 0.86, 0.7), hash(c+5.5));
  return tint * b * tw * exp(-d*d*0.9);
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

  // stars: a still, distant layer, then three layers cycling toward the camera
  vec3 stars = starLayer(uv*55.0*uDensity + vec2(0.0, uScroll*0.9), 0.25, m/(55.0*uDensity)) * 0.35;
  for (int i = 0; i < 3; i++){
    float k = fract(uCamZ*0.08 + float(i)/3.0);
    float zoom = mix(2.2, 0.55, k);                  // nearer = spread wider = fewer stars per screen
    float a = smoothstep(0.0, 0.25, k) * smoothstep(1.0, 0.7, k);
    float cells = 24.0 * zoom * uDensity;
    vec2 sp = uv*cells + vec2(float(i)*17.3, float(i)*5.1 + uScroll*(1.6 + 2.0*k));
    stars += starLayer(sp, 0.3, m/cells) * a * 0.8;
  }
  col += stars * uStars * (0.4 + 0.6 * uDensity);   // dimmer on small screens, where the same stars sit closer together

  // the light objects; split = two more copies either side (the three products)
  float spread = min(0.46, 0.33*max(aspect, 1.0));
  if (uAInt * (1.0 - uLMix) > 0.002){
    vec2 q = uv - uAPos;
    float off = spread * uALine.y;
    float l = lightShape(q, uAShape, uALine, uAAng);
    if (uALine.y > 0.01) l += (lightShape(q - vec2(off, 0.0), uAShape, uALine, uAAng) + lightShape(q + vec2(off, 0.0), uAShape, uALine, uAAng)) * uALine.y;
    col += uACol * l * uAInt * (1.0 - uLMix);
  }
  if (uBInt * uLMix > 0.002){
    vec2 q = uv - uBPos;
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
