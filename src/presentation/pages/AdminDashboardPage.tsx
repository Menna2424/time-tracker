import React, { useState, useMemo } from 'react';
import type { TeamMember } from '../../domain/entities/TeamMember';
import { MockTeamRepository } from '../../infrastructure/repositories/mockTeamRepository';
import { AddTeamMember } from '../../application/useCases/AddTeamMember';
import { useTeamMemberTasks } from '../../application/useCases/useTeamMemberTasks';
import { TeamMemberTasksModal, AddTeamMemberModal } from '../components/Admin';
import { formatCurrency, formatHours } from '../../shared/utils/formatters';
import { useAdminTeamStats } from '../hooks/useAdminTeamStats';

export const AdminDashboardPage: React.FC = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  const { stats, loading, error, refresh } = useAdminTeamStats();
  const { tasks, projects, loading: tasksLoading, error: tasksError, getTasksByMemberId } = useTeamMemberTasks();

  const teamRepository = useMemo(() => new MockTeamRepository(), []);
  const addTeamMemberUseCase = useMemo(() => new AddTeamMember(teamRepository), [teamRepository]);





  const handleActiveTasksClick = async (member: TeamMember) => {
    setSelectedMember(member);
    await getTasksByMemberId(member.id);
    setShowTasksModal(true);
  };

  const handleCloseTasksModal = () => {
    setShowTasksModal(false);
    setSelectedMember(null);
  };

  const handleAddMember = async (request: { name: string; email: string; hourlyRate: number }) => {
    try {
      setAddingMember(true);
      await addTeamMemberUseCase.execute(request);
      // Refresh the team members list using the stats hook
      await refresh();
      setShowAddMemberModal(false);
    } catch (err) {
      console.error('Error adding team member:', err);
      // You could add a toast notification here for better UX
    } finally {
      setAddingMember(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-all duration-700">
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Admin Dashboard
        </h1>
        
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading team members...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center text-red-600 dark:text-red-400">
              <p>{error}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Team Members
              </h2>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Add Member
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hourly Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Active Tasks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.map(({ member, totalHours, totalEarnings, activeTasks }) => (
                    <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          {member.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(member.hourlyRate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatHours(totalHours, 'hm')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(totalEarnings)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleActiveTasksClick(member)}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                        >
                          {activeTasks}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {selectedMember && (
        <TeamMemberTasksModal
          isOpen={showTasksModal}
          onClose={handleCloseTasksModal}
          teamMemberName={selectedMember.name}
          tasks={tasks}
          projects={projects}
          hourlyRate={selectedMember.hourlyRate}
          loading={tasksLoading}
          error={tasksError}
        />
      )}

      <AddTeamMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSubmit={handleAddMember}
        loading={addingMember}
      />
    </div>
  );
}; 