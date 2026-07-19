export default function StatusBar({ status }) {
  const lower = status.toLowerCase();

  const isReady = lower.includes("ready");
  const isConnecting = lower.includes("connecting");

  return (
    <div className="fixed bottom-2 left-3 right-3 sm:left-6 sm:right-6">
      <div className="flex flex-col gap-1 px-2 text-[8px] text-zinc-400 sm:flex-row sm:items-center sm:text-xs">
        {/* Help Text */}
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <span>
            Try <span className="text-cyan-300">/help</span>.
          </span>

          <span>
            Run <span className="text-cyan-300">/info</span> to view{" "}
            resume.md.
          </span>

          <span>
            Type <span className="text-cyan-300">/status</span> to check
            session.
          </span>
        </div>

        {/* Status */}
        <div
          className={`flex justify-end items-center gap-2 sm:ml-auto ${
            isReady
              ? "text-emerald-400"
              : isConnecting
              ? "text-amber-400"
              : "text-zinc-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isReady
                ? "bg-emerald-400"
                : isConnecting
                ? "bg-amber-400 animate-pulse"
                : "bg-zinc-500"
            }`}
          />

          {status}
        </div>
      </div>
    </div>
  );
}

// export default function StatusBar({ status }) {
//   const isReady = status === "Ready";
//   const isConnecting = status === "Connecting to backend...";

//   return (
//     <div className="fixed bottom-2 left-6 right-6">
//       <div className="flex flex-wrap gap-3 px-2 text-xs text-zinc-400">
//         <span>
//           Try <span className="text-cyan-300">/help.</span>
//         </span>

//         <span>
//           Run <span className="text-cyan-300">/info</span> to view{" "}
//           resume.md.
//         </span>

//         <span>
//           Type <span className="text-cyan-300">/status</span> to check
//           session.
//         </span>

//         <span
//           className={`ml-auto flex items-center gap-2 ${
//             isReady
//               ? "text-emerald-400"
//               : isConnecting
//               ? "text-amber-400"
//               : "text-zinc-400"
//           }`}
//         >
//           <span
//             className={`h-2 w-2 rounded-full ${
//               isReady
//                 ? "bg-emerald-400"
//                 : isConnecting
//                 ? "bg-amber-400 animate-pulse"
//                 : "bg-zinc-500"
//             }`}
//           />

//           {status}
//         </span>
//       </div>
//     </div>
//   );
// }