/**
 * Tiny Web Audio engine — plays the "Happy Birthday" melody and sound effects
 * using oscillators only, so there are ZERO audio files to download. 🎵
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let loopTimer: number | null = null;
let isPlaying = false;

type Note = [freq: number, beats: number];

const N = {
  G4: 392.0, A4: 440.0, B4: 493.88, C5: 523.25,
  D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5,
};

// Happy Birthday to You 🎂
const MELODY: Note[] = [
  [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.C5, 1], [N.B4, 2],
  [N.G4, 0.75], [N.G4, 0.25], [N.A4, 1], [N.G4, 1], [N.D5, 1], [N.C5, 2],
  [N.G4, 0.75], [N.G4, 0.25], [N.G5, 1], [N.E5, 1], [N.C5, 1], [N.D5, 1], [N.C5, 2.5],
  [N.F5, 0.75], [N.F5, 0.25], [N.E5, 1], [N.C5, 1], [N.D5, 1], [N.C5, 2.5],
];

const BEAT = 0.36; // seconds per beat

function getCtx(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.22;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function melodyDuration() {
  return MELODY.reduce((sum, n) => sum + n[1], 0) * BEAT + 0.6;
}

function scheduleMelody(startAt: number) {
  const audio = getCtx();
  if (!masterGain) return;
  let t = startAt;

  MELODY.forEach(([freq, beats], i) => {
    const dur = beats * BEAT;

    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = i % 3 === 0 ? "triangle" : "sine";
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.92);

    osc.connect(gain).connect(masterGain!);
    osc.start(t);
    osc.stop(t + dur);

    // little harmony a third above on longer notes
    if (beats >= 1.5) {
      const h = audio.createOscillator();
      const hg = audio.createGain();
      h.type = "sine";
      h.frequency.setValueAtTime(freq * 1.5, t);
      hg.gain.setValueAtTime(0.0001, t);
      hg.gain.exponentialRampToValueAtTime(0.12, t + 0.05);
      hg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.9);
      h.connect(hg).connect(masterGain!);
      h.start(t);
      h.stop(t + dur);
    }

    t += dur;
  });
}

export const music = {
  toggle(): boolean {
    const audio = getCtx();
    if (isPlaying) {
      isPlaying = false;
      if (loopTimer) window.clearInterval(loopTimer);
      loopTimer = null;
      masterGain?.gain.setTargetAtTime(0.0001, audio.currentTime, 0.2);
    } else {
      isPlaying = true;
      masterGain?.gain.setTargetAtTime(0.22, audio.currentTime, 0.2);
      scheduleMelody(audio.currentTime + 0.15);
      const ms = melodyDuration() * 1000;
      loopTimer = window.setInterval(() => scheduleMelody(getCtx().currentTime + 0.1), ms);
    }
    return isPlaying;
  },
  get playing() {
    return isPlaying;
  },
  stop() {
    if (isPlaying) this.toggle();
  },
};

/** Generic blip used for clicks, pops and sparkles ✨ */
export function sfx(kind: "pop" | "click" | "whoosh" | "wow" | "blow" = "click") {
  try {
    const audio = getCtx();
    const t = audio.currentTime;

    if (kind === "pop") {
      const osc = audio.createOscillator();
      const g = audio.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12);
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      osc.connect(g).connect(audio.destination);
      osc.start(t);
      osc.stop(t + 0.2);
      return;
    }

    if (kind === "whoosh") {
      const buf = audio.createBuffer(1, audio.sampleRate * 0.5, audio.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      }
      const src = audio.createBufferSource();
      src.buffer = buf;
      const filter = audio.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(400, t);
      filter.frequency.exponentialRampToValueAtTime(2400, t + 0.45);
      const g = audio.createGain();
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      src.connect(filter).connect(g).connect(audio.destination);
      src.start(t);
      return;
    }

    if (kind === "blow") {
      const buf = audio.createBuffer(1, audio.sampleRate * 0.6, audio.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        const env = Math.sin((i / data.length) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env * 0.7;
      }
      const src = audio.createBufferSource();
      src.buffer = buf;
      const filter = audio.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 900;
      const g = audio.createGain();
      g.gain.setValueAtTime(0.35, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
      src.connect(filter).connect(g).connect(audio.destination);
      src.start(t);
      return;
    }

    if (kind === "wow") {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
        const osc = audio.createOscillator();
        const g = audio.createGain();
        const at = t + i * 0.09;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(f, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.3, at + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35);
        osc.connect(g).connect(audio.destination);
        osc.start(at);
        osc.stop(at + 0.4);
      });
      return;
    }

    // click
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);
    g.gain.setValueAtTime(0.14, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    osc.connect(g).connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  } catch {
    /* audio is a nice-to-have, never break the party for it */
  }
}
