import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Globe } from 'lucide-react';
import ProgressBar from '@/components/common/ProgressBar';

export default function CourseCard({ course, enrolled = false, progress = 0, viewMode = 'grid' }) {
  const {
    title, slug, thumbnail, instructor, price, isFree,
    rating, reviewCount, enrollmentCount, totalLessons,
    totalDuration, level, language,
  } = course;

  const formatDuration = (mins) => {
    if (!mins) return 'N/A';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const levelColors = {
    beginner: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    intermediate: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    advanced: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    all: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/courses/${slug}`}
        className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-md transition-all duration-200 group">
        <div className="w-40 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{instructor?.name}</p>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />{rating?.toFixed(1) || '0.0'} ({reviewCount || 0})</span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{enrollmentCount || 0}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{formatDuration(totalDuration)}</span>
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{totalLessons} lessons</span>
          </div>
          {enrolled && <ProgressBar value={progress} size="sm" showLabel className="mt-2 max-w-xs" />}
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {isFree || price === 0 ? <span className="text-green-600">Free</span> : `₹${price}`}
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${levelColors[level] || levelColors.all}`}>
            {level}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/courses/${slug}`}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-lg transition-all duration-200 overflow-hidden">

      {/* Thumbnail */}
      <div className="relative h-44 bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${levelColors[level] || levelColors.all}`}>
            {level}
          </span>
        </div>
        {(isFree || price === 0) && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
            Free
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors mb-1 text-sm leading-snug">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{instructor?.name}</p>

        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs font-bold text-yellow-600">{rating?.toFixed(1) || '0.0'}</span>
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({reviewCount || 0})</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDuration(totalDuration)}</span>
          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{totalLessons} lessons</span>
          <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{language}</span>
        </div>

        {enrolled && (
          <div className="mt-3">
            <ProgressBar value={progress} size="sm" showLabel />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-3">
        <div>
          {isFree || price === 0 ? (
            <span className="text-base font-bold text-green-600">Free</span>
          ) : (
            <span className="text-base font-bold text-gray-900 dark:text-white">₹{price}</span>
          )}
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Users className="w-3 h-3" />{enrollmentCount?.toLocaleString() || 0}
        </span>
      </div>
    </Link>
  );
}