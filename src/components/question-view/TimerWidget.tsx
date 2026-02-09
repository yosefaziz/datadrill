import { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { useAuthGate } from '@/hooks/useAuthGate';

type TimerMode = 'stopwatch' | 'countdown';

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(Math.abs(totalSeconds) / 60);
  const secs = Math.abs(totalSeconds) % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const PRESETS = [15, 30, 45, 60];

export function TimerWidget() {
  const { requireAuth } = useAuthGate();
  const [isVisible, setIsVisible] = useState(false);
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState(30 * 60); // default 30 min
  const [customMinutes, setCustomMinutes] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCountdownDone = mode === 'countdown' && seconds >= countdownTarget;
  const displaySeconds = mode === 'stopwatch' ? seconds : Math.max(countdownTarget - seconds, 0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && !isCountdownDone) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, isCountdownDone, clearTimer]);

  // Auto-stop countdown at 0
  useEffect(() => {
    if (isCountdownDone && isRunning) {
      setIsRunning(false);
    }
  }, [isCountdownDone, isRunning]);

  const handleToggleVisibility = () => {
    if (!requireAuth()) return;
    setIsVisible(!isVisible);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    clearTimer();
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    setMode(newMode);
    handleReset();
  };

  const handlePreset = (minutes: number) => {
    setCountdownTarget(minutes * 60);
    handleReset();
  };

  const handleCustomMinutes = () => {
    const mins = parseInt(customMinutes, 10);
    if (mins > 0 && mins <= 180) {
      setCountdownTarget(mins * 60);
      handleReset();
      setCustomMinutes('');
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleToggleVisibility}
        title="Timer"
        className={`p-1.5 rounded-lg transition-colors ${
          isRunning
            ? 'text-primary'
            : 'text-text-muted hover:text-text-secondary hover:bg-bg-secondary'
        }`}
      >
        <Clock className="w-4 h-4" />
      </button>

      {isVisible && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 bg-surface rounded-lg shadow-xl ring-1 ring-white/10 p-4">
          {/* Mode toggle */}
          <div className="flex rounded-lg bg-bg-secondary p-0.5 mb-3">
            <button
              onClick={() => handleModeSwitch('stopwatch')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'stopwatch'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Stopwatch
            </button>
            <button
              onClick={() => handleModeSwitch('countdown')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                mode === 'countdown'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              Countdown
            </button>
          </div>

          {/* Display */}
          <div
            className={`text-center text-3xl font-mono font-bold mb-3 ${
              isCountdownDone ? 'text-error animate-pulse' : 'text-text-primary'
            }`}
          >
            {formatTime(displaySeconds)}
          </div>

          {/* Countdown presets */}
          {mode === 'countdown' && !isRunning && seconds === 0 && (
            <div className="mb-3">
              <div className="flex gap-1.5 mb-2">
                {PRESETS.map((m) => (
                  <button
                    key={m}
                    onClick={() => handlePreset(m)}
                    className={`flex-1 py-1 text-xs rounded transition-colors ${
                      countdownTarget === m * 60
                        ? 'bg-primary text-white'
                        : 'bg-bg-secondary text-text-muted hover:text-text-secondary'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="Custom min"
                  min={1}
                  max={180}
                  className="flex-1 bg-bg-secondary text-text-primary text-xs rounded px-2 py-1 border border-border-color focus:outline-none focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomMinutes()}
                />
                <button
                  onClick={handleCustomMinutes}
                  disabled={!customMinutes}
                  className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  Set
                </button>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              disabled={isCountdownDone}
              className="p-2 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-bg-secondary text-text-muted hover:text-text-secondary transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
