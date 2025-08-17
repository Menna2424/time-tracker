import { useState, useCallback } from 'react';
import type { ITaskAssignmentRepository } from '../../domain/repositories/ITaskAssignmentRepository';

export const useTaskAssignments = (assignmentRepository: ITaskAssignmentRepository) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAssignedMembers = useCallback(async (taskId: string): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);
      return await assignmentRepository.getAssignedMembers(taskId);
    } catch (err) {
      setError('Failed to get assigned members');
      console.error('Error getting assigned members:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [assignmentRepository]);

  const assignMember = useCallback(async (taskId: string, memberId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await assignmentRepository.assignMember(taskId, memberId);
    } catch (err) {
      setError('Failed to assign member');
      console.error('Error assigning member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [assignmentRepository]);

  const unassignMember = useCallback(async (taskId: string, memberId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await assignmentRepository.unassignMember(taskId, memberId);
    } catch (err) {
      setError('Failed to unassign member');
      console.error('Error unassigning member:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [assignmentRepository]);

  const updateTaskAssignments = useCallback(async (taskId: string, memberIds: string[]): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await assignmentRepository.updateTaskAssignments(taskId, memberIds);
    } catch (err) {
      setError('Failed to update task assignments');
      console.error('Error updating task assignments:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [assignmentRepository]);

  const getTasksByMember = useCallback(async (memberId: string): Promise<string[]> => {
    try {
      setLoading(true);
      setError(null);
      return await assignmentRepository.getTasksByMember(memberId);
    } catch (err) {
      setError('Failed to get tasks by member');
      console.error('Error getting tasks by member:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [assignmentRepository]);

  return {
    getAssignedMembers,
    assignMember,
    unassignMember,
    updateTaskAssignments,
    getTasksByMember,
    loading,
    error
  };
};
