import { Search, X } from 'lucide-react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full input-glass text-white rounded-xl pl-10 pr-10 py-2.5 text-sm placeholder-slate-500 font-medium"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}