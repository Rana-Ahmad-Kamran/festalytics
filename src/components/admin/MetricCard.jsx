export default function MetricCard({ label, value, hint, hintTone = "muted", icon, iconBg = "bg-slate-800" }) {
  const hintClass = {
    muted: "text-slate-400",
    success: "text-emerald-400",
    warning: "text-amber-400",
    danger: "text-rose-400",
  }[hintTone] || "text-slate-400";

  return (
    <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
            {label}
          </p>
          <p className="text-3xl font-black text-white tracking-tight">{value}</p>
          {hint && <p className={`text-xs font-medium mt-2 ${hintClass}`}>{hint}</p>}
        </div>
        {icon && (
          <div
            className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${iconBg}`}
          >
            <span className="material-symbols-outlined text-[22px] text-slate-300">{icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
