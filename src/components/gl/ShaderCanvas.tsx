"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";

export type Uniforms = Record<string, number | [number, number] | [number, number, number]>;

/** Camera-style post-processing for a scene rendered in HDR (linear, unclamped). */
export type PostSettings = {
  /** brightness above which light blooms */
  threshold?: number;
  /** bloom strength */
  bloom?: number;
  /** anamorphic horizontal streak strength */
  streak?: number;
  /** chromatic aberration toward the edges */
  aberration?: number;
  exposure?: number;
  grain?: number;
  /** lens vignette 0..1 */
  vignette?: number;
};

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.0,1.0);}`;

// ---- post passes (GLSL 100, run on WebGL2 for float render targets) ----
const P = "precision highp float;\n";

/** 4-tap downsample with a soft-knee bright pass (threshold 0 = plain downsample) */
const BRIGHT = `${P}
uniform sampler2D uSrc; uniform vec2 uTexel; uniform vec2 uDst; uniform float uThreshold;
void main(){
  vec2 uv = gl_FragCoord.xy / uDst;
  vec3 c = texture2D(uSrc, uv + uTexel*vec2(-1.0,-1.0)).rgb + texture2D(uSrc, uv + uTexel*vec2(1.0,-1.0)).rgb
         + texture2D(uSrc, uv + uTexel*vec2(-1.0,1.0)).rgb + texture2D(uSrc, uv + uTexel*vec2(1.0,1.0)).rgb;
  c = min(c * 0.25, vec3(60.0));                       // no fireflies
  float l = max(c.r, max(c.g, c.b));
  float knee = uThreshold * 0.5 + 1e-4;
  float soft = clamp(l - uThreshold + knee, 0.0, 2.0 * knee);
  soft = soft * soft / (4.0 * knee);
  gl_FragColor = vec4(c * max(soft, l - uThreshold) / max(l, 1e-4), 1.0);
}`;

/** 9-tap Gaussian in 5 linear fetches along uDir */
const BLUR = `${P}
uniform sampler2D uSrc; uniform vec2 uDir; uniform vec2 uDst;
void main(){
  vec2 uv = gl_FragCoord.xy / uDst;
  vec3 c = texture2D(uSrc, uv).rgb * 0.2270270270;
  c += (texture2D(uSrc, uv + uDir*1.3846153846).rgb + texture2D(uSrc, uv - uDir*1.3846153846).rgb) * 0.3162162162;
  c += (texture2D(uSrc, uv + uDir*3.2307692308).rgb + texture2D(uSrc, uv - uDir*3.2307692308).rgb) * 0.0702702703;
  gl_FragColor = vec4(c, 1.0);
}`;

/** lens + film: aberration, bloom, anamorphic streak, ACES tone map, vignette, grain */
const COMPOSITE = `${P}
uniform sampler2D uScene; uniform sampler2D uBloomH; uniform sampler2D uBloomQ; uniform sampler2D uStreak;
uniform vec2 uRes; uniform float uTime;
uniform float uExposure; uniform float uBloom; uniform float uStreakAmt; uniform float uAberr; uniform float uGrain; uniform float uVignette;
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
vec3 aces(vec3 x){ return clamp((x*(2.51*x + 0.03)) / (x*(2.43*x + 0.59) + 0.14), 0.0, 1.0); }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 d = uv - 0.5;
  vec2 off = d * dot(d, d) * uAberr;
  vec3 c = vec3(texture2D(uScene, uv - off).r, texture2D(uScene, uv).g, texture2D(uScene, uv + off).b);
  vec3 bloom = texture2D(uBloomH, uv).rgb * 0.55 + texture2D(uBloomQ, uv).rgb;
  vec3 streak = texture2D(uStreak, uv).rgb * vec3(0.72, 0.86, 1.2);
  c += bloom * uBloom + streak * uStreakAmt;
  c *= uExposure;
  float vig = 1.0 - dot(d * vec2(uRes.x / uRes.y, 1.0), d) * 1.1;
  c *= mix(1.0, clamp(vig, 0.0, 1.0), uVignette);
  c = aces(c);
  c = pow(c, vec3(0.96, 1.0, 1.03));
  float g = hash(gl_FragCoord.xy + fract(uTime) * 91.0) + hash(gl_FragCoord.xy * 1.7 - fract(uTime * 1.3) * 57.0) - 1.0;
  c += g * uGrain * (1.0 - c * 0.6);                    // film grain, quieter in highlights
  gl_FragColor = vec4(c, 1.0);
}`;

const SCENE_UNIT = 4; // scene textures live on units 4+, post passes use 0..3

type Target = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };

/**
 * Tiny full-screen fragment-shader canvas (no three.js).
 * - Provides uTime, uRes, uMouse (-1..1, eased) automatically.
 * - `uniforms()` is read every frame for extra values (scroll progress etc.).
 * - `post`: render the scene in HDR (float target, `#define HDR`) and finish it
 *   like a camera: bloom, anamorphic streak, aberration, ACES, vignette, grain.
 *   Falls back to a single pass where float targets aren't supported.
 * - Pauses when off screen; renders a single still frame for reduced motion.
 */
