import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { music } from "../lib/music";

/** Floating player with a live analyser-driven visualiser 🎶 */
export default function MusicPlayer() {
  const [playing, setPlaying] = useState(music.isPlaying);
  const [vol, setVol] = useState(music.volume);
  const [open, setOpen] = useState(false);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const off = music.onChange(setPlaying);
    return () => {
      off();
    };
  }, []);

  /* animate the visualiser bars straight from the AnalyserNode */
  useEffect(() => {
    let raf = 0;
    const data = new Uint8Array(64);
    const loop = () => {
      const an = music.getAnalyser();
      const host = barsRef.current;
      if (an && host) {
        an.getByteFrequencyData(data as any);
        const kids = host.children;
        for (let i = 0; i < kids.length; i++) {
          const v = data[i * 2 + 1] / 255;
          const el = kids[i] as HTMLElement;
          el.style.transform = `scaleY(${playing ? 0.16 + v * 1.5 : 0.16})`;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <motion.div
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.4 }}
      className="fixed right-3 top-3 z-[70] sm:right-5 sm:top-5"
      onHoverStart={() => setOpen(true)}
      onHoverEnd={() => setOpen(false)}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="flex items-center gap-3 rounded-full border border-white/25 bg-white/10 px-3 py-2 shadow-[0_10px_40px_-12px_rgba(0,0,0,.8)] backdrop-blur-xl"
      >
        <motion.button
          onClick={() => {
            music.toggle();
            setOpen(true);
          }}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.08 }}
          aria-label={playing ? "Pause music" : "Play Happy Birthday music"}
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-pink-500 text-lg shadow-lg"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={playing ? "pause" : "play"}
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {playing ? "⏸" : "▶️"}
            </motion.span>
          </AnimatePresence>
          {playing && (
            <motion.span
              className="absolute inset-0 rounded-full ring-2 ring-amber-200/70"
              animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.button>

        {/* visualiser */}
        <div ref={barsRef} className="flex h-8 items-center gap-[3px]">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="h-7 w-[3px] origin-bottom rounded-full bg-gradient-to-t from-fuchsia-400 to-amber-200 transition-transform duration-75"
              style={{ transform: "scaleY(0.16)" }}
            />
          ))}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 pr-1">
                <span className="font-body whitespace-nowrap text-xs text-white/80">
                  ♪ Happy Birthday
                </span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={vol}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setVol(v);
                    music.setVolume(v);
                  }}
                  aria-label="Volume"
                  className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 accent-amber-300"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
