import { useAuth } from '../context/AuthContext';

type NavbarProps = { title: string }

export default function Navbar({ title }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 glass-strong border-b border-white/5 flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-white tracking-tight">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">{user?.name}</span>
        <button
          onClick={logout}
          className="text-xs text-slate-500 hover:text-red-400 transition-colors"
        >
          Logout
        </button>
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-primary text-sm font-bold border border-primary/20">
          {user?.name?.charAt(0) || 'R'}
        </div>
      </div>
    </header>
  );
}