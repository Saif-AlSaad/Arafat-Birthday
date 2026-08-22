import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ConfettiLayer from "./components/ConfettiLayer";
import { Balloons, StarrySky } from "./components/Decorations";
import { config } from "./config";
import { confetti } from "./lib/confetti";
import { fx, music } from "./lib/music";

const quickGifts = [
  { icon: "pizza", label: "Pizza treat" },
  { icon: "game", label: "Extra game time" },
  { icon: "movie", label: "Movie night" },
];

export default function App() {
  const [opened, setOpened] = useState(false);
  const [wishMade, setWishMade] = useState(false);
  const [playing, setPlaying] = useState(false);
  const candles = useMemo(() => Array.from({ length: config.age }), []);

  useEffect(() => () => music.pause(), []);

  const openCard = () => {
    music.play();
    setPlaying(true);
    fx("fanfare");
    setOpened(true);
    confetti.cannon(120);
    window.setTimeout(() => confetti.rain(80), 500);
  };

  const makeWish = () => {
    if (wishMade) return;
    setWishMade(true);
    fx("sparkle");
    confetti.cannon(110);
  };

  const toggleMusic = () => {
    setPlaying(music.toggle());
  };

  return (
    <main className="sky relative min-h-screen overflow-hidden text-white">
      <StarrySky />
      <Balloons count={7} />
      <ConfettiLayer />

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.section
            key="cover"
            className="relative z-20 flex min-h-screen flex-col items-center justify-center px-5 text-center"
            exit={{ opacity: 0, scale: 1.04, filter: "blur(12px)" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <motion.p
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-hand mb-6 text-3xl text-amber-200 sm:text-4xl"
            >
              A small surprise for Arafat
            </motion.p>

            <motion.button
              onClick={openCard}
              aria-label="Open Arafat's birthday card"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 140, damping: 14, delay: 0.15 }}
              className="group relative flex h-64 w-64 items-center justify-center rounded-[2.2rem] bg-gradient-to-br from-rose-500 via-fuchsia-500 to-indigo-600 shadow-[0_30px_80px_-20px_rgba(0,0,0,.85)] ring-4 ring-white/20 sm:h-72 sm:w-72"
            >
              <motion.span
                className="absolute inset-0 rounded-[2.2rem] bg-white/15"
                animate={{ opacity: [0.25, 0.55, 0.25], scale: [1, 1.04, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="absolute left-1/2 top-0 h-full w-10 -translate-x-1/2 bg-amber-300 shadow-lg" />
              <span className="absolute left-0 top-1/2 h-10 w-full -translate-y-1/2 bg-amber-300 shadow-lg" />
              <motion.span
                animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 text-8xl drop-shadow-xl"
              >
                🎁
              </motion.span>
            </motion.button>

            <motion.p
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              className="font-display mt-10 text-lg text-amber-200 sm:text-2xl"
            >
              Tap to open
            </motion.p>
          </motion.section>
        ) : (
          <motion.section
            key="card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.45 }}
            className="relative z-20 flex min-h-screen items-center justify-center px-4 py-8"
          >
            <button
              onClick={toggleMusic}
              className="fixed right-4 top-4 z-40 rounded-full border border-white/25 bg-white/10 px-4 py-2 font-body text-sm text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 active:scale-95"
            >
              {playing ? "Pause music" : "Play music"}
            </button>

            <motion.article
              initial={{ y: 70, scale: 0.9, rotateX: -18 }}
              animate={{ y: 0, scale: 1, rotateX: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="relative w-full max-w-3xl overflow-hidden rounded-[2.4rem] border border-white/20 bg-white/10 p-5 text-center shadow-[0_35px_90px_-25px_rgba(0,0,0,.9)] backdrop-blur-xl sm:p-10"
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-amber-300/30 blur-3xl" />
              <div className="absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-body text-sm uppercase tracking-[0.35em] text-amber-200"
              >
                Level {config.age} unlocked
              </motion.p>

              <motion.h1
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.25 } } }}
                className="font-display rainbow-text glow-text relative mt-4 flex flex-wrap justify-center text-4xl leading-none sm:text-6xl md:text-7xl"
                aria-label="Happy birthday Arafat"
              >
                {"HAPPY BIRTHDAY".split("").map((letter, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 45, rotate: -8, scale: 0.7 },
                      show: {
                        opacity: 1,
                        y: 0,
                        rotate: 0,
                        scale: 1,
                        transition: { type: "spring", stiffness: 220, damping: 15 },
                      },
                    }}
                    className="inline-block"
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 13, delay: 0.85 }}
                className="font-display relative mt-3 text-5xl text-white sm:text-7xl"
              >
                ARAFAT
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05 }}
                className="relative mx-auto mt-7 max-w-lg rounded-3xl bg-white/10 px-5 py-5 ring-1 ring-white/15"
              >
                <p className="font-hand text-2xl leading-snug text-white sm:text-3xl">
                  Happy 10th birthday, Arafat! Wishing you a day full of cake,
                  games, laughter and the biggest smile.
                </p>
              </motion.div>

              <div className="relative mt-8 flex justify-center gap-1.5 sm:gap-2">
                {candles.map((_, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", delay: 1.15 + index * 0.04 }}
                    className="flex flex-col items-center"
                  >
                    <motion.span
                      animate={wishMade ? { opacity: 0, scale: 0.2, y: 8 } : { scale: [1, 1.18, 0.92, 1] }}
                      transition={wishMade ? { duration: 0.25 } : { duration: 0.5, repeat: Infinity }}
                      className="mb-1 h-5 w-3 rounded-full bg-orange-400 shadow-[0_0_16px_5px_rgba(255,190,70,.75)]"
                    />
                    <span className="h-9 w-3 rounded-t-full bg-[repeating-linear-gradient(45deg,#fff_0_4px,#ff5d73_4px_8px)]" />
                  </motion.span>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.45 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                onClick={makeWish}
                className="shine relative mt-7 overflow-hidden rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 px-7 py-3 font-display text-sm text-rose-950 shadow-[0_18px_40px_-18px_rgba(255,180,80,.9)]"
              >
                {wishMade ? "Wish sent to the stars" : "Make a wish"}
              </motion.button>

              <AnimatePresence>
                {wishMade && (
                  <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.94 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: "spring", stiffness: 140, damping: 16 }}
                    className="relative mt-8"
                  >
                    <p className="font-display mb-4 text-lg text-amber-200">Your birthday treats</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {quickGifts.map((gift, index) => (
                        <motion.div
                          key={gift.label}
                          initial={{ opacity: 0, y: 18 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="rounded-2xl bg-white/10 px-4 py-4 ring-1 ring-white/15"
                        >
                          <p className="font-display text-sm text-white">{gift.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="font-body relative mt-8 text-sm text-white/60">
                Made with love for the best little brother.
              </p>
            </motion.article>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}