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
    <div className="overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Job</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium w-36">AI Score</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Uploaded</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-900">
          {candidates.map((c) => (
            <tr key={c.id} className="hover:bg-gray-800 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{c.name}</p>
                    <p className="text-gray-500 text-xs">{c.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-300 text-sm">{c.jobTitle}</td>
              <td className="px-4 py-3 w-36">
                {c.score !== null ? (
                  <ScoreBar score={c.score} showLabel={false} />
                ) : (
                  <span className="text-gray-500 text-xs">Not scored</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge label={c.status} color={statusColor[c.status]} />
              </td>
              <td className="px-4 py-3 text-gray-400 text-xs">{c.uploadedAt}</td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  className="text-xs py-1 px-2 flex items-center gap-1"
                  onClick={() => navigate(`/candidates/${c.id}`)}
                >
                  <Eye size={12} /> View
                </Button>
              </td>
            </tr>
          ))}
          {candidates.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                No candidates found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}