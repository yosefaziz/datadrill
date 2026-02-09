import { useState, useEffect, useRef } from 'react';
import { Code2, ChevronUp, ChevronDown, Send } from 'lucide-react';
import { useAuthGate } from '@/hooks/useAuthGate';
import { useSolutionStore } from '@/stores/solutionStore';
import { Question, getEditorLanguage, isArchitectureQuestion, isModelingQuestion } from '@/types';

interface SolutionsPanelProps {
  question: Question;
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

export function SolutionsPanel({ question, hasSubmitted }: SolutionsPanelProps) {
  const { isAuthenticated, user } = useAuthGate();
  const {
    solutions,
    userVotes,
    isLoading,
    isPosting,
    fetchSolutions,
    postSolution,
    voteSolution,
  } = useSolutionStore();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const fetchedRef = useRef<string | null>(null);

  const language = isArchitectureQuestion(question) || isModelingQuestion(question)
    ? 'text'
    : getEditorLanguage(question);

  useEffect(() => {
    if (isAuthenticated && hasSubmitted && fetchedRef.current !== question.id) {
      fetchedRef.current = question.id;
      fetchSolutions(question.id);
    }
  }, [isAuthenticated, hasSubmitted, question.id, fetchSolutions]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <Code2 className="w-8 h-8 mb-3" />
        <p className="text-sm">Sign in to access solutions.</p>
      </div>
    );
  }

  if (!hasSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-muted">
        <Code2 className="w-8 h-8 mb-3" />
        <p className="text-sm">Submit at least one attempt to unlock solutions.</p>
      </div>
    );
  }

  const userHasSolution = solutions.some((s) => s.user_id === user?.id);

  const handlePost = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) return;
    await postSolution(question.id, trimmedTitle, trimmedContent, language);
    setTitle('');
    setContent('');
    setShowForm(false);
  };

  const handleVote = async (solutionId: string, vote: 1 | -1) => {
    await voteSolution(solutionId, vote);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Post button / form */}
      <div className="p-3 border-b border-border-color">
        {showForm ? (
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Solution title..."
              maxLength={200}
              className="w-full bg-bg-secondary text-text-primary text-sm rounded-lg px-3 py-2 border border-border-color focus:outline-none focus:border-primary"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your solution code..."
              rows={6}
              className="w-full bg-bg-secondary text-text-primary text-sm font-mono rounded-lg px-3 py-2 resize-none border border-border-color focus:outline-none focus:border-primary"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!title.trim() || !content.trim() || isPosting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                Post
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            disabled={userHasSolution}
            className="w-full py-2 text-sm font-medium text-primary hover:text-primary-hover transition-colors disabled:text-text-muted disabled:cursor-not-allowed"
          >
            {userHasSolution ? 'You already posted a solution' : '+ Post Your Solution'}
          </button>
        )}
      </div>

      {/* Solutions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : solutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-text-muted">
            <p className="text-sm">No solutions yet. Be the first to share!</p>
          </div>
        ) : (
          solutions.map((s) => {
            const userVote = userVotes[s.id] || 0;

            return (
              <div key={s.id} className="p-3 bg-bg-secondary rounded-lg ring-1 ring-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-text-primary">{s.title}</h4>
                  <span className="text-xs text-text-muted">{timeAgo(s.created_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs text-primary">
                    {s.profiles?.display_name || 'Anonymous'}
                  </span>
                </div>
                <pre className="p-3 bg-surface rounded text-xs text-text-secondary font-mono overflow-x-auto whitespace-pre-wrap ring-1 ring-white/5">
                  {s.content}
                </pre>
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={() => handleVote(s.id, 1)}
                    className={`p-1 rounded transition-colors ${
                      userVote === 1 ? 'text-success' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className={`text-xs font-medium min-w-[1.5rem] text-center ${
                    s.vote_count > 0 ? 'text-success' : s.vote_count < 0 ? 'text-error' : 'text-text-muted'
                  }`}>
                    {s.vote_count}
                  </span>
                  <button
                    onClick={() => handleVote(s.id, -1)}
                    className={`p-1 rounded transition-colors ${
                      userVote === -1 ? 'text-error' : 'text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
