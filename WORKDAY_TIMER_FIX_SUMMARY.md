# Workday Global Timer Fix - Clean Architecture Implementation

## Problem Summary

The "Workday Remaining" timer was decrementing ~3s per real second due to:
- Multiple intervals attached to the same timer
- No proper cleanup of intervals
- Timer ticking even when no task was active
- No delta-based calculation causing drift
- No persistence of timer state

## Solution Overview

Implemented a clean architecture solution with the following key improvements:

### 1. Single Global Timer Instance

**File: `src/presentation/hooks/useGlobalTimerTick.ts`**

- Added global state variables to ensure only one timer instance across the entire app
- `globalTimerId`, `globalLastTick`, `globalIsInitialized` prevent duplicate intervals
- Components can mount/unmount without affecting the global timer

```typescript
// Global state to ensure only one timer instance across the entire app
let globalTimerId: number | null = null;
let globalLastTick: number = 0;
let globalIsInitialized = false;
```

### 2. Delta-Based Calculation

- Changed from `performance.now()` to `Date.now()` for more consistent timing
- Implemented proper delta calculation: `now - globalLastTick`
- Only processes when `deltaMs >= 1000` to ensure exactly 1 second per tick
- Prevents drift and multiple decrements per second

```typescript
const tick = useCallback(async () => {
  const now = Date.now();
  const deltaMs = now - globalLastTick;
  globalLastTick = now;
  
  // Only process if at least 1 second has passed
  if (deltaMs >= 1000) {
    // Execute tick logic
  }
}, []);
```

### 3. localStorage Persistence

- Persists `globalLastTick` to localStorage as `tt.globalLastTick`
- Prevents drift across page reloads
- Maintains timer accuracy even when browser is refreshed

```typescript
// Load last tick time from localStorage to prevent drift
const savedLastTick = localStorage.getItem('tt.globalLastTick');
if (savedLastTick) {
  globalLastTick = parseInt(savedLastTick, 10);
} else {
  globalLastTick = Date.now();
}

// Persist on each tick
localStorage.setItem('tt.globalLastTick', globalLastTick.toString());
```

### 4. Active Task Requirement

**File: `src/application/useCases/timer/TickActiveWorkSecond.ts`**

- Enhanced logging for better debugging
- Only decrements workday when active sessions exist
- Clear separation of concerns

```typescript
// If no active sessions, don't decrement working day
if (activeSessions.length === 0) {
  console.debug('[TICK] No active sessions, skipping workday decrement');
  return;
}
```

### 5. Clean Architecture Implementation

**New File: `src/domain/services/WorkdayTimerService.ts`**

- Created domain service for workday timer logic
- Proper separation of concerns
- Single responsibility principle
- Added to DI container for dependency injection

```typescript
export class WorkdayTimerService {
  async getCurrentState(): Promise<WorkdayTimerState> {
    // Encapsulates workday timer state logic
  }
  
  formatTime(seconds: number): string {
    // Centralized time formatting
  }
  
  getTimerColor(remainingSeconds: number, totalSeconds: number): string {
    // Centralized color logic
  }
}
```

### 6. Component Improvements

**File: `src/presentation/components/WorkdayTimer/WorkdayTimer.tsx`**

- Removed duplicate intervals
- Uses `useCallback` for `loadData` function
- Proper `useEffect` dependencies
- Relies on global timer for updates
- Uses domain service for business logic

## Key Benefits

1. **Accurate Timing**: Exactly 1 second per real second
2. **No Drift**: Delta-based calculation prevents timing drift
3. **Single Source of Truth**: One global timer instance
4. **Clean Architecture**: Proper separation of concerns
5. **Persistence**: Timer state survives page reloads
6. **Performance**: No infinite re-renders or duplicate intervals
7. **Maintainability**: Clear, testable code structure

## Testing

Run the test script to verify the fix:

```bash
node test-workday-timer-fix.js
```

## Verification Steps

1. Start a task timer
2. Watch the workday timer - it should decrement exactly 1s per real second
3. Check browser console for `[GLOBAL_TICK]` and `[TICK]` debug messages
4. Verify localStorage has `tt.globalLastTick` entry
5. Stop the task - workday should stop decrementing
6. Reload page - timer should continue from correct position

## Files Modified

- `src/presentation/hooks/useGlobalTimerTick.ts` - Global timer implementation
- `src/application/useCases/timer/TickActiveWorkSecond.ts` - Enhanced tick logic
- `src/presentation/components/WorkdayTimer/WorkdayTimer.tsx` - Component improvements
- `src/domain/services/WorkdayTimerService.ts` - New domain service
- `src/application/di/container.ts` - Added service to DI container

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ WorkdayTimer    │  │ useGlobalTimer  │  │ Other       │ │
│  │ Component       │  │ Tick Hook       │  │ Components  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ TickActiveWork  │  │ EnsureWorking   │  │ DI Container│ │
│  │ Second Use Case │  │ Day Use Case    │  │             │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ WorkdayTimer    │  │ WorkingDay      │  │ Timer       │ │
│  │ Service         │  │ Entity          │  │ Repository  │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │ LocalWorkingDay │  │ LocalTimer      │  │ localStorage│ │
│  │ Repository      │  │ Repository      │  │ Storage     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

This implementation follows clean architecture principles with clear separation of concerns, proper dependency injection, and maintainable code structure.
