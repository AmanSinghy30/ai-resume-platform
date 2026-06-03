import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ScoreBar from '../components/ScoreBar';
import ScoreCircle from '../components/ScoreCircle';
import { getJobById, matchCandidates, scoreAllForJob } from '../services/jobService';
import toast from 'react-hot-toast';

type RankedCandidate = {
  candidateId: string;
  matchScore: number;
  reason: string;
};

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<RankedCandidate[]>([]);
  const [matching, setMatching] = useState(false);
  const [scoring, setScoring] = useState(false);
  const [view, setView] = useState<'candidates' | 'ranked'>('candidates');

  // ✅ NEW — Selected candidate IDs
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!id) return;
    getJobById(id)
      .then(data => setJob(data.job))
      .catch(() => toast.error('Failed to load job'))
      .finally(() => setLoading(false));
  }, [id]);

  // ─── Selection Helpers ───
  const toggleSelect = (cid: string) => {
    setSelected(prev =>
      prev.includes(cid) ? prev.filter(x => x !== cid) : [...prev, cid]
    );
  };

  const toggleSelectAll = () => {
    const all = (job?.candidates || []).map((c: any) => c._id);
    setSelected(prev => prev.length === all.length ? [] : all);
  };

  const selectUnscored = () => {
    const unscored = (job?.candidates || [])
      .filter((c: any) => c.aiScore === null || c.aiScore === undefined)
      .map((c: any) => c._id);
    setSelected(unscored);
    toast.success(`${unscored.length} unscored candidates selected`);
  };

  // ─── AI Actions ───
  const handleScore = async () => {
    if (!id) return;

    const candidates = job?.candidates || [];
    if (candidates.length === 0) return;

    // If nothing selected, ask user
    if (selected.length === 0) {
      toast.error('Please select at least one candidate');
      return;
    }

    // Warning if rescoring already scored ones
    const rescoring = candidates.filter(
      (c: any) => selected.includes(c._id) && c.aiScore !== null && c.aiScore !== undefined
    );
    if (rescoring.length > 0) {
      const ok = window.confirm(
        `${rescoring.length} of the selected candidates already have scores. Re-score and overwrite them?`
      );
      if (!ok) return;
    }

    setScoring(true);
    try {
      const data = await scoreAllForJob(id, selected);
      toast.success(data.message);
      const updated = await getJobById(id);
      setJob(updated.job);
      setSelected([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Scoring failed');
    } finally {
      setScoring(false);
    }
  };

  const handleMatch = async () => {
    if (!id) return;
    setMatching(true);
    try {
      const data = await matchCandidates(id);
      setRanking(data.ranked);
      setView('ranked');
      toast.success('Candidates ranked by AI!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Matching failed');
    } finally {
      setMatching(false);
    }
  };

  const getRankedCandidates = () => {
    if (!ranking.length || !job?.candidates) return [];
    return ranking
      .map(r => {
        const candidate = job.candidates.find((c: any) => c._id === r.candidateId);
        return candidate ? { ...candidate, matchScore: r.matchScore, reason: r.reason } : null;
      })
      .filter(Boolean);
  };

  if (loading) return <Layout title="Job Detail"><Spinner /></Layout>;
  if (!job) return (
    <Layout title="Job Detail">
      <p className="text-gray-400">Job not found.</p>
    </Layout>
  );

  const candidates = job.candidates || [];
  const allSelected = selected.length === candidates.length && candidates.length > 0;

  return (
    <Layout title="Job Detail">

      <button
        onClick={() => navigate('/jobs')}
        className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Job Info */}
        <div className="flex flex-col gap-5">

          <Card>
            <h2 className="text-xl font-bold text-white mb-2">{job.title}</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{job.description}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {job.requiredSkills.map((skill: string) => (
                <span
                  key={skill}
                  className="text-xs bg-primary/20 text-primary px-2.5 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Experience</span>
                <span className="text-gray-300">{job.experienceRequired}+ years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Candidates</span>
                <span className="text-gray-300">{candidates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created</span>
                <span className="text-gray-300">
                  {new Date(job.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </Card>

          {/* AI Actions */}
          <Card>
            <h3 className="text-white font-semibold mb-3">AI Actions</h3>
            <div className="flex flex-col gap-3">

              <div>
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  disabled={scoring || candidates.length === 0 || selected.length === 0}
                  onClick={handleScore}
                >
                  {scoring
                    ? '⏳ Scoring...'
                    : selected.length === 0
                    ? '🤖 Score Selected'
                    : `🤖 Score Selected (${selected.length})`}
                </Button>
                <p className="text-gray-500 text-xs mt-1 text-center">
                  {selected.length === 0
                    ? 'Select candidates from the list to score'
                    : `Will score ${selected.length} candidate${selected.length > 1 ? 's' : ''}`}
                </p>
              </div>

              {/* Quick Selectors */}
              {candidates.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={toggleSelectAll}
                    className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1.5 rounded transition-colors"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                  <button
                    onClick={selectUnscored}
                    className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1.5 rounded transition-colors"
                  >
                    Select Unscored
                  </button>
                </div>
              )}

              <div>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  disabled={matching || candidates.length === 0 || !job.description}
                  onClick={handleMatch}
                >
                  {matching ? '⏳ Ranking...' : '🏆 Rank by AI Match'}
                </Button>
                {!job.description && (
                  <p className="text-yellow-400 text-xs text-center mt-1">
                    Add a job description to enable ranking
                  </p>
                )}
                <p className="text-gray-500 text-xs mt-1 text-center">
                  Ranks all candidates by job fit
                </p>
              </div>
            </div>

            {candidates.length === 0 && (
              <p className="text-yellow-400 text-xs text-center mt-3">
                No candidates assigned to this job yet
              </p>
            )}
          </Card>
        </div>

        {/* Right — Candidates */}
        <div className="lg:col-span-2">

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              {view === 'ranked'
                ? 'AI Ranked Candidates'
                : `All Candidates (${candidates.length})${selected.length > 0 ? ` — ${selected.length} selected` : ''}`}
            </h3>
            {ranking.length > 0 && (
              <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                <button
                  onClick={() => setView('candidates')}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    view === 'candidates' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setView('ranked')}
                  className={`px-3 py-1.5 rounded text-xs transition-colors ${
                    view === 'ranked' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  🏆 Ranked
                </button>
              </div>
            )}
          </div>

          {/* Empty / Ranked / All */}
          {candidates.length === 0 ? (
            <Card>
              <div className="text-center py-10">
                <p className="text-4xl mb-3">👤</p>
                <p className="text-white font-medium mb-1">No candidates yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Upload resumes and select this job position
                </p>
                <Button variant="primary" onClick={() => navigate('/upload')}>
                  Upload Resume
                </Button>
              </div>
            </Card>
          ) : view === 'ranked' ? (
            <div className="flex flex-col gap-3">
              {getRankedCandidates().map((c: any, index: number) => (
                <Card key={c._id} className="hover:border-gray-500 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400'
                      : index === 1 ? 'bg-gray-400/20 text-gray-300'
                      : index === 2 ? 'bg-orange-500/20 text-orange-400'
                      : 'bg-gray-700 text-gray-400'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{c.name}</h4>
                          <p className="text-gray-400 text-xs">{c.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge label={c.status} color={statusColor[c.status]} />
                          <ScoreCircle score={c.matchScore} size="sm" />
                        </div>
                      </div>
                      <ScoreBar score={c.matchScore} showLabel={false} height="h-1.5" />
                      <p className="text-gray-400 text-xs mt-2 italic">{c.reason}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.skills?.slice(0, 4).map((s: string) => (
                          <span key={s} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-xs py-1 px-2 flex-shrink-0"
                      onClick={() => navigate(`/candidates/${c._id}`)}
                    >
                      View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            // ✅ NEW — All candidates with checkboxes
            <>
              {/* Master checkbox */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span className="text-gray-400 text-xs">
                  {allSelected ? 'Deselect all' : 'Select all'}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {candidates.map((c: any) => {
                  const isSelected = selected.includes(c._id);
                  return (
                    <Card
                      key={c._id}
                      className={`hover:border-gray-500 transition-colors cursor-pointer ${
                        isSelected ? 'border-primary' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(c._id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
                          />
                          <div
                            className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 cursor-pointer"
                            onClick={() => toggleSelect(c._id)}
                          >
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div
                            className="cursor-pointer min-w-0"
                            onClick={() => toggleSelect(c._id)}
                          >
                            <h4 className="text-white font-medium truncate">{c.name}</h4>
                            <p className="text-gray-400 text-xs truncate">{c.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {c.aiScore !== null && c.aiScore !== undefined ? (
                            <div className="w-32">
                              <ScoreBar score={c.aiScore} showLabel={false} height="h-1.5" />
                            </div>
                          ) : (
                            <span className="text-gray-500 text-xs">Not scored</span>
                          )}
                          <Badge label={c.status} color={statusColor[c.status]} />
                          <Button
                            variant="ghost"
                            className="text-xs py-1 px-2"
                            onClick={() => navigate(`/candidates/${c._id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}