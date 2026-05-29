import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Candidates', path: '/candidates', icon: '👤' },
  { label: 'Jobs', path: '/jobs', icon: '💼' },
  { label: 'Rankings', path: '/rankings', icon: '🏆' },
  { label: 'Activity', path: '/activity', icon: '📋' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-4">
      <div className="mb-8 px-2">
        <h2 className="text-lg font-bold text-white">RecruitAI</h2>
        <p className="text-xs text-gray-500">Resume Screening Platform</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-white font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2 pt-4 border-t border-gray-800">
        <p className="text-xs text-gray-500">Logged in as</p>
        <p className="text-sm text-white font-medium">Recruiter</p>
      </div>
    </aside>
  );
}