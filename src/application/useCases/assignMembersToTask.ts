import type { ITasksRepository } from '../../domain/repositories/ITasksRepository';
import type { Task } from '../../domain/entities/Task';

export const makeAssignMembersToTask = (taskRepository: ITasksRepository) => {
  return async (taskId: string, memberIds: string[]): Promise<Task> => {
    // Optional: validate memberIds exist in TeamRepository
    // For now, we'll just update the task with the provided member IDs
    const updatedTask = await taskRepository.updateTaskAssignments(taskId, memberIds);
    return updatedTask;
  };
};
