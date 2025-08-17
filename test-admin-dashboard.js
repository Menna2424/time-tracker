// Simple test script to verify the Admin Dashboard reactive functionality
// Run this in the browser console after loading the app

console.log('🧪 Starting Admin Dashboard Test');

// Test 1: Add a team member
async function testAddTeamMember() {
  console.log('📋 Test 1: Adding team member');
  
  // Get team members storage
  const membersKey = 'team_members';
  const existing = JSON.parse(localStorage.getItem(membersKey) || '[]');
  
  // Add test member
  const testMember = {
    id: 'test-' + Date.now(),
    name: 'Test User',
    email: 'test@example.com',
    hourlyRate: 40,
    totalHours: 0,
    totalEarnings: 0,
    activeTasks: 0
  };
  
  existing.push(testMember);
  localStorage.setItem(membersKey, JSON.stringify(existing));
  
  console.log('✅ Added test member:', testMember);
  return testMember;
}

// Test 2: Assign member to a task and start timer
async function testAssignAndStartTimer(memberId) {
  console.log('📋 Test 2: Assigning member to task and starting timer');
  
  // Get tasks
  const tasksKey = 'tt.tasks';
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  
  if (tasks.length === 0) {
    console.log('❌ No tasks found, cannot test assignment');
    return;
  }
  
  const task = tasks[0];
  console.log('📝 Using task:', task.title);
  
  // Assign member to task
  task.assignedMemberIds = task.assignedMemberIds || [];
  if (!task.assignedMemberIds.includes(memberId)) {
    task.assignedMemberIds.push(memberId);
    task.status = 'active';
  }
  
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
  console.log('✅ Assigned member to task');
  
  // Create a timer session
  const sessionsKey = 'tt.sessions';
  const sessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
  
  const session = {
    id: 'test-session-' + Date.now(),
    taskId: task.id,
    projectId: task.projectId,
    memberId: memberId,
    mode: 'countup',
    startedAt: Date.now(),
    elapsedSeconds: 0
  };
  
  sessions.push(session);
  localStorage.setItem(sessionsKey, JSON.stringify(sessions));
  console.log('✅ Created timer session:', session);
  
  return { task, session };
}

// Test 3: Simulate time passing and check stats
function testTimeProgression(sessionId) {
  console.log('📋 Test 3: Simulating 30 seconds of work');
  
  const sessionsKey = 'tt.sessions';
  const sessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
  
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.elapsedSeconds = 30; // 30 seconds
    localStorage.setItem(sessionsKey, JSON.stringify(sessions));
    console.log('✅ Updated session time to 30 seconds');
  }
}

// Test 4: Stop timer and check final stats
function testStopTimer(sessionId, taskId) {
  console.log('📋 Test 4: Stopping timer and persisting data');
  
  // End the session
  const sessionsKey = 'tt.sessions';
  const sessions = JSON.parse(localStorage.getItem(sessionsKey) || '[]');
  
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.endedAt = Date.now();
    session.elapsedSeconds = 60; // 1 minute total
    session.earnedCents = 100; // $1.00 for 1 minute at $60/hour
    localStorage.setItem(sessionsKey, JSON.stringify(sessions));
    console.log('✅ Ended session');
  }
  
  // Update task totals
  const tasksKey = 'tt.tasks';
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.totalTimeSeconds = (task.totalTimeSeconds || 0) + 60;
    task.timeSpentSec = (task.timeSpentSec || 0) + 60;
    task.earningsCents = (task.earningsCents || 0) + 100;
    task.status = 'completed';
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
    console.log('✅ Updated task totals');
  }
}

// Run all tests
async function runAdminDashboardTests() {
  try {
    console.log('🚀 Running Admin Dashboard Tests...\n');
    
    const member = await testAddTeamMember();
    console.log('');
    
    const { task, session } = await testAssignAndStartTimer(member.id);
    console.log('');
    
    testTimeProgression(session.id);
    console.log('');
    
    testStopTimer(session.id, task.id);
    console.log('');
    
    console.log('🎉 All tests completed!');
    console.log('📊 Check the Admin Dashboard to see reactive updates');
    console.log('🔄 The stats should show:');
    console.log('   - Total Hours: 0h 1m (from 60 seconds)');
    console.log('   - Total Earnings: $1.00');
    console.log('   - Active Tasks: 0 (task completed)');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for manual testing
window.testAdminDashboard = runAdminDashboardTests;

console.log('✅ Admin Dashboard test functions loaded');
console.log('🔧 Run: testAdminDashboard() to execute all tests');
console.log('📝 Or run individual test functions manually');
