import { useState, useEffect } from 'react';
import type { TimerSession } from '../../domain/entities/TimerSession';

import { useNotification } from '../../infrastructure/notifications/useNotification';

const DEFAULT_DURATION = 25 * 60; // 25 minutes

export const useStartTimer = () => {
  const [session, setSession] = useState<TimerSession | null>(null);
  const [remaining, setRemaining] = useState(DEFAULT_DURATION);
  const [penalty, setPenalty] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  // Removed intervalRef since we removed the interval
  const notify = useNotification();

  // Note: Removed the interval here since this is a legacy timer hook.
  // The unified timer system (useGlobalTimerTick) handles all timing.

  useEffect(() => {
    if (remaining === 0 && isRunning) {
      notify('Session Complete', 'Your timer session has ended!');
      setIsRunning(false);
      setSession(s => s && { 
        ...s, 
        endedAt: Date.now(),
        elapsedSeconds: DEFAULT_DURATION + penalty
      });
    }
  }, [remaining, isRunning, notify, penalty]);

  const start = () => {
    setSession({
      id: Date.now().toString(),
      taskId: 'default-task',
      projectId: 'default-project',
      memberId: 'default-user',
      mode: 'countdown',
      targetSeconds: DEFAULT_DURATION,
      startedAt: Date.now(),
    });
    setRemaining(DEFAULT_DURATION);
    setPenalty(0);
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
    setSession(s => s && { 
      ...s, 
      endedAt: Date.now(),
      elapsedSeconds: DEFAULT_DURATION - remaining + penalty
    });
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