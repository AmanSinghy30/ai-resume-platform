import type { LucideIcon } from 'lucide-react';

type StatsCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;        // ✅ accepts Lucide icon component
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
  subtitle?: string;
};

const colorMap = {
  blue:   'text-blue-400   bg-blue-400/10   border-blue-400/20',
  green:  'text-green-400  bg-green-400/10  border-green-400/20',
  yellow: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  red:    'text-red-400    bg-red-400/10    border-red-400/20',
};

export default function StatsCard({
  title,
  value,
  icon: Icon,            // ✅ rename to capitalized — required for JSX components
  color,
  subtitle,
}: StatsCardProps) {
  const textColor = colorMap[color].split(' ')[0];

  return (
    <div className={`rounded-xl border p-4 md:p-5 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          <Icon size={20} className={textColor} />
        </div>
        <span className={`text-2xl md:text-3xl font-bold ${textColor}`}>
          {value}
        </span>
      </div>
      <p className="text-white font-medium text-sm md:text-base">{title}</p>
      {subtitle && (
        <p className="text-xs mt-0.5 opacity-70">{subtitle}</p>
      )}
    </div>
  );
}