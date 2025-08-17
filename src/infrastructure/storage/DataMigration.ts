// Data migration and corruption handling utilities

interface MigrationResult {
  success: boolean;
  message: string;
  dataRecovered?: boolean;
}

const MIGRATION_VERSION_KEY = 'data_migration_version';
const CURRENT_VERSION = '1.0.0';

export class DataMigrationService {
  static async checkAndMigrate(): Promise<MigrationResult> {
    try {
      const currentVersion = localStorage.getItem(MIGRATION_VERSION_KEY);
      
      if (!currentVersion) {
        // First time setup - mark as current version
        localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION);
        return {
          success: true,
          message: 'Data initialized successfully',
        };
      }

      if (currentVersion !== CURRENT_VERSION) {
        // Future migrations would go here
        await this.migrateData(currentVersion, CURRENT_VERSION);
        localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION);
        return {
          success: true,
          message: `Data migrated from ${currentVersion} to ${CURRENT_VERSION}`,
        };
      }

      return {
        success: true,
        message: 'Data up to date',
      };
    } catch (error) {
      console.error('Migration failed:', error);
      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static async migrateData(fromVersion: string, toVersion: string): Promise<void> {
    // Future migration logic would be implemented here
    console.log(`Migrating data from ${fromVersion} to ${toVersion}`);
  }

  static async validateData(): Promise<MigrationResult> {
    const issues: string[] = [];
    let dataRecovered = false;

    try {
      // Validate projects data
      const projectsData = localStorage.getItem('projects');
      if (projectsData) {
        try {
          const projects = JSON.parse(projectsData);
          if (!Array.isArray(projects)) {
            throw new Error('Projects data is not an array');
          }
          // Validate each project has required fields
          projects.forEach((project: Record<string, unknown>, index: number) => {
            if (!project.id || !project.name || !project.createdAt) {
              throw new Error(`Project at index ${index} is missing required fields`);
            }
          });
        } catch {
          issues.push('Projects data corrupted - will be reset');
          localStorage.removeItem('projects');
          dataRecovered = true;
        }
      }

      // Validate tasks data
      const tasksData = localStorage.getItem('tasks');
      if (tasksData) {
        try {
          const tasks = JSON.parse(tasksData);
          if (!Array.isArray(tasks)) {
            throw new Error('Tasks data is not an array');
          }
          // Validate each task has required fields
          tasks.forEach((task: Record<string, unknown>, index: number) => {
            if (!task.id || !task.projectId || !task.title || !task.createdAt) {
              throw new Error(`Task at index ${index} is missing required fields`);
            }
          });
        } catch {
          issues.push('Tasks data corrupted - will be reset');
          localStorage.removeItem('tasks');
          dataRecovered = true;
        }
      }

      // Validate timers data
      const timersData = localStorage.getItem('timers');
      if (timersData) {
        try {
          const timers = JSON.parse(timersData);
          if (!Array.isArray(timers)) {
            throw new Error('Timers data is not an array');
          }
          // Validate each timer has required fields
          timers.forEach((timer: Record<string, unknown>, index: number) => {
            if (!timer.id || !timer.taskId || !timer.startTime) {
              throw new Error(`Timer at index ${index} is missing required fields`);
            }
          });
        } catch {
          issues.push('Timers data corrupted - will be reset');
          localStorage.removeItem('timers');
          dataRecovered = true;
        }
      }

      // Validate settings data
      const settingsData = localStorage.getItem('app_settings');
      if (settingsData) {
        try {
          const settings = JSON.parse(settingsData);
          if (!settings.theme || typeof settings.notifications !== 'boolean') {
            throw new Error('Settings data structure invalid');
          }
        } catch {
          issues.push('Settings data corrupted - will be reset');
          localStorage.removeItem('app_settings');
          dataRecovered = true;
        }
      }

      if (issues.length > 0) {
        return {
          success: true,
          message: `Data validation completed with issues: ${issues.join(', ')}`,
          dataRecovered,
        };
      }

      return {
        success: true,
        message: 'All data validated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Data validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  static async clearAllData(): Promise<MigrationResult> {
    try {
      const keys = ['projects', 'tasks', 'timers', 'app_settings', 'workday_timer', 'active_timer_state', 'theme'];
      keys.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem(MIGRATION_VERSION_KEY);
      
      return {
        success: true,
        message: 'All application data cleared successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to clear data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  static async exportData(): Promise<{ success: boolean; data?: string; message: string }> {
    try {
      const exportData = {
        version: CURRENT_VERSION,
        timestamp: new Date().toISOString(),
        projects: localStorage.getItem('projects'),
        tasks: localStorage.getItem('tasks'),
        timers: localStorage.getItem('timers'),
        settings: localStorage.getItem('app_settings'),
        workdayTimer: localStorage.getItem('workday_timer'),
        theme: localStorage.getItem('theme'),
      };

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2),
        message: 'Data exported successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  static async importData(jsonData: string): Promise<MigrationResult> {
    try {
      const importData = JSON.parse(jsonData);
      
      // Validate import data structure
      if (!importData.version || !importData.timestamp) {
        throw new Error('Invalid import data format');
      }

      // Clear existing data first
      await this.clearAllData();

      // Import data
      if (importData.projects) localStorage.setItem('projects', importData.projects);
      if (importData.tasks) localStorage.setItem('tasks', importData.tasks);
      if (importData.timers) localStorage.setItem('timers', importData.timers);
      if (importData.settings) localStorage.setItem('app_settings', importData.settings);
      if (importData.workdayTimer) localStorage.setItem('workday_timer', importData.workdayTimer);
      if (importData.theme) localStorage.setItem('theme', importData.theme);

      localStorage.setItem(MIGRATION_VERSION_KEY, CURRENT_VERSION);

      // Validate imported data
      const validation = await this.validateData();
      if (!validation.success) {
        throw new Error(`Imported data validation failed: ${validation.message}`);
      }

      return {
        success: true,
        message: `Data imported successfully from ${importData.timestamp}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}