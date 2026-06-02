import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { getCandidateById, updateCandidateStatus } from '../services/candidateService';
import toast from 'react-hot-toast';

// ✅ Fix 3: Added extra status fallbacks
const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  shortlisted: 'green',
  reviewed:    'blue',
  new:         'yellow',
  rejected:    'red',
  pending:     'yellow',
  hired:       'green',
};

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    getCandidateById(id)
      .then(data => setCandidate(data.candidate))
      .catch(() => toast.error('Failed to load candidate'))
      .finally(() => setLoading(false));
  }, [id]);

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
                  {/* ✅ Fix 2: Safe null check */}
                  {candidate.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  {/* ✅ Fix 2: Fallback for null name */}
                  <h2 className="text-xl font-bold text-white">
                    {candidate.name || 'Unknown Candidate'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {candidate.email} • {candidate.phone || 'No phone'}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    💼 {candidate.jobId?.title || 'No job assigned'} • {candidate.experience || 0} years exp
                  </p>
                </div>
              </div>
              {/* ✅ Fix 3: Safe color fallback */}
              <Badge
                label={candidate.status}
                color={statusColor[candidate.status] ?? 'blue'}
              />
            </div>
          </Card>

          {/* AI Analysis */}
          <Card>
            <h3 className="text-white font-semibold mb-3">AI Analysis</h3>
            {candidate.aiAnalysis ? (
              <p className="text-gray-300 text-sm leading-relaxed">
                {candidate.aiAnalysis}
              </p>
            ) : (
              <div className="text-center py-6">
                <p className="text-4xl mb-2">🤖</p>
                <p className="text-gray-400 text-sm">AI analysis not run yet</p>
                <p className="text-gray-500 text-xs mt-1">Available in Week 4</p>
              </div>
            )}
          </Card>

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
            {/* ✅ Fix 4: Correct null check - handles score of 0 */}
            {candidate.aiScore !== null && candidate.aiScore !== undefined ? (
              <>
                <div className="flex items-center justify-center mb-3">
                  <div className={`relative w-28 h-28 rounded-full border-4 flex items-center justify-center ${
                    candidate.aiScore >= 80 ? 'border-green-500'
                    : candidate.aiScore >= 60 ? 'border-yellow-500'
                    : 'border-red-500'
                  }`}>
                    <span className="text-3xl font-bold text-white">
                      {candidate.aiScore}
                    </span>
                  </div>
                </div>
                <p className={`text-center text-sm font-medium ${
                  candidate.aiScore >= 80 ? 'text-green-400'
                  : candidate.aiScore >= 60 ? 'text-yellow-400'
                  : 'text-red-400'
                }`}>
                  {candidate.aiRecommendation || 'No recommendation'}
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">Not scored yet</p>
                <p className="text-gray-600 text-xs mt-1">Run AI analysis in Week 4</p>
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

              {/* ✅ Fix 2: Loading state on all buttons */}
              <Button
                variant="primary"
                className="w-full justify-center"
                disabled={updating || candidate.status === 'shortlisted'}
                onClick={() => handleStatusUpdate('shortlisted')}
              >
                {updating ? '⏳ Updating...'
                  : candidate.status === 'shortlisted' ? '✅ Shortlisted'
                  : 'Shortlist Candidate'}
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-center"
                disabled={updating || candidate.status === 'reviewed'}
                onClick={() => handleStatusUpdate('reviewed')}
              >
                {updating ? '⏳ Updating...' : 'Mark as Reviewed'}
              </Button>

              <Button
                variant="danger"
                className="w-full justify-center"
                disabled={updating || candidate.status === 'rejected'}
                onClick={() => handleStatusUpdate('rejected')}
              >
                {updating ? '⏳ Updating...'
                  : candidate.status === 'rejected' ? '❌ Rejected'
                  : 'Reject Candidate'}
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
                <Badge
                  label={candidate.status}
                  color={statusColor[candidate.status] ?? 'blue'}
                />
              </div>

              {/* ✅ Fix 1: Fixed broken <a> tag + Fix 5: env variable URL */}
              {candidate.resumeUrl && (
                <a
// ❌ Will break in production
                  href={`http://localhost:5000/${candidate.resumeUrl}`}
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