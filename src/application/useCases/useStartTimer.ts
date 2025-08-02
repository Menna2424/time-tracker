import { useState, useEffect, useRef } from 'react';
import type { TimerSession } from '../../domain/types';

import { useNotification } from '../../infrastructure/notifications/useNotification';

const DEFAULT_DURATION = 25 * 60; // 25 minutes

export const useStartTimer = () => {
  const [session, setSession] = useState<TimerSession | null>(null);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [penalty, setPenalty] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notify = useNotification();

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev > 0) return prev - 1;
        setPenalty(p => p + 1);
        return 0;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isRunning]);

  useEffect(() => {
    if (remaining === 0 && isRunning) {
      notify('Session Complete', 'Your timer session has ended!');
      setIsRunning(false);
      setSession(s => s && { ...s, status: 'completed', endTime: new Date(), penaltySeconds: penalty });
    }
  }, [remaining, isRunning, notify, penalty]);

  const start = () => {
    setSession({
      id: Date.now().toString(),
      duration: DEFAULT_DURATION,
      startTime: new Date(),
      status: 'running',
    });
    setRemaining(DEFAULT_DURATION);
    setPenalty(0);
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    setSession(s => s && { ...s, status: 'completed', endTime: new Date(), penaltySeconds: penalty });
  };

  return {
    session,
    remaining,
    penalty,
    isRunning,
    start,
    stop,
  };
}; 