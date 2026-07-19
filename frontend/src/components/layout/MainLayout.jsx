import SoftAurora from "../../components/layout/SoftAurora";

export default function MainLayout({ children }) {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-zinc-100 font-mono">

      {/* Base background */}
      <div
        className="
          absolute inset-0
          bg-[radial-gradient(circle_at_top_left,rgba(56,110,255,0.08),transparent_12%),linear-gradient(180deg,#0a0a0a_0%,#040404_100%)]
        "
      />

      {/* Aurora */}
      <div className="absolute inset-0 pointer-events-none blur-lg">
        <SoftAurora
          speed={0.5}
          scale={2.6}
          brightness={0.85}
          color1="#00c6ff"
          color2="#ff02ed"
          noiseFrequency={1.2}
          noiseAmplitude={0.9}
          bandHeight={0.5}
          bandSpread={0.45}
          octaveDecay={0.5}
          layerOffset={0.2}
          colorSpeed={0.6}
          enableMouseInteraction={false}
        />
      </div>

      {/* Your content */}
      <div className="relative flex h-full flex-col px-2 pb-2 sm:px-8 sm:pb-24 z-10">
        {children}
      </div>

    </div>
  );
}
