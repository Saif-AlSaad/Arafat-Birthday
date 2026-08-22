/**
 * 🎹 "Happy Birthday" — full arrangement, generated live in the browser.
 * Melody (music-box/piano tone) + bass + warm chord pad + light percussion.
 * Uses a look-ahead scheduler so timing stays rock solid, and exposes an
 * AnalyserNode so the UI can draw a live visualiser.
 * No audio files = nothing extra to host. 🎵
 */

/* ---------------------------------- notes --------------------------------- */
const NOTE: Record<string, number> = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, Bb2: 116.54, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, Bb3: 233.08, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, Bb4: 466.16, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, C6: 1046.5,
};

type Ev = { t: number; d: number; n: string };

/** 3/4 time. Beat 0 is the two-quaver pickup: "Hap-py". */
const MELODY: Ev[] = [
  { t: 0, d: 0.5, n: "G4" }, { t: 0.5, d: 0.5, n: "G4" },
  { t: 1, d: 1, n: "A4" }, { t: 2, d: 1, n: "G4" }, { t: 3, d: 1, n: "C5" },
  { t: 4, d: 2, n: "B4" },
  { t: 6, d: 0.5, n: "G4" }, { t: 6.5, d: 0.5, n: "G4" },
  { t: 7, d: 1, n: "A4" }, { t: 8, d: 1, n: "G4" }, { t: 9, d: 1, n: "D5" },
  { t: 10, d: 2, n: "C5" },
  { t: 12, d: 0.5, n: "G4" }, { t: 12.5, d: 0.5, n: "G4" },
  { t: 13, d: 1, n: "G5" }, { t: 14, d: 1, n: "E5" }, { t: 15, d: 1, n: "C5" },
  { t: 16, d: 1, n: "B4" }, { t: 17, d: 1, n: "A4" },
  { t: 18, d: 0.5, n: "F5" }, { t: 18.5, d: 0.5, n: "F5" },
  { t: 19, d: 1, n: "E5" }, { t: 20, d: 1, n: "C5" }, { t: 21, d: 1, n: "D5" },
  { t: 22, d: 2.5, n: "C5" },
];

/** Harmony under the tune. */
const CHORDS: { t: number; d: number; notes: string[] }[] = [
  { t: 0, d: 4, notes: ["C3", "E3", "G3"] },
  { t: 4, d: 6, notes: ["G2", "B2", "D3", "F3"] },
  { t: 10, d: 6, notes: ["C3", "E3", "G3"] },
  { t: 16, d: 2, notes: ["C3", "E3", "Bb3"] },
  { t: 18, d: 2, notes: ["F2", "A2", "C3"] },
  { t: 20, d: 1, notes: ["C3", "E3", "G3"] },
  { t: 21, d: 1, notes: ["G2", "B2", "F3"] },
  { t: 22, d: 4, notes: ["C3", "E3", "G3"] },
];

const BASS: Ev[] = [
  { t: 0, d: 1, n: "C2" }, { t: 1, d: 1, n: "G2" }, { t: 2, d: 1, n: "E2" }, { t: 3, d: 1, n: "G2" },
  { t: 4, d: 1, n: "G2" }, { t: 5, d: 1, n: "D3" }, { t: 6, d: 1, n: "G2" },
  { t: 7, d: 1, n: "B2" }, { t: 8, d: 1, n: "G2" }, { t: 9, d: 1, n: "D3" },
  { t: 10, d: 1, n: "C2" }, { t: 11, d: 1, n: "G2" }, { t: 12, d: 1, n: "C2" },
  { t: 13, d: 1, n: "E2" }, { t: 14, d: 1, n: "G2" }, { t: 15, d: 1, n: "C3" },
  { t: 16, d: 1, n: "C2" }, { t: 17, d: 1, n: "Bb2" },
  { t: 18, d: 1, n: "F2" }, { t: 19, d: 1, n: "C3" },
  { t: 20, d: 1, n: "C2" }, { t: 21, d: 1, n: "G2" },
  { t: 22, d: 1, n: "C2" }, { t: 23, d: 1, n: "G2" }, { t: 24, d: 2, n: "C2" },
];

const LOOP_BEATS = 26;
const BPM = 116;
const SPB = 60 / BPM; // seconds per beat

