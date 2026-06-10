type ButtonProps = {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
  className?: string;
}

const variants = {
  primary: 'gradient-primary hover:shadow-glow-sm text-white hover:-translate-y-0.5',
  secondary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-glow-purple text-white hover:-translate-y-0.5',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-glow-red text-white hover:-translate-y-0.5',
  ghost: 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300',
}

export default function Button({ children, variant = 'primary', onClick, disabled, type = 'button', className = '' }: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}