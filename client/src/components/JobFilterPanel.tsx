import { useState, useRef, useEffect } from 'react';
import { Filter, X, ChevronDown, Check } from 'lucide-react';
import Button from './Button';

export type JobFilters = {
  skills: string;
  minExperience: string;
};

type JobFilterPanelProps = {
  filters: JobFilters;
  onChange: (filters: JobFilters) => void;
  onClear: () => void;
};

export default function JobFilterPanel({ filters, onChange, onClear }: JobFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const update = (key: keyof JobFilters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant={hasFilters ? 'primary' : 'secondary'}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 shadow-sm"
      >
        <Filter size={16} />
        <span className="hidden sm:inline">Filters</span>
        {hasFilters && (
          <span className="bg-white/20 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {Object.values(filters).filter(v => v !== '').length}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[320px] glass-strong border border-slate-200 dark:border-white/10 rounded-2xl shadow-glass-lg p-5 z-50 animate-scale-in origin-top-right">
          
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-white/5">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter size={16} className="text-primary" /> Filter Jobs
            </h4>
            {hasFilters && (
              <button
                onClick={() => { onClear(); setOpen(false); }}
                className="text-xs text-slate-500 hover:text-red-500 transition-colors font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block uppercase tracking-wider">Required Skills</label>
              <input
                type="text"
                value={filters.skills}
                onChange={e => update('skills', e.target.value)}
                placeholder="e.g. React, Python"
                className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm placeholder-slate-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block uppercase tracking-wider">Min Experience (Years)</label>
              <input
                type="number"
                value={filters.minExperience}
                onChange={e => update('minExperience', e.target.value)}
                placeholder="e.g. 2"
                min="0"
                className="w-full input-glass text-slate-900 dark:text-white rounded-xl px-3 py-2 text-sm placeholder-slate-400"
              />
            </div>
          </div>

          <Button
            variant="primary"
            className="w-full mt-5"
            onClick={() => setOpen(false)}
          >
            Apply Filters
          </Button>

        </div>
      )}
    </div>
  );
}
