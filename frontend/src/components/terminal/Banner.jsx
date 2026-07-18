export default function Banner({ text }) {
  return (
    <pre
      className="
        overflow-x-auto
        whitespace-pre
        text-xl
        bg-gradient-to-r
        from-red-300
        via-cyan-400
        to-red-900
        bg-clip-text
        text-transparent
        drop-shadow-[0_0_12px_rgba(0,0,255,0.7)]
      "
    >
      {text}
    </pre>
  );
}