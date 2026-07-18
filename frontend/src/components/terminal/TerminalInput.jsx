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
          py-2
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
        <button
          onClick={onSubmit}
          disabled={!backendReady || !input.trim().length === 0}
          className="
              flex h-10 w-10 items-center justify-center
              rounded-full
              border border-cyan-400/40
              bg-cyan-500
              text-zinc-900
              transition-all
              hover:bg-cyan-400
              hover:scale-105
              active:scale-95
              disabled:opacity-40
              disabled:cursor-not-allowed
            ">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 ml-1"><path d="M3.4 20.4 20.8 12 3.4 3.6l2.2 6.7L15 12l-9.4 1.7-2.2 6.7z" /></svg> 
        </button>
      </div>
    </div>
  );
}