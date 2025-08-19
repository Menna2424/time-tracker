import type { ITasksRepository } from '../../domain/repositories/ITasksRepository';
import type { Task } from '../../domain/entities/Task';
import { TaskMapper } from '../adapters/taskMapper';
import { eventBus } from '../events/EventBus';

const TASKS_KEY = 'tt.tasks';

// Default tasks with unified schema
const DEFAULT_TASKS = [
  {
    id: '1',
    projectId: '1',
    title: 'Setup project structure',
    description: 'Initialize React project with TypeScript and configure build tools',
    totalTimeSeconds: 7200, // 2 hours
    earningsCents: 4000, // $40.00 for 2 hours at $20/hour
    currentTimeSeconds: 0,
    currentCents: 0,
    hourlyRateCents: 2000, // $20/hour
    status: 'completed',
    assignedMemberIds: [], // Initialize with empty array
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2',
    projectId: '1',
    title: 'Implement authentication',
    description: 'Create login/register functionality with JWT tokens',
    totalTimeSeconds: 5400, // 1.5 hours
    earningsCents: 3000, // $30.00 for 1.5 hours at $20/hour
    currentTimeSeconds: 0,
    currentCents: 0,
    hourlyRateCents: 2000, // $20/hour
    status: 'active',
    assignedMemberIds: [], // Initialize with empty array
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-03').toISOString(),
  },
  {
    id: '3',
    projectId: '1',
    title: 'Product catalog design',
    description: 'Design and implement product listing and detail pages',
    totalTimeSeconds: 0,
    earningsCents: 0,
    currentTimeSeconds: 0,
    currentCents: 0,
    hourlyRateCents: 2000, // $20/hour
    status: 'pending',
    assignedMemberIds: [], // Initialize with empty array
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-05').toISOString(),
  },
];

function readTasks(): Task[] {
  try {
    const stored = localStorage.getItem(TASKS_KEY);
    if (!stored) {
      // Initialize with default tasks
      const defaultTasks = DEFAULT_TASKS.map(TaskMapper.fromStorage);
      writeTasks(defaultTasks);
      return defaultTasks;
    }
    
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

  async getByProjectId(projectId: string): Promise<Task[]> {
    const tasks = readTasks();
    return tasks.filter(t => t.projectId === projectId);
  }

  async save(task: Task): Promise<void> {
    console.debug('[TASKS_REPO] saving task:', task);
    const tasks = readTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    
    const taskWithTimestamp = {
      ...task,
      updatedAt: new Date(),
    };
    
    if (index >= 0) {
      tasks[index] = taskWithTimestamp;
    } else {
      tasks.push({
        ...taskWithTimestamp,
        createdAt: new Date(),
      });
    }
    
    writeTasks(tasks);
  }

  async create(taskData: Omit<Task, 'id'>): Promise<Task> {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      totalTimeSeconds: 0,
      earningsCents: 0,
      currentTimeSeconds: 0,
      currentCents: 0,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.save(newTask);
    return newTask;
  }

  async update(id: string, taskData: Partial<Task>): Promise<Task> {
    const task = await this.getById(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updatedTask = {
      ...task,
      ...taskData,
      updatedAt: new Date(),
    };

    await this.save(updatedTask);
    return updatedTask;
  }

  async delete(id: string): Promise<void> {
    const tasks = readTasks();
    const index = tasks.findIndex(t => t.id === id);
    
    if (index < 0) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    tasks.splice(index, 1);
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
    
    // Atomically add deltas to totals AND zero current*, clear currentStartAt
    const updatedTask: Task = {
      ...task,
      totalTimeSeconds: task.totalTimeSeconds + deltaSeconds,
      earningsCents: task.earningsCents + deltaCents,
      currentTimeSeconds: 0,
      currentCents: 0,
      currentStartAt: undefined,
      updatedAt: new Date(),
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
      updatedAt: new Date(),
    };
    
    tasks[index] = updatedTask;
    writeTasks(tasks);
    
    console.debug('[TASKS_REPO] updated task assignments successfully:', updatedTask);
    return updatedTask;
  }
}
