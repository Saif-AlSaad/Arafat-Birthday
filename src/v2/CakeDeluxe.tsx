import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { config } from "../config";
import { fx } from "../lib/music";
import { confetti } from "../lib/confetti";
import { fireworks } from "../lib/fireworks";

type MicState = "off" | "asking" | "on" | "denied";

export default function CakeDeluxe({ onAllOut }: { onAllOut: () => void }) {
  const total = config.age;
  const [out, setOut] = useState<boolean[]>(() => Array(total).fill(false));
  const [smoke, setSmoke] = useState<number[]>([]);
  const [mic, setMic] = useState<MicState>("off");
  const [level, setLevel] = useState(0);
  const [done, setDone] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef(0);
  const outRef = useRef(out);
  outRef.current = out;
  const blownCount = out.filter(Boolean).length;

  const blowOne = useCallback((i: number) => {
    if (i < 0 || outRef.current[i]) return;
    const next = [...outRef.current];
    next[i] = true;
    outRef.current = next;
    setOut(next);
    fx("blow");
    setSmoke((s) => [...s, i]);
    window.setTimeout(() => setSmoke((s) => s.filter((x) => x !== i)), 1200);
  }, []);

  const blowNext = useCallback(() => {
    blowOne(outRef.current.findIndex((b) => !b));
  }, [blowOne]);

  const blowAll = () => {
    outRef.current
      .map((b, i) => (b ? -1 : i))
      .filter((i) => i >= 0)
      .forEach((i, k) => window.setTimeout(() => blowOne(i), k * 110));
  };

  /* ---------------- microphone blow detection ---------------- */
  const startMic = async () => {
    if (mic === "on" || mic === "asking") return;
    setMic("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ac: AudioContext = new AC();
      const src = ac.createMediaStreamSource(stream);
      const an = ac.createAnalyser();
      an.fftSize = 1024;
      an.smoothingTimeConstant = 0.6;
      src.connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      setMic("on");

      let hot = 0;
      const loop = () => {
        an.getByteFrequencyData(data as any);
        // a blow is broadband low/mid energy — average the lowest ~40 bins
        let sum = 0;
        for (let i = 2; i < 44; i++) sum += data[i];
        const avg = sum / 42 / 255;
        setLevel(avg);
        if (avg > 0.42) {
          hot += 1;
          if (hot % 8 === 0) blowNext();
        } else {
          hot = 0;
        }
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch {
      setMic("denied");
    }
  };

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* ---------------- all candles out ---------------- */
  useEffect(() => {
    if (!done && blownCount === total) {
      setDone(true);
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      const t = setTimeout(() => {
        fx("fanfare");
        confetti.cannon(120);
        fireworks.finale();
        onAllOut();
      }, 450);
      return () => clearTimeout(t);
    }
  }, [blownCount, total, done, onAllOut]);

  return (
    <div className="flex w-full flex-col items-center">
      {/* candles */}
      <div className="mb-1 flex flex-wrap items-end justify-center gap-2 sm:gap-3">
        {Array.from({ length: total }).map((_, i) => (
          <motion.button
            key={i}
            onClick={() => blowOne(i)}
            aria-label={`Blow out candle ${i + 1}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.9 }}
            initial={{ y: 24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: i * 0.05 }}
            className="relative flex w-4 flex-col items-center focus:outline-none sm:w-5"
          >
            <AnimatePresence>
              {smoke.includes(i) && (
                <motion.span
                  initial={{ opacity: 0.8, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -46, scale: 1.9 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.15, ease: "easeOut" }}
                  className="absolute -top-4 left-1/2 z-10 h-6 w-6 -translate-x-1/2 rounded-full bg-white/70 blur-[4px]"
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!out[i] && (
                <motion.span
                  exit={{ scaleY: 0, opacity: 0, y: 6 }}
                  transition={{ duration: 0.22 }}
                  className="relative mb-0.5 block h-7 w-4 origin-bottom"
                >
                  <motion.span
                    animate={{
                      scaleX: [1, 1.18, 0.9, 1.1, 1],
                      scaleY: [1, 0.9, 1.16, 0.95, 1],
                      rotate: [-2, 2, -1, 2, -2],
                    }}
                    transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 origin-bottom rounded-[50%_50%_45%_45%/62%_62%_38%_38%] bg-orange-400"
                    style={{ boxShadow: "0 0 16px 6px rgba(255,175,50,.75)" }}
                  />
                  <span className="absolute inset-y-[30%] left-1/2 w-[45%] -translate-x-1/2 rounded-full bg-yellow-100" />
                </motion.span>
              )}
            </AnimatePresence>

            <span className="h-10 w-full rounded-t-full bg-[repeating-linear-gradient(45deg,#ff5d73_0_4px,#fff_4px_8px)] shadow-inner sm:h-12" />
          </motion.button>
        ))}
      </div>

      {/* cake */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[min(88vw,400px)]"
      >
        <div className="relative mx-auto h-16 w-[86%] rounded-t-[2rem] bg-gradient-to-b from-pink-200 via-pink-300 to-pink-400 shadow-xl">
          <div className="absolute -top-1 left-0 right-0 flex justify-between px-2">
            {Array.from({ length: 13 }).map((_, i) => (
              <motion.span
                key={i}
                initial={{ height: 0 }}
                whileInView={{ height: 12 + (i % 3) * 8 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.03, type: "spring", stiffness: 200, damping: 16 }}
                className="w-[6.5%] rounded-b-full bg-white"
              />
            ))}
          </div>
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-1 w-2 rounded-full"
              style={{
                top: 18 + ((i * 41) % 42),
                left: 5 + ((i * 53) % 88) + "%",
                background: ["#ff5d73", "#ffd93d", "#4d96ff", "#6bcB77", "#fff"][i % 5],
                transform: `rotate(${(i * 47) % 180}deg)`,
              }}
            />
          ))}
        </div>
        <div className="mx-auto h-14 w-[94%] bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 shadow-xl">
          <div className="mx-auto h-full w-[92%] border-x border-dashed border-amber-600/40" />
        </div>
        <div className="mx-auto h-4 w-full rounded-b-2xl bg-amber-600/80 shadow-inner" />
        <div className="mx-auto mt-1 h-2 w-[108%] -translate-x-[4%] rounded-full bg-black/35 blur-md" />
      </motion.div>

      {/* controls */}
      <div className="mt-8 flex w-full max-w-md flex-col items-center gap-4">
        <p className="font-body text-center text-base text-white/90">
          {done ? "🌟 All out! Your wish is flying to the stars…" : `${blownCount} of ${total} candles out`}
        </p>

        <div className="h-3 w-full overflow-hidden rounded-full bg-white/15">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 via-pink-400 to-fuchsia-500"
            animate={{ width: `${(blownCount / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        {!done && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={blowAll}
              className="rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-2.5 font-display text-sm text-rose-900 shadow-lg"
            >
              💨 BLOW THEM ALL
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={startMic}
              className={`rounded-full px-5 py-2.5 font-display text-sm shadow-lg ${
                mic === "on"
                  ? "bg-emerald-400 text-emerald-950"
                  : "bg-white/15 text-white ring-1 ring-white/30"
              }`}
            >
              {mic === "on"
                ? "🎤 BLOW FOR REAL!"
                : mic === "asking"
                  ? "🎤 asking…"
                  : mic === "denied"
                    ? "🎤 mic blocked — just tap"
                    : "🎤 USE MY REAL BREATH"}
            </motion.button>
          </div>
        )}

        {/* live breath meter */}
        <AnimatePresence>
          {mic === "on" && !done && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full text-center"
            >
              <p className="font-body mb-1 text-xs text-white/70">
                Blow at your screen! 🌬️
              </p>
              <div className="mx-auto h-2 w-48 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-300 to-emerald-400 transition-[width] duration-75"
                  style={{ width: `${Math.min(100, level * 220)}%` }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