export function ShaderCanvas({
  frag,
  uniforms,
  className,
  maxDpr = 1.5,
  scale = 1,
  textures,
  post,
  onReady,
  active,
}: {
  frag: string;
  uniforms?: () => Uniforms;
  /** sampler2D uniforms, built once on mount (power-of-two sizes get mipmaps + repeat) */
  textures?: () => Record<string, TexImageSource>;
  className?: string;
  maxDpr?: number;
  /** render resolution multiplier (0.5 = half-res, cheaper) */
  scale?: number;
  post?: PostSettings;
  /** called once, after the first frame has actually reached the screen */
  onReady?: () => void;
  /** read every frame: return false to skip drawing (e.g. while the scene is fully dark) */
  active?: () => boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef(uniforms);
  const readyRef = useRef(onReady);
  const activeRef = useRef(active);
  useEffect(() => {
    uniformsRef.current = uniforms;
    readyRef.current = onReady;
    activeRef.current = active;
  }, [uniforms, onReady, active]);
  const postKey = post ? JSON.stringify(post) : "";

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const settings: PostSettings | null = postKey ? JSON.parse(postKey) : null;

    // a fresh canvas per mount: a context lost in cleanup can't be reused (React dev double-mount)
    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);
    const attrs: WebGLContextAttributes = { antialias: false, alpha: true, premultipliedAlpha: false };
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
    let hdr = false;
    if (settings) {
      const gl2 = canvas.getContext("webgl2", attrs) as WebGL2RenderingContext | null;
      if (gl2 && gl2.getExtension("EXT_color_buffer_float")) hdr = true;
      gl = gl2;
    }
    gl = gl ?? (canvas.getContext("webgl", attrs) as WebGLRenderingContext | null);
    if (!gl) {
      canvas.remove();
      return;
    }
    const g = gl;

    const compile = (type: number, src: string) => {
      const s = g.createShader(type)!;
      g.shaderSource(s, src);
      g.compileShader(s);
      if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.error(g.getShaderInfoLog(s));
      return s;
    };
    const vs = compile(g.VERTEX_SHADER, VERT);
    const makeProgram = (src: string) => {
      const prog = g.createProgram()!;
      g.attachShader(prog, vs);
      g.attachShader(prog, compile(g.FRAGMENT_SHADER, src));
      g.bindAttribLocation(prog, 0, "a");
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) console.error(g.getProgramInfoLog(prog));
      const locs = new Map<string, WebGLUniformLocation | null>();
      const u = (name: string) => {
        if (!locs.has(name)) locs.set(name, g.getUniformLocation(prog, name));
        return locs.get(name)!;
      };
      return { prog, u };
    };
    type Prog = ReturnType<typeof makeProgram>;

    const scene = makeProgram((hdr ? "#define HDR\n" : "") + P + frag);

    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    g.enableVertexAttribArray(0);
    g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0);

    // scene textures
    g.useProgram(scene.prog);
    Object.entries(textures?.() ?? {}).forEach(([name, src], i) => {
      const unit = SCENE_UNIT + i;
      const tex = g.createTexture();
      g.activeTexture(g.TEXTURE0 + unit);
      g.bindTexture(g.TEXTURE_2D, tex);
      g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, src);
      const w = (src as { width: number }).width;
      const h = (src as { height: number }).height;
      const pot = (w & (w - 1)) === 0 && (h & (h - 1)) === 0;
      if (pot) {
        g.generateMipmap(g.TEXTURE_2D);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.REPEAT);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.REPEAT);
      } else {
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      }
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.uniform1i(scene.u(name), unit);
    });
    g.activeTexture(g.TEXTURE0);

    // ---- HDR post chain ----
    let bright: Prog | null = null;
    let blur: Prog | null = null;
    let comp: Prog | null = null;
    let targets: Record<"scene" | "hA" | "hB" | "qA" | "qB" | "sA" | "sB", Target> | null = null;
    const gl2 = g as WebGL2RenderingContext;

    const makeTarget = (w: number, h: number): Target => {
      const tex = g.createTexture()!;
      g.bindTexture(g.TEXTURE_2D, tex);
      g.texImage2D(g.TEXTURE_2D, 0, gl2.RGBA16F, w, h, 0, g.RGBA, gl2.HALF_FLOAT, null);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
      g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
      const fb = g.createFramebuffer()!;
      g.bindFramebuffer(g.FRAMEBUFFER, fb);
      g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0);
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      return { fb, tex, w, h };
    };
    const freeTargets = () => {
      if (!targets) return;
      Object.values(targets).forEach((t) => {
        g.deleteFramebuffer(t.fb);
        g.deleteTexture(t.tex);
      });
      targets = null;
    };
    const buildTargets = (w: number, h: number) => {
      freeTargets();
      const hw = Math.max(1, w >> 1), hh = Math.max(1, h >> 1);
      const qw = Math.max(1, w >> 2), qh = Math.max(1, h >> 2);
      targets = {
        scene: makeTarget(w, h),
        hA: makeTarget(hw, hh),
        hB: makeTarget(hw, hh),
        qA: makeTarget(qw, qh),
        qB: makeTarget(qw, qh),
        sA: makeTarget(qw, qh),
        sB: makeTarget(qw, qh),
      };
      g.bindFramebuffer(g.FRAMEBUFFER, targets.scene.fb);
      const ok = g.checkFramebufferStatus(g.FRAMEBUFFER) === g.FRAMEBUFFER_COMPLETE;
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      if (!ok) {
        // float targets not renderable after all: rebuild the scene as a single pass
        freeTargets();
        hdr = false;
      }
    };

    if (hdr && settings) {
      bright = makeProgram(BRIGHT);
      blur = makeProgram(BLUR);
      comp = makeProgram(COMPOSITE);
      g.useProgram(comp.prog);
      ["uScene", "uBloomH", "uBloomQ", "uStreak"].forEach((n, i) => g.uniform1i(comp!.u(n), i));
      g.uniform1f(comp.u("uExposure"), settings.exposure ?? 1);
      g.uniform1f(comp.u("uBloom"), settings.bloom ?? 0.4);
      g.uniform1f(comp.u("uStreakAmt"), settings.streak ?? 0.2);
      g.uniform1f(comp.u("uAberr"), settings.aberration ?? 0.012);
      g.uniform1f(comp.u("uGrain"), settings.grain ?? 0.035);
      g.uniform1f(comp.u("uVignette"), settings.vignette ?? 0.3);
      g.useProgram(bright.prog);
      g.uniform1i(bright.u("uSrc"), 0);
      g.useProgram(blur.prog);
      g.uniform1i(blur.u("uSrc"), 0);
    }

    const pass = (p: Prog, src: Target, dst: Target | null, set: (p: Prog) => void) => {
      g.useProgram(p.prog);
      g.bindFramebuffer(g.FRAMEBUFFER, dst ? dst.fb : null);
      g.viewport(0, 0, dst ? dst.w : canvas.width, dst ? dst.h : canvas.height);
      g.activeTexture(g.TEXTURE0);
      g.bindTexture(g.TEXTURE_2D, src.tex);
      g.uniform2f(p.u("uDst"), dst ? dst.w : canvas.width, dst ? dst.h : canvas.height);
      set(p);
      g.drawArrays(g.TRIANGLES, 0, 3);
    };
    const blurPass = (src: Target, dst: Target, dx: number, dy: number) =>
      pass(blur!, src, dst, (p) => g.uniform2f(p.u("uDir"), dx / src.w, dy / src.h));
    const brightPass = (src: Target, dst: Target, threshold: number) =>
      pass(bright!, src, dst, (p) => {
        g.uniform2f(p.u("uTexel"), 0.5 / src.w, 0.5 / src.h);
        g.uniform1f(p.u("uThreshold"), threshold);
      });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const setExtras = (p: Prog, extra: Uniforms) => {
      for (const [k, v] of Object.entries(extra)) {
        const l = p.u(k);
        if (!l) continue;
        if (typeof v === "number") g.uniform1f(l, v);
        else if (v.length === 2) g.uniform2f(l, v[0], v[1]);
        else g.uniform3f(l, v[0], v[1], v[2]);
      }
    };

    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const time = reduced ? 12 : (now - start) / 1000;
      const extra = uniformsRef.current?.() ?? {};
      const t = hdr ? targets : null;

      // scene
      g.useProgram(scene.prog);
      if (t) {
        // nothing the scene doesn't sample may stay bound to the target it writes
        for (let i = 0; i < 4; i++) {
          g.activeTexture(g.TEXTURE0 + i);
          g.bindTexture(g.TEXTURE_2D, null);
        }
      }
      g.bindFramebuffer(g.FRAMEBUFFER, t ? t.scene.fb : null);
      g.viewport(0, 0, canvas.width, canvas.height);
      g.uniform1f(scene.u("uTime"), time);
      g.uniform2f(scene.u("uRes"), canvas.width, canvas.height);
      g.uniform2f(scene.u("uMouse"), mouse.x, mouse.y);
      setExtras(scene, extra);
      g.drawArrays(g.TRIANGLES, 0, 3);
      if (!t || !settings) return;

      // bloom: bright pass at half res, two widening blurs, then a wider quarter-res bloom
      brightPass(t.scene, t.hA, settings.threshold ?? 0.9);
      brightPass(t.hA, t.sA, (settings.threshold ?? 0.9) * 1.6); // only the hottest light streaks
      blurPass(t.hA, t.hB, 1, 0);
      blurPass(t.hB, t.hA, 0, 1);
      blurPass(t.hA, t.hB, 2, 0);
      blurPass(t.hB, t.hA, 0, 2);
      brightPass(t.hA, t.qA, 0);
      blurPass(t.qA, t.qB, 1.5, 0);
      blurPass(t.qB, t.qA, 0, 1.5);
      blurPass(t.qA, t.qB, 3, 0);
      blurPass(t.qB, t.qA, 0, 3);
      // anamorphic streak: horizontal only, each pass wider than the last
      blurPass(t.sA, t.sB, 1, 0);
      blurPass(t.sB, t.sA, 3, 0);
      blurPass(t.sA, t.sB, 8, 0);
      blurPass(t.sB, t.sA, 20, 0);

      // composite to screen
      const c = comp!;
      g.useProgram(c.prog);
      g.bindFramebuffer(g.FRAMEBUFFER, null);
      g.viewport(0, 0, canvas.width, canvas.height);
      [t.scene, t.hA, t.qA, t.sA].forEach((tg, i) => {
        g.activeTexture(g.TEXTURE0 + i);
        g.bindTexture(g.TEXTURE_2D, tg.tex);
      });
      g.activeTexture(g.TEXTURE0);
      g.uniform2f(c.u("uRes"), canvas.width, canvas.height);
      g.uniform1f(c.u("uTime"), time);
      setExtras(c, extra);
      g.drawArrays(g.TRIANGLES, 0, 3);
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr) * scale;
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        if (hdr) buildTargets(w, h);
        draw(performance.now()); // resizing clears the buffer: repaint now, not next frame
      }
    };

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);

    // the first frame is the slow one (shader compile, texture upload): report ready only once it is on screen
    let frames = 0;
    const loop = (now: number) => {
      if (visible && activeRef.current?.() !== false) {
        draw(now);
        frames += 1;
        if (frames === 2) readyRef.current?.();
      }
      raf = requestAnimationFrame(loop);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    if (reduced) {
      draw(performance.now());
      readyRef.current?.();
    }
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      freeTargets();
      g.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [frag, maxDpr, scale, textures, postKey]);

  return <div ref={ref} className={clsx("h-full w-full", className)} aria-hidden />;
}
