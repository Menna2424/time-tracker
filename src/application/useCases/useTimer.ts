import { useState, useEffect, useCallback } from 'react';
import type { Timer } from '../../domain/types';

export const useTimer = () => {
  const [currentTimer, setCurrentTimer] = useState<Timer | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && currentTimer) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, currentTimer]);

  const startTimer = useCallback((projectId?: string, description?: string) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      projectId,
      description: description || '',
      startTime: new Date(),
      isRunning: true,
    };

    setCurrentTimer(newTimer);
    setIsRunning(true);
    setElapsedTime(0);
  }, []);

  const stopTimer = useCallback(() => {
    if (currentTimer) {
      const updatedTimer: Timer = {
        ...currentTimer,
        endTime: new Date(),
        duration: elapsedTime,
        isRunning: false,
      };

      // Save timer to localStorage (would typically go to infrastructure layer)
      const savedTimers = localStorage.getItem('timers');
      const timers = savedTimers ? JSON.parse(savedTimers) : [];
      timers.push(updatedTimer);
      localStorage.setItem('timers', JSON.stringify(timers));

      setCurrentTimer(null);
      setIsRunning(false);
      setElapsedTime(0);
    }
  }, [currentTimer, elapsedTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resumeTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const resetTimer = useCallback(() => {
    setCurrentTimer(null);
    setIsRunning(false);
    setElapsedTime(0);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    currentTimer,
    isRunning,
    elapsedTime,
    startTimer,
    stopTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    formatTime,
  };
}; 