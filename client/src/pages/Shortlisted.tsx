import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ScoreBar from '../components/ScoreBar';
import {
  getCandidates,
  bulkUpdateStatus,
  exportShortlisted,
} from '../services/candidateService';
import toast from 'react-hot-toast';

export default function Shortlisted() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [showAutoModal, setShowAutoModal] = useState(false);
  const [minScore, setMinScore] = useState('75');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const fetchShortlisted = () => {
    setLoading(true);
    getCandidates({ status: 'shortlisted', sortBy: 'aiScore', order: 'desc' })
      .then(data => setCandidates(data.candidates))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchShortlisted(); }, []);

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Shortlisted Candidates</h2>
          <p className="text-sm text-gray-400 mt-1">
            {candidates.length} candidates ready for interview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setShowAutoModal(true)}
          >
            ⚡ Auto-Shortlist
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            disabled={exporting || candidates.length === 0}
          >
            {exporting ? 'Exporting...' : '📥 Export CSV'}
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-4 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 mb-4">
          <p className="text-primary text-sm font-medium">
            {selected.length} selected
          </p>
          <Button
            variant="danger"
            className="text-xs py-1.5"
            disabled={processing}
            onClick={handleBulkReject}
          >
            Reject Selected
          </Button>
          <button
            onClick={() => setSelected([])}
            className="text-gray-400 hover:text-white text-sm ml-auto"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Empty State */}
      {candidates.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl mb-4">✅</p>
            <h3 className="text-white font-semibold text-lg mb-2">
              No shortlisted candidates yet
            </h3>
            <p className="text-gray-400 text-sm mb-6">
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
        <>
          {/* Select All */}
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={selected.length === candidates.length && candidates.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <span className="text-gray-400 text-sm">Select all</span>
          </div>

          <div className="flex flex-col gap-3">
            {candidates.map((c) => (
              <Card
                key={c._id}
                className={`hover:border-gray-500 transition-colors ${
                  selected.includes(c._id) ? 'border-primary/50' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selected.includes(c._id)}
                    onChange={() => toggleSelect(c._id)}
                    className="w-4 h-4 accent-primary cursor-pointer mt-1 flex-shrink-0"
                  />

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold">{c.name}</h3>
                        <p className="text-gray-400 text-xs">
                          {c.email} • {c.jobId?.title || 'No job'}
                        </p>
                      </div>
                      <Badge label="shortlisted" color="green" />
                    </div>

                    {c.aiScore !== null && (
                      <div className="mb-2 max-w-xs">
                        <ScoreBar score={c.aiScore} height="h-1.5" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {c.skills?.slice(0, 5).map((s: string) => (
                        <span
                          key={s}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    variant="ghost"
                    className="text-xs py-1 px-3 flex-shrink-0"
                    onClick={() => navigate(`/candidates/${c._id}`)}
                  >
                    View
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Auto-Shortlist Modal */}
      {showAutoModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">⚡ Auto-Shortlist</h3>
              <button
                onClick={() => setShowAutoModal(false)}
                className="text-gray-400 hover:text-white"
              >✕</button>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Automatically shortlist all candidates with an AI score above your chosen threshold.
            </p>

            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-1 block">
                Minimum AI Score
              </label>
              <input
                type="number"
                value={minScore}
                onChange={e => setMinScore(e.target.value)}
                min="0"
                max="100"
                className="w-full bg-gray-900 border border-gray-600 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
              />
              <p className="text-gray-500 text-xs mt-1">
                Candidates scoring {minScore}+ will be shortlisted
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
                className="flex-1"
                disabled={processing}
                onClick={handleAutoShortlist}
              >
                {processing ? 'Processing...' : 'Auto-Shortlist Now'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}