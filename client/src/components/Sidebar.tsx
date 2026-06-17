import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckCircle2,
  Upload,
  Trophy,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  type LucideIcon,
} from 'lucide-react';

type NavLinkItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

const NAV_LINKS: NavLinkItem[] = [
  { to: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/candidates',  label: 'Candidates',  icon: Users },
  { to: '/jobs',        label: 'Jobs',        icon: Briefcase },
  { to: '/shortlisted', label: 'Shortlisted', icon: CheckCircle2 },
  { to: '/upload',      label: 'Upload',      icon: Upload },
  { to: '/rankings',    label: 'Ranking',     icon: Trophy },
  { to: '/activity',    label: 'Activity',    icon: ClipboardList },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ─── Sidebar Content ───
  const SidebarContent = ({ isCollapsed = false }: { isCollapsed?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className={`py-5 border-b border-slate-200 dark:border-white/5 flex items-center ${
        isCollapsed ? 'px-3 justify-center' : 'px-6 justify-between'
      }`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-glow-sm">
              AI
            </div>
            <div>
              <span className="text-slate-900 dark:text-white font-bold text-sm whitespace-nowrap tracking-tight">
                ResumeScreen
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Smart Hiring</p>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-glow-sm">
            AI
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className={`flex-1 py-4 flex flex-col gap-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {NAV_LINKS.map(link => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              title={isCollapsed ? link.label : undefined}
              className={({ isActive }) =>
                `group relative flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                } py-2.5 rounded-xl text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/5 dark:from-primary/20 dark:to-secondary/10 text-primary dark:text-white font-medium border border-primary/20 shadow-sm dark:shadow-inner-glow'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active indicator bar */}
                  {isActive && !isCollapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 gradient-primary rounded-r-full" />
                  )}
                  <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-primary' : ''}`} />
                  {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}

                  {/* Hover tooltip when collapsed */}
                  {isCollapsed && (
                    <span className="absolute left-full ml-3 px-3 py-1.5 glass-strong text-slate-900 dark:text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-glass">
                      {link.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info + Logout + Theme Toggle */}
      <div className={`py-4 border-t border-slate-200 dark:border-white/5 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/30 dark:to-secondary/30 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0 border border-primary/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-slate-900 dark:text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-slate-500 dark:text-slate-600 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2" title={user?.name}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/30 dark:to-secondary/30 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}

        <button
          onClick={toggleTheme}
          title={isCollapsed ? 'Toggle Theme' : undefined}
          className={`group relative w-full flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
          } py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 mb-1`}
        >
          {theme === 'dark' ? <Sun size={18} className="flex-shrink-0" /> : <Moon size={18} className="flex-shrink-0" />}
          {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}

          {isCollapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 glass-strong text-slate-900 dark:text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-glass">
              Toggle Theme
            </span>
          )}
        </button>

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`group relative w-full flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
          } py-2.5 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-500/5 transition-all duration-200`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}

          {isCollapsed && (
            <span className="absolute left-full ml-3 px-3 py-1.5 glass-strong text-slate-900 dark:text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-glass">
              Logout
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0 transition-all duration-300 bg-white border-r border-slate-200 dark:bg-slate-900/95 dark:border-white/5 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <SidebarContent isCollapsed={collapsed} />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="absolute -right-3 top-14 w-7 h-7 glass-strong rounded-full flex items-center justify-center text-slate-600 dark:text-white shadow-sm dark:shadow-glass transition-all duration-200 z-20 hover:scale-110 hover:shadow-md dark:hover:shadow-glow-sm"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ─── MOBILE HAMBURGER ─── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 glass-strong rounded-xl flex items-center justify-center text-slate-700 dark:text-white shadow-sm dark:shadow-glass"
      >
        <Menu size={20} />
      </button>

      {/* ─── MOBILE OVERLAY ─── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="md:hidden fixed left-0 top-0 h-full w-64 z-50 flex flex-col shadow-xl animate-slide-up bg-white dark:bg-slate-900/95 border-r border-slate-200 dark:border-white/5"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white z-10 transition-colors"
            >
              <X size={20} />
            </button>
            <SidebarContent isCollapsed={false} />
          </aside>
        </>
      )}
    </>
  );
}