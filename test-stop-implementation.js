// Simple test to verify the stop timer implementation
console.log('Testing Stop Task Timer Implementation...');

// Test the localStorage keys
const tasksKey = 'tt.tasks';
const sessionsKey = 'tt.sessions';

// Check if localStorage is available
if (typeof localStorage !== 'undefined') {
  console.log('✅ localStorage is available');
  
  // Check if tasks exist
  const tasks = localStorage.getItem(tasksKey);
  if (tasks) {
    console.log('✅ Tasks found in localStorage');
    const parsedTasks = JSON.parse(tasks);
    console.log(`Found ${parsedTasks.length} tasks`);
    
    // Check task structure
    if (parsedTasks.length > 0) {
      const firstTask = parsedTasks[0];
      console.log('Sample task structure:', {
        id: firstTask.id,
        title: firstTask.title,
        totalTimeSeconds: firstTask.totalTimeSeconds,
        earningsCents: firstTask.earningsCents,
        currentTimeSeconds: firstTask.currentTimeSeconds,
        currentCents: firstTask.currentCents,
        status: firstTask.status
      });
    }
  } else {
    console.log('⚠️ No tasks found in localStorage');
  }
  
  // Check if sessions exist
  const sessions = localStorage.getItem(sessionsKey);
  if (sessions) {
    console.log('✅ Sessions found in localStorage');
    const parsedSessions = JSON.parse(sessions);
    console.log(`Found ${parsedSessions.length} sessions`);
    
    // Check session structure
    if (parsedSessions.length > 0) {
      const firstSession = parsedSessions[0];
      console.log('Sample session structure:', {
        id: firstSession.id,
        taskId: firstSession.taskId,
        projectId: firstSession.projectId,
        mode: firstSession.mode,
        startedAt: firstSession.startedAt,
        endedAt: firstSession.endedAt,
        elapsedSeconds: firstSession.elapsedSeconds,
        earnedCents: firstSession.earnedCents
      });
    }
  } else {
    console.log('⚠️ No sessions found in localStorage');
  }
  
} else {
  console.log('❌ localStorage is not available');
}

console.log('Test completed. Check the browser console for results.');

