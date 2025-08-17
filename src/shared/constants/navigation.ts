import type { NavigationItem } from '../../domain/types';
import type { UserRole } from '../../domain/entities/User';

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: '📊'
  },
  {
    id: 'projects',
    label: 'Projects',
    path: '/projects',
    icon: '📁'
  },
  {
    id: 'timer',
    label: 'Timer',
    path: '/timer',
    icon: '⏱️'
  },
  {
    id: 'statistics',
    label: 'Statistics',
    path: '/statistics',
    icon: '💰'
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: '⚙️'
  },
  {
    id: 'admin',
    label: 'Admin',
    path: '/admin',
    icon: '👨‍💼',
    requiredRole: 'admin'
  }
];

export const getNavigationItems = (userRole?: UserRole): NavigationItem[] => {
  if (!userRole) {
    return NAVIGATION_ITEMS.filter(item => !item.requiredRole);
  }

  return NAVIGATION_ITEMS.filter(item => {
    if (!item.requiredRole) return true;
    return item.requiredRole === userRole;
  });
}; 