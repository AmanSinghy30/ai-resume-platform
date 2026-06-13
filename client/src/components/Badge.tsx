type BadgeProps = {
  label: string;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'gray';
}

const colors = {
  green: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
  yellow: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
  red: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/25',
  blue: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25',
  purple: 'bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/25',
  gray: 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/25',
}

export default function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide ${colors[color]}`}>
      {label}
    </span>
  );
}