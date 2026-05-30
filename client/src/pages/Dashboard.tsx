import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import CandidateTable from '../components/CandidateTable';

// Dummy data — will be replaced with real API calls on Day 17
const dummyStats = {
  totalCandidates: 24,
  shortlisted: 8,
  pending: 12,
  activeJobs: 4,
};

const dummyCandidates = [
  {
    id: '1',
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    jobTitle: 'Frontend Developer',
    score: 87,
    status: 'shortlisted' as const,
    uploadedAt: 'Jun 1, 2025',
  },
  {
    id: '2',
    name: 'Priya Mehta',
    email: 'priya@example.com',
    jobTitle: 'Backend Developer',
    score: 72,
    status: 'reviewed' as const,
    uploadedAt: 'Jun 2, 2025',
  },
  {
    id: '3',
    name: 'Amit Verma',
    email: 'amit@example.com',
    jobTitle: 'Frontend Developer',
    score: 54,
    status: 'new' as const,
    uploadedAt: 'Jun 3, 2025',
  },
  {
    id: '4',
    name: 'Sneha Patel',
    email: 'sneha@example.com',
    jobTitle: 'UI Designer',
    score: null,
    status: 'new' as const,
    uploadedAt: 'Jun 4, 2025',
  },
  {
    id: '5',
    name: 'Karan Singh',
    email: 'karan@example.com',
    jobTitle: 'Backend Developer',
    score: 41,
    status: 'rejected' as const,
    uploadedAt: 'Jun 4, 2025',
  },
];

export default function Dashboard() {
  return (
    <Layout title="Dashboard">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Candidates"
          value={dummyStats.totalCandidates}
          icon="👤"
          color="blue"
          subtitle="All time"
        />
        <StatsCard
          title="Shortlisted"
          value={dummyStats.shortlisted}
          icon="✅"
          color="green"
          subtitle="Ready for interview"
        />
        <StatsCard
          title="Pending Review"
          value={dummyStats.pending}
          icon="⏳"
          color="yellow"
          subtitle="Needs attention"
        />
        <StatsCard
          title="Active Jobs"
          value={dummyStats.activeJobs}
          icon="💼"
          color="purple"
          subtitle="Open positions"
        />
      </div>

      {/* Recent Candidates */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Candidates</h2>
          <a href="/candidates" className="text-sm text-primary hover:underline">
            View all →
          </a>
        </div>
        <CandidateTable candidates={dummyCandidates} />
      </div>
    </Layout>
  );
}