import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  const location = useLocation();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/', icon: <Home className="w-4 h-4" /> }
    ];

    if (pathSegments.length === 0) {
      return breadcrumbs;
    }

    if (pathSegments[0] === 'book' && pathSegments[1]) {
      breadcrumbs.push({
        label: 'Book',
        href: `/book/${pathSegments[1]}`,
        icon: <BookOpen className="w-4 h-4" />
      });
    }

    if (pathSegments[0] === 'dev') {
      breadcrumbs.push({
        label: 'Dev Tools',
        icon: <span className="text-xs">🛠️</span>
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      aria-label="Breadcrumb navigation"
      className="flex items-center space-x-2 text-sm text-neutral-600 mb-6"
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isClickable = item.href && !isLast;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.2 }}
              className="flex items-center space-x-1.5"
            >
              {item.icon && (
                <span className="text-neutral-500 flex-shrink-0">
                  {item.icon}
                </span>
              )}
              
              {isClickable ? (
                <Link
                  to={item.href!}
                  className="hover:text-primary-600 transition-colors truncate"
                  aria-label={`Go to ${item.label}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span 
                  className={`truncate ${isLast ? 'text-neutral-800 font-medium' : ''}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </motion.div>
          </React.Fragment>
        );
      })}
    </motion.nav>
  );
};

export default Breadcrumb;