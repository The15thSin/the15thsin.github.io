import { useEffect, useRef, useState } from "react";

export default function AnimatedText({ text, onUpdate }) {
  const [displayed, setDisplayed] = useState("");

  const displayedRef = useRef("");
  const targetRef = useRef(text);
  const frameRef = useRef();

  // Keep the latest target text
  useEffect(() => {
    targetRef.current = text;
  }, [text]);

  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now) => {
      const elapsed = now - lastTime;

      // ~60fps
      if (elapsed >= 40) {
        const current = displayedRef.current;
        const target = targetRef.current;

        if (current.length < target.length) {
          const remaining = target.length - current.length;

          // Adaptive reveal speed
          let reveal = 2;

          if (remaining > 1000) reveal = 30;
          else if (remaining > 500) reveal = 20;
          else if (remaining > 250) reveal = 12;
          else if (remaining > 100) reveal = 8;
          else if (remaining > 40) reveal = 5;

          const next = target.slice(0, current.length + reveal);

          displayedRef.current = next;
          setDisplayed(next);

          requestAnimationFrame(() => {
            onUpdate?.("auto");
          });
        }

        lastTime = now;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <>
      {displayed}
      {displayed.length < text.length && (
        <span className="animate-pulse text-cyan-400">▍</span>
      )}
    </>
  );
}