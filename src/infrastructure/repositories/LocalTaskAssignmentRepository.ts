import type { TaskAssignment } from '../../domain/entities/TaskAssignment';
import type { ITaskAssignmentRepository } from '../../domain/repositories/ITaskAssignmentRepository';

const STORAGE_KEY = 'tt.assignments';

export class LocalTaskAssignmentRepository implements ITaskAssignmentRepository {
  private getStoredAssignments(): TaskAssignment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert assignedAt strings back to Date objects
        return parsed.map((assignment: Record<string, unknown>) => ({
          ...assignment,
          assignedAt: new Date(assignment.assignedAt as string)
        }));
      }
    } catch (error) {
      console.error('Error reading task assignments from storage:', error);
    }
    return [];
  }

  private saveAssignments(assignments: TaskAssignment[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (error) {
      console.error('Error saving task assignments to storage:', error);
      throw error;
    }
  }

  private generateId(): string {
    return `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Existing interface implementation for compatibility
  async getAssignedMembers(taskId: string): Promise<string[]> {
    const assignments = this.getStoredAssignments();
    return assignments
      .filter(assignment => assignment.taskId === taskId)
      .map(assignment => assignment.memberId);
  }

  async assignMember(taskId: string, memberId: string): Promise<void> {
    const assignments = this.getStoredAssignments();
    
    // Check if assignment already exists
    const exists = assignments.some(a => a.taskId === taskId && a.memberId === memberId);
    if (!exists) {
      const newAssignment: TaskAssignment = {
        id: this.generateId(),
        taskId,
        memberId,
        assignedAt: new Date()
      };
      this.saveAssignments([...assignments, newAssignment]);
    }
  }

  async unassignMember(taskId: string, memberId: string): Promise<void> {
    const assignments = this.getStoredAssignments();
    const filteredAssignments = assignments.filter(
      assignment => !(assignment.taskId === taskId && assignment.memberId === memberId)
    );
    this.saveAssignments(filteredAssignments);
  }

  async updateTaskAssignments(taskId: string, memberIds: string[]): Promise<void> {
    await this.assignMany(taskId, memberIds);
  }

  async getTasksByMember(memberId: string): Promise<string[]> {
    const assignments = this.getStoredAssignments();
    return assignments
      .filter(assignment => assignment.memberId === memberId)
      .map(assignment => assignment.taskId);
  }

  // New methods for enhanced functionality
  async assignMany(taskId: string, memberIds: string[]): Promise<void> {
    console.log('TaskAssignmentRepository.assignMany called with:', { taskId, memberIds });
    const assignments = this.getStoredAssignments();
    
    // Remove existing assignments for this task to avoid duplicates
    const filteredAssignments = assignments.filter(a => a.taskId !== taskId);
    
    // Create new assignments
    const newAssignments = memberIds.map(memberId => ({
      id: this.generateId(),
      taskId,
      memberId,
      assignedAt: new Date()
    }));
    
    console.log('Saving assignments:', [...filteredAssignments, ...newAssignments]);
    
    // Save updated assignments
    this.saveAssignments([...filteredAssignments, ...newAssignments]);
  }

  async listByTask(taskId: string): Promise<TaskAssignment[]> {
    const assignments = this.getStoredAssignments();
    return assignments.filter(assignment => assignment.taskId === taskId);
  }

  async unassign(taskId: string, memberId: string): Promise<void> {
    return this.unassignMember(taskId, memberId);
  }

  async unassignAll(taskId: string): Promise<void> {
    const assignments = this.getStoredAssignments();
    const filteredAssignments = assignments.filter(assignment => assignment.taskId !== taskId);
    this.saveAssignments(filteredAssignments);
  }

  async getAll(): Promise<TaskAssignment[]> {
    return this.getStoredAssignments();
  }
}
