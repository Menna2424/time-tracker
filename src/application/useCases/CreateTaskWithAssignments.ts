import type { Task } from '../../domain/entities/Task';
import type { ITaskAssignmentRepository } from '../../domain/repositories/ITaskAssignmentRepository';
import type { LocalTasksRepository } from '../../infrastructure/storage/LocalTasksRepository';

export interface CreateTaskWithAssignmentsInput {
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed';
  estimatedMinutes?: number | null;
  assignedMemberIds?: string[];
  projectId: string;
}

export class CreateTaskWithAssignments {
  constructor(
    private taskRepository: LocalTasksRepository,
    private taskAssignmentRepository: ITaskAssignmentRepository
  ) {}

  async execute(input: CreateTaskWithAssignmentsInput): Promise<Task> {
    // Prepare base task data
    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: input.title,
      description: input.description,
      status: input.status,
      projectId: input.projectId,
      timeSpentSec: 0,
      assignedMemberIds: input.assignedMemberIds || [],
      totalTimeSeconds: 0,
      earningsCents: 0,
      currentTimeSeconds: 0,
      currentCents: 0,
    };

    // Add estimated time if provided
    if (input.estimatedMinutes && input.estimatedMinutes > 0) {
      const durationSeconds = Math.floor(input.estimatedMinutes * 60);
      
      taskData.estimatedMinutes = input.estimatedMinutes;
      taskData.countdownRemainingSec = durationSeconds;
      taskData.countdownStartedAt = null;
      
      // Keep legacy countdown for backwards compatibility
      taskData.countdown = {
        initialDuration: durationSeconds,
        remaining: durationSeconds,
        isActive: false,
      };
    }

    // Create the task
    const createdTask = await this.taskRepository.create(taskData);

    // Assign members if provided
    if (input.assignedMemberIds && input.assignedMemberIds.length > 0) {
      await this.taskAssignmentRepository.assignMany(createdTask.id, input.assignedMemberIds);
    }

    return createdTask;
  }
}
