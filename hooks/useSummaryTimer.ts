// ============================================================
// useSummaryTimer — Session timer with pause/reset
// Standalone: no dependencies on other summary hooks
// ============================================================

import { useState, useEffect, useCallback } from 'react';

export function useSummaryTimer(autoStart = true) {
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(autoStart);

  // Tick every second when running
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setSessionElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setSessionElapsed(0);
    setIsTimerRunning(true);
  }, []);

  const formatTime = useCallback((totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }, []);

  return {
    sessionElapsed,
    setSessionElapsed,     // for persistence restore
    isTimerRunning,
    formattedTime: formatTime(sessionElapsed),
    formatTime,            // expose for custom formatting
    toggleTimer,
    resetTimer,
  };
}
