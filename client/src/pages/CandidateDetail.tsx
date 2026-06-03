import { useState, useEffect } from 'react';
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


const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCandidateById(id)
      .then(data => setCandidate(data.candidate))
      .catch(() => toast.error('Failed to load candidate'))
      .finally(() => setLoading(false));
  }, [id]);
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
      <p className="text-gray-400">Candidate not found.</p>
    </Layout>
  );

  return (
    <Layout title="Candidate Detail">

      {/* Back Button */}
      <button
        onClick={() => navigate('/candidates')}
        className="text-gray-400 hover:text-white text-sm mb-6 flex items-center gap-1"
      >
        ← Back to Candidates
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Profile Header */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  {candidate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
                  <p className="text-gray-400 text-sm">{candidate.email} • {candidate.phone || 'No phone'}</p>
                  <p className="text-gray-300 text-sm mt-1">
                    💼 {candidate.jobId?.title || 'No job assigned'} • {candidate.experience || 0} years exp
                  </p>
                </div>
              </div>
              <Badge label={candidate.status} color={statusColor[candidate.status]} />
            </div>
          </Card>

          {/* AI Analysis */}
<Card>
  <h3 className="text-white font-semibold mb-3">AI Analysis</h3>
  {candidate.aiAnalysis ? (
    <p className="text-gray-300 text-sm leading-relaxed">{candidate.aiAnalysis}</p>
  ) : (
    <div className="text-center py-6">
      <p className="text-4xl mb-2">🤖</p>
      <p className="text-gray-400 text-sm">AI analysis not run yet</p>
      <p className="text-gray-500 text-xs mt-1">Click "Run AI Analysis" to begin</p>
    </div>
  )}
</Card>

{/* ✅ Strengths */}
{candidate.aiStrengths?.length > 0 && (
  <Card>
    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
      <span className="text-green-400">💪</span> Strengths
    </h3>
    <ul className="flex flex-col gap-2">
      {candidate.aiStrengths.map((s: string, i: number) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
          <span className="text-green-400 mt-0.5">✓</span>
          <span className="leading-relaxed">{s}</span>
        </li>
      ))}
    </ul>
  </Card>
)}

{/* ✅ Weaknesses */}
{candidate.aiWeaknesses?.length > 0 && (
  <Card>
    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
      <span className="text-red-400">⚠️</span> Areas of Concern
    </h3>
    <ul className="flex flex-col gap-2">
      {candidate.aiWeaknesses.map((w: string, i: number) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
          <span className="text-red-400 mt-0.5">✗</span>
          <span className="leading-relaxed">{w}</span>
        </li>
      ))}
    </ul>
  </Card>
)}

{/* ✅ AI Reasoning */}
{candidate.aiReasoning && (
  <Card>
    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
      <span className="text-blue-400">🧠</span> AI Reasoning
    </h3>
    <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-primary/50 pl-3">
      {candidate.aiReasoning}
    </p>
  </Card>
)}

          {/* Education */}
          {candidate.education && (
            <Card>
              <h3 className="text-white font-semibold mb-2">Education</h3>
              <p className="text-gray-300 text-sm">{candidate.education}</p>
            </Card>
          )}

          {/* Raw Resume Text Preview */}
          {candidate.rawText && (
            <Card>
              <h3 className="text-white font-semibold mb-3">Resume Text Preview</h3>
              <div className="bg-gray-900 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-gray-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {candidate.rawText.slice(0, 800)}
                  {candidate.rawText.length > 800 && '...'}
                </p>
              </div>
            </Card>
          )}

        </div>

        {/* Right — Score + Skills + Actions */}
        <div className="flex flex-col gap-5">

          {/* AI Score */}
         <Card>
  <h3 className="text-white font-semibold mb-4">AI Score</h3>
  {candidate.aiScore !== null ? (
    <>
      <div className="flex items-center justify-center mb-4">
        <ScoreCircle score={candidate.aiScore} size="lg" />
      </div>
      <ScoreBar score={candidate.aiScore} />
      <p className={`text-center text-sm font-medium mt-3 ${
        candidate.aiScore >= 80 ? 'text-green-400'
        : candidate.aiScore >= 60 ? 'text-yellow-400'
        : 'text-red-400'
      }`}>
        Recommendation: {candidate.aiRecommendation || 'None'}
      </p>
    </>
  ) : (
    <div className="text-center py-4">
      <ScoreCircle score={null} size="md" />
      <p className="text-gray-500 text-sm mt-3">Not scored yet</p>
    </div>
  )}
</Card>

          {/* Skills */}
          <Card>
            <h3 className="text-white font-semibold mb-3">
              Skills
              <span className="text-gray-500 text-xs font-normal ml-2">
                ({candidate.skills?.length || 0} found)
              </span>
            </h3>
            {candidate.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="text-xs bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No skills extracted</p>
            )}
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-white font-semibold mb-3">Actions</h3>
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
            <h3 className="text-white font-semibold mb-3">Details</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Uploaded</span>
                <span className="text-gray-300">
                  {new Date(candidate.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Experience</span>
                <span className="text-gray-300">{candidate.experience || 0} years</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <Badge label={candidate.status} color={statusColor[candidate.status]} />
              </div>
              {candidate.resumeUrl && (
                <a
                    href={`http://localhost:5000/${candidate.resumeUrl.replace(/\\/g, '/')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-sm hover:underline text-center mt-2"
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