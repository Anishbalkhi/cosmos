/*
 * Page scenes from the third reference batch (Nov 2026), each built from one pin, studied
 * frame by frame at 0.3 s. Same conventions as sectionShaders.ts: linear HDR under the
 * ShaderCanvas post chain, self tone-mapped otherwise.
 */
import { common } from "./shaders";
import { finish, rocksChunk } from "./sectionShaders";

/**
 * Pin 894597913507269238: skimming low over Saturn's rings. The planet is a backlit crescent
 * above, ring bands stream past below, and boulders tumble by in the foreground.
 */
export const ringSkimFrag = /* glsl */ `
${common}
${finish}
${rocksChunk}
void main(){
  vec2 uv = screenUv() + uMouse * 0.01;
  float px = 1.0 / min(uRes.x, uRes.y);
  vec2 q = rot(uv, 0.32);                                  // the ring plane runs diagonally
  vec3 col = vec3(0.006, 0.006, 0.01) + vec3(stars(uv + 1.0, 80.0)) * 0.5;
  // Saturn: a dark disc lit only along its lower-left limb (the sun is behind it)
  vec2 pc = q - vec2(0.5, 0.66);
  float pr = length(pc);
  float R = 0.62;
  float lightSide = max(dot(pc / max(pr, 1e-4), normalize(vec2(-0.75, -0.65))), 0.0);
  col = mix(col, vec3(0.018, 0.016, 0.014), smoothstep(R + 0.004, R - 0.004, pr));
  col += vec3(1.0, 0.88, 0.7) * exp(-sq((pr - R) / 0.006)) * pow(lightSide, 3.0) * 2.2;
  col += vec3(1.0, 0.75, 0.5) * exp(-max(pr - R, 0.0) / 0.035) * pow(lightSide, 4.0) * 0.25 * step(R, pr);
  // the ring plane in perspective, below its horizon
  float hz = 0.06;
  float below = hz - q.y;
  if (below > 0.0) {
    float depth = 0.2 / (below + 0.003);
    float along = q.x * depth;
    float r = depth * 0.32;
    float bands = 0.55 + 0.45 * sin(r * 23.0) * sin(r * 7.3 + 1.0);
    bands *= 0.55 + 0.6 * noise(vec2(r * 60.0, 0.5));
    float gap = smoothstep(0.035, 0.0, abs(fract(r * 0.45) - 0.5) - 0.02);           // dark gaps
    float grain = noise(vec2(along * 26.0 - uTime * 1.4, r * 90.0));                  // particles streaming past
    float fade = exp(-depth * 0.05) * smoothstep(0.0, 0.025, below);
    vec3 rc = vec3(0.9, 0.76, 0.58) * bands * (0.45 + 0.7 * grain) * (1.0 - 0.85 * gap) * 0.55;
    col = mix(col, rc, fade * 0.95);
  }
  // boulders rushing past in the foreground, lit from behind
  gLight = normalize(vec3(-0.7, -0.55, 0.35));
  gRockTint = vec3(0.6, 0.5, 0.4);
  gRimTint = vec3(1.0, 0.82, 0.6);
  vec4 rk = rocks(uv, 3.2, 21.0, vec2(uTime * 0.12, uTime * 0.04), 1.0, px * 3.2 * 2.0, 0.8);
  col = mix(col, rk.rgb, rk.a * smoothstep(hz + 0.05, hz - 0.25, q.y));
  col *= smoothstep(1.6, 0.35, length(uv));
  gl_FragColor = finish(col);
}`;

/**
 * Pin 1104930089807378782: a peaceful Sun in warm haze above a dark teal field, with small
 * rocks drifting slowly through the foreground.
 */
export const sunDriftFrag = /* glsl */ `
${common}
${finish}
${rocksChunk}
void main(){
  vec2 uv = screenUv() + uMouse * 0.01;
  float px = 1.0 / min(uRes.x, uRes.y);
  vec2 sp = vec2(0.28, 0.2);
  float d = length(uv - sp);
  vec3 col = mix(vec3(0.01, 0.035, 0.04), vec3(0.07, 0.05, 0.03), smoothstep(-0.9, 0.45, uv.y));
  col += vec3(0.6, 0.45, 0.3) * pow(fbm(uv * 1.8 + vec2(uTime * 0.008, 0.0)), 3.0) * 0.25;
  col += vec3(stars(uv + vec2(uTime * 0.004, 0.0), 80.0)) * 0.45;
  col += vec3(1.0, 0.72, 0.38) * exp(-d * 3.2) * 0.45 + vec3(1.0, 0.58, 0.28) * exp(-d * 9.0) * 0.8
       + vec3(1.0, 0.93, 0.8) * exp(-d * d / 0.0014) * 4.0;
  gLight = normalize(vec3(sp - vec2(0.0, -0.2), 0.45));
  gRockTint = vec3(0.45, 0.36, 0.28);
  gRimTint = vec3(1.0, 0.72, 0.42);
  vec4 r = rocks(uv, 7.0, 3.0, vec2(uTime * 0.018, uTime * 0.003), 0.6, px * 7.0 * 1.5, 0.84);
  col = mix(col, r.rgb, r.a);
  r = rocks(uv, 2.6, 9.0, vec2(uTime * 0.032, -uTime * 0.004), 1.0, px * 2.6 * 2.0, 0.9);
  col = mix(col, r.rgb, r.a);
  col *= smoothstep(1.6, 0.35, length(uv));
  gl_FragColor = finish(col);
}`;

