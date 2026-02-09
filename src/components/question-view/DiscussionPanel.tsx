import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useDiscussionStore } from '@/stores/discussionStore';

interface DiscussionPanelProps {
  questionId: string;
  hasSubmitted: boolean;
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DiscussionPanel({ questionId, hasSubmitted }: DiscussionPanelProps) {
  const { isAuthenticated } = useAuthGate();
  const {
    discussions,
    isLoading,
    isPosting,
    fetchDiscussions,
    postDiscussion,
  } = useDiscussionStore();
  const [content, setContent] = useState('');
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && hasSubmitted && fetchedRef.current !== questionId) {
      fetchedRef.current = questionId;
      fetchDiscussions(questionId);
    }
  }, [isAuthenticated, hasSubmitted, questionId, fetchDiscussions]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <MessageSquare className="w-8 h-8 mb-3" />
        <p className="text-sm">Sign in to access discussions.</p>
      </div>
    );
  }

  if (!hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <MessageSquare className="w-8 h-8 mb-3" />
        <p className="text-sm">Submit at least one attempt to unlock discussion.</p>
      </div>
    );
  }

  const handlePost = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    await postDiscussion(questionId, trimmed);
    setContent('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Post input */}
      <div className="p-3 border-b border-border-color">
        <div className="flex gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your approach (no solutions)..."
            maxLength={2000}
            rows={2}
            className="flex-1 bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 resize-none border border-border-color focus:outline-none focus:border-primary"
          />
          <button
            onClick={handlePost}
            disabled={!content.trim() || isPosting}
            className="self-end px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Discussion list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : discussions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <p className="text-sm">No discussions yet. Be the first to share!</p>
          </div>
        ) : (
          discussions.map((d) => (
            <div key={d.id} className="p-3 bg-bg-secondary rounded-lg ring-1 ring-white/5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-primary">
                  {d.profiles?.display_name || 'Anonymous'}
                </span>
                <span className="text-xs text-text-muted">{timeAgo(d.created_at)}</span>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{d.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
