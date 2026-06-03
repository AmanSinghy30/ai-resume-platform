import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
      <div className={`py-5 border-b border-gray-700/50 flex items-center ${
        isCollapsed ? 'px-3 justify-center' : 'px-6 justify-between'
      }`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              AI
            </div>
            <span className="text-white font-semibold text-sm whitespace-nowrap">
              ResumeScreen
            </span>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">
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
                } py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-medium'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`
              }
            >
              <Icon size={18} className="flex-shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{link.label}</span>}

              {/* Hover tooltip when collapsed */}
              {isCollapsed && (
                <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 border border-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  {link.label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className={`py-4 border-t border-gray-700/50 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-2" title={user?.name}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`group relative w-full flex items-center ${
            isCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
          } py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}

          {isCollapsed && (
            <span className="absolute left-full ml-3 px-2 py-1 bg-gray-900 border border-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
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
        className={`hidden md:flex flex-col bg-gray-800 border-r border-gray-700 h-screen sticky top-0 flex-shrink-0 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        <SidebarContent isCollapsed={collapsed} />

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="absolute -right-3 top-14 w-7 h-7 bg-gray-700 hover:bg-primary border-2 border-gray-900 rounded-full flex items-center justify-center text-white shadow-lg transition-colors z-20"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>

      {/* ─── MOBILE HAMBURGER ─── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-white shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* ─── MOBILE OVERLAY ─── */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-50 flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white z-10"
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