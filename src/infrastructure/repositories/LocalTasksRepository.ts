import type { ITasksRepository } from '../../domain/repositories/ITasksRepository';
import type { Task } from '../../domain/entities/Task';
import { TaskMapper } from '../adapters/taskMapper';
import { eventBus } from '../events/EventBus';

const TASKS_KEY = 'tt.tasks';

function readTasks(): Task[] {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    if (!stored) return [];
    
    const rawTasks = JSON.parse(stored);
    return rawTasks.map(TaskMapper.fromStorage);
  } catch (error) {
    console.error('[TASKS_REPO] Error reading tasks:', error);
    return [];
  }
}

function writeTasks(tasks: Task[]) {
  try {
    const serialized = tasks.map(TaskMapper.toStorage);
    console.debug('[TASKS_REPO] writing tasks:', serialized);
    localStorage.setItem(TASKS_KEY, JSON.stringify(serialized));
    eventBus.emit('tasks:changed');
  } catch (error) {
    console.error('[TASKS_REPO] Error writing tasks:', error);
    throw error;
  }
}

export class LocalTasksRepository implements ITasksRepository {
  async getById(id: string): Promise<Task | null> {
    const tasks = readTasks();
    return tasks.find(t => t.id === id) || null;
  }

  async getAll(): Promise<Task[]> {
    return readTasks();
  }

  async save(task: Task): Promise<void> {
    console.debug('[TASKS_REPO] saving task:', task);
    const tasks = readTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    
    if (index >= 0) {
      tasks[index] = task;
    } else {
      tasks.push(task);
    }
    
    writeTasks(tasks);
  }

  async applyStop(taskId: string, deltaSeconds: number, deltaCents: number): Promise<Task> {
    console.debug('[TASKS_REPO] applying stop:', taskId, 'deltaSeconds:', deltaSeconds, 'deltaCents:', deltaCents);
    
    const tasks = readTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index < 0) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    const task = tasks[index];
    
    // Atomically add deltas to totals AND zero current*, clear currentStartAt and countdown state
    const updatedTask: Task = {
      ...task,
      totalTimeSeconds: task.totalTimeSeconds + deltaSeconds,
      earningsCents: task.earningsCents + deltaCents,
      currentTimeSeconds: 0,
      currentCents: 0,
      currentStartAt: undefined,
      isRunning: false,
      // Clear countdown state when stopping
      countdownRemainingSec: undefined,
      countdownStartedAt: undefined,
    };
    
    tasks[index] = updatedTask;
    writeTasks(tasks);
    
    console.debug('[TASKS_REPO] applied stop successfully:', updatedTask);
    return updatedTask;
  }

  async updateTaskAssignments(taskId: string, memberIds: string[]): Promise<Task> {
    console.debug('[TASKS_REPO] updating task assignments:', taskId, 'memberIds:', memberIds);
    
    const tasks = readTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    
    if (index < 0) {
      throw new Error(`Task with id ${taskId} not found`);
    }
    
    const task = tasks[index];
    
    // Update assignments with unique member IDs
    const updatedTask: Task = {
      ...task,
      assignedMemberIds: [...new Set(memberIds)],
    };
    
    tasks[index] = updatedTask;
    writeTasks(tasks);
    
    console.debug('[TASKS_REPO] updated task assignments successfully:', updatedTask);
    return updatedTask;
  }
}