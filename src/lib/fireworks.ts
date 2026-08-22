/** Smooth fireworks + sparkle-trail engine on a single canvas. 🎆 */

type P = {
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; color: string; size: number;
  kind: "rocket" | "spark" | "trail";
  targetY?: number;
  hue?: number;
};

const PALETTE = ["#ff5d73", "#ffd93d", "#6bcb77", "#4d96ff", "#c780e8", "#ff9f45", "#ffffff", "#5ce1e6"];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(a: T[]) => a[(Math.random() * a.length) | 0];

class Fireworks {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private ps: P[] = [];
  private raf = 0;
  private autoTimer: number | null = null;
  private last = 0;
  onBurst: ((x: number, y: number) => void) | null = null;

  attach(c: HTMLCanvasElement) {
    this.canvas = c;
    this.ctx = c.getContext("2d");
    this.resize();
    window.addEventListener("resize", this.resize);
    return () => {
      window.removeEventListener("resize", this.resize);
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.stopAuto();
      this.canvas = null;
      this.ctx = null;
    };
  }

  private resize = () => {
    const c = this.canvas;
    if (!c) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
    c.style.width = "100%";
    c.style.height = "100%";
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  /** Launch a rocket that explodes near the given height. */
  launch(xFrac = Math.random(), topFrac = rand(0.12, 0.42)) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.ps.push({
      x: xFrac * w,
      y: h + 10,
      vx: rand(-0.7, 0.7),
      vy: -rand(9, 12.5),
      life: 0,
      max: 4,
      color: pick(PALETTE),
      size: 3,
      kind: "rocket",
      targetY: topFrac * h,
    });
    this.start();
  }

  /** Instant explosion at a screen position (fractions 0–1). */
  explode(xFrac: number, yFrac: number, color?: string, count = 90) {
    const x = xFrac * window.innerWidth;
    const y = yFrac * window.innerHeight;
    this.burst(x, y, color ?? pick(PALETTE), count);
    this.start();
  }

  private burst(x: number, y: number, color: string, count = 90) {
    const ring = Math.random() > 0.45;
    for (let i = 0; i < count; i++) {
      const a = ring ? (i / count) * Math.PI * 2 : rand(0, Math.PI * 2);
      const sp = ring ? rand(5.2, 6.6) : rand(1.2, 7.2);
      this.ps.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: rand(1.1, 2.1),
        color: Math.random() > 0.82 ? "#ffffff" : color,
        size: rand(1.6, 3.4),
        kind: "spark",
      });
    }
    this.onBurst?.(x / window.innerWidth, y / window.innerHeight);
  }

  /** Continuous show. */
  startAuto(intervalMs = 900) {
    this.stopAuto();
    this.launch();
    this.autoTimer = window.setInterval(() => {
      this.launch();
      if (Math.random() > 0.6) setTimeout(() => this.launch(), 260);
    }, intervalMs);
  }

  stopAuto() {
    if (this.autoTimer) window.clearInterval(this.autoTimer);
    this.autoTimer = null;
  }

  finale() {
    for (let i = 0; i < 7; i++) {
      setTimeout(() => this.launch(rand(0.08, 0.92), rand(0.1, 0.45)), i * 170);
    }
  }

  private start() {
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private tick = (now: number) => {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const dt = Math.min((now - this.last) / 16.67, 2.2);
    this.last = now;

    // motion-blur trails instead of a hard clear → much smoother look
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    for (let i = this.ps.length - 1; i >= 0; i--) {
      const p = this.ps[i];
      p.life += dt / 60;

      if (p.kind === "rocket") {
        p.vy += 0.14 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // sparkling exhaust
        if (Math.random() > 0.35) {
          this.ps.push({
            x: p.x + rand(-1.5, 1.5), y: p.y + 3,
            vx: rand(-0.4, 0.4), vy: rand(0.4, 1.4),
            life: 0, max: 0.5, color: "#ffcf6b", size: rand(1, 2), kind: "trail",
          });
        }
        if (p.vy >= -1.2 || (p.targetY !== undefined && p.y <= p.targetY)) {
          this.burst(p.x, p.y, p.color, 80 + ((Math.random() * 50) | 0));
          this.ps.splice(i, 1);
          continue;
        }
      } else {
        p.vy += (p.kind === "spark" ? 0.075 : 0.02) * dt;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }

      const fade = Math.max(0, 1 - p.life / p.max);
      const r = p.size * (p.kind === "spark" ? 0.6 + fade * 0.7 : 1);
      ctx.globalAlpha = fade;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      if (p.kind === "spark" && fade > 0.55) {
        ctx.globalAlpha = fade * 0.28;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.life > p.max || p.y > h + 60) this.ps.splice(i, 1);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";

    if (this.ps.length > 0 || this.autoTimer) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      ctx.clearRect(0, 0, w, h);
      this.raf = 0;
    }
  };
}

export const fireworks = new Fireworks();
