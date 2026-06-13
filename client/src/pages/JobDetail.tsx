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
import { ArrowLeft, Brain, Users, Trophy, Eye, CheckSquare, Square } from 'lucide-react';

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

  // Selected candidate IDs
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
      <p className="text-slate-500">Job not found.</p>
    </Layout>
  );

  const candidates = job.candidates || [];
  const allSelected = selected.length === candidates.length && candidates.length > 0;

  return (
    <Layout title="Job Detail">

      <button
        onClick={() => navigate('/jobs')}
        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm mb-6 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">

        {/* Left — Job Info */}
        <div className="flex flex-col gap-5">

          <Card>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{job.title}</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-5">{job.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {job.requiredSkills.map((skill: string) => (
                <span
                  key={skill}
                  className="text-xs bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-600 dark:text-slate-500">Experience</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{job.experienceRequired}+ years</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-white/5">
                <span className="text-slate-600 dark:text-slate-500">Candidates</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">{candidates.length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600 dark:text-slate-500">Created</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {new Date(job.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </Card>

          {/* AI Actions */}
          <Card>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
              <Brain size={16} className="text-primary" /> AI Actions
            </h3>
            <div className="flex flex-col gap-4">

              <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Button
                  variant="secondary"
                  className="w-full justify-center relative z-10"
                  disabled={scoring || candidates.length === 0 || selected.length === 0}
                  onClick={handleScore}
                >
                  {scoring
                    ? '⏳ Scoring...'
                    : selected.length === 0
                    ? '🤖 Score Selected'
                    : `🤖 Score Selected (${selected.length})`}
                </Button>
                <p className="text-slate-600 dark:text-slate-500 text-xs mt-2 text-center relative z-10">
                  {selected.length === 0
                    ? 'Select candidates from the list to score'
                    : `Will score ${selected.length} candidate${selected.length > 1 ? 's' : ''}`}
                </p>
                
                {/* Quick Selectors */}
                {candidates.length > 0 && (
                  <div className="flex gap-2 mt-3 relative z-10">
                    <button
                      onClick={toggleSelectAll}
                      className="flex-1 text-xs bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-black/30 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      {allSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                      {allSelected ? 'Deselect All' : 'Select All'}
                    </button>
                    <button
                      onClick={selectUnscored}
                      className="flex-1 text-xs bg-slate-100 dark:bg-black/20 hover:bg-slate-200 dark:hover:bg-black/30 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      Select Unscored
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Button
                  variant="primary"
                  className="w-full justify-center bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-glow-green relative z-10"
                  disabled={matching || candidates.length === 0 || !job.description}
                  onClick={handleMatch}
                >
                  {matching ? '⏳ Ranking...' : '🏆 Rank by AI Match'}
                </Button>
                {!job.description && (
                  <p className="text-amber-600 dark:text-amber-400 text-xs text-center mt-2 relative z-10">
                    Add a job description to enable ranking
                  </p>
                )}
                <p className="text-slate-600 dark:text-slate-500 text-xs mt-2 text-center relative z-10">
                  Ranks all candidates by job fit
                </p>
              </div>

            </div>

            {candidates.length === 0 && (
              <p className="text-amber-600 dark:text-amber-400 text-xs text-center mt-4">
                No candidates assigned to this job yet
              </p>
            )}
          </Card>
        </div>

        {/* Right — Candidates */}
        <div className="lg:col-span-2">

          {/* View Toggle */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
              {view === 'ranked' ? <Trophy size={18} className="text-amber-500 dark:text-amber-400" /> : <Users size={18} className="text-blue-500 dark:text-blue-400" />}
              {view === 'ranked'
                ? 'AI Ranked Candidates'
                : `All Candidates (${candidates.length})${selected.length > 0 ? ` — ${selected.length} selected` : ''}`}
            </h3>
            {ranking.length > 0 && (
              <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                <button
                  onClick={() => setView('candidates')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 ${
                    view === 'candidates' ? 'gradient-primary text-white shadow-glow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Users size={14} /> All
                </button>
                <button
                  onClick={() => setView('ranked')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1.5 ${
                    view === 'ranked' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-glow-green' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Trophy size={14} /> Ranked
                </button>
              </div>
            )}
          </div>

          {/* Empty / Ranked / All */}
          {candidates.length === 0 ? (
            <Card>
              <div className="text-center py-16 animate-fade-in">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center mx-auto mb-5 border border-slate-200 dark:border-white/5">
                  <Users size={36} className="text-slate-600 dark:text-slate-500" />
                </div>
                <p className="text-slate-900 dark:text-white font-medium mb-1 text-lg">No candidates yet</p>
                <p className="text-slate-600 dark:text-slate-500 text-sm mb-6">
                  Upload resumes and select this job position
                </p>
                <Button variant="primary" onClick={() => navigate('/upload')}>
                  Upload Resume
                </Button>
              </div>
            </Card>
          ) : view === 'ranked' ? (
            <div className="flex flex-col gap-3 animate-fade-in">
              {getRankedCandidates().map((c: any, index: number) => (
                <Card key={c._id} className="relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                  {/* Subtle rank gradient background */}
                  <div className={`absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="flex items-start gap-4 relative z-10">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-white border border-yellow-300/30 shadow-glow-yellow'
                      : index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white border border-slate-300/30'
                      : index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white border border-orange-300/30'
                      : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/5'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-slate-900 dark:text-white font-semibold text-lg">{c.name}</h4>
                          <p className="text-slate-600 dark:text-slate-500 text-xs mt-0.5">{c.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge label={c.status} color={statusColor[c.status]} />
                          <ScoreCircle score={c.matchScore} size="sm" />
                        </div>
                      </div>
                      <ScoreBar score={c.matchScore} showLabel={false} height="h-1.5" />
                      <p className="text-slate-700 dark:text-slate-400 text-sm mt-3 leading-relaxed bg-slate-50 dark:bg-white/5 rounded-lg p-3 border border-slate-200 dark:border-white/5 border-l-2 border-l-emerald-500">
                        {c.reason}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {c.skills?.slice(0, 6).map((s: string) => (
                          <span key={s} className="text-xs bg-slate-100 dark:bg-black/20 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-xs py-1.5 px-3 flex-shrink-0 flex items-center gap-1.5"
                      onClick={() => navigate(`/candidates/${c._id}`)}
                    >
                      <Eye size={14} /> View
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Master checkbox */}
              <div className="flex items-center gap-3 mb-4 px-2">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <span className="text-slate-600 dark:text-slate-400 text-sm">
                  {allSelected ? 'Deselect all' : 'Select all'}
                </span>
              </div>

              <div className="flex flex-col gap-3 animate-fade-in">
                {candidates.map((c: any) => {
                  const isSelected = selected.includes(c._id);
                  return (
                    <Card
                      key={c._id}
                      className={`cursor-pointer transition-all duration-200 group ${
                        isSelected ? 'border-primary shadow-glow-sm bg-primary/5' : 'hover:border-slate-300 dark:hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0" onClick={() => toggleSelect(c._id)}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(c._id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
                          />
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                              isSelected ? 'bg-primary text-white shadow-lg' : 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-primary border border-indigo-500/20'
                            }`}
                          >
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-slate-900 dark:text-white font-medium truncate text-base">{c.name}</h4>
                            <p className="text-slate-600 dark:text-slate-500 text-xs mt-0.5 truncate">{c.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          {c.aiScore !== null && c.aiScore !== undefined ? (
                            <div className="w-32 hidden sm:block">
                              <ScoreBar score={c.aiScore} showLabel={false} height="h-1.5" />
                            </div>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-600 text-xs hidden sm:block">Not scored</span>
                          )}
                          <Badge label={c.status} color={statusColor[c.status]} />
                          <Button
                            variant="ghost"
                            className="text-xs py-1.5 px-3 opacity-70 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); navigate(`/candidates/${c._id}`); }}
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