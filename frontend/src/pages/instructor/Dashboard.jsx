import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Users, DollarSign, Star, BookOpen,
  TrendingUp, Plus, Eye, ChevronRight,
  BarChart2, ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/api/axios';

export default function InstructorDashboard() {
  const { user } = useAuthStore();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: () => api.get('/courses/analytics'),
    select: (res) => res.data.data,
  });

  const summary = analyticsData?.summary || {};
  const courses = analyticsData?.courses || [];
  const recentEnrollments = analyticsData?.recentEnrollments || [];

  const stats = [
    { label: 'Total Students', value: summary.totalStudents || 0, icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400', trend: '+12%' },
    { label: 'Total Revenue', value: `₹${(summary.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400', trend: '+8%' },
    { label: 'Avg Rating', value: summary.avgRating || '0.0', icon: Star, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400', trend: '+0.2' },
    { label: 'Total Courses', value: summary.totalCourses || 0, icon: BookOpen, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400', trend: '' },
  ];

  const statusColors = {
    draft: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    published: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Instructor Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name?.split(' ')[0]}!</p>
        </div>
        <Link to="/instructor/courses/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/30">
          <Plus className="w-4 h-4" /> Create Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              {trend && (
                <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                  <ArrowUpRight className="w-3 h-3" />{trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* My Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Courses</h2>
            <Link to="/instructor/courses" className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex gap-3">
                  <div className="skeleton w-16 h-16 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
              <BookOpen className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No courses yet</p>
              <Link to="/instructor/courses/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
                <Plus className="w-4 h-4" /> Create your first course
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.slice(0, 5).map((course) => (
                <div key={course._id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700 transition-colors">
                  <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{course.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Users className="w-3 h-3" />{course.enrollmentCount}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{course.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <DollarSign className="w-3 h-3" />₹{course.revenue?.toLocaleString() || 0}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[course.status] || statusColors.draft}`}>
                      {course.status}
                    </span>
                    <Link to={`/instructor/courses/${course._id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enrollments */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Enrollments</h2>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
            {recentEnrollments.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                No enrollments yet
              </div>
            ) : recentEnrollments.slice(0, 6).map((enrollment) => (
              <div key={enrollment._id} className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-xs flex-shrink-0">
                  {enrollment.student?.name?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{enrollment.student?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{enrollment.course?.title}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(enrollment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>

          {/* Quick stats card */}
          <div className="mt-4 p-4 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl text-white">
            <div className="flex items-center gap-2 mb-2">
              <BarChart2 className="w-4 h-4" />
              <span className="text-sm font-semibold">This month</span>
            </div>
            <p className="text-3xl font-extrabold">{recentEnrollments.length}</p>
            <p className="text-violet-200 text-sm">new enrollments</p>
          </div>
        </div>
      </div>
    </div>
  );
}