import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import Layout from '../components/Layout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import { getCandidates, deleteCandidate, bulkDeleteCandidates } from '../services/candidateService';
import toast from 'react-hot-toast';
import {
  Upload,
  Plus,
  X,
  FileText,
  Briefcase,
  Trash2,
  Eye,
  LayoutGrid,
  List,
} from 'lucide-react';

type Candidate = {
  _id: string;
  name: string;
  email: string;
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

const EMPTY_FILTERS = {
  status: '', jobId: '', minScore: '', maxScore: '', sortBy: '', order: 'desc'
};

export default function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [debouncedSearch] = useDebounce(search, 300);
  const [selected, setSelected] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const loadCandidates = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (filters.status) params.status = filters.status;
    if (filters.jobId) params.jobId = filters.jobId;
    if (filters.minScore) params.minScore = filters.minScore;
    if (filters.maxScore) params.maxScore = filters.maxScore;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.order) params.order = filters.order;

    getCandidates(params)
      .then(data => setCandidates(data.candidates))
      .catch(() => toast.error('Failed to load candidates'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCandidates();
    setSelected([]);
  }, [debouncedSearch, filters]);

  // ─── Selection helpers ───
  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === candidates.length) {
      setSelected([]);
    } else {
      setSelected(candidates.map(c => c._id));
    }
  };

  // ─── Delete handlers ───
  const handleDeleteOne = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    try {
      await deleteCandidate(id);
      toast.success(`${name} deleted`);
      setCandidates(prev => prev.filter(c => c._id !== id));
      setSelected(prev => prev.filter(x => x !== id));
    } catch {
      toast.error('Failed to delete candidate');
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) return;
    if (!window.confirm(`Delete ${selected.length} candidate${selected.length > 1 ? 's' : ''}? This cannot be undone.`)) return;

    setDeleting(true);
    try {
      const res = await bulkDeleteCandidates(selected);
      toast.success(res.message);
      setCandidates(prev => prev.filter(c => !selected.includes(c._id)));
      setSelected([]);
    } catch {
      toast.error('Bulk delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const hasActiveFilters = search || Object.values(filters).some(
    (v, i) => v !== '' && i !== 5
  );

  const allSelected = candidates.length > 0 && selected.length === candidates.length;

  return (
    <Layout title="Candidates">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">All Candidates</h2>
          <p className="text-sm text-gray-400 mt-1">
            {loading
              ? 'Loading...'
              : `${candidates.length} candidates found${selected.length > 0 ? ` — ${selected.length} selected` : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selected.length > 0 && (
            <Button
              variant="danger"
              onClick={handleBulkDelete}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              <Trash2 size={16} />
              {deleting ? 'Deleting...' : `Delete (${selected.length})`}
            </Button>
          )}
          <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1 ${
                view === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-1 ${
                view === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <List size={14} /> List
            </button>
          </div>
          <Button variant="primary" onClick={() => navigate('/upload')} className="flex items-center gap-2">
            <Plus size={16} /> Upload Resume
          </Button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex gap-3 mb-6">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search candidates by name..."
        />
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {search && (
            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center gap-1">
              Search: "{search}"
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-white ml-1">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center gap-1">
              Status: {filters.status}
              <button onClick={() => setFilters(f => ({ ...f, status: '' }))} className="text-gray-400 hover:text-white ml-1">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.jobId && (
            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center gap-1">
              Job filtered
              <button onClick={() => setFilters(f => ({ ...f, jobId: '' }))} className="text-gray-400 hover:text-white ml-1">
                <X size={12} />
              </button>
            </span>
          )}
          {(filters.minScore || filters.maxScore) && (
            <span className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full flex items-center gap-1">
              Score: {filters.minScore || '0'}–{filters.maxScore || '100'}
              <button onClick={() => setFilters(f => ({ ...f, minScore: '', maxScore: '' }))} className="text-gray-400 hover:text-white ml-1">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Select All */}
      {!loading && candidates.length > 0 && (
        <div className="flex items-center gap-2 mb-3 px-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
          <span className="text-xs text-gray-400">
            {allSelected ? 'Deselect all' : 'Select all'}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Empty */}
      {!loading && candidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText size={56} className="text-gray-500 mb-4" />
          <h3 className="text-white font-semibold text-lg mb-2">No candidates found</h3>
          <p className="text-gray-400 text-sm mb-6">
            {hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'Upload resumes to start screening'}
          </p>
          {!hasActiveFilters && (
            <Button variant="primary" onClick={() => navigate('/upload')} className="flex items-center gap-2">
              <Plus size={16} /> Upload First Resume
            </Button>
          )}
        </div>
      )}

      {/* Grid View */}
      {!loading && view === 'grid' && candidates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map(c => {
            const isSelected = selected.includes(c._id);
            return (
              <Card
                key={c._id}
                className={`hover:border-gray-500 transition-colors ${
                  isSelected ? 'border-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(c._id)}
                      className="w-4 h-4 accent-primary cursor-pointer mt-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{c.name}</h3>
                      <p className="text-gray-400 text-sm truncate">{c.email}</p>
                    </div>
                  </div>
                  <Badge label={c.status} color={statusColor[c.status]} />
                </div>

                <p className="text-gray-300 text-sm mb-3 flex items-center gap-1.5">
                  <Briefcase size={14} className="flex-shrink-0" />
                  {c.jobId?.title || 'No job'} • {c.experience} yrs
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {c.skills.length > 0
                    ? c.skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{s}</span>
                      ))
                    : <span className="text-xs text-gray-500">No skills yet</span>
                  }
                </div>

                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${
                    c.aiScore === null ? 'text-gray-500'
                    : c.aiScore >= 80 ? 'text-green-400'
                    : c.aiScore >= 60 ? 'text-yellow-400'
                    : 'text-red-400'
                  }`}>
                    {c.aiScore !== null ? `${c.aiScore}/100` : 'Not scored'}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      className="text-xs py-1 px-2 flex items-center gap-1"
                      onClick={() => navigate(`/candidates/${c._id}`)}
                    >
                      <Eye size={12} /> View
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs py-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDeleteOne(c._id, c.name)}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && view === 'list' && candidates.length > 0 && (
        <div className="flex flex-col gap-3">
          {candidates.map(c => {
            const isSelected = selected.includes(c._id);
            return (
              <Card
                key={c._id}
                className={`hover:border-gray-500 transition-colors ${
                  isSelected ? 'border-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(c._id)}
                      className="w-4 h-4 accent-primary cursor-pointer flex-shrink-0"
                    />
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white font-medium truncate">{c.name}</h3>
                      <p className="text-gray-400 text-xs truncate">{c.email} • {c.jobId?.title || 'No job'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden md:flex gap-1">
                      {c.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">{s}</span>
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
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        className="text-xs py-1 px-2 flex items-center gap-1"
                        onClick={() => navigate(`/candidates/${c._id}`)}
                      >
                        <Eye size={12} /> View
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-xs py-1 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={() => handleDeleteOne(c._id, c.name)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

    </Layout>
  );
}