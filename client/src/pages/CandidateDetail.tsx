import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { getCandidateById, updateCandidateStatus } from '../services/candidateService';
import toast from 'react-hot-toast';
import { analyzeCandidate } from '../services/candidateService';
import ScoreCircle from '../components/ScoreCircle';
import ScoreBar from '../components/ScoreBar';
import { ArrowLeft, Briefcase, Mail, Phone, Sparkles, Brain, ShieldCheck, AlertTriangle } from 'lucide-react';


const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};
const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchCandidate = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const data = await getCandidateById(id);
      // Only update if the status or score changed to avoid unnecessary re-renders
      // Actually React will handle shallow equality, but we can just set it.
      setCandidate(data.candidate);
    } catch {
      if (!silent) toast.error('Failed to load candidate');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCandidate();
    const interval = setInterval(() => fetchCandidate(true), 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchCandidate]);
  const handleAnalyze = async () => {
    if (!id) return;

    // Warn if already analyzed
    if (candidate.aiScore) {
      const confirm = window.confirm(
        `This candidate already has a score of ${candidate.aiScore}/100. Re-analyze and overwrite?`
      );
      if (!confirm) return;
    }

    setAnalyzing(true);
    try {
      const data = await analyzeCandidate(id);
      setCandidate(data.candidate);
      toast.success(`Analysis complete — Score: ${data.candidate.aiScore}/100`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    if (!id) return;
    setUpdating(true);
    try {
      const data = await updateCandidateStatus(id, status);
      setCandidate(data.candidate);
      toast.success(`Candidate marked as ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Layout title="Candidate Detail"><Spinner /></Layout>;
  if (!candidate) return (
    <Layout title="Candidate Detail">
      <p className="text-slate-500">Candidate not found.</p>
    </Layout>
  );

  return (
    <Layout title="Candidate Detail">

      {/* Back Button */}
      <button
        onClick={() => navigate('/candidates')}
        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm mb-6 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Candidates
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">

        {/* Left — Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Profile Header */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{candidate.name}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1"><Mail size={13} /> {candidate.email}</span>
                    {candidate.phone && <span className="text-slate-600 dark:text-slate-400 text-sm flex items-center gap-1"><Phone size={13} /> {candidate.phone}</span>}
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm mt-1 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-slate-600 dark:text-slate-500" /> {candidate.jobId?.title || 'No job assigned'} • {candidate.experience || 0} years exp
                  </p>
                </div>
              </div>
              <Badge label={candidate.status} color={statusColor[candidate.status]} />
            </div>
          </Card>

          {/* Dynamic Analysis Card: AI Analysis or Match Reason */}
          <Card>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              {candidate.aiAnalysis ? 'AI Analysis' : 'Job Match Reason'}
            </h3>

            {candidate.aiAnalysis ? (
              // 1. Show detailed AI Analysis if generated
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{candidate.aiAnalysis}</p>
            ) : candidate.reason ? (
              // 2. Fall back to Match Reason before AI Analysis
              <div>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                  {candidate.reason}
                </p>
                <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-500 text-xs mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <Sparkles size={14} className="text-slate-500" />
                  <span>Click "Run AI Analysis" for a deeper evaluation</span>
                </div>
              </div>
            ) : (
              // 3. Fall back to default empty state
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-3 border border-violet-500/15">
                  <Sparkles size={24} className="text-violet-500 dark:text-violet-400" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">No analysis available</p>
                <p className="text-slate-500 dark:text-slate-600 text-xs mt-1">Click "Run AI Analysis" to begin</p>
              </div>
            )}
          </Card>

          {/* Strengths */}
          {candidate.aiStrengths?.length > 0 && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500 dark:text-emerald-400" /> Strengths
              </h3>
              <ul className="flex flex-col gap-2">
                {candidate.aiStrengths.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-500 dark:text-emerald-400 mt-0.5 text-xs">✓</span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Weaknesses */}
          {candidate.aiWeaknesses?.length > 0 && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500 dark:text-amber-400" /> Areas of Concern
              </h3>
              <ul className="flex flex-col gap-2">
                {candidate.aiWeaknesses.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <span className="text-red-500 dark:text-red-400 mt-0.5 text-xs">✗</span>
                    <span className="leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* AI Reasoning */}
          {candidate.aiReasoning && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                <Brain size={16} className="text-blue-500 dark:text-blue-400" /> AI Reasoning
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic border-l-2 border-primary/30 pl-3">
                {candidate.aiReasoning}
              </p>
            </Card>
          )}

          {/* Education */}
          {candidate.education && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2">Education</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm">{candidate.education}</p>
            </Card>
          )}

          {/* Raw Resume Text Preview */}
          {candidate.rawText && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-3">Resume Text Preview</h3>
              <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-4 max-h-48 overflow-y-auto border border-slate-200 dark:border-white/5">
                <p className="text-slate-700 dark:text-slate-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {candidate.rawText.slice(0, 800)}
                  {candidate.rawText.length > 800 && '...'}
                </p>
              </div>
            </Card>
          )}

        </div>

        {/* Right — Score + Skills + Actions */}
        <div className="flex flex-col gap-5">

          {/* Dynamic Score Card: AI Score or Match Score */}
          <Card>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">
              {candidate.aiScore != null ? 'AI Score' : 'Match Score'}
            </h3>

            {candidate.aiScore != null ? (
              // 1. Show AI Score if generated
              <>
                <div className="flex items-center justify-center mb-4">
                  <ScoreCircle score={candidate.aiScore} size="lg" />
                </div>
                <ScoreBar score={candidate.aiScore} />
                <p className={`text-center text-sm font-medium mt-3 ${candidate.aiScore >= 80 ? 'text-emerald-600 dark:text-emerald-400'
                  : candidate.aiScore >= 60 ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}>
                  Recommendation: {candidate.aiRecommendation || 'None'}
                </p>
              </>
            ) : candidate.matchScore != null ? (
              // 2. Fall back to Match Score
              <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl border border-emerald-500/20 shadow-inner">
                <div className="mb-4">
                  <ScoreCircle score={candidate.matchScore} size="lg" />
                </div>
                <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm tracking-wide uppercase">Basic Match</p>
                <p className="text-slate-500 dark:text-slate-600 text-xs mt-1">(AI Analysis pending)</p>
              </div>
            ) : (
              // 3. Fall back to Not Scored
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/5 border-dashed">
                <ScoreCircle score={null as any} size="md" />
                <p className="text-slate-500 dark:text-slate-600 text-sm mt-3">Not scored yet</p>
              </div>
            )}
          </Card>

          {/* Skills */}
          <Card>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-3">
              Skills
              <span className="text-slate-500 dark:text-slate-600 text-xs font-normal ml-2">
                {(candidate.matchedSkills?.length > 0 || candidate.missingSkills?.length > 0) 
                  ? `(${candidate.matchedSkills?.length || 0} matched and ${candidate.missingSkills?.length || 0} missing)` 
                  : `(${candidate.skills?.length || 0} found)`}
              </span>
            </h3>
            {candidate.matchedSkills?.length > 0 || candidate.missingSkills?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {candidate.matchedSkills?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">Matched Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.matchedSkills.map((skill: string) => (
                        <span key={skill} className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {candidate.missingSkills?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">Missing Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {candidate.missingSkills.map((skill: string) => (
                        <span key={skill} className="text-xs bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : candidate.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-600 text-sm">No skills extracted</p>
            )}
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-3">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button
                variant="secondary"
                className="w-full justify-center"
                disabled={analyzing || !!candidate.aiScore}
                onClick={handleAnalyze}
              >
                {analyzing ? '🤖 Analyzing...'
                  : !candidate.rawText ? '⚠️ No Resume Text'
                    : candidate.aiScore ? '✅ Already Analyzed'
                      : '🤖 Run AI Analysis'}
              </Button>
              <Button
                variant="primary"
                className="w-full justify-center"
                disabled={updating || candidate.status === 'shortlisted'}
                onClick={() => handleStatusUpdate('shortlisted')}
              >
                {candidate.status === 'shortlisted' ? '✅ Shortlisted' : 'Shortlist Candidate'}
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-center"
                disabled={updating || candidate.status === 'reviewed'}
                onClick={() => handleStatusUpdate('reviewed')}
              >
                Mark as Reviewed
              </Button>
              <Button
                variant="danger"
                className="w-full justify-center"
                disabled={updating || candidate.status === 'rejected'}
                onClick={() => handleStatusUpdate('rejected')}
              >
                {candidate.status === 'rejected' ? '❌ Rejected' : 'Reject Candidate'}
              </Button>
            </div>
          </Card>

          {/* Meta Info */}
          <Card>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-3">Details</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-500">Uploaded</span>
                <span className="text-slate-700 dark:text-slate-300">
                  {new Date(candidate.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-500">Experience</span>
                <span className="text-slate-700 dark:text-slate-300">{candidate.experience || 0} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-500">Status</span>
                <Badge label={candidate.status} color={statusColor[candidate.status]} />
              </div>
              {candidate.resumeUrl && (
                <a
                  href={`${API_BASE}/${candidate.resumeUrl.replace(/\\/g, '/')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary text-sm hover:text-primary-dark text-center mt-2 transition-colors font-medium"
                >
                  View Resume PDF →
                </a>
              )}
            </div>
          </Card>

        </div>
      </div>
    </Layout>
  );
}