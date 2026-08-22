import { useRef } from "react";
import { motion } from "framer-motion";
import { config } from "../config";

const TINTS = [
  "from-rose-500/80 to-orange-400/80",
  "from-sky-500/80 to-indigo-500/80",
  "from-emerald-500/80 to-teal-400/80",
  "from-fuchsia-500/80 to-purple-500/80",
  "from-amber-400/80 to-yellow-300/80",
];

/** Drag-to-scroll cards with springy hover tilt. */
export default function ReasonsCarousel() {
  const track = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      <motion.div ref={track} className="w-full cursor-grab overflow-hidden active:cursor-grabbing">
        <motion.div
          drag="x"
          dragConstraints={{
            left: -Math.max(0, config.reasons.length * 260 - 320),
            right: 0,
          }}
          dragElastic={0.12}
          dragTransition={{ bounceStiffness: 260, bounceDamping: 26 }}
          className="flex gap-5 px-1 pb-4"
        >
          {config.reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40, rotate: -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1.5 : -1.5 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 150, damping: 16, delay: i * 0.1 }}
              whileHover={{ scale: 1.05, rotate: 0, y: -6 }}
              className={`flex h-52 w-[230px] shrink-0 select-none flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br ${
                TINTS[i % TINTS.length]
              } p-5 text-center shadow-[0_20px_45px_-18px_rgba(0,0,0,.9)] ring-1 ring-white/25 backdrop-blur-sm`}
            >
              <motion.span
                animate={{ y: [0, -7, 0], rotate: [-6, 6, -6] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl drop-shadow"
              >
                {r.emoji}
              </motion.span>
              <p className="font-body text-[15px] font-medium leading-snug text-white">{r.text}</p>
              <span className="font-display text-[10px] tracking-widest text-white/70">
                REASON #{i + 1}
              </span>
            </motion.div>
          ))}

          {/* end card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 150, damping: 16, delay: 0.4 }}
            className="flex h-52 w-[230px] shrink-0 flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-white/40 p-5 text-center"
          >
            <span className="text-4xl">♾️</span>
            <p className="font-hand text-2xl text-amber-200">…and a million more</p>
          </motion.div>
        </motion.div>
      </motion.div>
      <p className="font-body mt-1 text-center text-xs text-white/50">← drag the cards →</p>
    </div>
  );
}
