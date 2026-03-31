import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Users, BookOpen, DollarSign, TrendingUp,
  Check, X, Search, Shield, AlertCircle,
  ChevronRight, Plus, BarChart2, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import toast from 'react-hot-toast';
import api from '@/api/axios';

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const location = useLocation();
  const queryClient = useQueryClient();

  const getActiveTab = () => {
    if (location.pathname.includes('/users')) return 'users';
    if (location.pathname.includes('/courses')) return 'courses';
    if (location.pathname.includes('/categories')) return 'categories';
    if (location.pathname.includes('/analytics')) return 'analytics';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());
  const [userSearch, setUserSearch] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', color: '#7c3aed' });

  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats'),
    select: (res) => res.data.data,
  });

  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics'),
    select: (res) => res.data.data,
  });

  const { data: pendingCourses } = useQuery({
    queryKey: ['pending-courses'],
    queryFn: () => api.get('/admin/courses/pending'),
    select: (res) => res.data.data?.courses || [],
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin-users', userSearch],
    queryFn: () => api.get('/admin/users', { params: { search: userSearch, limit: 20 } }),
    select: (res) => res.data.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/admin/categories'),
    select: (res) => res.data.data?.categories || [],
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/courses/${id}/approve`),
    onSuccess: () => {
      toast.success('Course approved!');
      queryClient.invalidateQueries(['pending-courses']);
      queryClient.invalidateQueries(['admin-stats']);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.patch(`/admin/courses/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Course rejected');
      queryClient.invalidateQueries(['pending-courses']);
    },
  });

  const banMutation = useMutation({
    mutationFn: ({ id, ban }) => api.patch(`/admin/users/${id}/ban`, { ban }),
    onSuccess: (_, { ban }) => {
      toast.success(ban ? 'User banned' : 'User unbanned');
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries(['admin-users']);
    },
  });

  const categoryMutation = useMutation({
    mutationFn: (data) => api.post('/admin/categories', data),
    onSuccess: () => {
      toast.success('Category created!');
      queryClient.invalidateQueries(['admin-categories']);
      setNewCategory({ name: '', slug: '', color: '#7c3aed' });
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => {
      toast.success('Category deleted');
      queryClient.invalidateQueries(['admin-categories']);
    },
  });

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', trend: '+12%' },
    { label: 'Published Courses', value: stats?.totalCourses || 0, icon: BookOpen, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', trend: '+5%' },
    { label: 'Total Enrollments', value: stats?.totalEnrollments || 0, icon: TrendingUp, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', trend: '+18%' },
    { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', trend: '+8%' },
  ];

  const roleColors = {
    student: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    instructor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
    admin: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  const tabs = [
    { id: 'overview', label: 'Overview', to: '/admin' },
    { id: 'analytics', label: 'Analytics', to: '/admin/analytics' },
    { id: 'courses', label: `Pending (${pendingCourses?.length || 0})`, to: '/admin/courses' },
    { id: 'users', label: 'Users', to: '/admin/users' },
    { id: 'categories', label: 'Categories', to: '/admin/categories' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 shadow-lg">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
              {p.name === 'Revenue' ? `₹${p.value.toLocaleString()}` : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-violet-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your LMS platform</p>
        </div>
        {pendingCourses?.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            {pendingCourses.length} awaiting review
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-800 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <Link key={tab.id} to={tab.to}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ label, value, icon: Icon, color, trend }) => (
              <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="w-3 h-3" />{trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Recent users + quick links */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 dark:text-white">Recent Users</h2>
                <Link to="/admin/users" className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {(stats?.recentUsers || []).map((u) => (
                  <div key={u._id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-sm flex-shrink-0">
                      {u.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleColors[u.role]}`}>
                      {u.role}
                    </span>
                  </div>
                ))}
                {!stats?.recentUsers?.length && (
                  <p className="text-sm text-gray-500 text-center py-4">No users yet</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Review Pending Courses', to: '/admin/courses', icon: BookOpen, color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300', badge: pendingCourses?.length },
                { label: 'Manage Users', to: '/admin/users', icon: Users, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300' },
                { label: 'View Analytics', to: '/admin/analytics', icon: BarChart2, color: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300' },
                { label: 'Manage Categories', to: '/admin/categories', icon: BarChart2, color: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' },
              ].map(({ label, to, icon: Icon, color, badge }) => (
                <Link key={label} to={to}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${color} hover:shadow-md transition-all`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-semibold flex-1">{label}</span>
                  {badge > 0 && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{badge}</span>
                  )}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">

          {/* Charts row 1 */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Enrollments chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Monthly Enrollments</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Last 6 months</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics?.monthlyEnrollments || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Enrollments" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User growth chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">User Growth</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Last 6 months</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics?.userGrowth || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="New Users"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts row 2 */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Revenue chart */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Revenue</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Last 6 months (₹)</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={analytics?.monthlyRevenue || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Role distribution pie */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">User Distribution</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">By role</p>
              {analytics?.roleStats?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={(analytics?.roleStats || []).map((r) => ({
                        name: r._id,
                        value: r.count,
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(analytics?.roleStats || []).map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                  No data yet
                </div>
              )}
            </div>
          </div>

          {/* Top courses table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-5">Top Courses by Enrollment</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Course', 'Enrollments', 'Revenue', 'Rating'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 pb-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {(analytics?.topCourses || []).map((course, i) => (
                    <tr key={course._id}>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                            {course.title}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                        {course.enrollmentCount?.toLocaleString()}
                      </td>
                      <td className="py-3 text-sm text-gray-700 dark:text-gray-300">
                        ₹{course.revenue?.toLocaleString() || 0}
                      </td>
                      <td className="py-3">
                        <span className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                          ★ {course.rating?.toFixed(1) || '0.0'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!analytics?.topCourses?.length && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-gray-500">
                        No published courses yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Pending Courses */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white text-lg">Courses Pending Approval</h2>
          {!pendingCourses?.length ? (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <Check className="w-10 h-10 mx-auto text-green-500 mb-3" />
              <p className="font-semibold text-gray-900 dark:text-white">All caught up!</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">No courses pending review</p>
            </div>
          ) : (pendingCourses || []).map((course) => (
            <div key={course._id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                  {course.thumbnail
                    ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-gray-400" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">{course.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>By: <strong className="text-gray-700 dark:text-gray-300">{course.instructor?.name}</strong></span>
                    <span>Category: <strong className="text-gray-700 dark:text-gray-300">{course.category?.name}</strong></span>
                    <span>Level: <strong className="text-gray-700 dark:text-gray-300 capitalize">{course.level}</strong></span>
                    <span>Price: <strong className="text-gray-700 dark:text-gray-300">₹{course.price}</strong></span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approveMutation.mutate(course._id)}
                    disabled={approveMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) rejectMutation.mutate({ id: course._id, reason });
                    }}
                    disabled={rejectMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl transition-colors border border-red-200 dark:border-red-800">
                    <X className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search users..." value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-violet-500 text-gray-900 dark:text-white" />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    {['User', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {(usersData?.users || []).map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-xs flex-shrink-0">
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[160px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={u.role}
                          onChange={(e) => roleMutation.mutate({ id: u._id, role: e.target.value })}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 outline-none cursor-pointer ${roleColors[u.role]}`}>
                          <option value="student">student</option>
                          <option value="instructor">instructor</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isBanned ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                          {u.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => banMutation.mutate({ id: u._id, ban: !u.isBanned })}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            u.isBanned
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'
                          }`}>
                          {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!usersData?.users?.length && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-sm text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Add New Category</h3>
            <div className="flex gap-3 flex-wrap">
              <input type="text" placeholder="Category name" value={newCategory.name}
                onChange={(e) => setNewCategory((p) => ({
                  ...p,
                  name: e.target.value,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                }))}
                className="flex-1 min-w-[200px] px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-violet-500 text-gray-900 dark:text-white" />
              <input type="text" placeholder="slug" value={newCategory.slug}
                onChange={(e) => setNewCategory((p) => ({ ...p, slug: e.target.value }))}
                className="w-40 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:border-violet-500 text-gray-900 dark:text-white" />
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">Color:</label>
                <input type="color" value={newCategory.color}
                  onChange={(e) => setNewCategory((p) => ({ ...p, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer p-1" />
              </div>
              <button onClick={() => categoryMutation.mutate(newCategory)}
                disabled={!newCategory.name || !newCategory.slug || categoryMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-medium rounded-xl transition-colors text-sm">
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(categories || []).map((cat) => (
              <div key={cat._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: cat.color || '#7c3aed' }}>
                    {cat.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">/{cat.slug} • {cat.courseCount || 0} courses</p>
                  </div>
                </div>
                <button onClick={() => { if (confirm(`Delete "${cat.name}"?`)) deleteCatMutation.mutate(cat._id); }}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {!categories?.length && (
              <div className="col-span-3 text-center py-8 text-sm text-gray-500">
                No categories yet. Add one above.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}