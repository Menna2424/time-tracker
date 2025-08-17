import React from 'react';
import { Users, User } from 'lucide-react';
import type { TeamMember } from '../../../domain/entities/TeamMember';

interface AssignedMembersDisplayProps {
  assignedMembers: TeamMember[];
  maxDisplay?: number;
}

export const AssignedMembersDisplay: React.FC<AssignedMembersDisplayProps> = ({
  assignedMembers,
  maxDisplay = 3
}) => {
  if (assignedMembers.length === 0) {
    return null;
  }

  const displayMembers = assignedMembers.slice(0, maxDisplay);
  const remainingCount = assignedMembers.length - maxDisplay;

  return (
    <div className="flex items-center space-x-2">
      <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      <div className="flex items-center space-x-1">
        {displayMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center space-x-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium"
            title={`${member.name} (${member.email})`}
          >
            <User className="w-3 h-3" />
            <span>{member.name.split(' ')[0]}</span>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  );
};
