
export interface DetailRow {
  label: string;
  value: React.ReactNode;
}

interface DetailTableProps {
  rows: DetailRow[];
}

const DetailTable: React.FC<DetailTableProps> = ({ rows }) => (
  <div className="overflow-x-auto rounded-md border border-slate-50">
    <table className="w-full text-sm">
      <tbody className="divide-y divide-slate-50">
        {rows.map((row) => (
          <tr key={row.label} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-6 py-3 w-1/3 text-[10px] font-bold text-slate-400 uppercase tracking-widest align-top">
              {row.label}
            </td>
            <td className="px-6 py-3 font-semibold text-slate-900">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DetailTable;
