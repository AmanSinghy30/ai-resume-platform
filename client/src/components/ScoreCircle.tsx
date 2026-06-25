import { getScoreColor } from './ScoreBar';

type ScoreCircleProps = {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { circle: 'w-14 h-14', text: 'text-lg', border: 'border-2' },
  md: { circle: 'w-24 h-24', text: 'text-2xl', border: 'border-[3px]' },
  lg: { circle: 'w-32 h-32', text: 'text-4xl', border: 'border-4' },
};

export default function ScoreCircle({ score, size = 'md' }: ScoreCircleProps) {
  const s = sizes[size];

  if (score === null || score === undefined) {
    return (
      <div className={`${s.circle} rounded-full border-2 border-slate-200 dark:border-slate-700/50 flex items-center justify-center bg-slate-50 dark:bg-slate-800/50`}>
        <span className="text-slate-500 dark:text-slate-600 text-xs font-medium">N/A</span>
      </div>
    );
  }

  const colors = getScoreColor(score);

  return (
    <div className={`${s.circle} rounded-full ${s.border} ${colors.border} flex items-center justify-center relative`}>
      {/* Inner glow */}
      <div className={`absolute inset-1 rounded-full ${colors.border.replace('border-', 'bg-')}/10 blur-sm`} />
      <span className={`font-bold ${s.text} ${colors.text} relative z-10`}>{score}</span>
    </div>
  );
}