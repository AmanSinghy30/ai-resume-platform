import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import CandidateTable from '../components/CandidateTable';
import ActivityFeed from '../components/ActivityFeed';
import Spinner from '../components/Spinner';
import Card from '../components/Card';
import { getDashboardStats } from '../services/dashboardService';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    shortlisted: 0,
    pending: 0,
    rejected: 0,
    totalJobs: 0,
  });
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getDashboardStats()
      .then(data => {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
        setRecentCandidates(
          (data.recentCandidates || []).map((c: any) => ({
            id: c._id,
            name: c.name,
            email: c.email,
            jobTitle: c.jobId?.title || 'No job assigned',
            score: c.aiScore,
            status: c.status,
            uploadedAt: new Date(c.createdAt).toLocaleDateString('en-IN'),
          }))
        );
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Layout title="Dashboard"><Spinner /></Layout>;

  return (
    <Layout title="Dashboard">

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Candidates"
          value={stats.total}
          icon="👤"
          color="blue"
          subtitle="All time"
        />
        <StatsCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon="✅"
          color="green"
          subtitle="Ready for interview"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon="⏳"
          color="yellow"
          subtitle="Needs attention"
        />
        <StatsCard
          title="Active Jobs"
          value={stats.totalJobs}
          icon="💼"
          color="purple"
          subtitle="Open positions"
        />
      </div>

      {/* Main Content — Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Candidates — takes 2/3 width */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Candidates</h2>
            <button
              onClick={() => navigate('/candidates')}
              className="text-sm text-primary hover:underline"
            >
              View all →
            </button>
          </div>

          {recentCandidates.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-4xl mb-3">📄</p>
                <p className="text-white font-medium mb-1">No candidates yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Upload resumes to start screening
                </p>
                <button
                  onClick={() => navigate('/upload')}
                  className="text-primary text-sm hover:underline"
                >
                  Upload first resume →
                </button>
              </div>
            </Card>
          ) : (
            <CandidateTable candidates={recentCandidates} />
          )}
        </div>

        {/* Activity Feed — takes 1/3 width */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <button
              onClick={() => navigate('/activity')}
              className="text-sm text-primary hover:underline"
            >
              View all →
            </button>
          </div>
          <Card>
            <ActivityFeed activities={recentActivity} />
          </Card>
        </div>

      </div>

      {/* Quick Stats Row */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-gray-400 text-sm mb-1">Rejection Rate</p>
          <p className="text-2xl font-bold text-red-400">
            {stats.total > 0
              ? `${Math.round((stats.rejected / stats.total) * 100)}%`
              : '—'}
          </p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm mb-1">Shortlist Rate</p>
          <p className="text-2xl font-bold text-green-400">
            {stats.total > 0
              ? `${Math.round((stats.shortlisted / stats.total) * 100)}%`
              : '—'}
          </p>
        </Card>
        <Card>
          <p className="text-gray-400 text-sm mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </Card>
      </div>

    </Layout>
  );
}