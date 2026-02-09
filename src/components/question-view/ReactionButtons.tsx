import { useEffect, useRef } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useReactionStore } from '@/stores/reactionStore';
import { ReactionType } from '@/types';

interface ReactionButtonsProps {
  questionId: string;
}

export function ReactionButtons({ questionId }: ReactionButtonsProps) {
  const { requireAuth } = useAuthGate();
  const reactions = useReactionStore((s) => s.reactions[questionId]);
  const userReaction = useReactionStore((s) => s.userReactions[questionId]);
  const fetchReactions = useReactionStore((s) => s.fetchReactions);
  const toggleReaction = useReactionStore((s) => s.toggleReaction);
  const fetchedRef = useRef<string | null>(null);

  useEffect(() => {
    if (fetchedRef.current !== questionId) {
      fetchedRef.current = questionId;
      fetchReactions(questionId);
    }
  }, [questionId, fetchReactions]);

  const handleClick = (reaction: ReactionType) => {
    if (!requireAuth()) return;
    toggleReaction(questionId, reaction);
  };

  const likes = reactions?.likes ?? 0;
  const dislikes = reactions?.dislikes ?? 0;

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => handleClick('like')}
        className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs transition-colors ${
          userReaction === 'like'
            ? 'text-primary bg-primary/10'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
        }`}
        title="Like this question"
      >
        <ThumbsUp size={14} />
        {likes > 0 && <span>{likes}</span>}
      </button>
      <button
        onClick={() => handleClick('dislike')}
        className={`flex items-center gap-1 px-1.5 py-1 rounded-md text-xs transition-colors ${
          userReaction === 'dislike'
            ? 'text-error bg-error/10'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
        }`}
        title="Dislike this question"
      >
        <ThumbsDown size={14} />
        {dislikes > 0 && <span>{dislikes}</span>}
      </button>
    </div>
  );
}
