import { getScoreColor } from './ScoreBar';

type ScoreCircleProps = {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { circle: 'w-14 h-14', text: 'text-lg', border: 'border-2' },
  md: { circle: 'w-24 h-24', text: 'text-2xl', border: 'border-4' },
  lg: { circle: 'w-32 h-32', text: 'text-4xl', border: 'border-4' },
};

export default function ScoreCircle({ score, size = 'md' }: ScoreCircleProps) {
  const s = sizes[size];

  if (score === null || score === undefined) {
    return (
      <div className={`${s.circle} rounded-full border-2 border-gray-600 flex items-center justify-center`}>
        <span className="text-gray-500 text-xs font-medium">N/A</span>
      </div>
    );
  }

  const colors = getScoreColor(score);

  return (
    <div className={`${s.circle} rounded-full ${s.border} ${colors.border} flex items-center justify-center`}>
      <span className={`font-bold ${s.text} text-white`}>{score}</span>
    </div>
  );
}