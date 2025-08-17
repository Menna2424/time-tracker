import type { TaskAssignment } from '../entities/TaskAssignment';

export interface ITaskAssignmentRepository {
  // Existing interface methods for compatibility
  getAssignedMembers(taskId: string): Promise<string[]>;
  assignMember(taskId: string, memberId: string): Promise<void>;
  unassignMember(taskId: string, memberId: string): Promise<void>;
  updateTaskAssignments(taskId: string, memberIds: string[]): Promise<void>;
  getTasksByMember(memberId: string): Promise<string[]>;
  
  // Additional methods for new functionality
  assignMany(taskId: string, memberIds: string[]): Promise<void>;
  listByTask(taskId: string): Promise<TaskAssignment[]>;
  unassign(taskId: string, memberId: string): Promise<void>;
  unassignAll(taskId: string): Promise<void>;
  getAll(): Promise<TaskAssignment[]>;
}