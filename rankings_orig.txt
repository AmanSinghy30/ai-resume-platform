import { useState, useEffect } from 'react';
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

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};

const medalColors = [
  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  'bg-gray-400/20 text-gray-300 border border-gray-400/30',
  'bg-orange-500/20 text-orange-400 border border-orange-500/30',
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
      .catch(() => {});
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

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(i => i !== id);
      if (prev.length >= 3) { toast.error('Max 3 candidates to compare'); return prev; }
      return [...prev, id];
    });
  };

  const compareList = candidates.filter(c => compareIds.includes(c._id));

  return (
    <Layout title="Rankings">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Candidate Rankings</h2>
          <p className="text-sm text-gray-400 mt-1">
            {candidates.length} scored candidates
            {candidates.length === 0 && ' — run AI analysis to see rankings'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {compareIds.length >= 2 && (
            <Button
              variant="secondary"
              onClick={() => setShowCompare(true)}
            >
              Compare {compareIds.length} Candidates
            </Button>
          )}
          <select
            value={selectedJob}
            onChange={e => setSelectedJob(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
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
        <Card>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-5xl mb-4">🏆</p>
            <h3 className="text-white font-semibold text-lg mb-2">No ranked candidates yet</h3>
            <p className="text-gray-400 text-sm mb-6">
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
        <>
          {compareIds.length > 0 && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-secondary/10 border border-secondary/30 rounded-xl">
              <p className="text-secondary text-sm font-medium">
                {compareIds.length} selected for comparison
              </p>
              <button
                onClick={() => setCompareIds([])}
                className="text-gray-400 hover:text-white text-sm ml-auto"
              >
                Clear
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {candidates.map((c, index) => (
              <Card
                key={c._id}
                className={`hover:border-gray-500 transition-colors ${
                  compareIds.includes(c._id) ? 'border-secondary/50' : ''
                }`}
              >
                <div className="flex items-center gap-4">

                  {/* Rank */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    index < 3 ? medalColors[index] : 'bg-gray-700 text-gray-400'
                  }`}>
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{c.name}</h3>
                      <Badge label={c.status} color={statusColor[c.status]} />
                    </div>
                    <p className="text-gray-400 text-xs mb-2">
                      {c.jobId?.title || 'No job'} • {c.experience} yrs exp
                    </p>
                    <div className="max-w-xs">
                      <ScoreBar score={c.aiScore} showLabel={false} height="h-1.5" />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.skills?.slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  <ScoreCircle score={c.aiScore} size="sm" />

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      className="text-xs py-1 px-2"
                      onClick={() => navigate(`/candidates/${c._id}`)}
                    >
                      View
                    </Button>
                    <button
                      onClick={() => toggleCompare(c._id)}
                      className={`text-xs px-2 py-1 rounded border transition-colors ${
                        compareIds.includes(c._id)
                          ? 'border-secondary text-secondary'
                          : 'border-gray-600 text-gray-400 hover:border-gray-400'
                      }`}
                    >
                      {compareIds.includes(c._id) ? '✓ Added' : 'Compare'}
                    </button>
                  </div>

                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Compare Modal */}
      {showCompare && compareList.length >= 2 && (
        <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto">
          <div className="flex items-start justify-center min-h-screen py-8 px-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl mx-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-700">
              <h3 className="text-white font-semibold text-lg">
                Candidate Comparison
              </h3>
              <button
                onClick={() => setShowCompare(false)}
                className="text-gray-400 hover:text-white"
              >✕</button>
            </div>

            <div className={`grid gap-px bg-gray-700 ${
              compareList.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
            }`}>
              {compareList.map((c, i) => (
                <div key={c._id} className="bg-gray-800 p-5">

                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl mx-auto mb-2">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <h4 className="text-white font-semibold">{c.name}</h4>
                    <p className="text-gray-400 text-xs">{c.email}</p>
                    <Badge label={c.status} color={statusColor[c.status]} />
                  </div>

                  {/* Score */}
                  <div className="text-center mb-4">
                    <ScoreCircle score={c.aiScore} size="md" />
                    <p className="text-gray-400 text-xs mt-2">AI Score</p>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-col gap-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Experience</span>
                      <span className="text-white">{c.experience} yrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Job</span>
                      <span className="text-white text-xs">{c.jobId?.title || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recommendation</span>
                      <span className={`text-xs font-medium ${
                        c.aiRecommendation === 'shortlist' ? 'text-green-400'
                        : c.aiRecommendation === 'reject' ? 'text-red-400'
                        : 'text-yellow-400'
                      }`}>
                        {c.aiRecommendation || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-gray-400 text-xs mb-2 font-medium">SKILLS</p>
                    <div className="flex flex-wrap gap-1">
                      {c.skills?.slice(0, 8).map((s: string) => (
                        <span
                          key={s}
                          className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Analysis */}
                  {c.aiAnalysis && (
                    <div className="mt-4">
                      <p className="text-gray-400 text-xs mb-1 font-medium">AI SUMMARY</p>
                      <p className="text-gray-300 text-xs leading-relaxed line-clamp-4">
                        {c.aiAnalysis}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-full justify-center mt-4 text-xs"
                    onClick={() => {
                      setShowCompare(false);
                      navigate(`/candidates/${c._id}`);
                    }}
                  >
                    View Full Profile
                  </Button>

                </div>
              ))}
            </div>
          </div></div>
        </div>
      )}

    </Layout>
  );
}