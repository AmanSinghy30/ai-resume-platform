import { useState, useEffect } from 'react';


type ScoreBarProps = {
  score: number;
  showLabel?: boolean;
  height?: string;
};

function getScoreColor(score: number) {
  if (score >= 80) return { bar: 'bg-green-500', text: 'text-green-400', border: 'border-green-500' };
  if (score >= 60) return { bar: 'bg-yellow-500', text: 'text-yellow-400', border: 'border-yellow-500' };
  return { bar: 'bg-red-500', text: 'text-red-400', border: 'border-red-500' };
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
          <span className={`text-xs font-medium ${colors.text}`}>
            {getScoreLabel(clamped)}
          </span>
        )}
        <span className={`text-xs font-bold ml-auto ${colors.text}`}>
          {clamped}/100
        </span>
      </div>
      <div className={`w-full bg-gray-700 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} rounded-full transition-all duration-700 ease-out ${colors.bar}`}
          style={{ width: mounted ? `${clamped}%` : '0%' }}
        />
      </div>
    </div>
  );
}

export { getScoreColor, getScoreLabel };