import type { Task } from '../entities/Task';

export interface ITasksRepository {
  getById(id: string): Promise<Task | null>;
  getAll(): Promise<Task[]>;
  save(task: Task): Promise<void>;
  applyStop(taskId: string, deltaSeconds: number, deltaCents: number): Promise<Task>; // atomically add to totals & zero current*
  updateTaskAssignments(taskId: string, memberIds: string[]): Promise<Task>;
}