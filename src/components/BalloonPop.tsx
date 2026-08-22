import { useMemo, useState } from "react";
import { config } from "../config";
import { sfx } from "../lib/audio";
import { confetti } from "../lib/confetti";

const SKINS = [
  { from: "#ff8fa3", to: "#ff5d73" },
  { from: "#ffe066", to: "#f5b301" },
  { from: "#8ecae6", to: "#4d96ff" },
  { from: "#a7e8b5", to: "#43aa8b" },
  { from: "#d8b4fe", to: "#a855f7" },
];

type Balloon = { id: number; reason: string | null; emoji: string; skin: number };

export default function BalloonPop() {
  const balloons = useMemo<Balloon[]>(() => {
    const list: Balloon[] = config.reasons.map((r, i) => ({
      id: i,
      reason: r.text,
      emoji: r.emoji,
      skin: i % SKINS.length,
    }));
    // filler balloons so there are more pops than prizes
    const fillers = ["✨", "⭐", "🎊", "🍬", "🪀", "🤖"];
    for (let i = 0; i < 6; i++) {
      list.push({
        id: 100 + i,
        reason: null,
        emoji: fillers[i % fillers.length],
        skin: (i + 2) % SKINS.length,
      });
    }
    return list.sort(() => Math.random() - 0.5);
  }, []);

  const [popped, setPopped] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<{ text: string; emoji: string } | null>(null);

  const total = balloons.length;
  const prizesFound = popped.filter((id) =>
    balloons.find((b) => b.id === id && b.reason)
  ).length;
  const allDone = popped.length === total;

  const pop = (b: Balloon, e: React.MouseEvent<HTMLButtonElement>) => {
    if (popped.includes(b.id)) return;
    sfx("pop");
    confetti.atElement(e.currentTarget, 26);
    setPopped((p) => [...p, b.id]);
    if (b.reason) setRevealed({ text: b.reason, emoji: b.emoji });
    if (b.reason) setTimeout(() => sfx("wow"), 120);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 sm:gap-4">
        {balloons.map((b, i) => {
          const isPopped = popped.includes(b.id);
          const skin = SKINS[b.skin];
          return (
            <button
              key={b.id}
              onClick={(e) => pop(b, e)}
              disabled={isPopped}
              aria-label={isPopped ? "Popped balloon" : "Pop the balloon"}
              className={`pop-in relative flex aspect-[3/4] w-full items-center justify-center transition-transform duration-200 focus:outline-none ${
                isPopped ? "scale-90 cursor-default" : "hover:scale-110 active:scale-95"
              }`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              {!isPopped ? (
                <>
                  <span
                    className="block h-[82%] w-full rounded-[50%_50%_48%_48%/55%_55%_45%_45%] shadow-lg"
                    style={{
                      background: `radial-gradient(circle at 32% 24%, rgba(255,255,255,.65), ${skin.from} 42%, ${skin.to} 100%)`,
                    }}
                  />
                  <span
                    className="absolute -bottom-[2%] left-1/2 h-[10%] w-[16%] -translate-x-1/2"
                    style={{
                      background: skin.to,
                      clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                    }}
                  />
                  <span className="pointer-events-none absolute text-xl opacity-0 transition group-hover:opacity-100" />
                </>
              ) : (
                <span className="text-2xl opacity-45">💥</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-8 min-h-[92px] w-full max-w-xl rounded-2xl border-2 border-dashed border-white/25 bg-white/10 p-4 text-center backdrop-blur-sm">
        {revealed && !allDone ? (
          <p className="font-body text-lg text-white">
            <span className="mr-2 text-2xl">{revealed.emoji}</span>
            {revealed.text}
          </p>
        ) : allDone ? (
          <p className="font-display text-lg text-amber-200">
            🎉 All popped — {prizesFound} reasons found. You're officially AWESOME!
          </p>
        ) : (
          <p className="font-body text-white/70">
            Pop the balloons to find why {config.brotherName} is awesome 👆
          </p>
        )}
      </div>
      <p className="font-body mt-3 text-sm text-white/60">
        {popped.length} / {total} popped
      </p>
    </div>
  );
}
