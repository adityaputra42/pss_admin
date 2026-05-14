import clsx from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'teal' | 'emerald' | 'amber' | 'rose' | 'blue' | 'green' | 'yellow' | 'red';
}

const colorMap = {
  teal: 'bg-teal-50 text-primary ring-teal-100',
  emerald: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  rose: 'bg-rose-50 text-rose-600 ring-rose-100',
  blue: 'bg-blue-50 text-blue-600 ring-blue-100',
  green: 'bg-green-50 text-green-600 ring-green-100',
  yellow: 'bg-yellow-50 text-yellow-600 ring-yellow-100',
  red: 'bg-red-50 text-red-600 ring-red-100',
};

export const StatCard = ({
  title,
  value,
  icon,
  color,
}: StatCardProps) => (
  <div className="premium-card p-6 flex items-center gap-6">
    <div className={clsx(
        "w-14 h-14 rounded-2xl flex items-center justify-center ring-4 transition-transform group-hover:scale-110",
        colorMap[color]
    )}>
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
    </div>
  </div>
);
