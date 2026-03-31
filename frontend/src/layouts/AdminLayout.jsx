import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Users, BookOpen, Tag, BarChart2, TrendingUp, LogOut, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleDark } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  const navItems = [
    { icon: BarChart2, label: 'Overview', to: '/admin' },
    { icon: TrendingUp, label: 'Analytics', to: '/admin/analytics' },
    { icon: BookOpen, label: 'Pending Courses', to: '/admin/courses' },
    { icon: Users, label: 'Users', to: '/admin/users' },
    { icon: Tag, label: 'Categories', to: '/admin/categories' },
  ];

  const isActive = (to) => {
    if (to === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(to);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 sticky top-0 h-screen flex-shrink-0">
        <div className="flex items-center gap-2 px-5 h-16 border-b border-gray-200 dark:border-gray-800">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Admin Panel</span>
        </div>

        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-700 dark:text-red-300 font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <span className="text-xs text-red-600 dark:text-red-400">Administrator</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ icon: Icon, label, to }) => (
            <Link key={label} to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                isActive(to)
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-3">
          <button onClick={toggleDark}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}