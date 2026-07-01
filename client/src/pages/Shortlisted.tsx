import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ScoreBar from '../components/ScoreBar';
import Pagination from '../components/Pagination';
import {
  getCandidates,
  bulkUpdateStatus,
  exportShortlisted,
} from '../services/candidateService';
import toast from 'react-hot-toast';
import { CheckCircle2, Zap, Download, X, Eye } from 'lucide-react';

export default function Shortlisted() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [minScore, setMinScore] = useState('75');
  const [processing, setProcessing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const navigate = useNavigate();

  const fetchShortlisted = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    getCandidates({ status: 'shortlisted', sortBy: 'aiScore', order: 'desc', page: page.toString(), limit: '10' })
      .then(data => {
        setCandidates(data.candidates);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.totalCount || 0);
      })
      .catch(() => { if (!silent) toast.error('Failed to load'); })
      .finally(() => { if (!silent) setLoading(false); });
  }, [page]);

  useEffect(() => {
    fetchShortlisted();
    const interval = setInterval(() => fetchShortlisted(true), 5000);
    return () => clearInterval(interval);
  }, [fetchShortlisted]);

  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelected(
      selected.length === candidates.length ? [] : candidates.map(c => c._id)
    );
  };

  const handleBulkReject = async () => {
    if (!selected.length) { toast.error('Select candidates first'); return; }
    if (!window.confirm(`Reject ${selected.length} candidates?`)) return;
    setProcessing(true);
    try {
      await bulkUpdateStatus(selected, 'rejected');
      toast.success(`${selected.length} candidates rejected`);
      setSelected([]);
      fetchShortlisted();
    } catch {
      toast.error('Bulk action failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportShortlisted();
      toast.success('CSV downloaded!');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleAutoShortlist = async () => {
    const score = Number(minScore);
    if (isNaN(score) || score < 0 || score > 100) {
      toast.error('Enter a valid score between 0 and 100');
      return;
    }
    setProcessing(true);
    try {
      const data = await bulkUpdateStatus('auto', 'shortlisted', score);
      toast.success(data.message);
      setShowAutoModal(false);
      fetchShortlisted();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Auto-shortlist failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <Layout title="Shortlisted"><Spinner /></Layout>;

  return (
    <Layout title="Shortlisted Candidates">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Shortlisted Candidates</h2>
          <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">
            {totalCount} candidates ready for interview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowAutoModal(true)}
            className="flex items-center gap-2"
          >
            <Zap size={16} className="text-amber-500 dark:text-amber-400" /> Auto-Shortlist
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={exporting || candidates.length === 0}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-glow-green"
          >
            <Download size={16} /> {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-xl px-5 py-3 mb-4 shadow-inner-glow animate-fade-in">
          <p className="text-primary text-sm font-medium">
            {selected.length} selected
          </p>
          <Button
            variant="danger"
            className="text-xs py-1.5 px-4"
            disabled={processing}
            onClick={handleBulkReject}
          >
            Reject Selected
          </Button>
          <button
            onClick={() => setSelected([])}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm ml-auto transition-colors"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Empty State */}
      {candidates.length === 0 && (
        <Card className="animate-fade-in">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-5 border border-emerald-500/20 shadow-glow-green">
              <CheckCircle2 size={36} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">
              No shortlisted candidates yet
            </h3>
            <p className="text-slate-600 dark:text-slate-500 text-sm mb-6">
              Shortlist candidates from the Candidates page or use Auto-Shortlist
            </p>
            <Button variant="primary" onClick={() => navigate('/candidates')}>
              View All Candidates
            </Button>
          </div>
        </Card>
      )}

      {/* Candidates List */}
      {candidates.length > 0 && (
        <div className="animate-fade-in">
          {/* Select All */}
          <div className="flex items-center gap-3 mb-4 px-2">
            <input
              type="checkbox"
              checked={selected.length === candidates.length && candidates.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <span className="text-slate-600 dark:text-slate-400 text-sm">Select all</span>
          </div>

          <div className="flex flex-col gap-3">
            {candidates.map((c) => (
              <Card
                key={c._id}
                className={`transition-all duration-200 group ${selected.includes(c._id) ? 'border-primary/50 shadow-glow-sm bg-primary/5' : 'hover:border-slate-300 dark:hover:border-emerald-500/30'
                  }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left Group */}
                  <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => toggleSelect(c._id)}>
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selected.includes(c._id)}
                      onChange={() => toggleSelect(c._id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
                    />

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 font-bold text-lg flex-shrink-0 border border-emerald-500/20 shadow-inner">
                      {c.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-slate-900 dark:text-white font-medium text-base truncate">{c.name}</h3>
                      <p className="text-slate-600 dark:text-slate-500 text-xs mt-0.5 truncate">
                        {c.email} • {c.jobId?.title || 'No job'}
                      </p>
                    </div>
                  </div>

                  {/* Right Group */}
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <div className="hidden lg:flex flex-col items-end w-32">
                      {c.aiScore !== null ? (
                        <ScoreBar score={c.aiScore} height="h-1.5" />
                      ) : (
                        <span className="text-slate-500 dark:text-slate-600 text-xs">Not scored</span>
                      )}
                    </div>

                    <div className="hidden md:flex gap-1.5">
                      {c.skills?.slice(0, 3).map((s: string) => (
                        <span
                          key={s}
                          className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <Badge label="shortlisted" color="green" />

                    <Button
                      variant="ghost"
                      className="text-xs py-1.5 px-3 flex items-center gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); navigate(`/candidates/${c._id}`); }}
                    >
                      <Eye size={14} /> View
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Shortlist Modal */}
      {showAutoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4">
          <div className="glass-strong border border-slate-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-md shadow-glass-lg animate-scale-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-slate-900 dark:text-white font-semibold text-lg tracking-tight flex items-center gap-2">
                <Zap size={18} className="text-amber-500 dark:text-amber-400" /> Auto-Shortlist
              </h3>
              <button
                onClick={() => setShowAutoModal(false)}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed">
              Automatically shortlist all candidates with an AI score above your chosen threshold.
            </p>

            <div className="mb-6">
              <label className="text-sm text-slate-700 dark:text-slate-400 mb-1.5 block font-medium">
                Minimum AI Score
              </label>
              <input
                type="number"
                value={minScore}
                onChange={e => setMinScore(e.target.value)}
                min="0"
                max="100"
                className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm"
              />
              <p className="text-emerald-600 dark:text-emerald-400/80 text-xs mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> Candidates scoring {minScore}+ will be shortlisted
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowAutoModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-glow-yellow"
                disabled={processing}
                onClick={handleAutoShortlist}
              >
                {processing ? 'Processing...' : 'Auto-Shortlist Now'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {candidates.length > 0 && (
        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      )}
    </Layout>
  );
}