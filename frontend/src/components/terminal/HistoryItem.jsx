import Banner from "./Banner";
import AnimatedText from "./AnimatedText";

export default function HistoryItem({ item, scrollToBottom }) {
  
  switch (item.type) {
    case "banner":
      return (
        <Banner text={item.text} />
      );

    case "command":
      return (
        <div
          className="
            whitespace-pre-wrap
            break-words
            text-[0.95rem]
            leading-relaxed
          "
        >
          <span className="font-semibold text-cyan-400">
            {item.text.prompt}
          </span>{" "}
          <span className="text-sky-100">
            {item.text.command}
          </span>
        </div>
      );

    case "assistant":
      return (
        <div
          className="
            mt-3
            mb-2
            border-l-2
            border-cyan-400/60
            pl-4
            whitespace-pre-wrap
            break-words
            leading-relaxed
            text-zinc-100
          "
        >
          <AnimatedText text={item.text} onUpdate={scrollToBottom} />
        </div>
      );

    case "info":
      return (
        <div
          className="
            whitespace-pre-wrap
            break-words
            text-[0.95rem]
            leading-relaxed
            text-zinc-400
          "
        >
          {item.text}
        </div>
      );

    case "vibe":
      return (
        <div
          className="
            whitespace-pre-wrap
            break-words
            text-[0.95rem]
            leading-relaxed
            text-cyan-300
            drop-shadow-[0_0_18px_rgba(169,240,255,0.25)]
          "
        >
          {item.text}
        </div>
      );

    case "error":
      return (
        <div
          className="
            whitespace-pre-wrap
            break-words
            text-[0.95rem]
            leading-relaxed
            text-red-400
          "
        >
          {item.text}
        </div>
      );

    default:
      return (
        <div
          className="
            whitespace-pre-wrap
            break-words
            text-[0.95rem]
            leading-relaxed
            text-zinc-100
          "
        >
          {item.text}
        </div>
      );
  }
}