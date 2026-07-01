type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  title?: string;
}

const variants = {
  primary: 'gradient-primary hover:shadow-glow-sm text-white hover:-translate-y-0.5',
  secondary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-glow-purple text-white hover:-translate-y-0.5',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-glow-red text-white hover:-translate-y-0.5',
  ghost: 'bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 text-slate-700 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10 dark:hover:border-white/20 dark:text-slate-300',
}

export default function Button({ children, variant = 'primary', onClick, disabled, type = 'button', className = '', title }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}