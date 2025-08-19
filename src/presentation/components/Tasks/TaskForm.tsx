import React, { useState, useEffect } from 'react';
import { X, Save, Clock, Users, Search } from 'lucide-react';
import type { Task } from '../../../domain/entities/Task';
import type { TeamMember } from '../../../domain/entities/TeamMember';
import { useAuthContext } from '../../../shared/context/AuthContext';

interface TaskFormProps {
  task?: Task | null;
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Omit<Task, 'id'>, assignedMemberIds?: string[]) => Promise<void>;
  teamMembers?: TeamMember[];
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  projectId,
  isOpen,
  onClose,
  onSubmit,
  teamMembers = []
}) => {
  const { isAdmin } = useAuthContext();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending' as Task['status'],
    totalTimeSeconds: 0,
    estimatedMinutes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        totalTimeSeconds: task.totalTimeSeconds,
        estimatedMinutes: task.estimatedMinutes ? task.estimatedMinutes.toString() : 
                         task.countdown ? (task.countdown.initialDuration / 60).toString() : '',
      });
      // Ensure we properly load the assigned member IDs from the task
      setSelectedMemberIds(task.assignedMemberIds || []);
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        totalTimeSeconds: 0,
        estimatedMinutes: '',
      });
      setSelectedMemberIds([]);
    }
    setMemberSearchTerm('');
    setShowMemberDropdown(false);
  }, [task?.id, isOpen]); // Use task?.id to ensure reset when switching tasks

  // Reset modal state on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedMemberIds([]);
      setMemberSearchTerm('');
      setShowMemberDropdown(false);
    }
  }, [isOpen]);

  // Filter members based on search term
  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  // Get selected member objects
  const selectedMembers = teamMembers.filter(member => 
    selectedMemberIds.includes(member.id)
  );

  const handleMemberToggle = (memberId: string) => {
    setSelectedMemberIds(prev => {
      const newSelection = prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      return newSelection;
    });
    // Keep dropdown open for better UX when selecting multiple members
    setShowMemberDropdown(true);
  };

  const handleMemberClick = (e: React.MouseEvent, memberId: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleMemberToggle(memberId);
  };

  const removeMember = (memberId: string) => {
    setSelectedMemberIds(prev => prev.filter(id => id !== memberId));
  };

  const handleRemoveMember = (e: React.MouseEvent, memberId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeMember(memberId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare task data with optional countdown
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        totalTimeSeconds: formData.totalTimeSeconds,
        earningsCents: 0,
        currentTimeSeconds: 0,
        currentCents: 0,
        projectId,
        timeSpentSec: 0,
        assignedMemberIds: selectedMemberIds, // Include assigned member IDs in task data
      };

      // Add estimated time if provided
      if (formData.estimatedMinutes && parseFloat(formData.estimatedMinutes) > 0) {
        const estimatedMinutes = parseFloat(formData.estimatedMinutes);
        const durationSeconds = Math.floor(estimatedMinutes * 60);
        
        // Set new countdown properties
        taskData.estimatedMinutes = estimatedMinutes;
        
        // Keep legacy countdown for backwards compatibility
        const countdown = {
          initialDuration: durationSeconds,
          remaining: durationSeconds,
          isActive: false,
        };
        taskData.countdown = countdown;
      }

      await onSubmit(taskData, selectedMemberIds);
      onClose();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {task ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter task title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter task description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Task['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Estimated Time (minutes)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedMinutes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Optional countdown timer (e.g., 30)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave blank for normal time tracking. Enter minutes for countdown timer.
              </p>
            </div>

            {/* Member Assignment - Admin Only */}
            {isAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Assign to members
                </label>
                
                {/* Selected Members - Scrollable Tags */}
                {selectedMembers.length > 0 && (
                  <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Selected Members ({selectedMembers.length})
                    </div>
                    <div className="max-h-24 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {selectedMembers.map(member => (
                          <div
                            key={member.id}
                            className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex-shrink-0"
                          >
                            <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate max-w-20">{member.name}</span>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveMember(e, member.id)}
                              className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 flex-shrink-0 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Member Search */}
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={memberSearchTerm}
                      onChange={(e) => setMemberSearchTerm(e.target.value)}
                      onFocus={() => setShowMemberDropdown(true)}
                      onBlur={() => setTimeout(() => setShowMemberDropdown(false), 300)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Search team members..."
                    />
                  </div>

                  {/* Member Dropdown - Scrollable */}
                  {showMemberDropdown && filteredMembers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredMembers.map(member => {
                        const isSelected = selectedMemberIds.includes(member.id);
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={(e) => handleMemberClick(e, member.id)}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors ${
                              isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : ''
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isSelected 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                            }`}>
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 dark:text-white truncate">{member.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.email}</div>
                            </div>
                            {isSelected && (
                              <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Optional. Search and select team members to assign to this task.
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 inline mr-2" />
            {isSubmitting ? 'Saving...' : task ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
