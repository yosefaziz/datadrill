import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { UserRole, UserGoal, WeakestSkill } from '@/types';

type Step = 'role' | 'goal' | 'weakness';

const STEPS: Step[] = ['role', 'goal', 'weakness'];

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
  { value: 'pyspark', label: 'PySpark', desc: 'DataFrame transformations and distributed processing' },
  { value: 'architecture', label: 'Architecture', desc: 'System design and technology choices' },
  { value: 'modeling', label: 'Modeling', desc: 'Schema design and data modeling' },
];

export function OnboardingModal() {
  const { completeOnboarding } = useAuthStore();
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [goal, setGoal] = useState<UserGoal | null>(null);
  const [weakness, setWeakness] = useState<WeakestSkill | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentIndex = STEPS.indexOf(step);

  const handleNext = async () => {
    if (step === 'role' && role) {
      setStep('goal');
    } else if (step === 'goal' && goal) {
      setStep('weakness');
    } else if (step === 'weakness' && weakness && role && goal) {
      setIsSubmitting(true);
      try {
        await completeOnboarding({ role, primary_goal: goal, weakest_skill: weakness });
      } catch (err) {
        console.error('Onboarding error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 'goal') setStep('role');
    else if (step === 'weakness') setStep('goal');
  };

  const canProceed =
    (step === 'role' && role !== null) ||
    (step === 'goal' && goal !== null) ||
    (step === 'weakness' && weakness !== null);

  return (
    <div className="fixed inset-0 bg-bg-primary/95 flex items-center justify-center z-50">
      <div className="w-full max-w-lg mx-4">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                i <= currentIndex ? 'bg-primary w-12' : 'bg-border w-8'
              }`}
            />
          ))}
        </div>

        <div className="bg-surface rounded-xl shadow-2xl ring-1 ring-white/10 p-8">
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
                : step === 'weakness'
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
