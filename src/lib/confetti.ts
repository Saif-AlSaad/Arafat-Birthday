/** Canvas confetti engine — no dependencies, auto-stops when the party is over 🎊 */

type Particle = {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  rot: number; vr: number;
  color: string;
  shape: "rect" | "circle" | "star";
  life: number; maxLife: number;
  wobble: number;
};

const COLORS = [
  "#ff5d73", "#ffd93d", "#6bcB77", "#4d96ff", "#c780e8",
  "#ff9f45", "#ffffff", "#ff5cf0",
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(arr: T[]): T => arr[(Math.random() * arr.length) | 0];

class ConfettiEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private raf = 0;
  private dpr = 1;

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", this.resize);
    return () => {
      window.removeEventListener("resize", this.resize);
      cancelAnimationFrame(this.raf);
      this.canvas = null;
      this.ctx = null;
    };
  }

  private resize = () => {
    if (!this.canvas) return;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * this.dpr;
    this.canvas.height = window.innerHeight * this.dpr;
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.ctx?.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  };

  /** Explosion from a point (fractions of screen, 0–1) */
  burst(xFrac = 0.5, yFrac = 0.6, count = 120, power = 15) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(power * 0.25, power);
      this.particles.push({
        x: xFrac * w,
        y: yFrac * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        size: rand(6, 13),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.28, 0.28),
        color: pick(COLORS),
        shape: pick(["rect", "circle", "star"] as const),
        life: 0,
        maxLife: rand(2.4, 4.4),
        wobble: rand(0, Math.PI * 2),
      });
    }
    this.start();
  }

  /** Two cannons firing inward from the bottom corners */
  cannon(count = 90) {
    this.burst(0.02, 0.95, count, 22);
    this.burst(0.98, 0.95, count, 22);
    setTimeout(() => this.burst(0.5, 0.85, count, 20), 260);
  }

  /** Gentle falling shower across the whole screen */
  rain(count = 90) {
    const w = window.innerWidth;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: rand(0, w),
        y: rand(-window.innerHeight, 0),
        vx: rand(-1.2, 1.2),
        vy: rand(2.2, 5.5),
        size: rand(5, 12),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.2, 0.2),
        color: pick(COLORS),
        shape: pick(["rect", "circle", "star"] as const),
        life: 0,
        maxLife: rand(4, 7),
        wobble: rand(0, Math.PI * 2),
      });
    }
    this.start();
  }

  /** Small celebration at an element's centre */
  atElement(el: Element | null, count = 70) {
    if (!el) return this.burst(0.5, 0.5, count);
    const r = el.getBoundingClientRect();
    this.burst(
      (r.left + r.width / 2) / window.innerWidth,
      (r.top + r.height / 2) / window.innerHeight,
      count,
      12
    );
  }

  private start() {
    if (this.raf) return;
    this.tick();
  }

  private tick = () => {
    const ctx = this.ctx;
    if (!ctx) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);

    const dt = 1 / 60;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.vy += 0.36; // gravity
      p.vx *= 0.992;
      p.wobble += 0.14;
      p.x += p.vx + Math.sin(p.wobble) * 0.9;
      p.y += p.vy;
      p.rot += p.vr;

      const fade = Math.max(0, 1 - p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = Math.min(1, fade * 1.6);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "star") {
        drawStar(ctx, p.size / 1.7);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      }
      ctx.restore();

      if (p.life > p.maxLife || p.y > h + 80) this.particles.splice(i, 1);
    }

    if (this.particles.length > 0) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      ctx.clearRect(0, 0, w, h);
      this.raf = 0;
    }
  };
}

function drawStar(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
  ctx.fill();
}

export const confetti = new ConfettiEngine();
