import { useMemo } from "react";

export function StarrySky() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: 1 + Math.random() * 2.6,
        dur: 2 + Math.random() * 4,
        delay: Math.random() * 4,
        opacity: 0.35 + Math.random() * 0.65,
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      {/* a few bigger glowing orbs */}
      <div className="absolute -left-24 top-1/4 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute bottom-10 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-300/10 blur-3xl" />
    </div>
  );
}

const BALLOON_COLORS = [
  { body: "#ff5d73", shine: "rgba(255,255,255,.55)" },
  { body: "#ffd93d", shine: "rgba(255,255,255,.6)" },
  { body: "#4d96ff", shine: "rgba(255,255,255,.55)" },
  { body: "#6bcB77", shine: "rgba(255,255,255,.5)" },
  { body: "#c780e8", shine: "rgba(255,255,255,.5)" },
];

export function Balloons({ count = 9 }: { count?: number }) {
  const balloons = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 92,
        dur: 16 + Math.random() * 14,
        delay: Math.random() * 18,
        size: 46 + Math.random() * 44,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
        swayDur: 3 + Math.random() * 3,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden" aria-hidden="true">
      {balloons.map((b) => (
        <div
          key={b.id}
          className="balloon absolute bottom-0"
          style={{
            left: `${b.left}%`,
            animationDuration: `${b.dur}s`,
            animationDelay: `-${b.delay}s`,
          }}
        >
          <div className="sway" style={{ animationDuration: `${b.swayDur}s` }}>
            <div
              className="relative rounded-[50%_50%_48%_48%/54%_54%_46%_46%]"
              style={{
                width: b.size,
                height: b.size * 1.22,
                background: `radial-gradient(circle at 30% 25%, ${b.color.shine} 0%, ${b.color.body} 45%, ${b.color.body} 100%)`,
                boxShadow: `inset -6px -8px 14px rgba(0,0,0,.22)`,
              }}
            >
              <div
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: -b.size * 0.14,
                  width: b.size * 0.16,
                  height: b.size * 0.16,
                  background: b.color.body,
                  filter: "brightness(0.75)",
                  clipPath: "polygon(50% 100%, 0 0, 100% 0)",
                }}
              />
            </div>
            <div
              className="mx-auto"
              style={{
                width: 1.5,
                height: b.size * 1.1,
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,.55), rgba(255,255,255,.12))",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Bunting({ text = "HAPPY BIRTHDAY" }: { text?: string }) {
  const flags = [...text.replace(/\s/g, "·"), "🎉", "🎈", "🎂"];
  const colors = ["#ff5d73", "#ffd93d", "#6bcB77", "#4d96ff", "#c780e8"];

  return (
    <div className="pointer-events-none relative z-20 flex w-full justify-center" aria-hidden="true">
      <div className="flex w-full max-w-3xl items-start justify-center gap-1 sm:gap-2">
        {flags.map((ch, i) => (
          <div
            key={i}
            className="bunting-flag flex flex-col items-center"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div
              className="flex h-8 w-6 items-end justify-center rounded-b-md pb-0.5 text-[11px] font-bold text-white/95 shadow-md sm:h-11 sm:w-9 sm:text-base"
              style={{ background: colors[i % colors.length] }}
            >
              {ch}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
