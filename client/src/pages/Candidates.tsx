import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import { getCandidates } from '../services/candidateService';
import toast from 'react-hot-toast';

type Candidate = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  jobId: { _id: string; title: string } | null;
  aiScore: number | null;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  skills: string[];
  experience: number;
  createdAt: string;
};

const statusColor: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  shortlisted: 'green',
  reviewed: 'blue',
  new: 'yellow',
  rejected: 'red',
};

function ScoreText({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-500 text-sm font-medium">Not scored</span>;
  const color = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-bold text-sm ${color}`}>Score: {score}/100</span>;
}

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const fetchCandidates = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    getCandidates(params)
      .then(data => setCandidates(data.candidates))
      .catch(() => toast.error('Failed to load candidates'))
      .finally(() => setLoading(false));
  };

  // Fetch on mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timeout = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(timeout);
  }, [search, statusFilter]);

  if (loading) return <Layout title="Candidates"><Spinner /></Layout>;

  return (
    <Layout title="Candidates">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">All Candidates</h2>
          <p className="text-sm text-gray-400 mt-1">{candidates.length} total candidates</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                view === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                view === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              List
            </button>
          </div>
          <Button variant="primary" onClick={() => navigate('/upload')}>
            + Upload Resume
          </Button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary placeholder-gray-500"
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
        {(search || statusFilter) && (
          <Button
            variant="ghost"
            onClick={() => { setSearch(''); setStatusFilter(''); }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Empty State */}
      {candidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-5xl mb-4">📄</p>
          <h3 className="text-white font-semibold text-lg mb-2">No candidates found</h3>
          <p className="text-gray-400 text-sm mb-6">
            {search || statusFilter
              ? 'Try adjusting your search or filters'
              : 'Upload resumes to start screening candidates'}
          </p>
          {!search && !statusFilter && (
            <Button variant="primary" onClick={() => navigate('/upload')}>
              + Upload First Resume
            </Button>
          )}
        </div>
      )}

      {/* Grid View */}
      {view === 'grid' && candidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((c) => (
            <Card key={c._id} className="hover:border-gray-500 transition-colors cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{c.name}</h3>
                  <p className="text-gray-400 text-sm">{c.email}</p>
                </div>
                <Badge label={c.status} color={statusColor[c.status]} />
              </div>

              <p className="text-gray-300 text-sm mb-3">
                💼 {c.jobId?.title || 'No job assigned'} • {c.experience} yrs
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {c.skills.length > 0
                  ? c.skills.slice(0, 4).map(skill => (
                      <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))
                  : <span className="text-xs text-gray-500">No skills extracted yet</span>
                }
              </div>

              <div className="flex items-center justify-between">
                <ScoreText score={c.aiScore} />
                <Button
                  variant="ghost"
                  className="text-xs py-1 px-3"
                  onClick={() => navigate(`/candidates/${c._id}`)}
                >
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && candidates.length > 0 && (
        <div className="flex flex-col gap-3">
          {candidates.map((c) => (
            <Card key={c._id} className="hover:border-gray-500 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{c.name}</h3>
                    <p className="text-gray-400 text-xs">
                      {c.email} • {c.jobId?.title || 'No job assigned'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden md:flex gap-1 flex-wrap max-w-xs">
                    {c.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <Badge label={c.status} color={statusColor[c.status]} />
                  <span className={`font-bold text-sm w-16 text-right ${
                    c.aiScore === null ? 'text-gray-500'
                    : c.aiScore >= 80 ? 'text-green-400'
                    : c.aiScore >= 60 ? 'text-yellow-400'
                    : 'text-red-400'
                  }`}>
                    {c.aiScore !== null ? `${c.aiScore}/100` : '—'}
                  </span>
                  <Button
                    variant="ghost"
                    className="text-xs py-1 px-3"
                    onClick={() => navigate(`/candidates/${c._id}`)}
                  >
                    View
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </Layout>
  );
}