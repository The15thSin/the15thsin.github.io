import { useCallback } from "react";

export default function TerminalInput({
  input,
  setInput,
  onSubmit,

  inputRef,
  cursorRef,
  mirrorRef,

  backendReady,
}) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        onSubmit();
      }
    },
    [onSubmit]
  );

  return (
    <div className="fixed bottom-8 left-6 right-6">
      <div
        className="
          relative
          flex
          items-center
          gap-4
          rounded-2xl
          border
          border-sky-400/30
          bg-slate-900/95
          px-5
          py-4
          cursor-text
        "
        onClick={() => inputRef.current?.focus()}
      >
        <span className="font-bold text-cyan-300">
          ❯
        </span>

        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            disabled={!backendReady}
            className="
              w-full
              bg-transparent
              outline-none
              caret-transparent
              font-mono
              text-sky-100
            "
          />

          <span
            ref={cursorRef}
            className="
              absolute
              top-1/2
              -translate-y-1/2
              h-5
              w-[10px]
              bg-sky-200
              animate-pulse
              pointer-events-none
            "
          />

          {!input && (
            <span
              className="
                absolute
                left-0
                top-1/2
                -translate-y-1/2
                pointer-events-none
                select-none
                font-mono
                text-sky-100/40
              "
            >
              Enter command…
            </span>
          )}

          <span
            ref={mirrorRef}
            className="
              absolute
              invisible
              whitespace-pre
              font-mono
              text-base
            "
          />
        </div>
      </div>
    </div>
  );
}