import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-1 text-sm flex-wrap">
        <li className="flex items-center">
          <Link
            to="/"
            className="text-text-muted hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 text-text-muted mx-1" aria-hidden="true" />
            {item.href ? (
              <Link
                to={item.href}
                className="text-text-muted hover:text-primary transition-colors px-1 py-0.5 rounded hover:bg-primary/10"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary font-medium px-1 py-0.5" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
