import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { fx } from "../lib/music";
import { confetti } from "../lib/confetti";

/** Gold-foil card you scratch off with a finger or mouse ✨ */
export default function ScratchCard({
  secret,
  hint = "Scratch the gold with your finger!",
}: {
  secret: string;
  hint?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const drawing = useRef(false);
  const [revealed, setRevealed] = useState(false);
  const lastCheck = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const paint = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const g = ctx.createLinearGradient(0, 0, r.width, r.height);
      g.addColorStop(0, "#f6c453");
      g.addColorStop(0.35, "#fff0b3");
      g.addColorStop(0.5, "#e8a33d");
      g.addColorStop(0.75, "#ffe08a");
      g.addColorStop(1, "#d98b26");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, r.width, r.height);

      ctx.fillStyle = "rgba(255,255,255,.45)";
      for (let i = 0; i < 90; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * r.width, Math.random() * r.height, Math.random() * 1.8, 0, 7);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(120,70,10,.55)";
      ctx.font = "700 16px Fredoka, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("✦ SCRATCH HERE ✦", r.width / 2, r.height / 2 + 6);
    };

    paint();
    window.addEventListener("resize", paint);
    return () => window.removeEventListener("resize", paint);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d")!;
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";

    const now = performance.now();
    if (now - lastCheck.current > 220) {
      lastCheck.current = now;
      checkProgress();
    }
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { width, height } = canvas;
    const img = ctx.getImageData(0, 0, width, height).data;
    let clear = 0;
    const step = 40; // sample every 10th pixel
    let total = 0;
    for (let i = 3; i < img.length; i += step) {
      total++;
      if (img[i] < 40) clear++;
    }
    if (clear / total > 0.48) {
      setRevealed(true);
      fx("sparkle");
      confetti.atElement(canvas, 80);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto aspect-[16/7] w-full max-w-xl overflow-hidden rounded-3xl border-4 border-amber-300/70 shadow-[0_24px_60px_-20px_rgba(0,0,0,.8)]"
    >
      {/* prize underneath */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-rose-500 px-5 text-center">
        <motion.span
          animate={revealed ? { scale: [0.6, 1.25, 1], rotate: [0, 12, 0] } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-4xl"
        >
          🎟️
        </motion.span>
        <p className="font-display text-lg leading-tight text-amber-200 sm:text-2xl">{secret}</p>
      </div>

      {/* foil */}
      <motion.canvas
        ref={canvasRef}
        animate={{ opacity: revealed ? 0 : 1, scale: revealed ? 1.04 : 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className={`absolute inset-0 h-full w-full touch-none ${revealed ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"}`}
        onPointerDown={(e) => {
          drawing.current = true;
          (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
          scratch(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => drawing.current && scratch(e.clientX, e.clientY)}
        onPointerUp={() => {
          drawing.current = false;
          checkProgress();
        }}
        onPointerLeave={() => (drawing.current = false)}
      />

      {!revealed && (
        <motion.p
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="pointer-events-none absolute bottom-2 left-0 right-0 text-center font-body text-xs text-amber-900"
        >
          {hint}
        </motion.p>
      )}
    </div>
  );
}
