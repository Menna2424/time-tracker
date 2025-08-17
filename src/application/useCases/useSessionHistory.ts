import { useState, useCallback } from 'react';
import type { ITimerRepository } from '../../domain/repositories/ITimerRepository';

export interface SessionHistoryRecord {
  id: string;
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number;
  earned: number;
}

export const useSessionHistory = (_timerRepository?: ITimerRepository) => { // eslint-disable-line @typescript-eslint/no-unused-vars
  const [sessionHistory, setSessionHistory] = useState<Map<string, SessionHistoryRecord[]>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessionHistory = useCallback(async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const historyKey = `task_session_history_${taskId}`;
      const existingHistory = localStorage.getItem(historyKey);
      const history: SessionHistoryRecord[] = existingHistory ? JSON.parse(existingHistory) : [];
      
      setSessionHistory(prev => new Map(prev).set(taskId, history));
      return history;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load session history';
      setError(errorMessage);
      console.error('Error loading session history:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionHistory = useCallback((taskId: string): SessionHistoryRecord[] => {
    return sessionHistory.get(taskId) || [];
  }, [sessionHistory]);

  const getTotalEarningsForTask = useCallback((taskId: string): number => {
    const history = getSessionHistory(taskId);
    return history.reduce((total, session) => total + session.earned, 0);
  }, [getSessionHistory]);

  const getTotalTimeForTask = useCallback((taskId: string): number => {
    const history = getSessionHistory(taskId);
    return history.reduce((total, session) => total + session.duration, 0);
  }, [getSessionHistory]);

  return {
    sessionHistory,
    loading,
    error,
    loadSessionHistory,
    getSessionHistory,
    getTotalEarningsForTask,
    getTotalTimeForTask
  };
};

