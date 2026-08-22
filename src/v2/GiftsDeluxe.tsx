import { useState } from "react";
import { motion } from "framer-motion";
import { config, type Gift } from "../config";
import { fx } from "../lib/music";
import { confetti } from "../lib/confetti";
import { fireworks } from "../lib/fireworks";

function Box({ gift, index }: { gift: Gift; index: number }) {
  const [open, setOpen] = useState(false);

  const toggle = (e: React.MouseEvent<HTMLDivElement>) => {
    fx(open ? "tap" : "pop");
    if (!open) {
      confetti.atElement(e.currentTarget, 70);
      fireworks.explode(
        (e.currentTarget.getBoundingClientRect().left + e.currentTarget.clientWidth / 2) /
          window.innerWidth,
        (e.currentTarget.getBoundingClientRect().top + 40) / window.innerHeight,
        gift.boxColor,
        50
      );
    }
    setOpen((o) => !o);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: -20 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ type: "spring", stiffness: 130, damping: 16, delay: index * 0.12 }}
      className="h-[330px] w-full"
      style={{ perspective: 1400 }}
    >
      <motion.div
        onClick={toggle}
        animate={{ rotateY: open ? 180 : 0 }}
        whileHover={{ scale: 1.04, rotateZ: open ? 0 : 1.5 }}
        transition={{ type: "spring", stiffness: 120, damping: 15 }}
        className="relative h-full w-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-[28px] border-4 border-white/20 p-6 shadow-[0_25px_60px_-20px_rgba(0,0,0,.9)]"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: `linear-gradient(150deg, ${gift.boxColor}, ${gift.boxColor}aa 55%, rgba(0,0,0,.55))`,
          }}
        >
          {/* ribbon */}
          <div
            className="absolute inset-y-0 left-1/2 w-8 -translate-x-1/2 opacity-90"
            style={{ background: gift.ribbonColor }}
          />
          <div
            className="absolute inset-x-0 top-1/2 h-8 -translate-y-1/2 opacity-90"
            style={{ background: gift.ribbonColor }}
          />
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
            className="relative z-10 text-7xl drop-shadow-[0_10px_16px_rgba(0,0,0,.45)]"
          >
            🎁
          </motion.div>
          <p className="relative z-10 font-display text-lg text-white drop-shadow">
            GIFT #{index + 1}
          </p>
          <p className="relative z-10 rounded-full bg-black/30 px-3 py-1 font-body text-xs text-white/90">
            tap to unwrap
          </p>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-between rounded-[28px] bg-gradient-to-br from-white via-amber-50 to-amber-100 p-5 text-center shadow-[0_25px_60px_-20px_rgba(0,0,0,.9)] ring-4 ring-amber-300"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <motion.span
            animate={open ? { scale: [0.4, 1.3, 1] } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-5xl"
          >
            {gift.emoji}
          </motion.span>
          <div>
            <p className="font-display text-lg leading-tight text-rose-600 sm:text-xl">
              {gift.title}
            </p>
            <p className="font-body mt-2 text-sm leading-snug text-slate-700">
              {gift.description}
            </p>
          </div>
          <div className="w-full rounded-xl border-2 border-dashed border-amber-400 bg-amber-100/80 px-3 py-2">
            <p className="font-body text-[10px] uppercase tracking-[0.2em] text-amber-700">
              coupon code
            </p>
            <p className="font-display text-sm text-rose-600">{gift.code}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function GiftsDeluxe() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {config.gifts.map((g, i) => (
          <Box key={g.id} gift={g} index={i} />
        ))}
      </div>
      <p className="font-body mt-6 text-center text-sm text-white/65">
        Valid forever · Redeem any time with {config.fromName} 🤗
      </p>
    </div>
  );
}
