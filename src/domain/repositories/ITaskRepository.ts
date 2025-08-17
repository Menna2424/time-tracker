import type { Task } from '../types';

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  getByProjectId(projectId: string): Promise<Task[]>;
  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;
  update(id: string, task: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  updateTimeSpent(id: string, additionalTime: number): Promise<Task>;
  updateEarnings(id: string, earnings: number): Promise<Task>;
  updateCurrentEarnings(id: string, currentEarnings: number): Promise<Task>;
  updateTimeAndEarnings(id: string, additionalTime: number, earnings: number): Promise<Task>;
  startTaskSession(id: string): Promise<Task>;
  stopTaskSession(id: string, sessionEarnings: number): Promise<Task>;
  updateSessionEarnings(id: string, currentSessionEarnings: number): Promise<Task>;
}























