import { useNavigate } from 'react-router-dom';
import Badge from './Badge';
import Button from './Button';
import ScoreBar from './ScoreBar';
import { Eye } from 'lucide-react';

type Candidate = {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  score: number | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  uploadedAt: string;
};

type CandidateTableProps = {
  candidates: Candidate[];
};

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};

export default function CandidateTable({ candidates }: CandidateTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-2xl glass shadow-glass">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/5">
            <th className="text-left px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Name</th>
            <th className="text-left px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Job</th>
            <th className="text-left px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider w-36">AI Score</th>
            <th className="text-left px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Status</th>
            <th className="text-left px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Uploaded</th>
            <th className="text-left px-5 py-4 text-slate-400 font-medium text-xs uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {candidates.map((c) => (
            <tr key={c.id} className="hover:bg-white/[0.03] transition-colors group">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 border border-indigo-500/20">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{c.name}</p>
                    <p className="text-slate-500 text-xs">{c.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-slate-300 text-sm">{c.jobTitle}</td>
              <td className="px-5 py-4 w-36">
                {c.score !== null ? (
                  <ScoreBar score={c.score} showLabel={false} />
                ) : (
                  <span className="text-slate-600 text-xs">Not scored</span>
                )}
              </td>
              <td className="px-5 py-4">
                <Badge label={c.status} color={statusColor[c.status]} />
              </td>
              <td className="px-5 py-4 text-slate-500 text-xs">{c.uploadedAt}</td>
              <td className="px-5 py-4">
                <Button
                  variant="ghost"
                  className="text-xs py-1.5 px-3 flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                  onClick={() => navigate(`/candidates/${c.id}`)}
                >
                  <Eye size={12} /> View
                </Button>
              </td>
            </tr>
          ))}
          {candidates.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-12 text-center text-slate-600">
                No candidates found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}