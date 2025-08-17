import { eventBus } from './EventBus';

export function installStorageSync(): () => void {
  const handleStorageChange = (event: StorageEvent) => {
    // Only handle storage events from other tabs/windows
    if (event.storageArea !== localStorage) {
      return;
    }

    switch (event.key) {
      case 'projects':
        eventBus.emit('projects:changed');
        eventBus.emit('tasks:changed'); // Tasks are stored within projects
        break;
      
      case 'sessions':
      case 'timer_sessions':
        eventBus.emit('sessions:changed');
        break;
      
      case 'team_members':
        eventBus.emit('members:changed');
        break;
      
      case 'settings':
        eventBus.emit('settings:changed');
        break;
      
      case 'tasks':
        eventBus.emit('tasks:changed');
        break;
      
      default:
        // Handle any other storage keys that might affect data
        if (event.key?.includes('project') || event.key?.includes('task')) {
          eventBus.emit('tasks:changed');
        }
        break;
    }
  };

  // Install the storage event listener
  window.addEventListener('storage', handleStorageChange);

  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}
