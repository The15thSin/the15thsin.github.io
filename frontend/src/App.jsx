import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

const BANNER = `
╭───< Ayush Vibe Codes: V1 >─────────┬─────────────────────────────────────╮
│                                    │ Tips for getting started...         |
│    Welcome back for Ayush Jalan.   │ Run /info to view resume.md,        |
│                                    │  or /help if you're feeling lost.   |
│               /\\_/|                │                                     |
│              ( -.- )               │ This portfolio was 100% vibe coded. |
│               z z z                │ 0% planning, 100% confidence.       |
│                                    │                                     │
│         Software Engineer          │ Still under construction...         |
│      ~/ayushjalan/portfolio        │ Why? Because credits ran out... ;)  |
╰────────────────────────────────────┴─────────────────────────────────────╯

`;

export default function App() {
  const [history, setHistory] = useState([
    { id: 0, text: BANNER, type: 'banner' },
    { id: 1, text: "Welcome to Ayush Jalan's portfolio.", type: 'info' },
    { id: 2, text: 'Completely vibe coded portfolio -> feels slick and immersive.', type: 'vibe' },
    { id: 3, text: 'Claude Code-style assistant is ready!!! Send a command below...', type: 'info' },
    { id: 4, text: ' ', type: 'info' },
  ]);

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState('');
  const [status, setStatus] = useState("Connecting to backend...");
  const [backendReady, setBackendReady] = useState(false);
  const [thinking, setThinking] = useState("");

  const inputRef = useRef(null);
  const cursorRef = useRef(null);
  const mirrorRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* Caret sync */
  useEffect(() => {
    const updateCursor = () => {
      const inputEl = inputRef.current;
      const cursorEl = cursorRef.current;
      const mirrorEl = mirrorRef.current;
      if (!inputEl || !cursorEl || !mirrorEl) return;

      const pos = inputEl.selectionStart ?? inputEl.value.length;

      mirrorEl.textContent =
        inputEl.value.slice(0, pos).replace(/ /g, '\u00A0');

      const rect = mirrorEl.getBoundingClientRect();
      cursorEl.style.left = `${rect.width}px`;
    };

    const el = inputRef.current;
    el?.addEventListener('input', updateCursor);
    el?.addEventListener('click', updateCursor);
    updateCursor();

    return () => {
      el?.removeEventListener('input', updateCursor);
      el?.removeEventListener('click', updateCursor);
    };
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [history, thinking]);

  const addHistory = (text, type = 'command') => {
    setHistory((h) => [...h, { id: Date.now(), text, type }]);
  };

  const updateLastHistory = (text) => {
    setHistory((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = {
        ...copy[copy.length - 1],
        text,
      };
      return copy;
    });
  };

  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        const res = await fetch(`${BACKEND_ENDPOINT}/health`);

        if (res.ok) {
          if (!cancelled) {
            setBackendReady(true);
            setStatus("Ready");
          }
          return;
        }
      } catch (_) { }

      if (!cancelled) {
        setStatus("Connecting to backend...");
        setTimeout(checkHealth, 2000);
      }
    };

    checkHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    if (!backendReady) {
      addHistory("Backend is still starting. Please wait...", "info");
      return;
    }

    const command = input.trim();

    // Show command in terminal
    addHistory(
      {
        prompt: "ayush@portfolio:~$",
        command,
      },
      "command"
    );

    requestAnimationFrame(() => {
      if (cursorRef.current) cursorRef.current.style.left = "0px";
    });

    setInput("");
    setStatus("Ready");
    setThinking("Thinking...");

    // Updated conversation
    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: command,
      },
    ];

    setMessages(updatedMessages);
    let assistantReply = "";
    let thinkingText = "";
    let firstAssistantToken = false;

    try {
      addHistory("", "assistant");
      const response = await fetch(`${BACKEND_ENDPOINT}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/x-ndjson",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          max_tokens: 8192,
          temperature: 1.0,
          top_p: 0.95,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      if (!response.body) {
        throw new Error("No response stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete JSON

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const obj = JSON.parse(line);

            if ("1" in obj && !firstAssistantToken) {
              thinkingText += obj["1"];
              setThinking(thinkingText);
            }

            if ("0" in obj) {

              if (!firstAssistantToken) {
                firstAssistantToken = true;
                setThinking("");
              }

              assistantReply += obj["0"];
              updateLastHistory(assistantReply);
            }
          } catch (e) {
            console.error("Invalid NDJSON:", line);
          }
        }
      }

      if (buffer.trim()) {
        try {
          const obj = JSON.parse(buffer);

          if ("1" in obj && !firstAssistantToken) {
            thinkingText += obj["1"];
            setThinking(thinkingText);
          }

          if ("0" in obj) {

            if (!firstAssistantToken) {
              firstAssistantToken = true;
              setThinking("");
            }

            assistantReply += obj["0"];
            updateLastHistory(assistantReply);
          }
        } catch (err) {
          console.error("Invalid final NDJSON:", buffer);
        }
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: assistantReply,
        },
      ]);

      // addHistory(assistantReply, "info");
    } catch (err) {
      addHistory("Error: Unable to reach backend endpoint.", "error");
    } finally {
      setThinking("");
      setStatus("Ready");
    }
  };

  return (
    <div className="h-screen w-screen bg-black text-zinc-100 font-mono overflow-hidden">
      <div className="flex h-full flex-col px-8 pb-24 bg-[radial-gradient(circle_at_top_left,rgba(56,110,255,0.08),transparent_22%),linear-gradient(180deg,#0a0a0a_0%,#040404_100%)]">

        {/* OUTPUT */}
        <div className="flex-1 overflow-y-auto p-4 
            scrollbar-thin
            scrollbar-thumb-slate-500/40
            scrollbar-track-transparent
            hover:scrollbar-thumb-slate-400/70
            scrollbar-thumb-rounded-full">
          {history.map((e) => {
            switch (e.type) {
              case "banner":
                return (
                  <pre
                    key={e.id}
                    className="text-xl whitespace-pre overflow-x-auto bg-gradient-to-r from-red-300 via-cyan-400 to-red-900 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,0,255,0.7)]"
                  >
                    {e.text}
                  </pre>
                );

              case "command":
                return (
                  <div
                    key={e.id}
                    className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed"
                  >
                    <span className="text-cyan-400 font-semibold">
                      {e.text.prompt}
                    </span>{" "}
                    <span className="text-sky-100">
                      {e.text.command}
                    </span>
                  </div>
                );

              case "assistant":
                return (
                  <div
                    key={e.id}
                    className="
                      mt-3 mb-2
                      border-l-2 border-cyan-400/60
                      pl-4
                      whitespace-pre-wrap
                      break-words
                      leading-relaxed
                      text-zinc-100
                    "
                  >
                    {e.text}
                  </div>
                );

              case "info":
                return (
                  <div
                    key={e.id}
                    className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-zinc-400"
                  >
                    {e.text}
                  </div>
                );

              case "vibe":
                return (
                  <div
                    key={e.id}
                    className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-cyan-300 drop-shadow-[0_0_18px_rgba(169,240,255,0.25)]"
                  >
                    {e.text}
                  </div>
                );

              case "error":
                return (
                  <div
                    key={e.id}
                    className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-red-400"
                  >
                    {e.text}
                  </div>
                );

              default:
                return (
                  <div
                    key={e.id}
                    className="whitespace-pre-wrap break-words text-[0.95rem] leading-relaxed text-zinc-100"
                  >
                    {e.text}
                  </div>
                );
            }
          })}
          {thinking && (
            <div
              className="
                mt-3 mb-2
                rounded-lg
                border border-yellow-500/20
                bg-yellow-500/5
                px-4 py-3
                whitespace-pre-wrap
                break-words
              "
            >
              <div className="flex items-center gap-2 mb-2 text-yellow-400 text-xs uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                Thinking...
              </div>

              <div className="text-yellow-200/90 italic leading-relaxed">
                {thinking}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* INPUT */}
        <div className="fixed bottom-2 left-6 right-6 space-y-2">
          <div
            className="relative flex items-center gap-4 rounded-2xl border border-sky-400/30 bg-slate-900/95 px-5 py-4 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            <span className="text-cyan-300 font-bold">❯</span>

            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                className="
                  w-full
                  bg-transparent
                  outline-none
                  caret-transparent
                  text-sky-100
                  font-mono
                "
                spellCheck={false}
                disabled={!backendReady}
              />

              {/* BLOCK CURSOR */}
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
                    text-sky-100/40
                    font-mono
                    pointer-events-none
                    select-none
                  "
                >
                  Enter command…
                </span>
              )}

              {/* TEXT MIRROR */}
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

          {/* HINTS */}
          <div className="flex flex-wrap gap-3 px-2 text-xs text-zinc-400">
            <span>
              Try <span className="text-cyan-300">/help.</span>
            </span>
            <span>
              Run <span className="text-cyan-300">/info</span> to view resume.md.
            </span>
            <span>
              Type <span className="text-cyan-300">/status</span> to check session
            </span>

            <span className="ml-auto text-cyan-300">{status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}