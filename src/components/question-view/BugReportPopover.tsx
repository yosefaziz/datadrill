import { useState, useEffect, useRef } from 'react';
import { Flag, CheckCircle2 } from 'lucide-react';
import { ReportCategory } from '@/types';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useReportStore } from '@/stores/reportStore';
import { isSupabaseConfigured } from '@/lib/supabase';

interface BugReportPopoverProps {
  questionId: string;
}

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'wrong_output', label: 'Wrong expected output' },
  { value: 'unclear_description', label: 'Unclear description' },
  { value: 'broken_test', label: 'Broken test case' },
  { value: 'typo', label: 'Typo' },
  { value: 'other', label: 'Other' },
];

export function BugReportPopover({ questionId }: BugReportPopoverProps) {
  const { user, requireAuth } = useAuthGate();
  const { isSubmitting, submitReport } = useReportStore();
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory>('wrong_output');
  const [details, setDetails] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowSuccess(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setShowSuccess(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Auto-close after success
  useEffect(() => {
    if (!showSuccess) return;
    const timer = setTimeout(() => {
      setIsOpen(false);
      setShowSuccess(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  if (!isSupabaseConfigured) return null;

  const handleClick = () => {
    if (!requireAuth()) return;
    setIsOpen(!isOpen);
  };

  const handleSubmit = async () => {
    if (!user) return;
    try {
      await submitReport(questionId, user.id, category, details.trim() || null);
      setDetails('');
      setCategory('wrong_output');
      setShowSuccess(true);
    } catch {
      // Error already logged in store
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={handleClick}
        title="Report an issue"
        className="p-1.5 rounded-lg transition-colors text-text-muted hover:text-text-secondary hover:bg-bg-secondary"
      >
        <Flag className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-surface rounded-lg shadow-xl ring-1 ring-white/10 p-4">
          {showSuccess ? (
            <div className="flex flex-col items-center py-4 gap-2">
              <CheckCircle2 className="w-8 h-8 text-success" />
              <p className="text-sm font-medium text-text-primary">Thanks for reporting!</p>
            </div>
          ) : (
            <>
              <h4 className="text-sm font-semibold text-text-primary mb-3">Report an Issue</h4>

              <div className="space-y-2 mb-3">
                {CATEGORIES.map((cat) => (
                  <label key={cat.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="report-category"
                      checked={category === cat.value}
                      onChange={() => setCategory(cat.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm text-text-secondary">{cat.label}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Additional details (optional)..."
                maxLength={500}
                rows={2}
                className="w-full bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 resize-none border border-border-color focus:outline-none focus:border-primary mb-3"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
