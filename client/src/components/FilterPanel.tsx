import { useState, useEffect } from 'react';
import { getJobs } from '../services/jobService';
import { SlidersHorizontal, X } from 'lucide-react';

type Filters = {
  status: string;
  jobId: string;
  minScore: string;
  maxScore: string;
  sortBy: string;
  order: string;
  skills: string;
  minExperience: string;
};

type FilterPanelProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onClear: () => void;
};

export default function FilterPanel({ filters, onChange, onClear }: FilterPanelProps) {
  const [jobs, setJobs] = useState<{ _id: string; title: string }[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getJobs().then(d => setJobs(d.jobs)).catch(() => { });
  }, []);

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ${hasFilters
          ? 'gradient-primary text-white shadow-glow-sm'
          : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
      >
        <SlidersHorizontal size={14} />
        Filters
        {hasFilters && (
          <span className="bg-white/20 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {Object.values(filters).filter(v => v !== '').length - 1}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-20 bg-white dark:glass-strong rounded-2xl p-5 w-72 shadow-xl dark:shadow-glass-lg animate-scale-in border border-slate-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900 dark:text-white font-semibold text-sm">Filter Candidates</h3>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="flex flex-col gap-4">

            {/* Status */}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Status</label>
              <select
                value={filters.status}
                onChange={e => update('status', e.target.value)}
                className="w-full bg-slate-50 dark:input-glass text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Job */}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Job Position</label>
              <select
                value={filters.jobId}
                onChange={e => update('jobId', e.target.value)}
                className="w-full bg-slate-50 dark:input-glass text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm"
              >
                <option value="">All Jobs</option>
                {jobs.map(j => (
                  <option key={j._id} value={j._id}>{j.title}</option>
                ))}
              </select>
            </div>

            {/* Score Range */}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Score Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={filters.minScore}
                  onChange={e => update('minScore', e.target.value)}
                  placeholder="Min"
                  min="0" max="100"
                  className="w-full bg-slate-50 dark:input-glass text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm"
                />
                <span className="text-slate-400 dark:text-slate-600 text-sm">–</span>
                <input
                  type="number"
                  value={filters.maxScore}
                  onChange={e => update('maxScore', e.target.value)}
                  placeholder="Max"
                  min="0" max="100"
                  className="w-full bg-slate-50 dark:input-glass text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Skills & Experience */}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Skills (e.g. React + Node)</label>
              <input
                type="text"
                value={filters.skills}
                onChange={e => update('skills', e.target.value)}
                placeholder="Comma or + separated..."
                className="w-full bg-slate-50 dark:input-glass text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm mb-4"
              />

              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Min Experience (Years)</label>
              <input
                type="number"
                value={filters.minExperience}
                onChange={e => update('minExperience', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full bg-slate-50 dark:input-glass text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm"
              />
            </div>

            {/* Sort */}
            <div>
              <label className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 block font-medium">Sort By</label>
              <div className="flex gap-2">
                <select
                  value={filters.sortBy}
                  onChange={e => update('sortBy', e.target.value)}
                  className="flex-1 bg-slate-50 dark:input-glass text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="">Date Added</option>
                  <option value="aiScore">AI Score</option>
                  <option value="matchScore">Match Score</option>
                  <option value="name">Name</option>
                  <option value="experience">Experience</option>
                </select>
                <select
                  value={filters.order}
                  onChange={e => update('order', e.target.value)}
                  className="w-24 bg-slate-50 dark:input-glass text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={() => { onClear(); setOpen(false); }}
                className="text-sm text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-center mt-1 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}