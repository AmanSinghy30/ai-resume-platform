import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { getActivityLogs } from '../services/activityService';
import toast from 'react-hot-toast';

type Log = {
  _id: string;
  action: string;
  description: string;
  candidateId: { name: string; email: string } | null;
  jobId: { title: string } | null;
  performedBy: { name: string } | null;
  createdAt: string;
};

const actionConfig: Record<string, { icon: string; color: string; bg: string }> = {
  resume_uploaded:       { icon: '📤', color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  candidate_shortlisted: { icon: '✅', color: 'text-green-400',  bg: 'bg-green-500/10' },
  candidate_rejected:    { icon: '❌', color: 'text-red-400',    bg: 'bg-red-500/10' },
  candidate_reviewed:    { icon: '👁️', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  job_created:           { icon: '💼', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  job_updated:           { icon: '✏️', color: 'text-blue-300',   bg: 'bg-blue-500/10' },
  job_deleted:           { icon: '🗑️', color: 'text-gray-400',   bg: 'bg-gray-500/10' },
  ai_analysis_run:       { icon: '🤖', color: 'text-accent',     bg: 'bg-green-500/10' },
  candidate_deleted:     { icon: '🗑️', color: 'text-gray-400',   bg: 'bg-gray-500/10' },
};

const ACTION_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Uploads', value: 'resume_uploaded' },
  { label: 'Shortlisted', value: 'candidate_shortlisted' },
  { label: 'Rejected', value: 'candidate_rejected' },
  { label: 'Jobs', value: 'job_created' },
  { label: 'AI', value: 'ai_analysis_run' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return 'Just now';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Activity() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = (p = 1, action = '') => {
    setLoading(true);
    getActivityLogs({ limit: 15, page: p, action: action || undefined })
      .then(data => {
        setLogs(data.logs);
        setTotal(data.total);
        setTotalPages(data.pages);
      })
      .catch(() => toast.error('Failed to load activity'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs(1, actionFilter);
    setPage(1);
  }, [actionFilter]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchLogs(newPage, actionFilter);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Layout title="Activity">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Activity Log</h2>
          <p className="text-sm text-gray-400 mt-1">
            {total} total actions recorded
          </p>
        </div>
      </div>

      {/* Action Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {ACTION_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActionFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              actionFilter === f.value
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && <Spinner />}

      {/* Empty State */}
      {!loading && logs.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl mb-4">📋</p>
            <h3 className="text-white font-semibold text-lg mb-2">No activity yet</h3>
            <p className="text-gray-400 text-sm">
              Actions like uploading resumes and shortlisting candidates will appear here
            </p>
          </div>
        </Card>
      )}

      {/* Activity Timeline */}
      {!loading && logs.length > 0 && (
        <div className="flex flex-col gap-3">
          {logs.map((log, index) => {
            const config = actionConfig[log.action] || {
              icon: '📋',
              color: 'text-gray-400',
              bg: 'bg-gray-500/10',
            };

            return (
              <Card key={log._id} className="hover:border-gray-600 transition-colors">
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                    <span className="text-lg">{config.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={`text-sm font-semibold ${config.color}`}>
                          {log.description || log.action.replace(/_/g, ' ')}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-1">
                          {log.candidateId && (
                            <span className="text-xs text-gray-400">
                              👤 {log.candidateId.name}
                            </span>
                          )}
                          {log.jobId && (
                            <span className="text-xs text-gray-400">
                              💼 {log.jobId.title}
                            </span>
                          )}
                          {log.performedBy && (
                            <span className="text-xs text-gray-400">
                              by {log.performedBy.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-400">{timeAgo(log.createdAt)}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-40 hover:border-gray-500 transition-colors"
          >
            ← Prev
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc: (number | string)[], p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="px-2 py-2 text-gray-500 text-sm">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-primary text-white'
                        : 'bg-gray-800 border border-gray-700 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-lg text-sm disabled:opacity-40 hover:border-gray-500 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

    </Layout>
  );
}