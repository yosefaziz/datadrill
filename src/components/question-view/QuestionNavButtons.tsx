import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface QuestionNavButtonsProps {
  prevUrl: string | null;
  nextUrl: string | null;
}

export function QuestionNavButtons({ prevUrl, nextUrl }: QuestionNavButtonsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {prevUrl ? (
        <Link
          to={prevUrl}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-text-secondary bg-surface ring-1 ring-white/10 hover:text-primary hover:ring-primary/30 transition-colors"
          aria-label="Previous question"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </Link>
      ) : (
        <span
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-text-muted/30 bg-surface/50 ring-1 ring-white/5 cursor-not-allowed"
          aria-disabled="true"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Prev</span>
        </span>
      )}
      {nextUrl ? (
        <Link
          to={nextUrl}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors"
          aria-label="Next question"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium text-text-muted/30 bg-surface/50 ring-1 ring-white/5 cursor-not-allowed"
          aria-disabled="true"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </div>
  );
}
