import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function UserMenu() {
  const { user, profile, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!user) return null;

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-bg-primary transition-colors"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-7 h-7 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
            {displayName[0].toUpperCase()}
          </div>
        )}
        <span className="text-sm text-text-primary hidden sm:inline max-w-[120px] truncate">
          {displayName}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-xl ring-1 ring-white/10 py-1 z-50">
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-primary transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/history"
            onClick={() => setIsOpen(false)}
            className="block px-4 py-2 text-sm text-text-primary hover:bg-bg-primary transition-colors"
          >
            History
          </Link>
          <div className="border-t border-white/10 my-1" />
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-error hover:bg-bg-primary transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
