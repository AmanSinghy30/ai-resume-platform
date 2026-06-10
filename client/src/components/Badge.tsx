type BadgeProps = {
  label: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
}

const colors = {
  green: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  yellow: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  red: 'bg-red-500/15 text-red-400 border border-red-500/25',
  blue: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  purple: 'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  gray: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
}

export default function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide ${colors[color]}`}>
      {label}
    </span>
  );
}