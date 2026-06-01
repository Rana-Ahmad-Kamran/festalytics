export default function DataTable({ columns, rows, emptyMessage = "No records." }) {
  if (!rows?.length) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center text-slate-400 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/50">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-widest">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-bold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.map((row) => (
              <tr key={row._key} className="hover:bg-slate-800/40 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-slate-200 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
