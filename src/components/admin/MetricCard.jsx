export default function MetricCard({ label, value, hint, accent = "rose" }) {
  const accentMap = {
    rose: "border-rose-500/30 bg-rose-500/10",
    amber: "border-amber-500/30 bg-amber-500/10",
    emerald: "border-emerald-500/30 bg-emerald-500/10",
    sky: "border-sky-500/30 bg-sky-500/10",
  };

  return (
    <div className={`rounded-2xl border p-5 ${accentMap[accent] || accentMap.rose}`}>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-3xl font-black text-white">{value}</p>
      {hint && <p className="text-xs text-slate-400 mt-2">{hint}</p>}
    </div>
  );
}
