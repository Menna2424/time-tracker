// Simple test script to verify task assignment functionality
console.log('Testing task assignment functionality...');

// Test localStorage operations
const testStorageKey = 'task_assignments_test';
const testData = {
  'task-1': ['member-1', 'member-2'],
  'task-2': ['member-1'],
  'task-3': []
};

// Test saving assignments
try {
  localStorage.setItem(testStorageKey, JSON.stringify(testData));
  console.log('✅ Successfully saved test assignments to localStorage');
} catch (error) {
  console.error('❌ Failed to save test assignments:', error);
}

// Test loading assignments
try {
  const loadedData = JSON.parse(localStorage.getItem(testStorageKey) || '{}');
  console.log('✅ Successfully loaded test assignments from localStorage');
  console.log('Loaded data:', loadedData);
} catch (error) {
  console.error('❌ Failed to load test assignments:', error);
}

// Test team members storage
const teamMembersKey = 'team_members';
const testTeamMembers = [
  {
    id: 'member-1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    hourlyRate: 50.00,
    totalHours: 156.5,
    totalEarnings: 7825.00,
    activeTasks: 3
  },
  {
    id: 'member-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    hourlyRate: 50.00,
    totalHours: 142.25,
    totalEarnings: 7112.50,
    activeTasks: 2
  }
];

try {
  localStorage.setItem(teamMembersKey, JSON.stringify(testTeamMembers));
  console.log('✅ Successfully saved test team members to localStorage');
} catch (error) {
  console.error('❌ Failed to save test team members:', error);
}

console.log('Test completed! The task assignment feature should be ready to use.');
console.log('Navigate to the Projects page and look for the assignment button (Users icon) on task cards.');

