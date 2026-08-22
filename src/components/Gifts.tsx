import { useState } from "react";
import { config, type Gift } from "../config";
import { sfx } from "../lib/audio";
import { confetti } from "../lib/confetti";

function GiftBox({ gift, index }: { gift: Gift; index: number }) {
  const [flipped, setFlipped] = useState(false);

  const reveal = (e: React.MouseEvent<HTMLButtonElement>) => {
    sfx("pop");
    if (!flipped) confetti.atElement(e.currentTarget, 60);
    setFlipped((f) => !f);
  };

  return (
    <div
      className="flip-container pop-in h-[320px] w-full"
      style={{ animationDelay: `${index * 0.14}s` }}
    >
      <div className={`flip-inner h-full w-full ${flipped ? "is-flipped" : ""}`}>
        {/* FRONT — the wrapped box */}
        <button
          onClick={reveal}
          aria-label={`Open gift ${index + 1}`}
          className="flip-face shake-box flex h-full w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-4 border-white/25 p-6 shadow-2xl focus:outline-none"
          style={{
            background: `linear-gradient(155deg, ${gift.boxColor}, ${gift.boxColor}bb 60%, #00000055)`,
          }}
        >
          <div className="relative text-7xl drop-shadow-[0_8px_12px_rgba(0,0,0,.4)] sm:text-8xl">
            🎁
          </div>
          <p className="font-display text-lg text-white sm:text-xl">GIFT #{index + 1}</p>
          <p className="font-body text-sm text-white/85">Tap to unwrap 👆</p>
        </button>

        {/* BACK — the coupon */}
        <button
          onClick={reveal}
          className="flip-face flip-back flex h-full w-full cursor-pointer flex-col items-center justify-between rounded-3xl bg-gradient-to-br from-white to-amber-50 p-5 text-center shadow-2xl ring-4 ring-amber-300 focus:outline-none"
        >
          <span className="font-hand text-3xl">{gift.emoji}</span>
          <div>
            <p className="font-display text-lg leading-tight text-rose-600 sm:text-xl">
              {gift.title}
            </p>
            <p className="font-body mt-2 text-sm leading-snug text-slate-700">
              {gift.description}
            </p>
          </div>
          <div className="w-full rounded-lg border-2 border-dashed border-amber-400 bg-amber-100/70 px-3 py-1.5">
            <p className="font-body text-[11px] uppercase tracking-widest text-amber-700">
              coupon code
            </p>
            <p className="font-display text-sm text-rose-600">{gift.code}</p>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function Gifts() {
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {config.gifts.map((gift, i) => (
          <GiftBox key={gift.id} gift={gift} index={i} />
        ))}
      </div>
      <p className="font-body mt-6 text-center text-sm text-white/70">
        Valid forever · Redeemable with {config.fromName} · No expiry, big hugs 🤗
      </p>
    </div>
  );
}
