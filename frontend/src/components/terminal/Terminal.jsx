import TerminalOutput from "./TerminalOutput";
import TerminalInput from "./TerminalInput";

export default function Terminal({
  history,
  thinking,
  endRef,
  scrollToBottom,

  input,
  setInput,
  onSubmit,

  inputRef,
  cursorRef,
  mirrorRef,

  backendReady,
  status,
}) {
  return (
    <>
      <TerminalOutput
        history={history}
        thinking={thinking}
        endRef={endRef}
        scrollToBottom={scrollToBottom}
      />

      <TerminalInput
        input={input}
        setInput={setInput}
        onSubmit={onSubmit}
        inputRef={inputRef}
        cursorRef={cursorRef}
        mirrorRef={mirrorRef}
        backendReady={backendReady}
        status={status}
      />

    </>
  );
}