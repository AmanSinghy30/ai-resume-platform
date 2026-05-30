import Badge from './Badge';
import Button from './Button';

type Candidate = {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  score: number | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  uploadedAt: string;
}

type CandidateTableProps = {
  candidates: Candidate[];
}

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-500 text-sm">—</span>;
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-bold text-sm ${color}`}>{score}/100</span>;
}

export default function CandidateTable({ candidates }: CandidateTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-800 border-b border-gray-700">
          <tr>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Name</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Job</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">AI Score</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Uploaded</th>
            <th className="text-left px-4 py-3 text-gray-400 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 bg-gray-900">
          {candidates.map((c) => (
            <tr key={c.id} className="hover:bg-gray-800 transition-colors">
              <td className="px-4 py-3">
                <p className="text-white font-medium">{c.name}</p>
                <p className="text-gray-500 text-xs">{c.email}</p>
              </td>
              <td className="px-4 py-3 text-gray-300">{c.jobTitle}</td>
              <td className="px-4 py-3"><ScoreBadge score={c.score} /></td>
              <td className="px-4 py-3">
                <Badge label={c.status} color={statusColor[c.status]} />
              </td>
              <td className="px-4 py-3 text-gray-400">{c.uploadedAt}</td>
              <td className="px-4 py-3">
                <Button variant="ghost" className="text-xs py-1 px-2">View</Button>
              </td>
            </tr>
          ))}
          {candidates.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                No candidates yet. Upload resumes to get started.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}