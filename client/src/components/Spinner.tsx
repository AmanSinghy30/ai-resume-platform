export default function Spinner() {
  return (
    <div className="w-full flex flex-col gap-4 animate-fade-in mt-2">
      {[1, 2, 3].map((i) => (
        <div 
          key={i} 
          className="glass p-5 rounded-2xl border border-slate-200 dark:border-white/5 animate-pulse flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700/50 flex-shrink-0" />
            <div className="space-y-3 flex-1 max-w-sm">
              <div className="h-4 bg-slate-200 dark:bg-slate-700/50 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700/50 rounded-md w-1/2" />
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            <div className="w-16 h-6 bg-slate-200 dark:bg-slate-700/50 rounded-lg" />
            <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700/50 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}