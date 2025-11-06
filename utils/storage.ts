import { AppState } from '@/types/shopping';

// Storage keys
const STORAGE_KEYS = {
  APP_STATE: 'shopping_app_state',
  VERSION: 'shopping_app_version',
  BACKUP: 'shopping_app_backup',
} as const;

// Current version for data migration
const CURRENT_VERSION = '1.0.0';

// Default state factory
function getDefaultState(): AppState {
  return {
    lists: [],
    activeListId: null,
    ui: {
      editingItemId: null,
      isMobileNavOpen: false,
      isModalOpen: false,
      modalType: null,
      loading: {
        items: false,
        lists: false,
        saving: false,
      },
      error: null,
      successMessage: null,
      isMobile: false,
      filters: {
        category: null,
        completed: null,
        searchTerm: '',
      },
      sort: {
        field: 'name',
        direction: 'asc',
      },
    },
    settings: {
      autoSave: true,
      autoSaveInterval: 1000,
      theme: 'light',
      showCompletedItems: true,
      currency: 'USD',
    },
  };
}

// Check if localStorage is available
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Type guards for validation
function isValidAppState(data: unknown): data is AppState {
  if (!data || typeof data !== 'object') return false;

  const state = data as Record<string, unknown>;

  return (
    typeof state.version === 'string' &&
    Array.isArray(state.lists) &&
    state.ui !== null &&
    typeof state.ui === 'object'
  );
}

// Simple serialization
function serialize(state: AppState): string {
  return JSON.stringify(state);
}

function deserialize(data: string): AppState | null {
  try {
    const parsed = JSON.parse(data);
    return isValidAppState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// Core storage functions
export function saveState(state: AppState): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const serialized = serialize(state);
    localStorage.setItem(STORAGE_KEYS.APP_STATE, serialized);
    localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
    return true;
  } catch {
    return false;
  }
}

export function loadState(): AppState {
  if (!isStorageAvailable()) return getDefaultState();

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    if (!stored) return getDefaultState();

    const state = deserialize(stored);
    return state || getDefaultState();
  } catch {
    return getDefaultState();
  }
}

export function clearStorage(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    localStorage.removeItem(STORAGE_KEYS.APP_STATE);
    localStorage.removeItem(STORAGE_KEYS.VERSION);
    localStorage.removeItem(STORAGE_KEYS.BACKUP);
    return true;
  } catch {
    return false;
  }
}

// Backup functions
export function createBackup(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const state = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    if (!state) return false;

    const backup = {
      data: state,
      timestamp: new Date().toISOString(),
      version: CURRENT_VERSION,
    };

    localStorage.setItem(STORAGE_KEYS.BACKUP, JSON.stringify(backup));
    return true;
  } catch {
    return false;
  }
}

export function restoreFromBackup(): boolean {
  if (!isStorageAvailable()) return false;

  try {
    const backupStr = localStorage.getItem(STORAGE_KEYS.BACKUP);
    if (!backupStr) return false;

    const backup = JSON.parse(backupStr);
    if (!backup?.data) return false;

    const state = deserialize(backup.data);
    if (!state) return false;

    return saveState(state);
  } catch {
    return false;
  }
}

// Auto-save functionality with debouncing
let saveTimeout: NodeJS.Timeout | null = null;

export function debouncedSave(state: AppState, delay = 1000): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveState(state);
    saveTimeout = null;
  }, delay);
}

// Utility functions for common operations
export function hasStoredData(): boolean {
  if (!isStorageAvailable()) return false;
  return !!localStorage.getItem(STORAGE_KEYS.APP_STATE);
}

export function getStorageSize(): number {
  if (!isStorageAvailable()) return 0;

  try {
    const state = localStorage.getItem(STORAGE_KEYS.APP_STATE);
    return state ? state.length : 0;
  } catch {
    return 0;
  }
}
