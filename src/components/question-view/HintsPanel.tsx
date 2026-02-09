import { useState } from 'react';
import { Lightbulb, Eye } from 'lucide-react';

interface HintsPanelProps {
  hints: string[];
}

export function HintsPanel({ hints }: HintsPanelProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  if (hints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <Lightbulb className="w-8 h-8 mb-3" />
        <p className="text-sm">No hints available for this question.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hints.map((hint, index) => {
        const isRevealed = index < revealedCount;

        return (
          <div
            key={index}
            className="rounded-lg ring-1 ring-white/10 overflow-hidden"
          >
            {isRevealed ? (
              <div className="p-4 bg-warning/5">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-warning">
                      Hint {index + 1}
                    </span>
                    <p className="text-sm text-text-secondary mt-1">{hint}</p>
                  </div>
                </div>
              </div>
            ) : index === revealedCount ? (
              <button
                onClick={() => setRevealedCount(revealedCount + 1)}
                className="w-full p-4 flex items-center gap-2.5 bg-surface hover:bg-bg-secondary transition-colors text-left"
              >
                <Eye className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text-secondary">
                  Reveal Hint {index + 1}
                </span>
              </button>
            ) : (
              <div className="p-4 bg-surface opacity-50">
                <div className="flex items-center gap-2.5">
                  <Lightbulb className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text-muted">
                    Hint {index + 1}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
