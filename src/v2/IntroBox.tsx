import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { config } from "../config";
import { music, fx } from "../lib/music";
import { fireworks } from "../lib/fireworks";
import { confetti } from "../lib/confetti";

type Phase = "idle" | "counting" | "burst";

export default function IntroBox({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(3);

  const start = () => {
    if (phase !== "idle") return;
    music.play(); // browsers allow audio after this user gesture
    fx("tap");
    setPhase("counting");
  };

  useEffect(() => {
    if (phase !== "counting") return;
    if (count > 0) {
      const t = setTimeout(() => {
        fx("tap");
        setCount((c) => c - 1);
      }, 620);
      return () => clearTimeout(t);
    }
    fx("fanfare");
    setPhase("burst");
    confetti.cannon(90);
    fireworks.finale();
    const t = setTimeout(onDone, 1250);
    return () => clearTimeout(t);
  }, [phase, count, onDone]);

  const shaking = phase === "counting";

  return (
    <div className="relative z-30 flex min-h-screen flex-col items-center justify-center px-6">
      <motion.p
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 180, damping: 18 }}
        className="font-hand mb-2 text-center text-3xl text-amber-200 sm:text-4xl"
      >
        Something is waiting for you…
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="font-body mb-10 text-center text-white/70"
      >
        (turn your sound on 🔊)
      </motion.p>

      <motion.button
        onClick={start}
        aria-label="Open your present"
        className="relative cursor-pointer focus:outline-none"
        style={{ perspective: 1000 }}
        whileHover={phase === "idle" ? { scale: 1.06 } : undefined}
        whileTap={phase === "idle" ? { scale: 0.95 } : undefined}
        animate={
          shaking
            ? { rotate: [0, -7, 7, -6, 6, 0], y: [0, -6, 0, -4, 0] }
            : phase === "burst"
              ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] }
              : { y: [0, -10, 0] }
        }
        transition={
          shaking
            ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" }
            : phase === "burst"
              ? { duration: 0.7, ease: "easeIn" }
              : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }
        }
      >
        {/* glow */}
        <motion.div
          className="absolute left-1/2 top-1/2 -z-10 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-400/35 blur-3xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* lid */}
        <motion.div
          className="relative z-20 mx-auto h-10 w-52 rounded-lg bg-gradient-to-b from-rose-400 to-rose-600 shadow-xl sm:h-12 sm:w-60"
          animate={
            phase === "burst"
              ? { y: -260, rotate: -35, opacity: 0 }
              : shaking
                ? { y: [-2, -8, -2] }
                : { y: 0 }
          }
          transition={
            phase === "burst"
              ? { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
              : { duration: 0.5, repeat: Infinity }
          }
        >
          <div className="absolute left-1/2 top-0 h-full w-6 -translate-x-1/2 bg-amber-300" />
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-4xl">🎀</div>
        </motion.div>

        {/* box body */}
        <div className="relative mx-auto -mt-1 h-40 w-44 overflow-hidden rounded-b-xl rounded-t-sm bg-gradient-to-b from-rose-500 via-rose-600 to-rose-800 shadow-2xl sm:h-44 sm:w-52">
          <div className="absolute left-1/2 top-0 h-full w-6 -translate-x-1/2 bg-amber-300" />
          <div className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(45deg,#fff_0_3px,transparent_3px_12px)]" />
          <div className="absolute inset-x-0 bottom-3 text-center font-display text-sm text-amber-200">
            FOR {config.brotherName.toUpperCase()}
          </div>
        </div>

        {/* light escaping the box */}
        <AnimatePresence>
          {phase === "burst" && (
            <motion.div
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 1 }}
              className="absolute bottom-24 left-1/2 h-[70vh] w-40 origin-bottom -translate-x-1/2 bg-gradient-to-t from-amber-200/90 via-amber-100/30 to-transparent blur-md"
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* countdown numbers */}
      <AnimatePresence mode="popLayout">
        {phase === "counting" && count > 0 && (
          <motion.div
            key={count}
            initial={{ scale: 0.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
          >
            <span className="font-display text-[26vw] text-white/85 drop-shadow-[0_0_40px_rgba(255,200,80,.8)]">
              {count}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "idle" && (
        <motion.p
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="font-display mt-12 text-center text-lg text-amber-200 sm:text-2xl"
        >
          TAP THE PRESENT 🎁
        </motion.p>
      )}
    </div>
  );
}
