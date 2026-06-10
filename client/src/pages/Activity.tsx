import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { getActivityLogs } from '../services/activityService';
import toast from 'react-hot-toast';
import { 
  UploadCloud, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Briefcase, 
  Edit3, 
  Trash2, 
  Sparkles,
  ClipboardList,
  User
} from 'lucide-react';

type Log = {
  _id: string;
  action: string;
  description: string;
  candidateId: { name: string; email: string } | null;
  jobId: { title: string } | null;
  performedBy: { name: string } | null;
  createdAt: string;
};

// Map actions to Lucide icons and gradient colors
const actionConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  resume_uploaded:       { icon: <UploadCloud size={18} />, color: 'text-blue-400',   bg: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/20' },
  candidate_shortlisted: { icon: <CheckCircle2 size={18} />, color: 'text-emerald-400',  bg: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/20' },
  candidate_rejected:    { icon: <XCircle size={18} />, color: 'text-red-400',    bg: 'bg-gradient-to-br from-red-500/20 to-rose-500/20 border-red-500/20' },
  candidate_reviewed:    { icon: <Eye size={18} />, color: 'text-amber-400', bg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-500/20' },
  job_created:           { icon: <Briefcase size={18} />, color: 'text-violet-400', bg: 'bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/20' },
  job_updated:           { icon: <Edit3 size={18} />, color: 'text-indigo-400',   bg: 'bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border-indigo-500/20' },
  job_deleted:           { icon: <Trash2 size={18} />, color: 'text-slate-400',   bg: 'bg-gradient-to-br from-slate-500/20 to-slate-600/20 border-slate-500/20' },
  ai_analysis_run:       { icon: <Sparkles size={18} />, color: 'text-primary',     bg: 'bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/20 shadow-glow-sm' },
  candidate_deleted:     { icon: <Trash2 size={18} />, color: 'text-slate-400',   bg: 'bg-gradient-to-br from-slate-500/20 to-slate-600/20 border-slate-500/20' },
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
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Activity Log</h2>
          <p className="text-sm text-slate-500 mt-1">
            {total} total actions recorded
          </p>
        </div>
      </div>

      {/* Action Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap animate-fade-in">
        {ACTION_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setActionFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              actionFilter === f.value
                ? 'gradient-primary text-white border-primary/50 shadow-glow-sm'
                : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:border-white/20 hover:bg-white/10'
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
        <Card className="animate-fade-in">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center mb-5 border border-white/5">
              <ClipboardList size={36} className="text-slate-500" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">No activity yet</h3>
            <p className="text-slate-500 text-sm">
              Actions like uploading resumes and shortlisting candidates will appear here
            </p>
          </div>
        </Card>
      )}

      {/* Activity Timeline */}
      {!loading && logs.length > 0 && (
        <div className="flex flex-col gap-3 animate-fade-in">
          {logs.map((log) => {
            const config = actionConfig[log.action] || {
              icon: <ClipboardList size={18} />,
              color: 'text-slate-400',
              bg: 'bg-gradient-to-br from-slate-500/20 to-slate-600/20 border-slate-500/20',
            };

            return (
              <Card key={log._id} className="hover:border-white/20 transition-all duration-200 group">
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${config.bg} ${config.color} group-hover:scale-105 transition-transform`}>
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={`text-sm font-medium ${config.color}`}>
                          {log.description || log.action.replace(/_/g, ' ')}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {log.candidateId && (
                            <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
                              <User size={12} className="text-slate-500" /> {log.candidateId.name}
                            </span>
                          )}
                          {log.jobId && (
                            <span className="text-xs text-slate-400 flex items-center gap-1.5 bg-black/20 px-2.5 py-1 rounded-lg border border-white/5">
                              <Briefcase size={12} className="text-slate-500" /> {log.jobId.title}
                            </span>
                          )}
                          {log.performedBy && (
                            <span className="text-xs text-slate-500">
                              by {log.performedBy.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-400 font-medium">{timeAgo(log.createdAt)}</p>
                        <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">{formatDate(log.createdAt)}</p>
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
        <div className="flex items-center justify-center gap-2 mt-8 animate-fade-in">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm disabled:opacity-40 hover:border-white/20 hover:bg-white/10 transition-all font-medium"
          >
            ← Prev
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc: (number | string)[], p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === '...' ? (
                  <span key={`dots-${i}`} className="px-2 py-2 text-slate-600 text-sm">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p as number)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                      page === p
                        ? 'gradient-primary text-white shadow-glow-sm border border-primary/50'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
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
            className="px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm disabled:opacity-40 hover:border-white/20 hover:bg-white/10 transition-all font-medium"
          >
            Next →
          </button>
        </div>
      )}

    </Layout>
  );
}