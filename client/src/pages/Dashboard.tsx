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
import {
  Users,
  CheckCircle2,
  Clock,
  Briefcase,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

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

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 mb-8 animate-fade-in" style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(16,185,129,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.15)',
      }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-primary" />
            <span className="text-primary text-sm font-semibold">AI-Powered Dashboard</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Welcome back! 👋</h2>
          <p className="text-slate-400 text-sm">
            You have <span className="text-white font-semibold">{stats.pending}</span> candidates pending review and <span className="text-white font-semibold">{stats.totalJobs}</span> active job positions.
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Candidates"
          value={stats.total}
          icon={Users}
          color="blue"
          subtitle="All time"
        />
        <StatsCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon={CheckCircle2}
          color="green"
          subtitle="Ready for interview"
        />
        <StatsCard
          title="Pending Review"
          value={stats.pending}
          icon={Clock}
          color="yellow"
          subtitle="Needs attention"
        />
        <StatsCard
          title="Active Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          color="purple"
          subtitle="Open positions"
        />
      </div>

      {/* Main Content — Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Candidates */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white tracking-tight">Recent Candidates</h2>
            <button
              onClick={() => navigate('/candidates')}
              className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 transition-colors font-medium"
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {recentCandidates.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 flex items-center justify-center mb-4 border border-white/5">
                  <FileText size={28} className="text-slate-500" />
                </div>
                <p className="text-white font-medium mb-1">No candidates yet</p>
                <p className="text-slate-500 text-sm mb-4">
                  Upload resumes to start screening
                </p>
                <button
                  onClick={() => navigate('/upload')}
                  className="text-primary text-sm hover:text-primary-dark flex items-center gap-1 transition-colors font-medium"
                >
                  Upload first resume <ArrowRight size={14} />
                </button>
              </div>
            </Card>
          ) : (
            <CandidateTable candidates={recentCandidates} />
          )}
        </div>

        {/* Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white tracking-tight">Recent Activity</h2>
            <button
              onClick={() => navigate('/activity')}
              className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 transition-colors font-medium"
            >
              View all <ArrowRight size={14} />
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
          <p className="text-slate-500 text-sm mb-1">Rejection Rate</p>
          <p className="text-2xl font-bold text-red-400">
            {stats.total > 0
              ? `${Math.round((stats.rejected / stats.total) * 100)}%`
              : '—'}
          </p>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm mb-1">Shortlist Rate</p>
          <p className="text-2xl font-bold text-emerald-400">
            {stats.total > 0
              ? `${Math.round((stats.shortlisted / stats.total) * 100)}%`
              : '—'}
          </p>
        </Card>
        <Card>
          <p className="text-slate-500 text-sm mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
        </Card>
      </div>

    </Layout>
  );
}