import { useAuth } from '../context/AuthContext';

type NavbarProps = { title: string }

export default function Navbar({ title }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-base font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">{user?.name}</span>
        <button
          onClick={logout}
          className="text-xs text-gray-500 hover:text-red-400 transition-colors"
        >
          Logout
        </button>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
          {user?.name?.charAt(0) || 'R'}
        </div>
      </div>
    </header>
  );
}