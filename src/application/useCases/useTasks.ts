import { useState, useEffect, useCallback, useMemo } from 'react';
import { LocalTasksRepository } from '../../infrastructure/storage/LocalTasksRepository';
import { makeAssignMembersToTask } from './assignMembersToTask';
import type { Task } from '../../domain/entities/Task';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const taskRepository = useMemo(() => new LocalTasksRepository(), []);
  const assignMembersToTask = useMemo(() => makeAssignMembersToTask(taskRepository), [taskRepository]);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const loadedTasks = await taskRepository.getAll();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [taskRepository]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTask = await taskRepository.create(taskData);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await taskRepository.update(id, updates);
      setTasks(prev => prev.map(task => task.id === id ? updatedTask : task));
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskRepository.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const updateTaskTimeSpent = async (taskId: string, timeSpent: number) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const updatedTask = await taskRepository.update(taskId, {
          ...task,
          totalTimeSeconds: (task.totalTimeSeconds || 0) + timeSpent
        });
        setTasks(prev => prev.map(t => t.id === taskId ? updatedTask : t));
      }
    } catch (error) {
      console.error('Failed to update task time spent:', error);
      throw error;
    }
  };

  const assignMembers = async (taskId: string, memberIds: string[]) => {
    try {
      // optimistic update
      setTasks(prev =>
        prev.map(t => t.id === taskId ? { ...t, assignedMemberIds: memberIds } : t)
      );
      
      const updatedTask = await assignMembersToTask(taskId, memberIds);
      
      // ensure state matches what's persisted
      setTasks(prev =>
        prev.map(t => t.id === updatedTask.id ? updatedTask : t)
      );
      
      return updatedTask;
    } catch (error) {
      // rollback if needed
      await loadTasks(); // refresh from storage
      console.error('Failed to assign members to task:', error);
      throw error;
    }
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    loadTasks,
    refreshTasks: loadTasks, // Expose loadTasks as refreshTasks for external calls
    updateTaskTimeSpent,
    assignMembers
  };
}; 