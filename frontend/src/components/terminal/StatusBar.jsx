export default function StatusBar({ status }) {
  return (
    <div className="fixed bottom-2 left-6 right-6">
      <div className="flex flex-wrap gap-3 px-2 text-xs text-zinc-400">
        <span>
          Try <span className="text-cyan-300">/help.</span>
        </span>

        <span>
          Run <span className="text-cyan-300">/info</span> to view
          {" "}resume.md.
        </span>

        <span>
          Type <span className="text-cyan-300">/status</span> to check
          session.
        </span>

        <span className="ml-auto text-cyan-300">
          {status}
        </span>
      </div>
    </div>
  );
}