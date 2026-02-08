import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UserRole, UserGoal, WeakestSkill } from '@/types';

type Step = 'username' | 'role' | 'goal' | 'weakness' | 'demographics';

const STEPS: Step[] = ['username', 'role', 'goal', 'weakness', 'demographics'];

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'student', label: 'Student', desc: 'Currently studying data engineering' },
  { value: 'junior', label: 'Junior', desc: '0-2 years of experience' },
  { value: 'mid', label: 'Mid-Level', desc: '2-5 years of experience' },
  { value: 'senior', label: 'Senior', desc: '5-8 years of experience' },
  { value: 'staff', label: 'Staff+', desc: '8+ years of experience' },
];

const GOALS: { value: UserGoal; label: string; desc: string }[] = [
  { value: 'interview_prep', label: 'Interview Prep', desc: 'Preparing for data engineering interviews' },
  { value: 'skill_building', label: 'Skill Building', desc: 'Improving my existing skills' },
  { value: 'career_switch', label: 'Career Switch', desc: 'Transitioning into data engineering' },
];

const WEAKNESSES: { value: WeakestSkill; label: string; desc: string }[] = [
  { value: 'sql', label: 'SQL', desc: 'Writing complex queries and optimization' },
  { value: 'python', label: 'Python', desc: 'DataFrame transformations and distributed processing' },
  { value: 'architecture', label: 'Architecture', desc: 'System design and technology choices' },
  { value: 'modeling', label: 'Modeling', desc: 'Schema design and data modeling' },
];

const BIRTH_YEARS = Array.from({ length: 71 }, (_, i) => 2010 - i); // 2010 down to 1940

type GenderOption = 'Male' | 'Female' | 'Other';

