import type { ITaskAssignmentRepository } from '../../domain/repositories/ITaskAssignmentRepository';
import type { TaskAssignment } from '../../domain/entities/TaskAssignment';

const STORAGE_KEY = 'task_assignments';

interface TaskAssignments {
  [taskId: string]: string[]; // taskId -> memberIds[]
}

// Cache for assignments to reduce localStorage reads
let assignmentsCache: TaskAssignments | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5000; // 5 seconds

const getStoredAssignments = (): TaskAssignments => {
  // Return cached data if it's still valid
  const now = Date.now();
  if (assignmentsCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return assignmentsCache;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate the parsed data
      if (parsed && typeof parsed === 'object') {
        assignmentsCache = parsed;
        cacheTimestamp = now;
        return parsed;
      }
    }
  } catch (error) {
    console.error('Error reading task assignments from storage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (clearError) {
      console.error('Error clearing corrupted task assignments:', clearError);
    }
  }
  
  // Return empty object if no valid data found
  assignmentsCache = {};
  cacheTimestamp = now;
  return {};
};

const saveAssignments = (assignments: TaskAssignments): void => {
  try {
    // Validate assignments before saving
    if (!assignments || typeof assignments !== 'object') {
      console.error('Invalid assignments data:', assignments);
      return;
    }

    // Update cache
    assignmentsCache = assignments;
    cacheTimestamp = Date.now();
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    console.error('Error saving task assignments to storage:', error);
    // Clear cache on error
    assignmentsCache = null;
  }
};

export class MockTaskAssignmentRepository implements ITaskAssignmentRepository {
  async getAssignedMembers(taskId: string): Promise<string[]> {
    try {
      const assignments = getStoredAssignments();
      const memberIds = assignments[taskId] || [];
      
      // Validate member IDs
      if (Array.isArray(memberIds)) {
        return memberIds.filter(id => typeof id === 'string' && id.length > 0);
      }
      
      return [];
    } catch (error) {
      console.error(`Error getting assigned members for task ${taskId}:`, error);
      return [];
    }
  }

  async assignMember(taskId: string, memberId: string): Promise<void> {
    try {
      if (!taskId || !memberId) {
        throw new Error('Invalid taskId or memberId');
      }

      const assignments = getStoredAssignments();
      const currentAssignments = assignments[taskId] || [];
      
      if (!currentAssignments.includes(memberId)) {
        assignments[taskId] = [...currentAssignments, memberId];
        saveAssignments(assignments);
      }
    } catch (error) {
      console.error(`Error assigning member ${memberId} to task ${taskId}:`, error);
      throw error;
    }
  }

  async unassignMember(taskId: string, memberId: string): Promise<void> {
    try {
      if (!taskId || !memberId) {
        throw new Error('Invalid taskId or memberId');
      }

      const assignments = getStoredAssignments();
      const currentAssignments = assignments[taskId] || [];
      
      assignments[taskId] = currentAssignments.filter(id => id !== memberId);
      saveAssignments(assignments);
    } catch (error) {
      console.error(`Error unassigning member ${memberId} from task ${taskId}:`, error);
      throw error;
    }
  }

  async getTasksByMember(memberId: string): Promise<string[]> {
    try {
      if (!memberId) {
        return [];
      }

      const assignments = getStoredAssignments();
      const taskIds: string[] = [];
      
      Object.entries(assignments).forEach(([taskId, memberIds]) => {
        if (Array.isArray(memberIds) && memberIds.includes(memberId)) {
          taskIds.push(taskId);
        }
      });
      
      return taskIds;
    } catch (error) {
      console.error(`Error getting tasks for member ${memberId}:`, error);
      return [];
    }
  }

  async updateTaskAssignments(taskId: string, memberIds: string[]): Promise<void> {
    try {
      if (!taskId) {
        throw new Error('Invalid taskId');
      }

      // Validate memberIds array
      const validMemberIds = Array.isArray(memberIds) 
        ? memberIds.filter(id => typeof id === 'string' && id.length > 0)
        : [];

      const assignments = getStoredAssignments();
      assignments[taskId] = validMemberIds;
      saveAssignments(assignments);
    } catch (error) {
      console.error(`Error updating task assignments for task ${taskId}:`, error);
      throw error;
    }
  }

  // Additional methods for new functionality - stub implementations 
  async assignMany(taskId: string, memberIds: string[]): Promise<void> {
    return this.updateTaskAssignments(taskId, memberIds);
  }

  async listByTask(): Promise<TaskAssignment[]> {
    // This mock repository doesn't store TaskAssignment entities, only simple mappings
    // Return empty array as this method is not used by the existing mock system
    return [];
  }

  async unassign(taskId: string, memberId: string): Promise<void> {
    return this.unassignMember(taskId, memberId);
  }

  async unassignAll(taskId: string): Promise<void> {
    const assignments = getStoredAssignments();
    delete assignments[taskId];
    saveAssignments(assignments);
  }

  async getAll(): Promise<TaskAssignment[]> {
    // This mock repository doesn't store TaskAssignment entities, only simple mappings
    // Return empty array as this method is not used by the existing mock system
    return [];
  }
}
