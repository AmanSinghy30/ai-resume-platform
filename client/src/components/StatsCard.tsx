import type { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;        // ✅ accepts Lucide icon component
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  subtitle?: string;
};

const colorMap = {
  blue:   { icon: 'from-blue-500 to-indigo-600',   text: 'text-blue-400',   glow: 'shadow-glow-sm' },
  green:  { icon: 'from-emerald-500 to-teal-600',   text: 'text-emerald-400', glow: 'shadow-glow-green' },
  yellow: { icon: 'from-amber-500 to-orange-600',   text: 'text-amber-400',  glow: 'shadow-glow-yellow' },
  purple: { icon: 'from-violet-500 to-purple-600',  text: 'text-violet-400', glow: 'shadow-glow-purple' },
  red:    { icon: 'from-red-500 to-rose-600',       text: 'text-red-400',    glow: 'shadow-glow-red' },
};

export default function StatsCard({
  title,
  value,
  icon: Icon,            // ✅ rename to capitalized — required for JSX components
  color,
  subtitle,
}: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div className="glass rounded-2xl p-5 card-hover group animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.icon} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
          <Icon size={20} className="text-white" />
        </div>
        <span className={`text-3xl font-bold ${c.text} tracking-tight`}>
          {value}
        </span>
      </div>
      <p className="text-slate-200 font-medium text-sm">{title}</p>
      {subtitle && (
        <p className="text-xs mt-1 text-slate-500">{subtitle}</p>
      )}
    </div>
  );
}