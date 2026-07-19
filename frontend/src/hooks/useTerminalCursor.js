import { useEffect, useRef } from "react";

export default function useTerminalCursor(input) {
  const inputRef = useRef(null);
  const cursorRef = useRef(null);
  const mirrorRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const updateCursor = () => {
      const inputEl = inputRef.current;
      const cursorEl = cursorRef.current;
      const mirrorEl = mirrorRef.current;

      if (!inputEl || !cursorEl || !mirrorEl) {
        return;
      }

      const position =
        inputEl.selectionStart ?? inputEl.value.length;

      mirrorEl.textContent = inputEl.value
        .slice(0, position)
        .replace(/ /g, "\u00A0");

      const rect = mirrorEl.getBoundingClientRect();

      const left = rect.width - inputEl.scrollLeft;

      cursorEl.style.left = `${Math.max(0, left)}px`;
    };

    const inputElement = inputRef.current;

    inputElement?.addEventListener("input", updateCursor);
    inputElement?.addEventListener("click", updateCursor);
    inputElement?.addEventListener("keyup", updateCursor);

    updateCursor();

    return () => {
      inputElement?.removeEventListener(
        "input",
        updateCursor
      );

      inputElement?.removeEventListener(
        "click",
        updateCursor
      );

      inputElement?.removeEventListener(
        "keyup",
        updateCursor
      );
    };
  }, [input]);

  return {
    inputRef,
    cursorRef,
    mirrorRef,
  };
}