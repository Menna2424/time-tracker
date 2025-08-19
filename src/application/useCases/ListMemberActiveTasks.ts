import type { ITasksRepository } from '../../domain/repositories/ITasksRepository';
import type { ITaskAssignmentRepository } from '../../domain/repositories/ITaskAssignmentRepository';
import type { Task } from '../../domain/entities/Task';
import { isTaskRunning } from '../selectors/taskFilters';

export class ListMemberActiveTasks {
  constructor(
    private readonly tasksRepository: ITasksRepository,
    private readonly assignmentRepository: ITaskAssignmentRepository
  ) {}

  async execute(memberId: string): Promise<Task[]> {
    const [allTasks, taskIdsByMember] = await Promise.all([
      this.tasksRepository.getAll(),
      this.assignmentRepository.getTasksByMember(memberId).catch(() => [] as string[]),
    ]);

    const assignedTaskIdSet = new Set<string>(taskIdsByMember || []);

    const isAssignedToMember = (task: Task): boolean => {
      if (assignedTaskIdSet.size > 0) {
        return assignedTaskIdSet.has(task.id);
      }
      const assigned = task.assignedMemberIds || [];
      return assigned.includes(memberId);
    };

    return allTasks.filter(t => isAssignedToMember(t) && isTaskRunning(t));
  }
}


