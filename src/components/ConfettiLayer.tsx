import { useEffect, useRef } from "react";
import { confetti } from "../lib/confetti";

export default function ConfettiLayer() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => confetti.attach(ref.current!), []);
  return <canvas ref={ref} className="confetti-canvas" aria-hidden="true" />;
}
