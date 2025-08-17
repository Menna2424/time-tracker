import React, { useState, useEffect } from 'react';
import { X, Users, Check, UserPlus } from 'lucide-react';
import type { TeamMember } from '../../../domain/entities/TeamMember';
import type { Task } from '../../../domain/entities/Task';

interface AssignMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  teamMembers: TeamMember[];
  assignedMemberIds: string[];
  onAssignMembers: (taskId: string, memberIds: string[]) => Promise<void>;
  loading?: boolean;
}

export const AssignMembersModal: React.FC<AssignMembersModalProps> = ({
  isOpen,
  onClose,
  task,
  teamMembers,
  assignedMemberIds,
  onAssignMembers,
  loading = false
}) => {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && assignedMemberIds) {
      setSelectedMemberIds([...assignedMemberIds]);
    }
  }, [isOpen, assignedMemberIds]);

  const handleMemberToggle = (memberId: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSave = async () => {
    if (!task) return;
    
    try {
      setSaving(true);
      await onAssignMembers(task.id, selectedMemberIds);
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedMemberIds([]);
    onClose();
  };

  if (!isOpen || !task) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh', overflow: 'auto' }}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assign Members
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Task: {task.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select team members to assign to this task
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading members...</span>
            </div>
          ) : teamMembers.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {teamMembers.map((member) => {
                const isSelected = selectedMemberIds.includes(member.id);
                return (
                  <div
                    key={member.id}
                    className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
                        : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    onClick={() => handleMemberToggle(member.id)}
                  >
                    <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 mr-3">
                      {isSelected ? (
                        <Check className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {member.email}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${member.hourlyRate}/hr
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No team members available
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Assignments'}
          </button>
        </div>
      </div>
    </div>
  );
};
