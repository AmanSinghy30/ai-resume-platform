type StatsCardProps = {
  title: string;
  value: number;
  icon: string;
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
  icon,
  color,
  subtitle,
}: StatsCardProps) {
  return (
    <div className={`rounded-xl border p-4 md:p-5 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl md:text-2xl">{icon}</span>
        <span className={`text-2xl md:text-3xl font-bold ${colorMap[color].split(' ')[0]}`}>
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