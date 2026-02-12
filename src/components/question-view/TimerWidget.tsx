import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, Hourglass } from 'lucide-react';

type TimerMode = 'stopwatch' | 'countdown';

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(Math.abs(totalSeconds) / 60);
  const secs = Math.abs(totalSeconds) % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function TimerWidget() {
  const [mode, setMode] = useState<TimerMode>('stopwatch');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [countdownTarget, setCountdownTarget] = useState(30 * 60);
  const [inputMins, setInputMins] = useState('30');
  const [inputSecs, setInputSecs] = useState('00');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCountdownDone = mode === 'countdown' && seconds >= countdownTarget;
  const displaySeconds = mode === 'stopwatch' ? seconds : Math.max(countdownTarget - seconds, 0);
  const showInput = mode === 'countdown' && !isRunning && seconds === 0;

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

  useEffect(() => {
    if (isCountdownDone && isRunning) {
      setIsRunning(false);
    }
  }, [isCountdownDone, isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
    clearTimer();
  };

  const handleModeSwitch = (newMode: TimerMode) => {
    setMode(newMode);
    handleReset();
  };

  const handlePlayPause = () => {
    if (mode === 'countdown' && !isRunning && seconds === 0) {
      const totalSecs = parseInt(inputMins || '0', 10) * 60 + parseInt(inputSecs || '0', 10);
      if (totalSecs <= 0) return;
      setCountdownTarget(totalSecs);
    }
    setIsRunning(!isRunning);
  };

  const handleMinsChange = (value: string) => {
    if (/^\d{0,3}$/.test(value)) {
      setInputMins(value);
    }
  };

  const handleSecsChange = (value: string) => {
    if (/^\d{0,2}$/.test(value)) {
      const num = parseInt(value || '0', 10);
      if (num <= 59) setInputSecs(value);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Mode toggle */}
      <div className="flex rounded-md bg-bg-secondary p-0.5">
        <button
          onClick={() => handleModeSwitch('stopwatch')}
          className={`p-1 rounded transition-colors ${
            mode === 'stopwatch'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          title="Stopwatch"
        >
          <Timer className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleModeSwitch('countdown')}
          className={`p-1 rounded transition-colors ${
            mode === 'countdown'
              ? 'bg-primary text-white'
              : 'text-text-muted hover:text-text-secondary'
          }`}
          title="Countdown"
        >
          <Hourglass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Time display or countdown input */}
      {showInput ? (
        <div className="flex items-center">
          <input
            type="text"
            inputMode="numeric"
            value={inputMins}
            onChange={(e) => handleMinsChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePlayPause()}
            className="w-7 text-center bg-bg-secondary rounded px-0.5 py-0.5 border border-border-color focus:outline-none focus:border-primary text-sm font-mono text-text-primary"
            placeholder="mm"
          />
          <span className="mx-0.5 text-text-muted text-sm">:</span>
          <input
            type="text"
            inputMode="numeric"
            value={inputSecs}
            onChange={(e) => handleSecsChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePlayPause()}
            className="w-7 text-center bg-bg-secondary rounded px-0.5 py-0.5 border border-border-color focus:outline-none focus:border-primary text-sm font-mono text-text-primary"
            placeholder="ss"
          />
        </div>
      ) : (
        <span
          className={`font-mono text-sm tabular-nums ${
            isCountdownDone ? 'text-error animate-pulse' : 'text-text-primary'
          }`}
        >
          {formatTime(displaySeconds)}
        </span>
      )}

      {/* Play/Pause */}
      <button
        onClick={handlePlayPause}
        disabled={isCountdownDone}
        className="p-1 rounded-md text-text-muted hover:text-primary transition-colors disabled:opacity-50"
        title={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
      </button>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="p-1 rounded-md text-text-muted hover:text-text-secondary transition-colors"
        title="Reset"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
