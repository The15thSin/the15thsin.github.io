import { useEffect, useRef, useState } from "react";

const SPINNER = [
  "⠋",
  "⠙",
  "⠹",
  "⠸",
  "⠼",
  "⠴",
  "⠦",
  "⠧",
  "⠇",
  "⠏",
];

const CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=<>?/";

const PHRASES = [
  "Percolating",
  "Noodling",
  "Marinating on it",
  "Untangling threads",
  "Synthesizing",
  "Sparking connections",
  "Mulling it over",
  "Crystallizing",
  "Weaving it together",
  "Cross-referencing",
  "Sifting through synapses",
  "Triangulating",
  "Distilling",
  "Assembling the pieces",
  "Fine-tuning the take",
  "Polishing the phrasing",
  "Ruminating",
  "Chewing on it",
  "Spinning up thoughts",
  "Threading the needle",
  "Squaring the circle",
  "Zooming out",
  "Zeroing in",
  "Coalescing",
  "Brewing an answer",
  "Almost ready",
];

export default function ThinkingBox() {
  const [spinnerIndex, setSpinnerIndex] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState(PHRASES[0]);

  const scrambleRef = useRef(null);

  //
  // CLI Spinner
  //
  useEffect(() => {
    const id = setInterval(() => {
      setSpinnerIndex((i) => (i + 1) % SPINNER.length);
    }, 80);

    return () => clearInterval(id);
  }, []);

  //
  // Phrase cycling
  //
  useEffect(() => {
    if (phraseIndex >= PHRASES.length - 1) return;

    const timeout = setTimeout(() => {
      setPhraseIndex((i) => i + 1);
    }, 1600);

    return () => clearTimeout(timeout);
  }, [phraseIndex]);

  useEffect(() => {
    const target = PHRASES[phraseIndex];

    let frame = 0;

    clearInterval(scrambleRef.current);

    scrambleRef.current = setInterval(() => {
      frame++;

      const progress = frame / (target.length + 6);

      const text = target
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";

          if (i / target.length < progress) {
            return char;
          }

          return CHARS[Math.floor(Math.random() * CHARS.length)];
        })
        .join("");

      setDisplayText(text);

      if (progress >= 1) {
        clearInterval(scrambleRef.current);
        setDisplayText(target);
      }
    }, 25);

    return () => clearInterval(scrambleRef.current);
  }, [phraseIndex]);

  return (
    <div className="mt-3 flex items-center gap-0.5 text-sm text-zinc-500 animate-fade-in font-mono">
      <span className="text-amber-400 select-none w-4">
        {SPINNER[spinnerIndex]}
      </span>

      <span className="tracking-wide">
        {displayText}...
      </span>
    </div>
  );
}