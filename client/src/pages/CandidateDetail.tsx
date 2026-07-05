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
import {
  ArrowLeft, Briefcase, Mail, Phone, Sparkles, Brain, ShieldCheck, AlertTriangle,
  ChevronDown, ChevronUp, Copy, Check, Target, TrendingUp, GraduationCap, FolderOpen,
  MessageSquare, Flag, Zap, Users, HelpCircle, CircleDot, AlertOctagon, Lightbulb,
  BarChart3, Microscope
} from 'lucide-react';


const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  shortlisted: 'green',
  reviewed: 'yellow',
  new: 'blue',
  rejected: 'red',
};
const API_BASE = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ── Verdict / Signal Helpers ──
const signalConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: string; textColor: string }> = {
  STRONG_YES: { label: 'Strong Yes', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-gradient-to-r from-emerald-500/15 to-teal-500/10', border: 'border-emerald-500/30', icon: '🟢', textColor: 'text-emerald-600 dark:text-emerald-400' },
  YES: { label: 'Yes', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-gradient-to-r from-emerald-500/10 to-green-500/5', border: 'border-emerald-400/25', icon: '✅', textColor: 'text-emerald-500 dark:text-emerald-400' },
  MAYBE: { label: 'Maybe', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-gradient-to-r from-amber-500/10 to-yellow-500/5', border: 'border-amber-400/25', icon: '🟡', textColor: 'text-amber-500 dark:text-amber-400' },
  NO: { label: 'No', color: 'text-red-600 dark:text-red-400', bg: 'bg-gradient-to-r from-red-500/10 to-rose-500/5', border: 'border-red-400/25', icon: '❌', textColor: 'text-red-500 dark:text-red-400' },
  STRONG_NO: { label: 'Strong No', color: 'text-red-700 dark:text-red-300', bg: 'bg-gradient-to-r from-red-500/15 to-rose-500/10', border: 'border-red-500/30', icon: '🔴', textColor: 'text-red-600 dark:text-red-400' },
};

const severityConfig: Record<string, { dot: string; label: string; bg: string }> = {
  critical: { dot: 'bg-red-500', label: 'Critical', bg: 'bg-red-500/10 text-red-700 dark:text-red-300' },
  moderate: { dot: 'bg-amber-500', label: 'Moderate', bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  minor: { dot: 'bg-yellow-400', label: 'Minor', bg: 'bg-yellow-400/10 text-yellow-700 dark:text-yellow-300' },
};

const levelValue: Record<string, number> = { none: 0, beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
const levelLabel: Record<string, string> = { none: 'None', beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', expert: 'Expert' };

const areaColors: Record<string, string> = {
  technical: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20',
  behavioral: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/20',
  experience: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20',
  culture: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
};

// ── Small reusable sub-components ──

function BreakdownBar({ label, score, maxScore, icon }: { label: string; score: number; maxScore: number; icon: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const color = pct >= 80 ? 'from-emerald-500 to-teal-400' : pct >= 60 ? 'from-amber-500 to-orange-400' : 'from-red-500 to-rose-400';
  const textColor = pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-500 dark:text-slate-400 w-5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{label}</span>
          <span className={`text-xs font-bold ${textColor} ml-2`}>{score}/{maxScore}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${color}`}
            style={{ width: mounted ? `${pct}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

function DimensionBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const clamped = Math.min(100, Math.max(0, score));
  const color = clamped >= 80 ? 'from-emerald-500 to-teal-400' : clamped >= 60 ? 'from-amber-500 to-orange-400' : 'from-red-500 to-rose-400';
  const textColor = clamped >= 80 ? 'text-emerald-600 dark:text-emerald-400' : clamped >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="flex items-center gap-3">
      <div className="text-slate-500 dark:text-slate-400 w-5 flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{label}</span>
          <span className={`text-xs font-bold ${textColor} ml-2`}>{clamped}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${color}`}
            style={{ width: mounted ? `${clamped}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
}

function SkillLevelDots({ level }: { level: string }) {
  const val = levelValue[level] ?? 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i <= val ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="text-slate-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" title="Copy to clipboard">
      {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
    </button>
  );
}

function InterviewQuestionsPanel({ questions, defaultExpanded = false }: { questions: any[]; defaultExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  if (!questions?.length) return null;

  return (
    <Card>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between group">
        <h3 className="text-slate-900 dark:text-white font-semibold flex items-center gap-2">
          <HelpCircle size={16} className="text-violet-500" /> Interview Questions
          <span className="text-xs font-normal text-slate-500">({questions.length})</span>
        </h3>
        {expanded
          ? <ChevronUp size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          : <ChevronDown size={18} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
        }
      </button>

      {expanded && (
        <ul className="flex flex-col gap-3 mt-4">
          {questions.map((q: any, i: number) => (
            <li key={i} className="bg-slate-50 dark:bg-slate-900/40 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/40">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed flex-1">
                  <span className="text-slate-400 dark:text-slate-600 mr-1.5">Q{i + 1}.</span>
                  {q.question}
                </p>
                <CopyButton text={q.question} />
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {q.area && (
                  <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md border ${areaColors[q.area] || areaColors.technical}`}>
                    {q.area}
                  </span>
                )}
                <span className="text-xs text-slate-500 dark:text-slate-500 italic">{q.rationale}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}


export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [deepAnalysisExpanded, setDeepAnalysisExpanded] = useState(false);

  const fetchCandidate = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    try {
      const data = await getCandidateById(id);
      setCandidate(data.candidate);
    } catch {
      if (!silent) toast.error('Failed to load candidate');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCandidate();
    const interval = setInterval(() => fetchCandidate(true), 5000);
    return () => clearInterval(interval);
  }, [fetchCandidate]);

  const handleAnalyze = async () => {
    if (!id) return;

    if (candidate.aiScore) {
      const confirm = window.confirm(
        `This candidate already has a score of ${candidate.aiScore}/100. Re-analyze and overwrite?`
      );
      if (!confirm) return;
    }

    setAnalyzing(true);
    try {
      const data = await analyzeCandidate(id, selectedModel);
      setCandidate(data.candidate);
      setDeepAnalysisExpanded(true);
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

  const hasMatchData = !!candidate.matchHiringSignal;
  const hasAdvancedAnalysis = !!candidate.aiVerdict;
  const matchSignal = candidate.matchHiringSignal ? signalConfig[candidate.matchHiringSignal] : null;
  const aiVConfig = candidate.aiVerdict ? signalConfig[candidate.aiVerdict] : null;
  const breakdown = candidate.matchScoreBreakdown;
  const dims = candidate.aiDimensionScores;
  const isReviewed = candidate.status === 'reviewed';

  // Determine job weights for breakdown bar max values
  const jobWeights = {
    skillWeight: candidate.jobId?.skillWeight || 50,
    experienceWeight: candidate.jobId?.experienceWeight || 30,
    roleFitWeight: candidate.jobId?.roleFitWeight || 20,
  };

  return (
    <Layout title="Candidate Detail">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-sm mb-6 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft size={16} /> Back
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

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 1: N8N MATCH DATA (Primary Decision View)
              ══════════════════════════════════════════════════════════════════════ */}

          {/* ── Manipulation Warning ── */}
          {candidate.matchFlaggedManipulation && (
            <div className="rounded-2xl border border-red-500/40 bg-gradient-to-r from-red-500/15 to-rose-500/10 p-4 flex items-start gap-3">
              <AlertOctagon size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-700 dark:text-red-300">⚠️ Manipulation Detected</h4>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">This resume contained prompt injection or keyword stuffing attempts. The score reflects genuine content only.</p>
              </div>
            </div>
          )}

          {/* ── Match Hiring Signal Banner ── */}
          {hasMatchData && matchSignal && (
            <div className={`rounded-2xl border ${matchSignal.border} ${matchSignal.bg} p-5 transition-all`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-2xl">{matchSignal.icon}</span>
                    <h3 className={`text-lg font-bold ${matchSignal.color}`}>
                      ATS Signal: {matchSignal.label}
                    </h3>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                    {candidate.matchOneLineVerdict}
                  </p>
                </div>
                {/* Match Score Circle */}
                {candidate.matchScore != null && (
                  <div className="flex-shrink-0">
                    <ScoreCircle score={candidate.matchScore} size="md" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Match Score Breakdown ── */}
          {breakdown && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary" /> Score Breakdown
              </h3>
              <div className="flex flex-col gap-3.5">
                <BreakdownBar
                  label="Skill Coverage"
                  score={breakdown.skillCoverage || 0}
                  maxScore={jobWeights.skillWeight}
                  icon={<Zap size={14} />}
                />
                <BreakdownBar
                  label="Experience Relevance"
                  score={breakdown.experienceRelevance || 0}
                  maxScore={jobWeights.experienceWeight}
                  icon={<TrendingUp size={14} />}
                />
                <BreakdownBar
                  label="Role Fit"
                  score={breakdown.roleFit || 0}
                  maxScore={jobWeights.roleFitWeight}
                  icon={<Target size={14} />}
                />
              </div>
              {/* Total */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Total Match Score</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{candidate.matchScore}/100</span>
              </div>
            </Card>
          )}

          {/* ── Match Strengths & Concerns ── */}
          {(candidate.matchStrengths?.length > 0 || candidate.matchConcerns?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {candidate.matchStrengths?.length > 0 && (
                <Card>
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" /> Strengths
                    <span className="text-xs font-normal text-slate-500">({candidate.matchStrengths.length})</span>
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {candidate.matchStrengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-emerald-500 mt-0.5 text-xs flex-shrink-0">✓</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {candidate.matchConcerns?.length > 0 && (
                <Card>
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" /> Concerns
                    <span className="text-xs font-normal text-slate-500">({candidate.matchConcerns.length})</span>
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {candidate.matchConcerns.map((c: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <span className="text-amber-500 mt-0.5 text-xs flex-shrink-0">⚠</span>
                        <span className="leading-relaxed">{c}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}

          {/* ── Match Analysis (reason text) ── */}
          {candidate.reason && !hasMatchData && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-primary" /> Match Analysis
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{candidate.reason}</p>
            </Card>
          )}

          {/* ── Experience Summary ── */}
          {candidate.matchExperienceSummary && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
                <Briefcase size={16} className="text-slate-500" /> Experience Summary
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{candidate.matchExperienceSummary}</p>
            </Card>
          )}

          {/* ── Match Interview Questions ── */}
          {candidate.matchInterviewQuestions?.length > 0 && (
            <InterviewQuestionsPanel questions={candidate.matchInterviewQuestions} defaultExpanded={false} />
          )}

          {/* ── Improvement Tips ── */}
          {(candidate.status === 'reviewed' || candidate.status === 'rejected') && (candidate.matchImprove || candidate.improve) && (
            <Card>
              <h3 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
                <Lightbulb size={16} className="text-amber-500" /> Improvement Tips
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed italic border-l-2 border-amber-400/30 pl-3">
                {candidate.matchImprove || candidate.improve}
              </p>
            </Card>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 2: DEEP AI ANALYSIS (On-Demand, Collapsible)
              ══════════════════════════════════════════════════════════════════════ */}

          {/* Deep Analysis Toggle Header */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200 dark:border-slate-700/50" />
            </div>
            <div className="relative flex justify-center">
              <button
                onClick={() => setDeepAnalysisExpanded(!deepAnalysisExpanded)}
                className="bg-white dark:bg-slate-900 px-4 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2 hover:text-primary transition-colors rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <Microscope size={14} />
                Deep AI Analysis {hasAdvancedAnalysis ? '(Complete)' : '(On-Demand)'}
                {deepAnalysisExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {deepAnalysisExpanded && (
            <div className="flex flex-col gap-5">
              {/* Show prompt to run analysis if not yet done */}
              {!hasAdvancedAnalysis && !candidate.aiScore && (
                <div className="text-center py-8 bg-slate-50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
                  <Microscope size={28} className="mx-auto mb-3 text-slate-400" />
                  <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">No deep analysis yet</p>
                  <p className="text-slate-500 dark:text-slate-600 text-xs mt-1 max-w-xs mx-auto">
                    {isReviewed
                      ? 'This candidate is borderline — run a deep AI analysis to get detailed insights'
                      : 'Use the actions panel to run a deep AI analysis if needed'}
                  </p>
                </div>
              )}

              {/* AI Verdict Banner */}
              {hasAdvancedAnalysis && aiVConfig && (
                <div className={`rounded-2xl border ${aiVConfig.border} ${aiVConfig.bg} p-5 transition-all`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-2">
                        <span className="text-2xl">{aiVConfig.icon}</span>
                        <h3 className={`text-lg font-bold ${aiVConfig.color}`}>
                          AI Verdict: {aiVConfig.label}
                        </h3>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{candidate.aiVerdictSummary}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 flex-shrink-0">
                      <div className="relative w-14 h-14">
                        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-200 dark:text-slate-700" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(candidate.aiVerdictConfidence / 100) * 150.8} 150.8`} strokeLinecap="round" className={aiVConfig.textColor} />
                        </svg>
                        <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${aiVConfig.textColor}`}>{candidate.aiVerdictConfidence}%</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Confidence</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Dimension Scores */}
              {hasAdvancedAnalysis && dims && (
                <Card>
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                    <Target size={16} className="text-primary" /> Evaluation Breakdown
                  </h3>
                  <div className="flex flex-col gap-3.5">
                    <DimensionBar label="Skill Match" score={dims.skillMatch} icon={<Zap size={14} />} />
                    <DimensionBar label="Experience Relevance" score={dims.experienceRelevance} icon={<TrendingUp size={14} />} />
                    <DimensionBar label="Education Fit" score={dims.educationFit} icon={<GraduationCap size={14} />} />
                    <DimensionBar label="Project Quality" score={dims.projectQuality} icon={<FolderOpen size={14} />} />
                    <DimensionBar label="Communication Clarity" score={dims.communicationClarity} icon={<MessageSquare size={14} />} />
                  </div>
                </Card>
              )}

              {/* AI Red/Green Flags */}
              {hasAdvancedAnalysis && (candidate.aiRedFlags?.length > 0 || candidate.aiGreenFlags?.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {candidate.aiGreenFlags?.length > 0 && (
                    <Card>
                      <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                        <Zap size={16} className="text-emerald-500" /> Green Flags
                      </h3>
                      <ul className="flex flex-col gap-2.5">
                        {candidate.aiGreenFlags.map((f: any, i: number) => (
                          <li key={i} className="bg-emerald-500/5 rounded-xl p-3 border border-emerald-500/10">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-emerald-500 text-xs">✦</span>
                              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">{f.flag}</span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-5">{f.detail}</p>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  )}
                  {candidate.aiRedFlags?.length > 0 && (
                    <Card>
                      <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                        <Flag size={16} className="text-red-500" /> Red Flags
                      </h3>
                      <ul className="flex flex-col gap-2.5">
                        {candidate.aiRedFlags.map((f: any, i: number) => {
                          const sev = severityConfig[f.severity] || severityConfig.minor;
                          return (
                            <li key={i} className="bg-red-500/5 rounded-xl p-3 border border-red-500/10">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-2 h-2 rounded-full ${sev.dot} flex-shrink-0`} />
                                <span className="text-sm font-medium text-red-700 dark:text-red-300 flex-1">{f.flag}</span>
                                <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-md ${sev.bg}`}>{sev.label}</span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-4">{f.detail}</p>
                            </li>
                          );
                        })}
                      </ul>
                    </Card>
                  )}
                </div>
              )}

              {/* AI Skill Gap Analysis */}
              {hasAdvancedAnalysis && candidate.aiSkillGapAnalysis?.length > 0 && (
                <Card>
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                    <CircleDot size={16} className="text-primary" /> Skill Gap Analysis
                  </h3>
                  <div className="overflow-x-auto -mx-1">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700/50">
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-2">Skill</th>
                          <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-2">Candidate</th>
                          <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-2">Required</th>
                          <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2 px-2">Gap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidate.aiSkillGapAnalysis.map((item: any, i: number) => {
                          const cVal = levelValue[item.candidateLevel] ?? 0;
                          const rVal = levelValue[item.requiredLevel] ?? 0;
                          const gap = cVal - rVal;
                          const gapColor = gap >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
                          const gapLabel = gap > 0 ? `+${gap}` : gap === 0 ? '✓' : `${gap}`;
                          return (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                              <td className="py-2.5 px-2 text-slate-700 dark:text-slate-300 font-medium">{item.skill}</td>
                              <td className="py-2.5 px-2">
                                <div className="flex flex-col items-center gap-1">
                                  <SkillLevelDots level={item.candidateLevel} />
                                  <span className="text-[10px] text-slate-500">{levelLabel[item.candidateLevel] || item.candidateLevel}</span>
                                </div>
                              </td>
                              <td className="py-2.5 px-2">
                                <div className="flex flex-col items-center gap-1">
                                  <SkillLevelDots level={item.requiredLevel} />
                                  <span className="text-[10px] text-slate-500">{levelLabel[item.requiredLevel] || item.requiredLevel}</span>
                                </div>
                              </td>
                              <td className={`py-2.5 px-2 text-center font-bold text-xs ${gapColor}`}>{gapLabel}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* AI Interview Questions */}
              {hasAdvancedAnalysis && candidate.aiInterviewQuestions?.length > 0 && (
                <InterviewQuestionsPanel questions={candidate.aiInterviewQuestions} defaultExpanded={true} />
              )}

              {/* AI Culture Fit & Comparative Notes */}
              {hasAdvancedAnalysis && (candidate.aiCultureFitNotes || candidate.aiComparativeNotes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {candidate.aiCultureFitNotes && (
                    <Card>
                      <h3 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
                        <Users size={16} className="text-cyan-500" /> Culture & Soft Skills
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{candidate.aiCultureFitNotes}</p>
                    </Card>
                  )}
                  {candidate.aiComparativeNotes && (
                    <Card>
                      <h3 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-500" /> Comparative Assessment
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{candidate.aiComparativeNotes}</p>
                    </Card>
                  )}
                </div>
              )}

              {/* Legacy: plain AI analysis text (for candidates analyzed before the upgrade) */}
              {!hasAdvancedAnalysis && candidate.aiAnalysis && (
                <Card>
                  <h3 className="text-slate-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
                    <Brain size={16} className="text-blue-500" /> AI Analysis
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{candidate.aiAnalysis}</p>
                </Card>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              SECTION 3: STATIC INFO
              ══════════════════════════════════════════════════════════════════════ */}

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

          {/* Dynamic Score Card */}
          <Card>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">
              {candidate.aiScore != null ? 'AI Score' : candidate.matchScore != null ? 'Match Score' : 'Score'}
            </h3>

            {candidate.aiScore != null ? (
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
              <>
                <div className="flex items-center justify-center mb-4">
                  <ScoreCircle score={candidate.matchScore} size="lg" />
                </div>
                <ScoreBar score={candidate.matchScore} />
                <p className={`text-center text-sm font-medium mt-3 ${candidate.matchScore >= 90 ? 'text-emerald-600 dark:text-emerald-400'
                  : candidate.matchScore >= 70 ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}>
                  {candidate.matchScore >= 90 ? 'Shortlisted' : candidate.matchScore >= 70 ? 'Under Review' : 'Below Threshold'}
                </p>
              </>
            ) : (
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
                  ? `(${candidate.matchedSkills?.length || 0} matched, ${candidate.missingSkills?.length || 0} missing)`
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
                  <span key={skill} className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">
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
              <div className="flex flex-col gap-1.5 mb-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">AI Model</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={analyzing || !!candidate.aiScore}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                >
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                  <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite</option>
                  <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                </select>
              </div>
              <Button
                variant={isReviewed ? 'primary' : 'ghost'}
                className="w-full justify-center"
                disabled={analyzing || !!candidate.aiScore}
                onClick={handleAnalyze}
              >
                {analyzing ? '🔬 Analyzing...'
                  : !candidate.rawText ? '⚠️ No Resume Text'
                    : candidate.aiScore ? '✅ Deep Analysis Done'
                      : isReviewed ? '🔬 Run Deep AI Analysis'
                        : '🔬 Run Deep AI Analysis'}
              </Button>
              {isReviewed && !candidate.aiScore && (
                <p className="text-xs text-center text-slate-500 dark:text-slate-500 -mt-0.5">
                  Recommended for borderline candidates
                </p>
              )}
              <div className="border-t border-slate-200 dark:border-slate-700/50 my-1" />
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