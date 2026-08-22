import { useCallback, useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import MusicPlayer from "./MusicPlayer";
import IntroBox from "./IntroBox";
import CakeDeluxe from "./CakeDeluxe";
import GiftsDeluxe from "./GiftsDeluxe";
import ReasonsCarousel from "./ReasonsCarousel";
import LetterV2 from "./LetterV2";
import ScratchCard from "./ScratchCard";
import ConfettiLayer from "../components/ConfettiLayer";
import { Balloons, StarrySky } from "../components/Decorations";
import { config } from "../config";
import { fx, music } from "../lib/music";
import { fireworks } from "../lib/fireworks";
import { confetti } from "../lib/confetti";

/* ------------------------------ fireworks layer ---------------------------- */
function FireworksLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const detach = fireworks.attach(ref.current!);
    return () => {
      fireworks.stopAuto();
      detach();
    };
  }, []);
  return (
    <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[55]" aria-hidden="true" />
  );
}

/* ------------------------------ aurora backdrop ---------------------------- */
function Aurora() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-40 top-[-10%] h-[55vh] w-[55vh] rounded-full bg-fuchsia-600/30 blur-[110px]"
        animate={{ x: [0, 120, -40, 0], y: [0, 80, 160, 0], scale: [1, 1.2, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-15%] top-[15%] h-[60vh] w-[60vh] rounded-full bg-sky-500/25 blur-[120px]"
        animate={{ x: [0, -110, 40, 0], y: [0, 120, -60, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-20%] left-1/3 h-[55vh] w-[55vh] rounded-full bg-amber-400/20 blur-[120px]"
        animate={{ x: [0, 80, -80, 0], y: [0, -70, 40, 0], scale: [1, 1.18, 0.9, 1] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

/* --------------------------------- section --------------------------------- */
function Section({
  title,
  emoji,
  id,
  children,
}: {
  title: string;
  emoji: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-24 w-full scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 34 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ type: "spring", stiffness: 110, damping: 18 }}
        className="mb-9 flex items-center justify-center gap-3"
      >
        <motion.span
          animate={{ rotate: [-10, 10, -10], scale: [1, 1.12, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl sm:text-4xl"
        >
          {emoji}
        </motion.span>
        <h2 className="font-display bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-center text-2xl text-transparent sm:text-4xl">
          {title}
        </h2>
        <motion.span
          animate={{ rotate: [10, -10, 10], scale: [1, 1.12, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="text-3xl sm:text-4xl"
        >
          {emoji}
        </motion.span>
      </motion.div>
      <div className="flex flex-col items-center">{children}</div>
    </section>
  );
}

/* ----------------------------- animated headline --------------------------- */
function AnimatedName({ text }: { text: string }) {
  return (
    <motion.h1
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } } }}
      className="font-display flex flex-wrap justify-center text-5xl leading-none sm:text-7xl md:text-8xl"
      aria-label={text}
    >
      {text.split("").map((ch, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, y: 70, rotateX: -90, scale: 0.6 },
            show: {
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
              transition: { type: "spring", stiffness: 180, damping: 12 },
            },
          }}
          whileHover={{ y: -14, scale: 1.15, rotate: i % 2 ? 6 : -6 }}
          className="rainbow-text glow-text inline-block cursor-default"
          style={{ transformStyle: "preserve-3d" }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </motion.h1>
  );
}

/* ---------------------------------- page ----------------------------------- */
export default function CardDeluxe() {
  const [opened, setOpened] = useState(false);
  const [cakeDone, setCakeDone] = useState(false);
  const [age, setAge] = useState(0);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, restDelta: 0.001 });

  /* hero parallax follows the pointer with spring smoothing */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 140, damping: 18 });
  const layerA = useSpring(useTransform(mx, [-0.5, 0.5], [-24, 24]), { stiffness: 90, damping: 20 });
  const layerB = useSpring(useTransform(mx, [-0.5, 0.5], [16, -16]), { stiffness: 90, damping: 20 });

  const onPointer = (e: React.PointerEvent) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const handleOpened = useCallback(() => {
    setOpened(true);
    window.scrollTo({ top: 0 });
    setTimeout(() => confetti.rain(70), 300);
    fireworks.startAuto(1400);
    setTimeout(() => fireworks.stopAuto(), 9000);
  }, []);

  /* count the age up 0 → 10 once the card appears */
  useEffect(() => {
    if (!opened) return;
    const controls = animate(0, config.age, {
      duration: 1.6,
      delay: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setAge(Math.round(v)),
    });
    return () => controls.stop();
  }, [opened]);

  useEffect(() => () => music.pause(), []);

  useEffect(() => {
    if (!cakeDone) return;
    const t = setTimeout(
      () => document.getElementById("gifts")?.scrollIntoView({ behavior: "smooth" }),
      1000
    );
    return () => clearTimeout(t);
  }, [cakeDone]);

  if (!opened) {
    return (
      <div className="sky relative min-h-screen overflow-hidden">
        <Aurora />
        <StarrySky />
        <Balloons count={6} />
        <ConfettiLayer />
        <FireworksLayer />
        <IntroBox onDone={handleOpened} />
      </div>
    );
  }

  return (
    <div className="sky relative min-h-screen overflow-x-hidden pb-24 text-white" onPointerMove={onPointer}>
      <Aurora />
      <StarrySky />
      <Balloons count={9} />
      <ConfettiLayer />
      <FireworksLayer />
      <MusicPlayer />

      {/* scroll progress */}
      <motion.div
        style={{ scaleX: progress }}
        className="fixed left-0 right-0 top-0 z-[80] h-1.5 origin-left bg-gradient-to-r from-amber-300 via-pink-400 to-fuchsia-500"
      />

      <main className="relative z-20 mx-auto max-w-5xl px-4 sm:px-6">
        {/* ---------------- HERO ---------------- */}
        <header
          className="flex min-h-[92vh] flex-col items-center justify-center text-center"
          style={{ perspective: 1200 }}
        >
          <motion.div
            style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
            className="flex flex-col items-center"
          >
            <motion.div style={{ x: layerA }} className="mb-5 flex gap-3 text-3xl sm:text-4xl">
              {["🎈", "🎉", "🎂", "🎁", "🥳"].map((e, i) => (
                <motion.span
                  key={i}
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 12, delay: i * 0.08 }}
                >
                  <motion.span
                    animate={{ y: [0, -12, 0], rotate: [-8, 8, -8] }}
                    transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    {e}
                  </motion.span>
                </motion.span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="font-body text-base tracking-[0.35em] text-amber-200/90 sm:text-lg"
            >
              LEVEL UP
            </motion.p>

            <AnimatedName text="HAPPY BIRTHDAY" />

            <motion.div style={{ x: layerB }} className="mt-4 flex items-baseline gap-4">
              <motion.h2
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 160, damping: 14, delay: 1.15 }}
                className="font-display text-3xl text-white drop-shadow sm:text-5xl"
              >
                {config.brotherName.toUpperCase()}
              </motion.h2>
              <motion.span
                initial={{ opacity: 0, rotate: -25, scale: 0.4 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 12, delay: 1.3 }}
                className="font-display bg-gradient-to-br from-amber-200 to-orange-500 bg-clip-text text-6xl text-transparent sm:text-8xl"
              >
                {age}
              </motion.span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, type: "spring", stiffness: 120, damping: 18 }}
              className="mt-8 flex items-center gap-4 rounded-3xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-md"
            >
              <span className="text-5xl">🕹️</span>
              <p className="font-body max-w-xs text-left text-sm text-white/90 sm:text-base">
                You just unlocked the <b>double-digit</b> club. Music's playing, so scroll down
                and play with everything!
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-12 font-body text-sm text-white/70"
          >
            scroll down ↓
          </motion.div>
        </header>

        {/* ---------------- LETTER ---------------- */}
        <Section title="A letter for you" emoji="💌">
          <LetterV2 />
        </Section>

        {/* ---------------- CAKE ---------------- */}
        <Section title="Make a wish" emoji="🎂" id="cake">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-body mb-9 max-w-md text-center text-white/80"
          >
            Tap the candles — or hit “use my real breath” and actually blow at your screen. 🌬️
          </motion.p>
          <CakeDeluxe onAllOut={() => setCakeDone(true)} />
        </Section>

        {/* ---------------- SCRATCH ---------------- */}
        <Section title="Secret scratch card" emoji="✨">
          <ScratchCard secret={`One BIG hug + anything you want today, ${config.brotherName}!`} />
        </Section>

        {/* ---------------- REASONS ---------------- */}
        <Section title={`Why ${config.brotherName} rocks`} emoji="🌟">
          <ReasonsCarousel />
        </Section>

        {/* ---------------- GIFTS ---------------- */}
        <Section title="Your surprise gifts" emoji="🎁" id="gifts">
          {cakeDone ? (
            <GiftsDeluxe />
          ) : (
            <motion.button
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
              onClick={() => {
                fx("tap");
                document.getElementById("cake")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex w-full max-w-xl flex-col items-center gap-3 rounded-[28px] border-2 border-dashed border-white/30 bg-white/5 px-6 py-14 text-center backdrop-blur-sm"
            >
              <motion.span
                animate={{ rotate: [-8, 8, -8] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl"
              >
                🔒
              </motion.span>
              <p className="font-display text-xl text-amber-200">GIFTS LOCKED</p>
              <p className="font-body text-sm text-white/75">
                Blow out all {config.age} candles first — tap here to go back 👆
              </p>
            </motion.button>
          )}
        </Section>

        {/* ---------------- FINALE ---------------- */}
        <motion.footer
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ type: "spring", stiffness: 110, damping: 18 }}
          className="mt-28 flex flex-col items-center gap-4 text-center"
        >
          <motion.p className="font-hand text-4xl text-amber-200 sm:text-5xl">
            Happiest birthday, {config.brotherName}! 🎂
          </motion.p>
          <p className="font-body max-w-sm text-sm text-white/65">{config.footerNote}</p>

          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => {
              fx("fanfare");
              fireworks.finale();
              confetti.cannon(130);
              confetti.rain(90);
            }}
            className="shine relative mt-3 overflow-hidden rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-400 px-8 py-4 font-display text-base shadow-[0_18px_40px_-12px_rgba(255,80,180,.8)]"
          >
            🎆 LAUNCH THE FIREWORKS
          </motion.button>

          <p className="font-body mt-6 text-xs text-white/40">— from {config.fromName}</p>
        </motion.footer>
      </main>
    </div>
  );
}
