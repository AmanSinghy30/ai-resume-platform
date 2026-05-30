type StatsCardProps = {
  title: string;
  value: number | string;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  subtitle?: string;
}

const colors = {
  blue: 'border-blue-500 bg-blue-500/10',
  green: 'border-green-500 bg-green-500/10',
  yellow: 'border-yellow-500 bg-yellow-500/10',
  purple: 'border-purple-500 bg-purple-500/10',
}

const iconColors = {
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400',
  purple: 'text-purple-400',
}

export default function StatsCard({ title, value, icon, color, subtitle }: StatsCardProps) {
  return (
    <div className={`rounded-xl border-l-4 bg-gray-800 p-5 shadow-md ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <span className={`text-2xl ${iconColors[color]}`}>{icon}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}