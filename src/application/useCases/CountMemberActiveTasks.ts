import type { ITasksRepository } from '../../domain/repositories/ITasksRepository';
import type { ITaskAssignmentRepository } from '../../domain/repositories/ITaskAssignmentRepository';
import { isTaskAssignedToMember, isTaskRunning } from '../selectors/taskFilters';

export class CountMemberActiveTasks {
  constructor(
    private readonly tasksRepository: ITasksRepository,
    private readonly assignmentRepository: ITaskAssignmentRepository
  ) {}

  async execute(memberId: string): Promise<number> {
    const [allTasks, taskIds] = await Promise.all([
      this.tasksRepository.getAll(),
      this.assignmentRepository.getTasksByMember(memberId).catch(() => [] as string[]),
    ]);
    const ids = new Set<string>(taskIds || []);
    return allTasks.filter(t => isTaskAssignedToMember(t, memberId, ids) && isTaskRunning(t)).length;
  }
}


