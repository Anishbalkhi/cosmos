"use client";

/**
 * Generated ambient sound (Web Audio, no audio files): a low space drone,
 * a hold "spin-up" and an entry whoosh. Only starts after a user gesture.
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let droneFilter: BiquadFilterNode | null = null;
const oscs: OscillatorNode[] = [];

function noiseBuffer(c: AudioContext, seconds = 2) {
  const buf = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02; // brown noise
    d[i] = last * 3.5;
  }
  return buf;
}

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  droneFilter = ctx.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 380;
  droneFilter.Q.value = 6;
  droneFilter.connect(master);

  [55, 82.41, 110.3].forEach((f, i) => {
    const o = ctx!.createOscillator();
    o.type = i === 1 ? "triangle" : "sine";
    o.frequency.value = f;
    o.detune.value = (i - 1) * 7;
    const g = ctx!.createGain();
    g.gain.value = i === 2 ? 0.05 : 0.12;
    o.connect(g).connect(droneFilter!);
    o.start();
    oscs.push(o);
  });

  const n = ctx.createBufferSource();
  n.buffer = noiseBuffer(ctx);
  n.loop = true;
  const ng = ctx.createGain();
  ng.gain.value = 0.05;
  n.connect(ng).connect(droneFilter);
  n.start();

  // slow breathing on the filter
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lg = ctx.createGain();
  lg.gain.value = 140;
  lfo.connect(lg).connect(droneFilter.frequency);
  lfo.start();
  return ctx;
}

export const ambient = {
  setOn(on: boolean) {
    const c = ensure();
    if (c.state === "suspended") void c.resume();
    master!.gain.cancelScheduledValues(c.currentTime);
    master!.gain.setTargetAtTime(on ? 0.5 : 0, c.currentTime, on ? 0.8 : 0.25);
  },
  /** 0..1 while holding: drone rises and opens up */
  setBoost(b: number) {
    if (!ctx || !droneFilter) return;
    droneFilter.frequency.setTargetAtTime(380 + b * 1400, ctx.currentTime, 0.15);
    oscs.forEach((o, i) => o.detune.setTargetAtTime((i - 1) * 7 + b * 700, ctx!.currentTime, 0.2));
  },
  /** a deep sub-bass hit (felt more than heard) with a muffled crack on top */
  thump(strength = 1) {
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(62, t);
    o.frequency.exponentialRampToValueAtTime(26, t + 1.4);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.0001, t);
    og.gain.exponentialRampToValueAtTime(0.9 * strength, t + 0.03);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
    o.connect(og).connect(master);
    o.start(t);
    o.stop(t + 1.9);

    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 1);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(900, t);
    lp.frequency.exponentialRampToValueAtTime(80, t + 0.6);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.0001, t);
    ng.gain.exponentialRampToValueAtTime(0.5 * strength, t + 0.01);
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    src.connect(lp).connect(ng).connect(master);
    src.start(t);
    src.stop(t + 0.8);
  },
  whoosh() {
    if (!ctx || !master) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, 2);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(2400, ctx.currentTime);
    bp.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 1.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 0.15);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
    src.connect(bp).connect(g).connect(master);
    src.start();
    src.stop(ctx.currentTime + 2);
  },
};
