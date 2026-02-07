import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export function ProfilePage() {
  const { user, profile, updateProfile, checkUsernameAvailable, updatePassword, deleteAccount } = useAuthStore();
  const navigate = useNavigate();

  // Identity form state
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'>('idle');
  const [displayNameError, setDisplayNameError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Detect if user signed in with email/password (not OAuth)
  const isEmailUser = user?.app_metadata?.provider === 'email';

  // Reset form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setUsername(profile.username || '');
    }
  }, [profile]);

  // Username availability check (debounced)
  const checkAvailability = useCallback(async (value: string) => {
    if (!USERNAME_REGEX.test(value)) {
      setUsernameStatus('invalid');
      return;
    }
    // If username hasn't changed from saved value, it's fine
    if (value === profile?.username) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    try {
      const available = await checkUsernameAvailable(value);
      setUsernameStatus(available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('error');
    }
  }, [checkUsernameAvailable, profile?.username]);

  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle');
      return;
    }
    if (username === profile?.username) {
      setUsernameStatus('idle');
      return;
    }
    if (!USERNAME_REGEX.test(username)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkAvailability(username);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [username, checkAvailability, profile?.username]);

  // Clear save message after 3s
  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  useEffect(() => {
    if (passwordMessage) {
      const timer = setTimeout(() => setPasswordMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [passwordMessage]);

  // Escape key to close delete modal
  useEffect(() => {
    if (!showDeleteModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDeleteModal(false);
        setDeleteConfirmText('');
        setDeleteError('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteModal]);

  const hasIdentityChanges =
    displayName !== (profile?.display_name || '') ||
    username !== (profile?.username || '');

  const canSaveIdentity =
    displayName.trim().length > 0 &&
    displayName.trim().length <= 50 &&
    USERNAME_REGEX.test(username) &&
    usernameStatus !== 'taken' &&
    usernameStatus !== 'checking' &&
    usernameStatus !== 'error' &&
    hasIdentityChanges;

  const handleSaveIdentity = async () => {
    if (!canSaveIdentity) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const updates: Record<string, string> = {};
      if (displayName !== (profile?.display_name || '')) {
        updates.display_name = displayName.trim();
      }
      if (username !== (profile?.username || '')) {
        updates.username = username.trim();
      }
      await updateProfile(updates);
      setSaveMessage({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelIdentity = () => {
    setDisplayName(profile?.display_name || '');
    setUsername(profile?.username || '');
    setUsernameStatus('idle');
    setDisplayNameError('');
    setSaveMessage(null);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setIsChangingPassword(true);
    setPasswordMessage(null);
    try {
      await updatePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ type: 'success', text: 'Password updated' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError('');
    try {
      await deleteAccount();
      navigate('/');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete account. Please try again.');
      setIsDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    setDeleteError('');
  };

  const displayInitial = (displayName || user?.email?.split('@')[0] || 'U')[0].toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-text-primary mb-8">Edit Profile</h1>

      {/* Section 1: Identity */}
      <div className="bg-surface rounded-xl p-6 ring-1 ring-white/5 mb-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {displayInitial}
          </div>
          <div className="min-w-0">
            <div className="text-lg font-semibold text-text-primary truncate">
              {displayName || 'Your Name'}
            </div>
            <div className="text-sm text-text-muted truncate">{user?.email}</div>
          </div>
        </div>

        {/* Display Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Display name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={() => {
              if (displayName.trim().length === 0) {
                setDisplayNameError('Display name is required.');
              } else if (displayName.trim().length > 50) {
                setDisplayNameError('Display name must be 50 characters or less.');
              } else {
                setDisplayNameError('');
              }
            }}
            maxLength={50}
            className="w-full px-4 py-2.5 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Your name"
          />
          {displayNameError && (
            <p className="text-sm text-error mt-1.5">{displayNameError}</p>
          )}
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Username</label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="your_username"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {usernameStatus === 'checking' && (
                <svg className="w-5 h-5 text-text-muted animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {usernameStatus === 'available' && (
                <svg className="w-5 h-5 text-success" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {(usernameStatus === 'taken' || usernameStatus === 'error') && (
                <svg className="w-5 h-5 text-error" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
          {usernameStatus === 'taken' && (
            <p className="text-sm text-error mt-1.5">This username is already taken.</p>
          )}
          {usernameStatus === 'invalid' && username.length > 0 && (
            <p className="text-sm text-error mt-1.5">
              {username.length < 3
                ? 'Username must be at least 3 characters.'
                : 'Only letters, numbers, and underscores allowed.'}
            </p>
          )}
          {usernameStatus === 'error' && (
            <p className="text-sm text-error mt-1.5">Could not check availability. Try again.</p>
          )}
        </div>

        {/* Email (read-only) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-muted cursor-not-allowed"
          />
        </div>

        {/* Save / Cancel */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveIdentity}
            disabled={!canSaveIdentity || isSaving}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              canSaveIdentity && !isSaving
                ? 'bg-primary text-white hover:bg-primary-hover'
                : 'bg-border text-text-muted cursor-not-allowed'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          {hasIdentityChanges && (
            <button
              onClick={handleCancelIdentity}
              className="px-5 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          )}
          {saveMessage && (
            <span className={`text-sm ${saveMessage.type === 'success' ? 'text-success' : 'text-error'}`}>
              {saveMessage.text}
            </span>
          )}
        </div>
      </div>

      {/* Section 2: Change Password (email users only) */}
      {isEmailUser && (
        <div className="bg-surface rounded-xl p-6 ring-1 ring-white/5 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-1">Change Password</h2>
          <p className="text-sm text-text-secondary mb-6">Must be at least 8 characters.</p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-text-primary mb-1.5">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="New password"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-1.5">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Confirm new password"
            />
          </div>

          {passwordError && (
            <p className="text-sm text-error mb-4">{passwordError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleChangePassword}
              disabled={!newPassword || !confirmPassword || isChangingPassword}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                newPassword && confirmPassword && !isChangingPassword
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'bg-border text-text-muted cursor-not-allowed'
              }`}
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
            {passwordMessage && (
              <span className={`text-sm ${passwordMessage.type === 'success' ? 'text-success' : 'text-error'}`}>
                {passwordMessage.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Section 3: Danger Zone */}
      <div className="bg-surface rounded-xl p-6 ring-1 ring-error/30 mb-6">
        <h2 className="text-lg font-semibold text-error mb-1">Danger Zone</h2>
        <p className="text-sm text-text-secondary mb-4">
          Permanently delete your account and all associated data including submission history and stats.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-5 py-2 rounded-lg text-sm font-medium text-error ring-1 ring-error/50 hover:bg-error/10 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
        >
          <div className="bg-surface rounded-xl p-6 ring-1 ring-white/10 max-w-md mx-4 w-full">
            <h3 id="delete-modal-title" className="text-lg font-bold text-text-primary mb-2">Delete your account?</h3>
            <p className="text-sm text-text-secondary mb-4">
              This action is permanent and cannot be undone. All your data will be deleted:
            </p>
            <ul className="text-sm text-text-secondary mb-4 list-disc list-inside space-y-1">
              <li>Your profile and username</li>
              <li>All submission history</li>
              <li>Performance stats and progress</li>
            </ul>
            <p className="text-sm text-text-primary mb-2">
              Type <span className="font-mono font-bold text-error">delete</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-error mb-4"
              placeholder="delete"
              autoFocus
            />
            {deleteError && (
              <p className="text-sm text-error mb-4">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-5 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'delete' || isDeleting}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  deleteConfirmText === 'delete' && !isDeleting
                    ? 'bg-error text-white hover:bg-error/80'
                    : 'bg-border text-text-muted cursor-not-allowed'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
