type InputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  className?: string;
}

export default function Input({ label, placeholder, value, onChange, type = 'text', error, className = '' }: InputProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm text-slate-400 font-medium">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-glass text-white rounded-xl px-3.5 py-2.5 text-sm placeholder-slate-500"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}