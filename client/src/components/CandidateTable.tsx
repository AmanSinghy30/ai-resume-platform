import { useNavigate } from 'react-router-dom';
import Badge from './Badge';
import Button from './Button';

type Candidate = {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  score: number | null;
  status: string;
  uploadedAt: string;
};

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  shortlisted: 'green',
  reviewed:    'blue',
  new:         'yellow',
  rejected:    'red',
};

export default function CandidateTable({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const navigate = useNavigate();

  if (candidates.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 text-sm">
        No candidates to show
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700 text-left">
              <th className="px-4 py-3 text-gray-400 font-medium">Name</th>
              {/* Hide on mobile */}
              <th className="px-4 py-3 text-gray-400 font-medium hidden md:table-cell">
                Job
              </th>
              <th className="px-4 py-3 text-gray-400 font-medium">Score</th>
              <th className="px-4 py-3 text-gray-400 font-medium">Status</th>
              {/* Hide on mobile */}
              <th className="px-4 py-3 text-gray-400 font-medium hidden lg:table-cell">
                Date
              </th>
              <th className="px-4 py-3 text-gray-400 font-medium text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {candidates.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-gray-700/30 transition-colors"
              >
                {/* Name — always visible */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate max-w-[120px] md:max-w-none">
                        {c.name}
                      </p>
                      <p className="text-gray-500 text-xs truncate hidden sm:block">
                        {c.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Job — hidden on mobile */}
                <td className="px-4 py-3 text-gray-300 hidden md:table-cell">
                  <span className="truncate block max-w-[140px]">{c.jobTitle}</span>
                </td>

                {/* Score — always visible */}
                <td className="px-4 py-3">
                  <span
                    className={`font-bold ${
                      c.score === null
                        ? 'text-gray-500'
                        : c.score >= 80
                        ? 'text-green-400'
                        : c.score >= 60
                        ? 'text-yellow-400'
                        : 'text-red-400'
                    }`}
                  >
                    {c.score !== null ? `${c.score}` : '—'}
                  </span>
                </td>

                {/* Status — always visible */}
                <td className="px-4 py-3">
                  <Badge
                    label={c.status}
                    color={statusColor[c.status] || 'gray'}
                  />
                </td>

                {/* Date — hidden on mobile & tablet */}
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">
                  {c.uploadedAt}
                </td>

                {/* Action — always visible */}
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    className="text-xs py-1 px-3"
                    onClick={() => navigate(`/candidates/${c.id}`)}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}