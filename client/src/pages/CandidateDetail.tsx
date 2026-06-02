import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';

const dummyCandidate = {
  id: '1',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  phone: '9876543210',
  jobTitle: 'Frontend Developer',
  score: 87,
  status: 'shortlisted' as const,
  skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Git'],
  experience: 3,
  education: 'B.Tech Computer Science — IIT Delhi',
  uploadedAt: 'Jun 1, 2025',
  aiAnalysis: 'Strong frontend candidate with solid React and TypeScript experience. Has worked on production-level applications. Missing backend knowledge but fits the frontend role well. Communication skills appear strong based on resume structure.',
  strengths: ['Strong React knowledge', 'TypeScript proficiency', '3 years relevant experience'],
  weaknesses: ['No backend experience', 'Missing system design exposure'],
  recommendation: 'shortlist',
};

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

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

        {/* Left Column — Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Profile Header */}
          <Card>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                  {dummyCandidate.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{dummyCandidate.name}</h2>
                  <p className="text-gray-400 text-sm">{dummyCandidate.email} • {dummyCandidate.phone}</p>
                  <p className="text-gray-300 text-sm mt-1">💼 {dummyCandidate.jobTitle} • {dummyCandidate.experience} years exp</p>
                </div>
              </div>
              <Badge label={dummyCandidate.status} color={statusColor[dummyCandidate.status]} />
            </div>
          </Card>

          {/* AI Analysis */}
          <Card>
            <h3 className="text-white font-semibold mb-3">AI Analysis</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{dummyCandidate.aiAnalysis}</p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-green-400 text-xs font-medium mb-2">STRENGTHS</p>
                {dummyCandidate.strengths.map((s) => (
                  <p key={s} className="text-gray-300 text-sm flex items-center gap-1.5 mb-1">
                    <span className="text-green-400">✓</span> {s}
                  </p>
                ))}
              </div>
              <div>
                <p className="text-red-400 text-xs font-medium mb-2">WEAKNESSES</p>
                {dummyCandidate.weaknesses.map((w) => (
                  <p key={w} className="text-gray-300 text-sm flex items-center gap-1.5 mb-1">
                    <span className="text-red-400">✗</span> {w}
                  </p>
                ))}
              </div>
            </div>
          </Card>

          {/* Education */}
          <Card>
            <h3 className="text-white font-semibold mb-2">Education</h3>
            <p className="text-gray-300 text-sm">{dummyCandidate.education}</p>
          </Card>
        </div>

        {/* Right Column — Score + Actions */}
        <div className="flex flex-col gap-5">

          {/* AI Score */}
          <Card>
            <h3 className="text-white font-semibold mb-4">AI Score</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-28 h-28 rounded-full border-4 border-green-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{dummyCandidate.score}</span>
              </div>
            </div>
            <p className="text-center text-green-400 text-sm font-medium">Recommended: Shortlist</p>
          </Card>

          {/* Skills */}
          <Card>
            <h3 className="text-white font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {dummyCandidate.skills.map((skill) => (
                <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-2.5 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-white font-semibold mb-3">Actions</h3>
            <div className="flex flex-col gap-2">
              <Button variant="primary" className="w-full justify-center">Shortlist Candidate</Button>
              <Button variant="ghost" className="w-full justify-center">Mark as Reviewed</Button>
              <Button variant="danger" className="w-full justify-center">Reject Candidate</Button>
            </div>
          </Card>

        </div>
      </div>
    </Layout>
  );
}