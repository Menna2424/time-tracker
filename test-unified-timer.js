// Test the new unified timer system
console.log('Testing unified timer system...');

// Clear any existing data
localStorage.clear();

// Test data
const testTask = {
  id: 'test-task-1',
  projectId: 'test-project-1',
  title: 'Test Task',
  description: 'A test task for the unified timer system',
  status: 'pending',
  totalTimeSeconds: 0,
  earningsCents: 0,
  currentTimeSeconds: 0,
  currentCents: 0,
  hourlyRateCents: 5000, // $50/hr
  updatedAt: new Date()
};

// Save test task
localStorage.setItem('tt.tasks', JSON.stringify([testTask]));

console.log('Test task saved:', testTask);

// Simulate starting a timer
console.log('\n--- Starting Timer ---');
const startTime = Date.now();
testTask.currentStartAt = startTime;
testTask.status = 'active';
testTask.currentTimeSeconds = 0;
testTask.currentCents = 0;

// Create a session
const session = {
  id: 'test-session-1',
  taskId: testTask.id,
  projectId: testTask.projectId,
  mode: 'countup',
  startedAt: startTime
};

localStorage.setItem('tt.sessions', JSON.stringify([session]));

console.log('Timer started at:', new Date(startTime).toISOString());
console.log('Session created:', session);

// Simulate 5 seconds passing
console.log('\n--- 5 seconds later ---');
const after5Seconds = startTime + (5 * 1000);
const elapsedSeconds = Math.floor((after5Seconds - startTime) / 1000);
const earnedCents = Math.round((elapsedSeconds / 3600) * testTask.hourlyRateCents);

testTask.currentTimeSeconds = elapsedSeconds;
testTask.currentCents = earnedCents;

console.log('Elapsed seconds:', elapsedSeconds);
console.log('Earned cents:', earnedCents);
console.log('Current task state:', testTask);

// Simulate stopping the timer
console.log('\n--- Stopping Timer ---');
const stopTime = after5Seconds;

// Update session
session.endedAt = stopTime;
session.elapsedSeconds = elapsedSeconds;
session.earnedCents = earnedCents;

// Update task totals
testTask.totalTimeSeconds += elapsedSeconds;
testTask.earningsCents += earnedCents;
testTask.currentTimeSeconds = 0;
testTask.currentCents = 0;
testTask.currentStartAt = undefined;
testTask.status = 'completed';
testTask.updatedAt = new Date();

localStorage.setItem('tt.tasks', JSON.stringify([testTask]));
localStorage.setItem('tt.sessions', JSON.stringify([session]));

console.log('Timer stopped at:', new Date(stopTime).toISOString());
console.log('Final task state:', testTask);
console.log('Final session state:', session);

// Verify totals
console.log('\n--- Verification ---');
console.log('Total time seconds:', testTask.totalTimeSeconds, '(should be 5)');
console.log('Total earnings cents:', testTask.earningsCents, '(should be ~69)');
console.log('Current time seconds:', testTask.currentTimeSeconds, '(should be 0)');
console.log('Current cents:', testTask.currentCents, '(should be 0)');

console.log('\nTest completed! Check localStorage for data persistence.');

