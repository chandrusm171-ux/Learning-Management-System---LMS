import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Globe,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Play,
  Lock,
  ArrowRight,
  Heart,
  Share2,
  BarChart2,
  Loader2,
} from "lucide-react";
import {
  getCourseBySlugAPI,
  enrollCourseAPI,
  getCourseReviewsAPI,
} from "@/api/course.api";
import { useAuthStore } from "@/store/authStore";
import Breadcrumb from "@/components/common/Breadcrumb";
import StarRating from "@/components/common/StarRating";

function EnrollCard({
  course,
  isEnrolled,
  isLoading,
  onEnroll,
  formatDuration,
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
      {course.thumbnail && (
        <div className="relative h-44 bg-gray-100 dark:bg-gray-800">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-violet-600 fill-current ml-0.5" />
            </div>
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-baseline gap-2 mb-4">
          {course.isFree || course.price === 0 ? (
            <span className="text-3xl font-extrabold text-green-600">Free</span>
          ) : (
            <>
              <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                ₹{course.price}
              </span>
              {course.discountPrice > 0 && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{course.discountPrice}
                </span>
              )}
            </>
          )}
        </div>

        {isEnrolled ? (
          <Link
            to={`/learn/${course._id}`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
          >
            Continue Learning <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button
            onClick={onEnroll}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {course.isFree || course.price === 0
              ? "Enroll for free"
              : "Buy now"}
          </button>
        )}

        <div className="flex gap-2 mt-3">
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:border-violet-400 transition-colors">
            <Heart className="w-4 h-4" /> Wishlist
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-400 hover:border-violet-400 transition-colors">
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
            This course includes:
          </p>
          <ul className="space-y-2.5">
            {[
              {
                icon: Clock,
                text: `${formatDuration(course.totalDuration)} of video content`,
              },
              { icon: BookOpen, text: `${course.totalLessons || 0} lessons` },
              { icon: Globe, text: "Full lifetime access" },
              { icon: Award, text: "Certificate of completion" },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-400"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openSections, setOpenSections] = useState([0]);
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => getCourseBySlugAPI(slug),
    select: (res) => res.data.data,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ["reviews", data?.course?._id],
    queryFn: () => getCourseReviewsAPI(data?.course?._id),
    enabled: !!data?.course?._id,
    select: (res) => res.data.data,
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollCourseAPI(data?.course?._id),
    onSuccess: () => {
      toast.success("Successfully enrolled!");
      queryClient.invalidateQueries(["course", slug]);
      navigate("/dashboard");
    },
  });

  const handleEnroll = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/courses/${slug}` } } });
      return;
    }
    enrollMutation.mutate();
  };

  const toggleSection = (idx) => {
    setOpenSections((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  const formatDuration = (mins) => {
    if (!mins) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const levelColors = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-yellow-100 text-yellow-700",
    advanced: "bg-red-100 text-red-700",
    all: "bg-blue-100 text-blue-700",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!data?.course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Course not found
          </h2>
          <Link to="/courses" className="text-violet-600 hover:underline">
            Browse all courses
          </Link>
        </div>
      </div>
    );
  }

  const { course, curriculum = [], isEnrolled } = data;
  const reviews = reviewsData?.reviews || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero */}
      <div className="bg-gray-900 dark:bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb
            items={[
              { label: "Courses", to: "/courses" },
              { label: course.category?.name || "Category", to: "/courses" },
              { label: course.title },
            ]}
          />

          <div className="mt-6 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${levelColors[course.level] || levelColors.all}`}
                >
                  {course.level}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-600 text-white font-medium">
                  {course.category?.name}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">
                {course.title}
              </h1>
              {course.subtitle && (
                <p className="text-lg text-gray-300 mb-4">{course.subtitle}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-yellow-400">
                    {course.rating?.toFixed(1) || "0.0"}
                  </span>
                  <StarRating rating={course.rating || 0} size="sm" />
                  <span className="text-gray-400">
                    ({course.reviewCount || 0} reviews)
                  </span>
                </div>
                <span className="flex items-center gap-1 text-gray-300">
                  <Users className="w-4 h-4" />
                  {course.enrollmentCount?.toLocaleString() || 0} students
                </span>
                <span className="flex items-center gap-1 text-gray-300">
                  <Globe className="w-4 h-4" />
                  {course.language}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {course.instructor?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Created by</p>
                  <span className="text-sm font-semibold text-violet-400">
                    {course.instructor?.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-5 text-sm text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatDuration(course.totalDuration)} total
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  {course.totalLessons || 0} lessons
                </span>
                <span className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4" />
                  {course.totalSections || 0} sections
                </span>
                {course.certificate && (
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-400" />
                    Certificate included
                  </span>
                )}
              </div>
            </div>

            {/* Mobile enroll card */}
            <div className="lg:hidden">
              <EnrollCard
                course={course}
                isEnrolled={isEnrolled}
                isLoading={enrollMutation.isPending}
                onEnroll={handleEnroll}
                formatDuration={formatDuration}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-1 bg-white dark:bg-gray-900 rounded-xl p-1 border border-gray-100 dark:border-gray-800">
              {["overview", "curriculum", "instructor", "reviews"].map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-colors ${
                      activeTab === tab
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>

            {/* Overview */}
            {activeTab === "overview" && (
              <div className="space-y-5">
                {course.objectives?.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      What you'll learn
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {course.objectives.map((obj, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {obj}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {course.requirements?.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                      Requirements
                    </h2>
                    <ul className="space-y-2">
                      {course.requirements.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="text-violet-400 mt-0.5">•</span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    Description
                  </h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </div>
              </div>
            )}

            {/* Curriculum */}
            {activeTab === "curriculum" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Course content
                  </h2>
                  <p className="text-sm text-gray-500">
                    {course.totalLessons || 0} lessons •{" "}
                    {formatDuration(course.totalDuration)}
                  </p>
                </div>
                <div className="space-y-3">
                  {curriculum.map((section, idx) => (
                    <div
                      key={section._id}
                      className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleSection(idx)}
                        className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center gap-3 text-left">
                          {openSections.includes(idx) ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {section.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {section.lessons?.length || 0} lessons
                            </p>
                          </div>
                        </div>
                      </button>
                      {openSections.includes(idx) && (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800">
                          {section.lessons?.map((lesson) => (
                            <div
                              key={lesson._id}
                              className="flex items-center gap-3 px-5 py-3"
                            >
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${lesson.isFreePreview ? "bg-violet-100 dark:bg-violet-900/30" : "bg-gray-100 dark:bg-gray-800"}`}
                              >
                                {lesson.isFreePreview ? (
                                  <Play className="w-3 h-3 text-violet-600 fill-current" />
                                ) : (
                                  <Lock className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                                {lesson.title}
                              </span>
                              <div className="flex items-center gap-2">
                                {lesson.isFreePreview && (
                                  <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                                    Preview
                                  </span>
                                )}
                                <span className="text-xs text-gray-400">
                                  {formatDuration(lesson.videoDuration)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructor */}
            {activeTab === "instructor" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">
                  About the instructor
                </h2>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-violet-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {course.instructor?.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {course.instructor?.name}
                    </h3>
                    <p className="text-sm text-violet-600 dark:text-violet-400 mb-2">
                      {course.instructor?.headline}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {course.instructor?.bio || "No bio available."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeTab === "reviews" && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-gray-900 dark:text-white">
                      {course.rating?.toFixed(1) || "0.0"}
                    </p>
                    <StarRating rating={course.rating || 0} size="md" />
                    <p className="text-xs text-gray-500 mt-1">Course rating</p>
                  </div>
                </div>
                <div className="space-y-5">
                  {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No reviews yet. Be the first!
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review._id}
                        className="border-b border-gray-50 dark:border-gray-800 pb-5 last:border-0"
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-semibold text-sm flex-shrink-0">
                            {review.student?.name?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                {review.student?.name}
                              </p>
                              <StarRating rating={review.rating} size="xs" />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Desktop enroll card */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <EnrollCard
                course={course}
                isEnrolled={isEnrolled}
                isLoading={enrollMutation.isPending}
                onEnroll={handleEnroll}
                formatDuration={formatDuration}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
