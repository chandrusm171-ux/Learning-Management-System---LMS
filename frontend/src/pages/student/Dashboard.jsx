import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Clock,
  Award,
  TrendingUp,
  Play,
  ChevronRight,
  Star,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { getMyEnrollmentsAPI } from "@/api/course.api";
import ProgressBar from "@/components/common/ProgressBar";

export default function StudentDashboard() {
  const { user } = useAuthStore();

  const { data: enrollmentsData, isLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: getMyEnrollmentsAPI,
    select: (res) => res.data.data?.enrollments || [],
  });

  const enrollments = enrollmentsData || [];
  const completed = enrollments.filter((e) => e.isCompleted).length;
  const inProgress = enrollments.filter((e) => !e.isCompleted).length;
  const avgProgress = enrollments.length
    ? Math.round(
        enrollments.reduce((a, e) => a + e.completionPercentage, 0) /
          enrollments.length,
      )
    : 0;

  const stats = [
    {
      label: "Enrolled Courses",
      value: enrollments.length,
      icon: BookOpen,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock,
      color:
        "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400",
    },
    {
      label: "Completed",
      value: completed,
      icon: Award,
      color:
        "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
    },
    {
      label: "Avg Progress",
      value: `${avgProgress}%`,
      icon: TrendingUp,
      color:
        "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">
          Welcome back, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-violet-100">Continue your learning journey today.</p>
        <Link
          to="/courses"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
        >
          Browse new courses <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5"
          >
            <div
              className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            My Courses
          </h2>
          <Link
            to="/courses"
            className="text-sm text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1"
          >
            Browse more <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                <div className="skeleton h-36 w-full" />
                <div className="p-4 space-y-3">
                  <div className="skeleton h-4 rounded w-3/4" />
                  <div className="skeleton h-3 rounded w-1/2" />
                  <div className="skeleton h-2 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 mx-auto mb-4 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No courses yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start learning by enrolling in your first course
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
            >
              Browse Courses <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative h-36 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  {enrollment.course?.thumbnail ? (
                    <img
                      src={enrollment.course.thumbnail}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  {enrollment.isCompleted && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <Award className="w-3 h-3" /> Completed
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {enrollment.course?.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {enrollment.course?.instructor?.name}
                  </p>

                  <ProgressBar
                    value={enrollment.completionPercentage}
                    size="sm"
                    showLabel
                  />

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {enrollment.completedLessons}/{enrollment.totalLessons}{" "}
                      lessons
                    </span>
                    <Link
                      to={`/courses/${enrollment.course?.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      <Play className="w-3 h-3" />
                      {enrollment.isCompleted ? "Review" : "Continue"}
                    </Link>
                    <Link
                      to={`/learn/${enrollment.course?._id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      <Play className="w-3 h-3" />
                      {enrollment.isCompleted ? "Review" : "Continue"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
