import { useState, useEffect } from 'react';


type ScoreBarProps = {
  score: number;
  showLabel?: boolean;
  height?: string;
};

function getScoreColor(score: number) {
  if (score >= 80) return { bar: 'from-emerald-500 to-teal-400', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500', glow: 'shadow-[0_0_12px_-3px_rgba(16,185,129,0.5)]' };
  if (score >= 60) return { bar: 'from-amber-500 to-orange-400', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500', glow: 'shadow-[0_0_12px_-3px_rgba(245,158,11,0.5)]' };
  return { bar: 'from-red-500 to-rose-400', text: 'text-red-600 dark:text-red-400', border: 'border-red-500', glow: 'shadow-[0_0_12px_-3px_rgba(239,68,68,0.5)]' };
}

function getScoreLabel(score: number) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Average';
  if (score >= 40) return 'Below Average';
  return 'Poor';
}


export default function ScoreBar({ score, showLabel = true, height = 'h-2' }: ScoreBarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const colors = getScoreColor(score);
  const clamped = Math.min(100, Math.max(0, score));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {showLabel && (
          <span className={`text-xs font-semibold ${colors.text}`}>
            {getScoreLabel(clamped)}
          </span>
        )}
        <span className={`text-xs font-bold ml-auto ${colors.text}`}>
          {clamped}/100
        </span>
      </div>
      <div className={`w-full bg-slate-200 dark:bg-slate-800/80 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${colors.bar} ${colors.glow}`}
          style={{ width: mounted ? `${clamped}%` : '0%' }}
        />
      </div>
    </div>
  );
}

export { getScoreColor, getScoreLabel };