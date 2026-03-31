import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
      <Link to="/" className="flex items-center hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          {i === items.length - 1 ? (
            <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">{item.label}</span>
          ) : (
            <Link to={item.to} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}