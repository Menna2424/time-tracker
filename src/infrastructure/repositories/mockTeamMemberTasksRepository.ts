import type { Task } from '../../domain/types';

export class MockTeamMemberTasksRepository {
  async getTasksByMemberId(_memberId: string): Promise<Task[]> { // eslint-disable-line @typescript-eslint/no-unused-vars
    // Mock implementation - return empty array for now
    return [];
  }

  async getProjects(): Promise<Array<{ id: string; name: string }>> {
    // Mock implementation - return empty array for now
    return [];
  }
}


