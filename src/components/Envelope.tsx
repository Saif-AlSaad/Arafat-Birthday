import { useEffect, useState } from "react";
import { config } from "../config";
import { sfx } from "../lib/audio";
import { confetti } from "../lib/confetti";

export default function Envelope({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!opening) return;
    const t = window.setTimeout(onOpen, 1500);
    return () => window.clearTimeout(t);
  }, [opening, onOpen]);

  const handleOpen = () => {
    if (opening) return;
    sfx("whoosh");
    setOpening(true);
    setTimeout(() => {
      sfx("wow");
      confetti.cannon(80);
    }, 700);
  };

  return (
    <div className="relative z-20 flex flex-col items-center px-4">
      <p className="font-hand mb-6 max-w-sm text-center text-2xl text-amber-200/90 sm:text-3xl">
        Psst… someone special has mail 💌
      </p>

      <button
        onClick={handleOpen}
        aria-label="Open the birthday envelope"
        className="group relative block w-[min(92vw,440px)] cursor-pointer focus:outline-none"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          className={`envelope-3d relative aspect-[3/2] w-full ${
            opening ? "" : "wiggle"
          }`}
        >
          {/* envelope body */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-white to-amber-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,.6)] ring-1 ring-amber-300/60">
            <div className="absolute inset-0 opacity-[0.08] [background-image:repeating-linear-gradient(45deg,#000_0_2px,transparent_2px_8px)]" />
          </div>

          {/* the card peeking / sliding out */}
          {opening && (
            <div className="card-out absolute left-[8%] right-[8%] top-[8%] z-10 flex h-[70%] flex-col items-center justify-center gap-1 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-600 p-4 text-center shadow-2xl">
              <span className="text-4xl">🎂</span>
              <p className="font-display text-xl leading-tight text-amber-200 sm:text-2xl">
                {config.headline}
              </p>
              <p className="font-body text-sm text-white/90">{config.brotherName} turns {config.age}!</p>
            </div>
          )}

          {/* front pocket */}
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[62%] overflow-hidden rounded-b-2xl bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 shadow-[0_-6px_18px_rgba(0,0,0,.18)]">
            <div className="absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(-45deg,#000_0_2px,transparent_2px_8px)]" />
          </div>

          {/* flap */}
          <div
            className={`flap absolute left-0 right-0 top-0 z-30 h-[52%] ${
              opening ? "flap-open" : ""
            }`}
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(160deg, #fcd34d, #f59e0b)",
              filter: opening ? "brightness(0.92)" : "none",
            }}
          >
            <div className="absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(45deg,#000_0_2px,transparent_2px_9px)]" />
          </div>

          {/* wax seal */}
          <div
            className={`absolute left-1/2 top-[46%] z-40 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[0_10px_20px_rgba(0,0,0,.45)] ring-4 ring-rose-300/40 transition-all duration-700 ${
              opening ? "scale-0 opacity-0" : "pulse-ring group-hover:scale-110"
            }`}
          >
            <span className="font-display text-2xl">{config.age}</span>
          </div>
        </div>
      </button>

      {!opening && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="font-display text-lg tracking-wide text-amber-200 sm:text-2xl">
            TAP THE ENVELOPE TO OPEN
          </p>
          <div className="text-3xl">👇</div>
        </div>
      )}
    </div>
  );
}
