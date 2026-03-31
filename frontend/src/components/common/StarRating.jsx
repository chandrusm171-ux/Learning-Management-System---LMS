import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, max = 5, size = 'sm' }) {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const iconSize = sizes[size] || sizes.sm;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-200 dark:text-gray-700'
          }`}
        />
      ))}
    </div>
  );
}