export function OnboardingModal() {
  const { completeOnboarding, checkUsernameAvailable } = useAuthStore();
  const [step, setStep] = useState<Step>('username');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Username state
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'error'>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Existing steps state
  const [role, setRole] = useState<UserRole | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [weakness, setWeakness] = useState<WeakestSkill | null>(null);

  // Demographics state
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [genderOption, setGenderOption] = useState<GenderOption | null>(null);
  const [genderOtherText, setGenderOtherText] = useState('');

  const currentIndex = STEPS.indexOf(step);

  const checkAvailability = useCallback(async (value: string) => {
    if (!USERNAME_REGEX.test(value)) {
      setUsernameStatus('invalid');
      return;
    }
    setUsernameStatus('checking');
    try {
      const available = await checkUsernameAvailable(value);
      setUsernameStatus(available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('error');
    }
  }, [checkUsernameAvailable]);

  useEffect(() => {
    if (!username) {
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
  }, [username, checkAvailability]);

  const genderValue = genderOption === 'Other' ? genderOtherText.trim() : genderOption;

  const canProceed =
    (step === 'username' && usernameStatus === 'available') ||
    (step === 'role' && role !== null) ||
    (step === 'goal' && goal !== null) ||
    (step === 'weakness' && weakness !== null) ||
    (step === 'demographics' && birthYear !== null && genderOption !== null && (genderOption !== 'Other' || genderOtherText.trim().length > 0));

  const handleNext = async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEPS.length) {
      setStep(STEPS[nextIndex]);
    } else if (role && goal && weakness && birthYear && genderValue) {
      setIsSubmitting(true);
      try {
        await completeOnboarding({
          username,
          role,
          primary_goal: goal,
          weakest_skill: weakness,
          birth_year: birthYear,
          gender: genderValue,
        });
      } catch (err) {
        console.error('Onboarding error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setStep(STEPS[currentIndex - 1]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="w-full max-w-lg mx-4">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                i <= currentIndex ? 'bg-primary w-10' : 'bg-border w-6'
              }`}
            />
          ))}
        </div>

        <div className="bg-surface rounded-xl shadow-2xl ring-1 ring-white/10 p-8">
          {/* Step 1: Username */}
          {step === 'username' && (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-1">Choose a username</h2>
              <p className="text-sm text-text-secondary mb-6">3-20 characters, letters, numbers, and underscores only.</p>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  maxLength={20}
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking' && (
                    <svg className="w-5 h-5 text-text-muted animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {usernameStatus === 'available' && (
                    <svg className="w-5 h-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {(usernameStatus === 'taken' || usernameStatus === 'error') && (
                    <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              {usernameStatus === 'taken' && (
                <p className="text-sm text-red-400 mt-2">This username is already taken.</p>
              )}
              {usernameStatus === 'invalid' && username.length > 0 && (
                <p className="text-sm text-red-400 mt-2">
                  {username.length < 3
                    ? 'Username must be at least 3 characters.'
                    : 'Only letters, numbers, and underscores allowed.'}
                </p>
              )}
              {usernameStatus === 'error' && (
                <p className="text-sm text-red-400 mt-2">Could not check availability. Please try again.</p>
              )}
            </>
          )}

          {/* Step 2: Role */}
          {step === 'role' && (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-1">What's your current role?</h2>
              <p className="text-sm text-text-secondary mb-6">This helps us personalize your experience.</p>
              <div className="space-y-2">
                {ROLES.map((r) => (
                  <OptionCard
                    key={r.value}
                    label={r.label}
                    desc={r.desc}
                    selected={role === r.value}
                    onClick={() => setRole(r.value)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Step 3: Goal */}
          {step === 'goal' && (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-1">What's your primary goal?</h2>
              <p className="text-sm text-text-secondary mb-6">We'll tailor recommendations accordingly.</p>
              <div className="space-y-2">
                {GOALS.map((g) => (
                  <OptionCard
                    key={g.value}
                    label={g.label}
                    desc={g.desc}
                    selected={goal === g.value}
                    onClick={() => setGoal(g.value)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Step 4: Weakness */}
          {step === 'weakness' && (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-1">Where do you need the most practice?</h2>
              <p className="text-sm text-text-secondary mb-6">We'll suggest questions to strengthen this area.</p>
              <div className="space-y-2">
                {WEAKNESSES.map((w) => (
                  <OptionCard
                    key={w.value}
                    label={w.label}
                    desc={w.desc}
                    selected={weakness === w.value}
                    onClick={() => setWeakness(w.value)}
                  />
                ))}
              </div>
            </>
          )}

          {/* Step 5: Demographics */}
          {step === 'demographics' && (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-1">A bit about you</h2>
              <p className="text-sm text-text-secondary mb-6">This helps us understand our community better.</p>

              {/* Birth Year */}
              <label className="block text-sm font-medium text-text-primary mb-2">Birth year</label>
              <select
                value={birthYear ?? ''}
                onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary mb-6 appearance-none"
              >
                <option value="">Select year</option>
                {BIRTH_YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Gender */}
              <label className="block text-sm font-medium text-text-primary mb-3">Gender</label>
              <div className="space-y-2">
                {(['Male', 'Female', 'Other'] as GenderOption[]).map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      genderOption === opt
                        ? 'ring-2 ring-primary bg-primary/10'
                        : 'ring-1 ring-white/10 hover:ring-primary/30'
                    }`}
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={opt}
                      checked={genderOption === opt}
                      onChange={() => setGenderOption(opt)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      genderOption === opt ? 'border-primary' : 'border-text-muted'
                    }`}>
                      {genderOption === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <span className="text-text-primary">{opt}</span>
                  </label>
                ))}
              </div>
              {genderOption === 'Other' && (
                <input
                  type="text"
                  value={genderOtherText}
                  onChange={(e) => setGenderOtherText(e.target.value)}
                  placeholder="How do you identify?"
                  autoFocus
                  className="w-full mt-3 px-4 py-3 rounded-lg bg-bg-primary ring-1 ring-white/10 text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            {currentIndex > 0 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed || isSubmitting}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
                canProceed && !isSubmitting
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'bg-border text-text-muted cursor-not-allowed'
              }`}
            >
              {isSubmitting
                ? 'Saving...'
                : step === 'demographics'
                  ? 'Get Started'
                  : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({
  label,
  desc,
  selected,
  onClick,
}: {
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/10'
          : 'border-transparent ring-1 ring-white/10 hover:ring-primary/30'
      }`}
    >
      <div className="font-medium text-text-primary">{label}</div>
      <div className="text-sm text-text-secondary mt-0.5">{desc}</div>
    </button>
  );
}
