import { useState, useEffect, useCallback } from 'react';
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

  const loadCandidates = useCallback(() => {
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
  }, [debouncedSearch, filters]);

  useEffect(() => {
    loadCandidates();
    setSelected([]);
  }, [debouncedSearch, filters, loadCandidates]);

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
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">All Candidates</h2>
          <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">
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
          <div className="flex bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1 ${
                view === 'grid' ? 'gradient-primary text-white shadow-glow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-1 ${
                view === 'list' ? 'gradient-primary text-white shadow-glow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
            <span className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-white/10">
              Search: "{search}"
              <button onClick={() => setSearch('')} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ml-1 transition-colors">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.status && (
            <span className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-white/10">
              Status: {filters.status}
              <button onClick={() => setFilters(f => ({ ...f, status: '' }))} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ml-1 transition-colors">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.jobId && (
            <span className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-white/10">
              Job filtered
              <button onClick={() => setFilters(f => ({ ...f, jobId: '' }))} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ml-1 transition-colors">
                <X size={12} />
              </button>
            </span>
          )}
          {(filters.minScore || filters.maxScore) && (
            <span className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-white/10">
              Score: {filters.minScore || '0'}–{filters.maxScore || '100'}
              <button onClick={() => setFilters(f => ({ ...f, minScore: '', maxScore: '' }))} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white ml-1 transition-colors">
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
          <span className="text-xs text-slate-600 dark:text-slate-500">
            {allSelected ? 'Deselect all' : 'Select all'}
          </span>
        </div>
      )}

      {/* Loading */}
      {loading && <Spinner />}

      {/* Empty */}
      {!loading && candidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700/50 dark:to-slate-800/50 flex items-center justify-center mb-5 border border-slate-200 dark:border-white/5">
            <FileText size={36} className="text-slate-500" />
          </div>
          <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">No candidates found</h3>
          <p className="text-slate-600 dark:text-slate-500 text-sm mb-6">
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
                className={`transition-all duration-200 ${
                  isSelected ? 'border-primary/40 shadow-glow-sm' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(c._id)}
                      className="w-4 h-4 accent-primary cursor-pointer mt-1 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-slate-900 dark:text-white font-semibold truncate">{c.name}</h3>
                      <p className="text-slate-600 dark:text-slate-500 text-sm truncate">{c.email}</p>
                    </div>
                  </div>
                  <Badge label={c.status} color={statusColor[c.status]} />
                </div>

                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 flex items-center gap-1.5">
                  <Briefcase size={14} className="flex-shrink-0 text-slate-500" />
                  {c.jobId?.title || 'No job'} • {c.experience} yrs
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {c.skills.length > 0
                    ? c.skills.slice(0, 4).map(s => (
                        <span key={s} className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5">{s}</span>
                      ))
                    : <span className="text-xs text-slate-500 dark:text-slate-600">No skills yet</span>
                  }
                </div>

                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${
                    c.aiScore === null ? 'text-slate-500 dark:text-slate-600'
                    : c.aiScore >= 80 ? 'text-emerald-600 dark:text-emerald-400'
                    : c.aiScore >= 60 ? 'text-amber-600 dark:text-amber-400'
                    : 'text-red-600 dark:text-red-400'
                  }`}>
                    {c.aiScore !== null ? `${c.aiScore}/100` : 'Not scored'}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      className="text-xs py-1.5 px-2.5 flex items-center gap-1"
                      onClick={() => navigate(`/candidates/${c._id}`)}
                    >
                      <Eye size={12} /> View
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-xs py-1.5 px-2.5 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 hover:bg-red-500/10"
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
                className={`transition-all duration-200 ${
                  isSelected ? 'border-primary/40 shadow-glow-sm' : ''
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0 border border-primary/15">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-slate-900 dark:text-white font-medium truncate">{c.name}</h3>
                      <p className="text-slate-600 dark:text-slate-500 text-xs truncate">{c.email} • {c.jobId?.title || 'No job'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="hidden md:flex gap-1.5">
                      {c.skills.slice(0, 3).map(s => (
                        <span key={s} className="text-xs bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-white/5">{s}</span>
                      ))}
                    </div>
                    <Badge label={c.status} color={statusColor[c.status]} />
                    <span className={`font-bold text-sm w-16 text-right ${
                      c.aiScore === null ? 'text-slate-500 dark:text-slate-600'
                      : c.aiScore >= 80 ? 'text-emerald-600 dark:text-emerald-400'
                      : c.aiScore >= 60 ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>
                      {c.aiScore !== null ? `${c.aiScore}/100` : '—'}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        className="text-xs py-1.5 px-2.5 flex items-center gap-1"
                        onClick={() => navigate(`/candidates/${c._id}`)}
                      >
                        <Eye size={12} /> View
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-xs py-1.5 px-2.5 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 hover:bg-red-500/10"
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