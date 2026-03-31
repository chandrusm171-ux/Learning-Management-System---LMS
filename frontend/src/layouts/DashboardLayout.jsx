import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, BookOpen, GraduationCap, Bell,
  Settings, LogOut, Menu, X, ChevronRight,
  Users, BarChart2, BookMarked, Sun, Moon
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleDark } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const studentNav = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
    { icon: BookOpen, label: 'My Courses', to: '/my-courses' },
    { icon: GraduationCap, label: 'Browse Courses', to: '/courses' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  const instructorNav = [
    { icon: LayoutDashboard, label: 'Dashboard', to: '/instructor/dashboard' },
    { icon: BookMarked, label: 'My Courses', to: '/instructor/courses' },
    { icon: Users, label: 'Students', to: '/instructor/students' },
    { icon: BarChart2, label: 'Analytics', to: '/instructor/analytics' },
    { icon: Bell, label: 'Notifications', to: '/notifications' },
    { icon: Settings, label: 'Settings', to: '/settings' },
  ];

  const navItems = user?.role === 'instructor' ? instructorNav : studentNav;
  const isActive = (to) => location.pathname === to;

  const Sidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-800">
        {sidebarOpen && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">LMS<span className="text-violet-600">Pro</span></span>
          </Link>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* User info */}
      {sidebarOpen && (
        <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-sm flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <span className="text-xs text-violet-600 dark:text-violet-400 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ icon: Icon, label, to }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive(to)
                ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            }`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && (
              <>
                <span className="text-sm font-medium flex-1">{label}</span>
                {isActive(to) && <ChevronRight className="w-3.5 h-3.5" />}
              </>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-800 pt-3">
        <button onClick={toggleDark}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {sidebarOpen && <span className="text-sm font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span>}
        </button>
        <button onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="w-4 h-4" />
          {sidebarOpen && <span className="text-sm font-medium">Sign out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-gray-600 dark:text-gray-300">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="font-bold text-gray-900 dark:text-white">
            LMS<span className="text-violet-600">Pro</span>
          </Link>
          <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}