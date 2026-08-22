import { useEffect, useState } from "react";
import { config } from "../config";
import { sfx } from "../lib/audio";
import { confetti } from "../lib/confetti";

export default function Cake({ onAllOut }: { onAllOut: () => void }) {
  const total = config.age;
  const [blown, setBlown] = useState<boolean[]>(() => Array(total).fill(false));
  const [smokes, setSmokes] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const countBlown = blown.filter(Boolean).length;

  const blowOne = (i: number) => {
    if (blown[i]) return;
    sfx("blow");
    setBlown((prev) => prev.map((b, idx) => (idx === i ? true : b)));
    setSmokes((prev) => [...prev, i]);
    confetti.burst(0.5, 0.55, 10, 6);
    setTimeout(() => setSmokes((prev) => prev.filter((s) => s !== i)), 1100);
  };

  const blowAll = () => {
    if (done) return;
    sfx("blow");
    [...Array(total).keys()]
      .filter((i) => !blown[i])
      .forEach((i, k) => setTimeout(() => blowOne(i), k * 130));
  };

  useEffect(() => {
    if (!done && countBlown === total) {
      setDone(true);
      const t = setTimeout(() => {
        sfx("wow");
        confetti.cannon(110);
        confetti.rain(70);
        onAllOut();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [countBlown, total, done, onAllOut]);

  return (
    <div className="flex flex-col items-center">
      {/* candles */}
      <div className="mb-1 flex flex-wrap items-end justify-center gap-1.5 sm:gap-3">
        {Array.from({ length: total }).map((_, i) => (
          <button
            key={i}
            onClick={() => blowOne(i)}
            aria-label={`Blow out candle ${i + 1}`}
            className="group relative flex w-4 flex-col items-center focus:outline-none sm:w-5"
          >
            {/* smoke */}
            {smokes.includes(i) && (
              <span className="smoke absolute -top-4 left-1/2 z-10 h-6 w-6 -translate-x-1/2 rounded-full bg-gradient-to-t from-white/0 to-white/70 blur-[3px]" />
            )}
            {/* flame */}
            <span
              className={`relative mb-0.5 block h-6 w-3.5 transition-opacity duration-300 sm:h-7 sm:w-4 ${
                blown[i] ? "pointer-events-none opacity-0" : "flame"
              }`}
            >
              <span
                className="absolute inset-0 rounded-[50%_50%_45%_45%/62%_62%_38%_38%] bg-orange-400"
                style={{ boxShadow: "0 0 14px 5px rgba(255,180,60,.75)" }}
              />
              <span className="absolute inset-y-[28%] left-1/2 w-[45%] -translate-x-1/2 rounded-[50%] bg-yellow-200" />
            </span>
            {/* stick */}
            <span
              className={`h-9 w-full rounded-t-full bg-[repeating-linear-gradient(45deg,#ff5d73_0_4px,#fff_4px_8px)] shadow-inner transition group-hover:brightness-110 sm:h-11`}
            />
          </button>
        ))}
      </div>

      {/* cake layers */}
      <div className="relative w-[min(88vw,380px)]">
        <div className="relative mx-auto h-14 w-[86%] rounded-t-3xl bg-gradient-to-b from-pink-200 via-pink-300 to-pink-400 shadow-lg sm:h-16">
          {/* frosting drips */}
          <div className="absolute -top-1 left-0 right-0 flex justify-between px-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <span
                key={i}
                className="w-[7%] rounded-b-full bg-white"
                style={{ height: 12 + (i % 3) * 7 }}
              />
            ))}
          </div>
          {/* sprinkles */}
          {Array.from({ length: 26 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-2 rounded-full"
              style={{
                top: 14 + ((i * 37) % 44),
                left: 6 + ((i * 53) % 88) + "%",
                background: ["#ff5d73", "#ffd93d", "#4d96ff", "#6bcB77", "#fff"][i % 5],
                transform: `rotate(${(i * 47) % 180}deg)`,
              }}
            />
          ))}
        </div>
        <div className="mx-auto h-12 w-[94%] rounded-b-2xl bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 shadow-lg sm:h-14">
          <div className="mx-auto h-full w-[92%] border-x border-dashed border-amber-500/40" />
        </div>
        <div className="mx-auto h-3 w-full rounded-b-xl bg-amber-500/70 shadow-inner" />
      </div>

      {/* progress + button */}
      <div className="mt-6 flex flex-col items-center gap-3">
        <p className="font-body text-base font-semibold text-white/90 sm:text-lg">
          {done
            ? "🎊 All out — your wish is on its way to the stars!"
            : `${countBlown} of ${total} candles blown out`}
        </p>
        <div className="h-3 w-56 overflow-hidden rounded-full bg-white/15 sm:w-72">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-fuchsia-500 transition-[width] duration-500"
            style={{ width: `${(countBlown / total) * 100}%` }}
          />
        </div>
        {!done && (
          <button
            onClick={blowAll}
            className="shine relative mt-1 overflow-hidden rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-2.5 font-display text-sm text-rose-900 shadow-lg transition hover:scale-105 active:scale-95 sm:text-base"
          >
            💨 BLOW THEM ALL OUT
          </button>
        )}
      </div>
    </div>
  );
}
