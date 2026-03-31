export default function CourseCardSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="w-40 h-24 flex-shrink-0 skeleton rounded-lg" />
        <div className="flex-1 space-y-2 py-2">
          <div className="skeleton h-4 rounded w-3/4" />
          <div className="skeleton h-3 rounded w-1/4" />
          <div className="skeleton h-3 rounded w-1/2" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 rounded w-full" />
        <div className="skeleton h-3 rounded w-2/3" />
        <div className="skeleton h-3 rounded w-1/2" />
        <div className="flex gap-2 mt-2">
          <div className="skeleton h-3 rounded w-16" />
          <div className="skeleton h-3 rounded w-16" />
        </div>
      </div>
    </div>
  );
}