/**
 * Pin 943081978224839392: dawn on an alien world. A giant banded planet rises behind a rocky
 * ridge under a violet nebula, and an anamorphic flare sweeps along its limb every 9 s.
 */
export const horizonRiseFrag = /* glsl */ `
${common}
${finish}
void main(){
  vec2 uv = screenUv() + uMouse * 0.01;
  vec3 col = mix(vec3(0.03, 0.01, 0.05), vec3(0.2, 0.05, 0.12), smoothstep(-0.3, 0.6, uv.y));
  col += vec3(0.5, 0.2, 0.65) * pow(fbm(uv * 1.7 + vec2(uTime * 0.004, 0.0)), 3.0) * 0.6;
  col += vec3(stars(uv + 5.0, 90.0)) * 0.6;
  // the planet, rising very slowly
  vec2 pc = uv - vec2(0.22, -0.66 + 0.03 * sin(uTime * 0.05));
  float R = 0.64;
  float pr = length(pc);
  if (pr < R) {
    vec2 s = pc / R;
    float z = sqrt(max(0.0, 1.0 - dot(s, s)));
    float bands = fbm(vec2(s.y * 7.0 + fbm(s * 3.0 + uTime * 0.01) * 0.8, s.x * 1.4));
    vec3 pcol = mix(vec3(0.5, 0.16, 0.08), vec3(0.98, 0.58, 0.32), bands);
    float lit = max(dot(vec3(s, z), normalize(vec3(-0.55, 0.65, 0.5))), 0.0);
    col = pcol * (0.06 + 1.1 * lit);
  }
  col += vec3(1.0, 0.5, 0.32) * exp(-abs(pr - R) / 0.018) * 0.7;
  // the rocky ridge in the foreground
  float ridge = -0.36 + 0.07 * fbm(vec2(uv.x * 2.6, 3.0)) + 0.025 * noise(vec2(uv.x * 14.0, 1.0));
  if (uv.y < ridge) {
    float g = fbm(uv * vec2(5.0, 11.0));
    col = vec3(0.22, 0.07, 0.04) * (0.3 + g) + vec3(1.0, 0.45, 0.25) * exp(-(ridge - uv.y) / 0.012) * 0.5;
  }
  // the anamorphic flare
  float cyc = fract(uTime / 9.0);
  float on = smoothstep(0.0, 0.08, cyc) * smoothstep(0.6, 0.42, cyc);
  vec2 fp = vec2(mix(-1.3, 1.3, smoothstep(0.0, 0.6, cyc)), -0.03);
  col += vec3(0.62, 0.72, 1.0) * exp(-sq((uv.y - fp.y) / 0.0045)) * exp(-abs(uv.x - fp.x) * 1.4) * on * 1.8;
  col += vec3(1.0, 0.92, 0.95) * exp(-length(uv - fp) * 22.0) * on * 2.5;
  col *= smoothstep(1.6, 0.35, length(uv));
  gl_FragColor = finish(col);
}`;

/**
 * Pin 984669906014577592: a black hole tilted on the diagonal, its disk in cream and teal,
 * turning slowly in total darkness.
 */
export const tiltedHoleFrag = /* glsl */ `
${common}
${finish}
void main(){
  vec2 uv = screenUv() + uMouse * 0.01;
  vec2 c = rot(uv, 0.95);
  float rr = length(c);
  float a = atan(c.y, c.x);
  vec2 dir = vec2(cos(a), sin(a));
  float swirl = fbm(dir * 3.0 + vec2(rr * 9.0 - uTime * 0.12, uTime * 0.05));
  vec3 cream = vec3(1.0, 0.94, 0.82);
  vec3 teal = vec3(0.35, 0.72, 0.68);
  // the lensed back of the disk: a glowing ring around the shadow
  float halo = exp(-sq((rr - 0.2) / 0.07)) * (0.35 + 1.3 * swirl * swirl);
  vec3 col = mix(teal, cream, smoothstep(0.3, 0.75, swirl)) * halo;
  col += cream * exp(-sq((rr - 0.165) / 0.006)) * 1.4;                    // photon ring
  col *= smoothstep(0.15, 0.158, rr);                                      // the shadow
  // the front of the disk: a thin ellipse crossing in front of the shadow
  float er = length(c / vec2(1.0, 0.18));
  float ea = atan(c.y / 0.18, c.x);
  float band = exp(-sq((er - 0.34) / 0.16)) * smoothstep(0.17, 0.2, er);
  float s2 = fbm(vec2(ea * 2.5 - uTime * 0.15, er * 10.0));
  col += mix(teal, cream, s2) * band * (0.25 + 1.2 * s2 * s2) * step(c.y, 0.0) * 0.9;
  col += vec3(stars(uv + 3.0, 90.0)) * 0.25;
  col *= smoothstep(1.4, 0.3, length(uv));
  gl_FragColor = finish(col);
}`;

/**
 * The same tilted black hole in the brand's warm light (gold and cream instead of teal): the Our Story
 * header. It turns slowly; the edges fall to black so it can be screened onto the night sky.
 */
export const goldHoleFrag = tiltedHoleFrag
  .replace("vec3 teal = vec3(0.35, 0.72, 0.68);", "vec3 teal = vec3(0.95, 0.58, 0.26);")
  .replace("col += vec3(stars(uv + 3.0, 90.0)) * 0.25;", "");
