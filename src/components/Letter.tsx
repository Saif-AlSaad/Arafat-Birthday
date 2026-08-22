import { useEffect, useRef, useState } from "react";
import { config } from "../config";

/** Handwritten note with a typewriter reveal once it scrolls into view */
export default function Letter() {
  const { letter, fromName } = config;
  const [shown, setShown] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (shown >= letter.length) return;
    const t = setTimeout(() => setShown((s) => s + 2), 22);
    return () => clearTimeout(t);
  }, [started, shown, letter.length]);

  return (
    <div
      ref={ref}
      className="relative mx-auto max-w-2xl rotate-[-0.6deg] rounded-2xl bg-amber-50 p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,.5)] sm:p-10"
      style={{
        backgroundImage:
          "repeating-linear-gradient(transparent, transparent 31px, #cbd5e1 32px)",
      }}
    >
      <span className="absolute -left-4 -top-5 text-5xl -rotate-12">💌</span>
      <p className="font-hand min-h-[220px] text-2xl leading-[2.05rem] text-slate-800 sm:text-3xl sm:leading-10">
        {letter.slice(0, shown)}
        <span className="ml-0.5 inline-block h-6 w-[2px] translate-y-1 animate-pulse bg-rose-500 align-middle" />
      </p>
      <p className="font-hand mt-4 text-right text-2xl text-rose-600 sm:text-3xl">
        — {fromName} ❤️
      </p>
    </div>
  );
}
