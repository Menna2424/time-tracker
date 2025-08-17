# Unified Earnings Calculation System

## Overview

The Unified Earnings Calculation System ensures that tasks with countdown timers and tasks without countdown timers work identically in terms of updating and persisting earnings and total time. This system eliminates discrepancies between different timer modes and provides a consistent user experience.

## Key Features

### ✅ Unified Calculation Formula
Both countdown and normal timer modes use the same earnings calculation:
```
earnings = (totalTimeSpentInMinutes / 60) * hourlyRate
```

### ✅ Real-time Updates
- **Every second**: Both modes update `timeSpent` and `earnings` in real-time
- **Continuous persistence**: All changes are immediately saved to local storage
- **Live display**: Current earnings are shown while timer is running

### ✅ Unified Persistence
- **Same data fields**: Both modes use `task.timeSpent` and `task.earnings`
- **Consistent storage**: No separate logic paths for different timer types
- **Page reload support**: All data persists and restores correctly

### ✅ Auto-finalization
- **Timer stop**: Earnings are finalized when user stops timer
- **Countdown end**: Earnings are finalized when countdown reaches 0
- **Workday end**: Earnings are finalized when workday timer ends

## Architecture

### Application Layer
- `useUnifiedEarningsCalculation`: Core calculation logic
- `useUnifiedTimer`: Unified timer management
- `useTimerTaskIntegration`: Integration between timer and task updates

### Infrastructure Layer
- `TaskRepository`: Persistence for task data
- `SettingsRepository`: Hourly rate management
- `TimerRepository`: Timer session storage

### Presentation Layer
- Components display updated earnings and time
- No calculation logic in presentation layer

## Implementation Details

### Core Calculation Service

```typescript
// src/application/useCases/useUnifiedEarningsCalculation.ts
export const useUnifiedEarningsCalculation = () => {
  const calculateEarnings = (timeSpentSeconds: number, hourlyRate: number): number => {
    const timeSpentHours = timeSpentSeconds / 3600;
    return Math.round((timeSpentHours * hourlyRate) * 100) / 100;
  };

  const updateTaskTimeAndEarnings = async (taskId: string, additionalTimeSeconds: number) => {
    // Updates both timeSpent and earnings every second
  };

  const finalizeTaskEarnings = async (taskId: string, totalTimeSpentSeconds: number) => {
    // Finalizes earnings when timer stops
  };
};
```

### Unified Timer Service

```typescript
// src/application/useCases/useUnifiedTimer.ts
export const useUnifiedTimer = () => {
  // Timer tick handler for both countdown and normal modes
  useEffect(() => {
    if (isRunning && currentTimer) {
      intervalId = setInterval(async () => {
        // Update task time and earnings every second
        await updateTaskTimeAndEarnings(currentTimer.taskId, 1);
        
        // Check if countdown has ended
        if (hasCountdownEnded(currentTimer.taskId)) {
          await stopTimer();
        }
      }, 1000);
    }
  }, []);
};
```

### Task Repository Updates

```typescript
// src/infrastructure/storage/TaskRepository.ts
export interface ITaskRepository {
  updateTimeAndEarnings(id: string, additionalTime: number, earnings: number): Promise<Task>;
  updateEarnings(id: string, earnings: number): Promise<Task>;
  updateCurrentEarnings(id: string, currentEarnings: number): Promise<Task>;
}
```

## Usage Examples

### Starting a Timer (Both Modes)

```typescript
const timer = useUnifiedTimer();

// Start normal timer
await timer.startTimer(taskId, "Working on feature");

// Start countdown timer (automatically detected)
await timer.startTimer(taskId, "Pomodoro session");
```

### Real-time Updates

```typescript
// Updates happen automatically every second
// No manual intervention needed
```

### Stopping a Timer

```typescript
// Finalizes earnings automatically
await timer.stopTimer();
```

## Data Flow

### 1. Timer Start
```
User clicks Start → Timer starts → Task marked as active → Real-time updates begin
```

### 2. During Timer Run
```
Every second: Update timeSpent +1s → Calculate new earnings → Save to storage → Update display
```

### 3. Timer Stop
```
User clicks Stop → Finalize earnings → Clear currentEarnings → Mark task as completed → Save final state
```

### 4. Countdown End
```
Countdown reaches 0 → Auto-stop timer → Finalize earnings → Clear currentEarnings → Save final state
```

## Persistence Strategy

### Task Data Structure
```typescript
interface Task {
  timeSpent: number;        // Total time in seconds
  earnings: number;         // Finalized earnings
  currentEarnings?: number; // Live earnings while running
  status: 'pending' | 'active' | 'completed';
}
```

### Storage Keys
- `tasks`: Task data with earnings
- `active_timer_state`: Current timer state
- `countdown_states`: Countdown timer states
- `settings`: Hourly rate configuration

## Benefits

### ✅ Consistency
- Same calculation logic for all timer modes
- No discrepancies between countdown and normal timers
- Unified data structure

### ✅ Reliability
- Real-time persistence prevents data loss
- Page reload support maintains state
- Automatic finalization ensures accuracy

### ✅ User Experience
- Live earnings display
- Immediate feedback
- Consistent behavior across modes

### ✅ Maintainability
- Single source of truth for calculations
- Clear separation of concerns
- Easy to extend and modify

## Testing

### Demo Component
Use `UnifiedEarningsDemo` component to test:
- Normal timer mode
- Countdown timer mode
- Real-time updates
- Persistence across page reloads
- Earnings calculations

### Manual Testing
1. Start a normal timer
2. Verify earnings update every second
3. Stop timer and check final earnings
4. Reload page and verify persistence
5. Repeat with countdown timer

## Migration Guide

### From Old System
The unified system is backward compatible. Existing tasks will continue to work with the new calculation logic.

### To New System
1. Use `useUnifiedTimer` instead of `useTimer`
2. Use `useUnifiedEarningsCalculation` for calculations
3. Update components to use unified interfaces

## Troubleshooting

### Common Issues

**Earnings not updating**: Check that `updateTaskTimeAndEarnings` is being called every second

**Data not persisting**: Verify localStorage is working and repositories are saving correctly

**Countdown not auto-stopping**: Ensure `hasCountdownEnded` is properly implemented

### Debug Mode
Enable console logging to see real-time updates:
```typescript
console.log(`Updated task ${taskId}: ${timeSpent}s, $${earnings}`);
```

## Future Enhancements

### Planned Features
- Export earnings data
- Multiple hourly rates per project
- Overtime calculations
- Tax deductions
- Currency conversion

### Extension Points
- Custom calculation formulas
- Different persistence backends
- Real-time collaboration
- Mobile synchronization 