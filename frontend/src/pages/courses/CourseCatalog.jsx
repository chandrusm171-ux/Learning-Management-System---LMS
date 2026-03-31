import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from 'lucide-react';
import { getCoursesAPI, getCategoriesAPI } from '@/api/course.api';
import CourseCard from '@/components/course/CourseCard';
import CourseCardSkeleton from '@/components/course/CourseCardSkeleton';
import Breadcrumb from '@/components/common/Breadcrumb';

const LEVELS = ['beginner', 'intermediate', 'advanced', 'all'];
const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
];

export default function CourseCatalog() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level: '',
    free: '',
    sort: 'newest',
    page: 1,
    limit: 12,
  });

  const { data: coursesData, isLoading } = useQuery({
    queryKey: ['courses', filters],
    queryFn: () => getCoursesAPI(filters),
    select: (res) => res.data.data,
  });

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesAPI,
    select: (res) => res.data.data?.categories || [],
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', level: '', free: '', sort: 'newest', page: 1, limit: 12 });
  };

  const hasActiveFilters = filters.category || filters.level || filters.free || filters.search;
  const courses = coursesData?.courses || [];
  const pagination = coursesData?.pagination || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Breadcrumb items={[{ label: 'Courses', to: '/courses' }]} />
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Courses</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {pagination.total || 0} courses available
              </p>
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-violet-500 focus:bg-white dark:focus:bg-gray-700 rounded-xl outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">

          {/* Sidebar */}
          <aside className={`${filtersOpen ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Category */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter('category', '')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!filters.category ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    All Categories
                  </button>
                  {(catData || []).map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => updateFilter('category', cat._id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.category === cat._id ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Level */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Level</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => updateFilter('level', '')}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!filters.level ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    All Levels
                  </button>
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => updateFilter('level', lvl)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg capitalize transition-colors ${filters.level === lvl ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Price</h4>
                <div className="space-y-1">
                  {[{ label: 'All Prices', value: '' }, { label: 'Free', value: 'true' }, { label: 'Paid', value: 'false' }].map(({ label, value }) => (
                    <button
                      key={label}
                      onClick={() => updateFilter('free', value)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filters.free === value ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>

              <div className="flex items-center gap-3 ml-auto">
                <div className="relative">
                  <select
                    value={filters.sort}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                  >
                    {SORTS.map(({ value, label }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.search && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs rounded-full">
                    Search: {filters.search}
                    <button onClick={() => updateFilter('search', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.level && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs rounded-full capitalize">
                    {filters.level}
                    <button onClick={() => updateFilter('level', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {filters.free === 'true' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                    Free only
                    <button onClick={() => updateFilter('free', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {/* Course grid/list */}
            {isLoading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                {[...Array(6)].map((_, i) => <CourseCardSkeleton key={i} viewMode={viewMode} />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
                  Clear filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5' : 'space-y-4'}>
                {courses.map((course) => (
                  <CourseCard key={course._id} course={course} viewMode={viewMode} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  disabled={filters.page === 1}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                  className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:border-violet-400 transition-colors"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFilters((p) => ({ ...p, page: i + 1 }))}
                    className={`w-9 h-9 text-sm font-medium rounded-xl transition-colors ${filters.page === i + 1 ? 'bg-violet-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-400'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={filters.page === pagination.pages}
                  onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                  className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl disabled:opacity-50 text-gray-700 dark:text-gray-300 hover:border-violet-400 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}