/* --------------------------------- engine -------------------------------- */
class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private melodyBus: GainNode | null = null;
  private padBus: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private timer: number | null = null;
  private nextBeatTime = 0;
  private beatCursor = 0;
  private playing = false;
  private vol = 0.65;
  private listeners = new Set<(p: boolean) => void>();

  /* ---- public api ---- */
  get isPlaying() {
    return this.playing;
  }
  get volume() {
    return this.vol;
  }
  onChange(fn: (p: boolean) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  getAnalyser() {
    return this.analyser;
  }

  setVolume(v: number) {
    this.vol = v;
    const a = this.ctx;
    if (this.playing && this.master && a) {
      this.master.gain.setTargetAtTime(v * 0.5, a.currentTime, 0.06);
    }
  }

  play() {
    const a = this.ensure();
    if (this.playing) return;
    this.playing = true;
    this.master!.gain.setTargetAtTime(this.vol * 0.5, a.currentTime, 0.12);
    this.nextBeatTime = a.currentTime + 0.12;
    this.beatCursor = 0;
    this.timer = window.setInterval(() => this.schedule(), 60);
    this.schedule();
    this.emit();
  }

  pause() {
    if (!this.playing) return;
    this.playing = false;
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    const a = this.ctx;
    if (this.master && a) this.master.gain.setTargetAtTime(0.0001, a.currentTime, 0.1);
    this.emit();
  }

  toggle() {
    this.playing ? this.pause() : this.play();
    return this.playing;
  }

  /** One-shot sound effects, routed around the music bus. */
  fx(kind: "pop" | "tap" | "whoosh" | "sparkle" | "blow" | "fanfare") {
    try {
      const a = this.ensure();
      const t = a.currentTime;
      const out = a.destination;

      if (kind === "pop" || kind === "tap") {
        const o = a.createOscillator();
        const g = a.createGain();
        o.type = kind === "pop" ? "sine" : "square";
        o.frequency.setValueAtTime(kind === "pop" ? 260 : 720, t);
        o.frequency.exponentialRampToValueAtTime(kind === "pop" ? 960 : 1180, t + 0.09);
        g.gain.setValueAtTime(kind === "pop" ? 0.3 : 0.12, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        o.connect(g).connect(out);
        o.start(t);
        o.stop(t + 0.2);
        return;
      }

      if (kind === "whoosh" || kind === "blow") {
        const len = kind === "blow" ? 0.62 : 0.5;
        const buf = a.createBuffer(1, a.sampleRate * len, a.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
          const env = kind === "blow" ? Math.sin((i / d.length) * Math.PI) : 1 - i / d.length;
          d[i] = (Math.random() * 2 - 1) * env;
        }
        const src = a.createBufferSource();
        src.buffer = buf;
        const f = a.createBiquadFilter();
        f.type = kind === "blow" ? "highpass" : "bandpass";
        f.frequency.setValueAtTime(kind === "blow" ? 800 : 380, t);
        if (kind === "whoosh") f.frequency.exponentialRampToValueAtTime(2600, t + 0.45);
        const g = a.createGain();
        g.gain.setValueAtTime(0.32, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        src.connect(f).connect(g).connect(out);
        src.start(t);
        return;
      }

      if (kind === "sparkle") {
        [1046, 1318, 1568, 2093].forEach((f, i) => {
          const o = a.createOscillator();
          const g = a.createGain();
          const at = t + i * 0.055;
          o.type = "sine";
          o.frequency.setValueAtTime(f, at);
          g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(0.16, at + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, at + 0.3);
          o.connect(g).connect(out);
          o.start(at);
          o.stop(at + 0.34);
        });
        return;
      }

      // fanfare
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const at = t + i * 0.11;
        [f, f * 2].forEach((freq, k) => {
          const o = a.createOscillator();
          const g = a.createGain();
          o.type = k ? "sine" : "triangle";
          o.frequency.setValueAtTime(freq, at);
          g.gain.setValueAtTime(0.0001, at);
          g.gain.exponentialRampToValueAtTime(k ? 0.08 : 0.24, at + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
          o.connect(g).connect(out);
          o.start(at);
          o.stop(at + 0.55);
        });
      });
    } catch {
      /* never let audio break the party */
    }
  }

  /* ---- internals ---- */
  private emit() {
    this.listeners.forEach((fn) => fn(this.playing));
  }

  private ensure(): AudioContext {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const a: AudioContext = new AC();
      this.ctx = a;

      this.master = a.createGain();
      this.master.gain.value = 0.0001;

      const comp = a.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.ratio.value = 4;

      this.analyser = a.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.72;

      this.melodyBus = a.createGain();
      this.melodyBus.gain.value = 0.85;
      this.padBus = a.createGain();
      this.padBus.gain.value = 0.4;

      this.melodyBus.connect(this.master);
      this.padBus.connect(this.master);
      this.master.connect(comp);
      comp.connect(this.analyser);
      this.analyser.connect(a.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** Look-ahead scheduler: queue everything happening in the next ~0.35s. */
  private schedule() {
    const a = this.ctx;
    if (!a || !this.playing) return;
    const horizon = a.currentTime + 0.35;

    while (this.nextBeatTime < horizon) {
      const beat = this.beatCursor % LOOP_BEATS;
      const t = this.nextBeatTime;

      MELODY.filter((e) => e.t >= beat && e.t < beat + 1).forEach((e) =>
        this.piano(t + (e.t - beat) * SPB, NOTE[e.n], e.d * SPB)
      );
      BASS.filter((e) => e.t >= beat && e.t < beat + 1).forEach((e) =>
        this.bass(t + (e.t - beat) * SPB, NOTE[e.n], e.d * SPB)
      );
      CHORDS.filter((c) => c.t >= beat && c.t < beat + 1).forEach((c) =>
        this.pad(t + (c.t - beat) * SPB, c.notes.map((n) => NOTE[n]), c.d * SPB)
      );

      this.shaker(t, beat % 3 === 0 ? 0.09 : 0.05);
      if (beat % 3 === 1) this.kick(t);

      this.nextBeatTime += SPB;
      this.beatCursor += 1;
    }
  }

  /** Bell-like music-box tone: fundamental + octave + shimmer, fast decay. */
  private piano(t: number, freq: number, dur: number) {
    const a = this.ctx!;
    const partials: [number, number, OscillatorType][] = [
      [1, 0.5, "triangle"],
      [2, 0.16, "sine"],
      [3.01, 0.07, "sine"],
      [0.5, 0.1, "sine"],
    ];
    partials.forEach(([mult, amp, type]) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq * mult, t);
      const len = Math.max(dur * 1.35, 0.4);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(amp, t + 0.012);
      g.gain.exponentialRampToValueAtTime(amp * 0.28, t + Math.min(0.22, len * 0.4));
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      o.connect(g).connect(this.melodyBus!);
      o.start(t);
      o.stop(t + len + 0.05);
    });
  }

  private bass(t: number, freq: number, dur: number) {
    const a = this.ctx!;
    const o = a.createOscillator();
    const g = a.createGain();
    const f = a.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 620;
    o.type = "triangle";
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.95);
    o.connect(f).connect(g).connect(this.padBus!);
    o.start(t);
    o.stop(t + dur);
  }

  private pad(t: number, freqs: number[], dur: number) {
    const a = this.ctx!;
    freqs.forEach((freq, i) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq * 2, t);
      o.detune.setValueAtTime((i - 1) * 5, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.075, t + 0.14);
      g.gain.setValueAtTime(0.075, t + dur * 0.7);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(this.padBus!);
      o.start(t);
      o.stop(t + dur + 0.05);
    });
  }

  private shaker(t: number, amp: number) {
    const a = this.ctx!;
    const buf = a.createBuffer(1, a.sampleRate * 0.08, a.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const src = a.createBufferSource();
    src.buffer = buf;
    const f = a.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = 5200;
    const g = a.createGain();
    g.gain.value = amp;
    src.connect(f).connect(g).connect(this.padBus!);
    src.start(t);
  }

  private kick(t: number) {
    const a = this.ctx!;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(132, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.13);
    g.gain.setValueAtTime(0.26, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g).connect(this.padBus!);
    o.start(t);
    o.stop(t + 0.22);
  }
}

export const music = new MusicEngine();
export const fx = (k: Parameters<MusicEngine["fx"]>[0]) => music.fx(k);
