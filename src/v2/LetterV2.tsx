import { motion } from "framer-motion";
import { config } from "../config";

/** The letter reveals word-by-word with a soft stagger as it scrolls in. */
export default function LetterV2() {
  const words = config.letter.split(" ");

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: -0.7 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: "spring", stiffness: 90, damping: 16 }}
      className="relative mx-auto max-w-2xl rounded-3xl bg-amber-50 p-6 shadow-[0_30px_70px_-25px_rgba(0,0,0,.9)] sm:p-10"
      style={{
        backgroundImage: "repeating-linear-gradient(transparent, transparent 33px, #cbd5e1 34px)",
      }}
    >
      {/* tape corners */}
      <span className="absolute -left-3 -top-3 h-10 w-16 -rotate-45 bg-amber-200/70 shadow-sm" />
      <span className="absolute -right-3 -top-3 h-10 w-16 rotate-45 bg-amber-200/70 shadow-sm" />
      <motion.span
        animate={{ rotate: [-12, -4, -12], y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-5 -top-7 text-5xl"
      >
        💌
      </motion.span>

      <motion.p
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.2 } } }}
        className="font-hand text-2xl leading-[2.15rem] text-slate-800 sm:text-3xl sm:leading-[2.6rem]"
      >
        {words.map((w, i) => (
          <motion.span
            key={i}
            variants={{
              hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { type: "spring", stiffness: 220, damping: 20 },
              },
            }}
            className="inline-block"
          >
            {w}&nbsp;
          </motion.span>
        ))}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.1, type: "spring", stiffness: 120, damping: 16 }}
        className="font-hand mt-5 text-right text-2xl text-rose-600 sm:text-3xl"
      >
        — {config.fromName} ❤️
      </motion.p>
    </motion.div>
  );
}
