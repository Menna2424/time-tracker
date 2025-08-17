import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTasks } from './useTasks';
import type { Task } from '../../domain/entities/Task';

export interface Statistics {
  totalTasks: number;
  completedTasks: number;
  totalTimeSpent: number;
  averageTimePerTask: number;
  tasksByProject: Record<string, number>;
  timeByProject: Record<string, number>;
  totalEarnings: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  tasksCompletedThisMonth: number;
}

export const useStatistics = () => {
  const { tasks } = useTasks();
  const [loading, setLoading] = useState(true);

  // Calculate real-time statistics from actual tasks
  const statistics = useMemo((): Statistics => {
    if (!tasks.length) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalTimeSpent: 0,
        averageTimePerTask: 0,
        tasksByProject: {},
        timeByProject: {},
        totalEarnings: 0,
        dailyEarnings: 0,
        weeklyEarnings: 0,
        monthlyEarnings: 0,
        tasksCompletedToday: 0,
        tasksCompletedThisWeek: 0,
        tasksCompletedThisMonth: 0,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalTimeSpent = 0;
    let totalEarnings = 0;
    let dailyEarnings = 0;
    let weeklyEarnings = 0;
    let monthlyEarnings = 0;
    let completedTasks = 0;
    let tasksCompletedToday = 0;
    let tasksCompletedThisWeek = 0;
    let tasksCompletedThisMonth = 0;

    const tasksByProject: Record<string, number> = {};
    const timeByProject: Record<string, number> = {};

    tasks.forEach((task: Task) => {
      // Calculate displayed totals (persisted + current)
      const displayedTimeSeconds = (task.totalTimeSeconds ?? 0) + (task.currentTimeSeconds ?? 0);
      const displayedEarningsCents = (task.earningsCents ?? 0) + (task.currentCents ?? 0);

      totalTimeSpent += displayedTimeSeconds;
      totalEarnings += displayedEarningsCents;

      // Project aggregations
      if (!tasksByProject[task.projectId]) {
        tasksByProject[task.projectId] = 0;
        timeByProject[task.projectId] = 0;
      }
      tasksByProject[task.projectId]++;
      timeByProject[task.projectId] += displayedTimeSeconds;

      // Status-based counting
      if (task.status === 'completed') {
        completedTasks++;
        
        // Date-based calculations (using updatedAt or createdAt as proxy for completion)
        const taskDate = task.updatedAt || task.createdAt;
        if (taskDate) {
          const taskTime = new Date(taskDate);
          
          if (taskTime >= today) {
            tasksCompletedToday++;
            dailyEarnings += displayedEarningsCents;
          }
          
          if (taskTime >= weekStart) {
            tasksCompletedThisWeek++;
            weeklyEarnings += displayedEarningsCents;
          }
          
          if (taskTime >= monthStart) {
            tasksCompletedThisMonth++;
            monthlyEarnings += displayedEarningsCents;
          }
        }
      }
    });

    return {
      totalTasks: tasks.length,
      completedTasks,
      totalTimeSpent,
      averageTimePerTask: tasks.length > 0 ? totalTimeSpent / tasks.length : 0,
      tasksByProject,
      timeByProject,
      totalEarnings: totalEarnings / 100, // Convert cents to dollars
      dailyEarnings: dailyEarnings / 100,
      weeklyEarnings: weeklyEarnings / 100,
      monthlyEarnings: monthlyEarnings / 100,
      tasksCompletedToday,
      tasksCompletedThisWeek,
      tasksCompletedThisMonth,
    };
  }, [tasks]);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      // Statistics are now calculated in real-time from tasks
      // This function mainly just updates the loading state
      await new Promise(resolve => setTimeout(resolve, 100)); // Minimal delay for UX
    } catch (error) {
      console.error('Failed to load statistics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const calculateEarnings = useCallback((hourlyRate: number): number => {
    const hoursSpent = statistics.totalTimeSpent / 3600; // Convert seconds to hours
    return hoursSpent * hourlyRate;
  }, [statistics.totalTimeSpent]);

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }, []);

  const getEarningsByProject = useCallback((projectId: string): number => {
    // Calculate displayed earnings for project tasks
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    let totalEarningsCents = 0;
    
    projectTasks.forEach(task => {
      totalEarningsCents += (task.earningsCents ?? 0) + (task.currentCents ?? 0);
    });
    
    return totalEarningsCents / 100; // Convert to dollars
  }, [tasks]);

  return {
    statistics,
    loading,
    loadStatistics,
    calculateEarnings,
    formatTime,
    getEarningsByProject,
  };
}; 