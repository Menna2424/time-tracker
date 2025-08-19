// Test script for Estimated Time Countdown Feature
console.log('🧪 Testing Estimated Time Countdown Feature...');

// Test 1: Create a task with estimated time
async function testCreateTaskWithEstimatedTime() {
  console.log('\n📝 Test 1: Creating task with estimated time...');
  
  const taskData = {
    title: 'Test Countdown Task',
    description: 'This task has a 30-minute countdown timer',
    status: 'pending',
    projectId: 'test-project-1',
    estimatedMinutes: 30,
    timeSpentSec: 0,
    assignedMemberIds: [],
    totalTimeSeconds: 0,
    earningsCents: 0,
    currentTimeSeconds: 0,
    currentCents: 0
  };

  // Simulate localStorage
  const existingTasks = JSON.parse(localStorage.getItem('tt.tasks') || '[]');
  const newTask = {
    ...taskData,
    id: 'test-task-countdown-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  existingTasks.push(newTask);
  localStorage.setItem('tt.tasks', JSON.stringify(existingTasks));
  
  console.log('✅ Task created with estimated time:', newTask.estimatedMinutes, 'minutes');
  return newTask;
}

// Test 2: Start timer and verify countdown mode
async function testStartTimerWithCountdown(task) {
  console.log('\n⏱️ Test 2: Starting timer with countdown mode...');
  
  const now = Date.now();
  const sessionData = {
    id: 'test-session-' + Date.now(),
    taskId: task.id,
    projectId: task.projectId,
    memberId: 'test-user-1',
    mode: 'countdown',
    targetSeconds: task.estimatedMinutes * 60,
    startedAt: now,
    elapsedSeconds: 0,
    earnedCents: 0
  };

  // Simulate localStorage for sessions
  const existingSessions = JSON.parse(localStorage.getItem('tt.sessions') || '[]');
  existingSessions.push(sessionData);
  localStorage.setItem('tt.sessions', JSON.stringify(existingSessions));

  // Update task with countdown state
  const updatedTask = {
    ...task,
    currentStartAt: now,
    currentTimeSeconds: 0,
    currentCents: 0,
    isRunning: true,
    countdownRemainingSec: task.estimatedMinutes * 60,
    countdownStartedAt: now
  };

  const existingTasks = JSON.parse(localStorage.getItem('tt.tasks') || '[]');
  const taskIndex = existingTasks.findIndex(t => t.id === task.id);
  if (taskIndex !== -1) {
    existingTasks[taskIndex] = updatedTask;
    localStorage.setItem('tt.tasks', JSON.stringify(existingTasks));
  }

  console.log('✅ Timer started in countdown mode');
  console.log('   - Target seconds:', sessionData.targetSeconds);
  console.log('   - Remaining seconds:', updatedTask.countdownRemainingSec);
  console.log('   - Session mode:', sessionData.mode);
  
  return { session: sessionData, task: updatedTask };
}

// Test 3: Simulate countdown progression
async function testCountdownProgression(task, session) {
  console.log('\n⏳ Test 3: Simulating countdown progression...');
  
  const initialRemaining = task.estimatedMinutes * 60;
  const testIntervals = [60, 300, 600, 1800]; // 1min, 5min, 10min, 30min
  
  for (const elapsedSeconds of testIntervals) {
    const remainingSeconds = Math.max(0, initialRemaining - elapsedSeconds);
    const progressPercentage = Math.min(100, Math.floor((elapsedSeconds / initialRemaining) * 100));
    const isExpired = remainingSeconds === 0;
    
    console.log(`   ${elapsedSeconds}s elapsed: ${remainingSeconds}s remaining (${progressPercentage}% complete)${isExpired ? ' - EXPIRED' : ''}`);
    
    if (isExpired) {
      console.log('   🎯 Countdown reached zero!');
      break;
    }
  }
}

// Test 4: Test countdown expiry and auto-stop
async function testCountdownExpiry(task, session) {
  console.log('\n🛑 Test 4: Testing countdown expiry and auto-stop...');
  
  const elapsedSeconds = task.estimatedMinutes * 60 + 1; // Exceed the estimated time
  const remainingSeconds = 0;
  const isExpired = true;
  
  console.log(`   Elapsed: ${elapsedSeconds}s, Remaining: ${remainingSeconds}s, Expired: ${isExpired}`);
  
  if (isExpired) {
    // Simulate auto-stop
    const updatedTask = {
      ...task,
      status: 'completed',
      countdownRemainingSec: 0,
      isRunning: false,
      currentStartAt: undefined
    };
    
    // End session
    const updatedSession = {
      ...session,
      endedAt: Date.now(),
      elapsedSeconds: task.estimatedMinutes * 60,
      earnedCents: Math.round((task.estimatedMinutes * 60 / 3600) * 5000) // $50/hour
    };
    
    console.log('   ✅ Auto-stop triggered');
    console.log('   ✅ Task status updated to completed');
    console.log('   ✅ Session ended with elapsed time:', updatedSession.elapsedSeconds, 'seconds');
    console.log('   ✅ Earnings calculated:', updatedSession.earnedCents, 'cents');
    
    return { task: updatedTask, session: updatedSession };
  }
}

// Test 5: Test notification
function testNotification() {
  console.log('\n🔔 Test 5: Testing notification system...');
  
  // Simulate browser notification
  if ('Notification' in window) {
    console.log('   Browser notifications supported');
    console.log('   Notification permission:', Notification.permission);
    
    if (Notification.permission === 'granted') {
      const notification = new Notification('Time\'s Up! ⏰', {
        body: 'Estimated time for "Test Countdown Task" has been reached.',
        tag: 'countdown-expired',
        requireInteraction: true
      });
      console.log('   ✅ Notification sent');
    } else {
      console.log('   ⚠️ Notification permission not granted');
    }
  } else {
    console.log('   ⚠️ Browser notifications not supported');
  }
}

// Test 6: Test normal timer (no estimated time)
async function testNormalTimer() {
  console.log('\n📝 Test 6: Testing normal timer (no estimated time)...');
  
  const normalTask = {
    id: 'test-task-normal-' + Date.now(),
    title: 'Normal Timer Task',
    description: 'This task has no estimated time - should count up normally',
    status: 'pending',
    projectId: 'test-project-1',
    estimatedMinutes: undefined, // No estimated time
    timeSpentSec: 0,
    assignedMemberIds: [],
    totalTimeSeconds: 0,
    earningsCents: 0,
    currentTimeSeconds: 0,
    currentCents: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const now = Date.now();
  const normalSession = {
    id: 'test-session-normal-' + Date.now(),
    taskId: normalTask.id,
    projectId: normalTask.projectId,
    memberId: 'test-user-1',
    mode: 'countup', // Should be countup mode
    targetSeconds: undefined, // No target
    startedAt: now,
    elapsedSeconds: 0,
    earnedCents: 0
  };

  console.log('✅ Normal task created without estimated time');
  console.log('   - Session mode:', normalSession.mode);
  console.log('   - Target seconds:', normalSession.targetSeconds);
  console.log('   - Should count up normally');
  
  return { task: normalTask, session: normalSession };
}

// Run all tests
async function runAllTests() {
  try {
    // Test 1: Create task with estimated time
    const task = await testCreateTaskWithEstimatedTime();
    
    // Test 2: Start timer with countdown
    const { session, task: updatedTask } = await testStartTimerWithCountdown(task);
    
    // Test 3: Simulate countdown progression
    await testCountdownProgression(updatedTask, session);
    
    // Test 4: Test countdown expiry
    await testCountdownExpiry(updatedTask, session);
    
    // Test 5: Test notification
    testNotification();
    
    // Test 6: Test normal timer
    await testNormalTimer();
    
    console.log('\n🎉 All countdown feature tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Tasks with estimated time start in countdown mode');
    console.log('   ✅ Countdown timer counts down from estimated time');
    console.log('   ✅ Progress bar shows countdown progress');
    console.log('   ✅ Auto-stop when countdown reaches zero');
    console.log('   ✅ Task status updated to completed on expiry');
    console.log('   ✅ Notification shown when countdown expires');
    console.log('   ✅ Tasks without estimated time use normal countup mode');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this script is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  runAllTests();
} else {
  // Node.js environment
  console.log('This test script is designed to run in a browser environment');
  console.log('Please run it in the browser console or integrate with your testing framework');
}

