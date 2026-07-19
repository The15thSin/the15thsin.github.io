import HistoryItem from "./HistoryItem";
import ThinkingBox from "./ThinkingBox";

export default function TerminalOutput({
  history,
  thinking,
  endRef,
  scrollToBottom,
}) {
  return (
    <div
      className="
        flex-1
        overflow-y-auto
        p-4
        mb-24
        sm:mb-0
        scrollbar-thin
        scrollbar-thumb-slate-500/40
        scrollbar-track-transparent
        hover:scrollbar-thumb-slate-400/70
        scrollbar-thumb-rounded-full
        sm:p-4
      "
    >
      {history.map((item) => (
        <HistoryItem
          key={item.id}
          item={item}
          scrollToBottom={scrollToBottom}
        />
      ))}

      {thinking !== null && (
        <ThinkingBox
          thinking={thinking}
        />
      )}

      <div ref={endRef} />
    </div>
  );
}