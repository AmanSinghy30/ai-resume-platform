import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ScoreBar from '../components/ScoreBar';
import ScoreCircle from '../components/ScoreCircle';
import { getRankedCandidates } from '../services/candidateService';
import { getJobs } from '../services/jobService';
import toast from 'react-hot-toast';
import { Trophy, X, Eye, Scale, Medal, Crown } from 'lucide-react';

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};

const medalColors = [
  'bg-gradient-to-br from-yellow-300 to-amber-600 text-white border border-yellow-300/30 shadow-glow-yellow', // Gold
  'bg-gradient-to-br from-slate-300 to-slate-500 text-white border border-slate-300/30', // Silver
  'bg-gradient-to-br from-orange-400 to-red-600 text-white border border-orange-400/30', // Bronze
];

export default function Rankings() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('');
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getJobs()
      .then(d => setJobs(d.jobs))
      .catch(() => { });
  }, []);

  useEffect(() => {
    setLoading(true);
    getRankedCandidates(selectedJob || undefined)
      .then(data => {
        // Only show scored candidates
        const scored = data.candidates.filter((c: any) => c.aiScore !== null);
        setCandidates(scored);
      })
      .catch(() => toast.error('Failed to load rankings'))
      .finally(() => setLoading(false));
  }, [selectedJob]);

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      // 1. Primary: AI Score (descending)
      if (b.aiScore !== a.aiScore) {
        return (b.aiScore || 0) - (a.aiScore || 0);
      }

      // 2. Secondary: Skill Match Count (descending)
      const getMatchCount = (c: any) => {
        const jobId = c.jobId?._id || c.jobId;
        const job = jobs.find(j => j._id === jobId);
        if (!job?.requiredSkills || !c.skills) return 0;
        const cSkills = c.skills.map((s: string) => s.toLowerCase());
        return job.requiredSkills.filter((s: string) => cSkills.includes(s.toLowerCase())).length;
      };

      const aMatchCount = getMatchCount(a);
      const bMatchCount = getMatchCount(b);
      if (bMatchCount !== aMatchCount) {
        return bMatchCount - aMatchCount;
      }

      // 3. Tertiary: Experience Years (descending)
      return (b.experience || 0) - (a.experience || 0);
    });
  }, [candidates, jobs]);

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) { toast.error('Max 3 candidates to compare'); return prev; }
      return [...prev, id];
    });
  };

  const compareList = sortedCandidates.filter(c => compareIds.includes(c._id));

  return (
    <Layout title="Rankings">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Candidate Rankings</h2>
          <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">
            {candidates.length} scored candidates
            {candidates.length === 0 && ' — run AI analysis to see rankings'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {compareIds.length >= 2 && (
            <Button
              variant="secondary"
              onClick={() => setShowCompare(true)}
              className="flex items-center gap-2"
            >
              <Scale size={16} /> Compare {compareIds.length} Candidates
            </Button>
          )}
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            className="input-glass text-slate-900 dark:text-white rounded-xl px-3.5 py-2.5 text-sm"
          >
            <option value="">All Jobs</option>
            {jobs.map(j => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <Spinner />}

      {/* Empty State */}
      {!loading && candidates.length === 0 && (
        <Card className="animate-fade-in">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-5 border border-amber-500/20 shadow-glow-yellow">
              <Trophy size={36} className="text-amber-500 dark:text-amber-400" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">No ranked candidates yet</h3>
            <p className="text-slate-600 dark:text-slate-500 text-sm mb-6">
              Run AI analysis on candidates to see their scores here
            </p>
            <Button variant="primary" onClick={() => navigate('/candidates')}>
              Go to Candidates
            </Button>
          </div>
        </Card>
      )}

      {/* Rankings Leaderboard */}
      {!loading && candidates.length > 0 && (
        <div className="animate-fade-in">
          {compareIds.length > 0 && (
            <div className="flex items-center gap-3 mb-4 p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/5 border border-violet-500/20 rounded-xl shadow-inner-glow">
              <Scale size={16} className="text-violet-500 dark:text-violet-400" />
              <p className="text-violet-500 dark:text-violet-400 text-sm font-medium">
                {compareIds.length} selected for comparison
              </p>
              <button
                onClick={() => setCompareIds([])}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm ml-auto transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {sortedCandidates.map((c, index) => (
              <Card
                key={c._id}
                className={`transition-all duration-300 relative overflow-hidden group ${compareIds.includes(c._id) ? 'border-violet-500/50 shadow-glow-purple bg-violet-500/5' : 'hover:border-slate-300 dark:hover:border-white/20'
                  }`}
              >
                {/* Subtle rank gradient background for top 3 */}
                {index < 3 && (
                  <div className={`absolute top-0 right-0 bottom-0 w-1/3 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                )}

                <div className="flex items-center gap-4 relative z-10">

                  {/* Rank */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg ${index < 3 ? medalColors[index] : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-white/5'
                    }`}>
                    {index === 0 ? <Crown size={20} /> : index < 3 ? <Medal size={20} /> : `#${index + 1}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0 border border-indigo-500/20">
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="text-slate-900 dark:text-white font-medium text-lg truncate">{c.name}</h3>
                      <Badge label={c.status} color={statusColor[c.status]} />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mb-2">
                      {c.jobId?.title || 'No job'} • {c.experience} yrs exp
                    </p>
                    <div className="max-w-xs">
                      <ScoreBar score={c.aiScore} showLabel={false} height="h-1.5" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {c.skills?.slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  <ScoreCircle score={c.aiScore} size="sm" />

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0 ml-2">
                    <Button
                      variant="ghost"
                      className="text-xs py-1.5 px-3 flex items-center gap-1.5"
                      onClick={() => navigate(`/candidates/${c._id}`)}
                    >
                      <Eye size={14} /> View
                    </Button>
                    <button
                      onClick={() => toggleCompare(c._id)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-200 ${compareIds.includes(c._id)
                        ? 'border-violet-500 bg-violet-500/20 text-violet-600 dark:text-violet-300 shadow-glow-sm'
                        : 'border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-white/5'
                        }`}
                    >
                      {compareIds.includes(c._id) ? '✓ Added' : 'Compare'}
                    </button>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && compareList.length >= 2 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto animate-fade-in">
          <div className="flex items-start justify-center min-h-screen py-8 px-4">
            <div className="glass-strong border border-slate-200 dark:border-white/10 rounded-2xl w-full max-w-5xl mx-4 shadow-glass-lg animate-scale-in">
              <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/5">
                <h3 className="text-slate-900 dark:text-white font-semibold text-lg tracking-tight flex items-center gap-2">
                  <Scale size={18} className="text-violet-500 dark:text-violet-400" /> Candidate Comparison
                </h3>
                <button
                  onClick={() => setShowCompare(false)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className={`grid gap-px bg-slate-200 dark:bg-white/5 ${compareList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
                }`}>
                {compareList.map((c, i) => (
                  <div key={c._id} className="bg-slate-50 dark:bg-slate-900/60 p-6 flex flex-col h-full">

                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-primary font-bold text-2xl mx-auto mb-3 border border-indigo-500/20 shadow-inner">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <h4 className="text-slate-900 dark:text-white font-medium text-lg mb-0.5">{c.name}</h4>
                      <p className="text-slate-600 dark:text-slate-500 text-xs mb-2">{c.email}</p>
                      <Badge label={c.status} color={statusColor[c.status]} />
                    </div>

                    {/* Score */}
                    <div className="text-center mb-6 p-4 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
                      <div className="flex justify-center mb-2">
                        <ScoreCircle score={c.aiScore} size="md" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs font-medium tracking-wide uppercase">AI Score</p>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-col gap-3 text-sm mb-6 flex-1">
                      <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-white/5">
                        <span className="text-slate-600 dark:text-slate-500">Experience</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{c.experience} yrs</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-slate-200 dark:border-white/5">
                        <span className="text-slate-600 dark:text-slate-500">Job</span>
                        <span className="text-slate-700 dark:text-slate-300 text-xs text-right max-w-[120px] truncate">{c.jobId?.title || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-600 dark:text-slate-500">Recommendation</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${c.aiRecommendation === 'shortlist' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : c.aiRecommendation === 'reject' ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          }`}>
                          {c.aiRecommendation || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                      <p className="text-slate-600 dark:text-slate-500 text-xs mb-2 font-medium tracking-wide uppercase">Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {c.skills?.slice(0, 8).map((s: string) => (
                          <span
                            key={s}
                            className="text-xs bg-slate-200 dark:bg-black/20 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg border border-slate-300 dark:border-white/5"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI Analysis */}
                    {c.aiAnalysis && (
                      <div className="mb-6">
                        <p className="text-slate-600 dark:text-slate-500 text-xs mb-2 font-medium tracking-wide uppercase">AI Summary</p>
                        <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed line-clamp-4 bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                          {c.aiAnalysis}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto">
                      <Button
                        variant="primary"
                        className="w-full justify-center text-xs flex items-center gap-1.5"
                        onClick={() => {
                          setShowCompare(false);
                          navigate(`/candidates/${c._id}`);
                        }}
                      >
                        <Eye size={14} /> View Full Profile
                      </Button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
}