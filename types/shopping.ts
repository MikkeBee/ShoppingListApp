// Core Shopping List Types
// This file contains all TypeScript interfaces and types for the shopping list application

// ItemCategory enum with all 13 categories as specified in the requirements
export enum ItemCategory {
  PRODUCE = 'produce',
  BAKERY = 'bakery',
  MEAT = 'meat',
  SEAFOOD = 'seafood',
  DAIRY = 'dairy',
  FROZEN = 'frozen',
  PANTRY = 'pantry',
  BEVERAGES = 'beverages',
  SNACKS = 'snacks',
  HOUSEHOLD = 'household',
  PERSONAL_CARE = 'personal_care',
  HEALTH = 'health',
  OTHER = 'other',
}

// Shopping item interface
export interface ShoppingItem {
  /** Unique identifier for the item */
  id: string;
  /** Item name/description */
  name: string;
  /** Category classification */
  category: ItemCategory;
  /** Quantity needed */
  quantity: number;
  /** Unit of measurement (e.g., "pcs", "kg", "liters") */
  unit: string;
  /** Whether the item has been completed/purchased */
  completed: boolean;

  /** Optional notes or additional details */
  notes?: string;
  /** Estimated price (optional) */
  estimatedPrice?: number;
  /** When the item was created */
  createdAt: Date;
  /** When the item was last modified */
  updatedAt: Date;
  /** When the item was completed (if applicable) */
  completedAt?: Date;
}

// Shopping list interface
export interface ShoppingList {
  /** Unique identifier for the list */
  id: string;
  /** List name/title */
  name: string;
  /** List description (optional) */
  description?: string;
  /** Array of shopping items */
  items: ShoppingItem[];
  /** Whether this is the active/current list */
  isActive: boolean;
  /** When the list was created */
  createdAt: Date;
  /** When the list was last modified */
  updatedAt: Date;
  /** List color theme (optional) */
  color?: string;
  /** Whether the list is archived */
  archived: boolean;
}

// UI State for managing editing states and mobile detection
export interface UIState {
  /** Currently editing item ID (null if none) */
  editingItemId: string | null;
  /** Whether mobile navigation is open */
  isMobileNavOpen: boolean;
  /** Whether a modal is currently open */
  isModalOpen: boolean;
  /** Current modal type */
  modalType:
    | 'add-item'
    | 'edit-item'
    | 'add-list'
    | 'delete-list'
    | 'delete-item'
    | null;
  /** Loading states for async operations */
  loading: {
    items: boolean;
    lists: boolean;
    saving: boolean;
  };
  /** Error states */
  error: string | null;
  /** Success message */
  successMessage: string | null;
  /** Whether the app is in mobile view */
  isMobile: boolean;
  /** Current filter settings */
  filters: {
    category: ItemCategory | null;
    completed: boolean | null;
    searchTerm: string;
  };
  /** Sort settings */
  sort: {
    field: 'name' | 'category' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
  };
}

// Application state interface
export interface AppState {
  /** All shopping lists */
  lists: ShoppingList[];
  /** Currently active list ID */
  activeListId: string | null;
  /** UI state */
  ui: UIState;
  /** App settings */
  settings: {
    /** Auto-save enabled */
    autoSave: boolean;
    /** Auto-save interval in milliseconds */
    autoSaveInterval: number;

    /** Theme preference */
    theme: 'light' | 'dark' | 'auto';
    /** Whether to show completed items */
    showCompletedItems: boolean;
    /** Default currency for prices */
    currency: string;
  };
}

// Action types for state management
export type AppAction =
  // List actions
  | {
      type: 'ADD_LIST';
      payload: Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>;
    }
  | {
      type: 'UPDATE_LIST';
      payload: { id: string; updates: Partial<ShoppingList> };
    }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'SET_ACTIVE_LIST'; payload: string | null }
  | { type: 'ARCHIVE_LIST'; payload: string }
  | { type: 'RESTORE_LIST'; payload: string }

  // Item actions
  | {
      type: 'ADD_ITEM';
      payload: {
        listId: string;
        item: Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>;
      };
    }
  | {
      type: 'UPDATE_ITEM';
      payload: {
        listId: string;
        itemId: string;
        updates: Partial<ShoppingItem>;
      };
    }
  | { type: 'DELETE_ITEM'; payload: { listId: string; itemId: string } }
  | { type: 'TOGGLE_ITEM'; payload: { listId: string; itemId: string } }
  | {
      type: 'MOVE_ITEM';
      payload: { fromListId: string; toListId: string; itemId: string };
    }
  | { type: 'DUPLICATE_ITEM'; payload: { listId: string; itemId: string } }
  | {
      type: 'BULK_TOGGLE_ITEMS';
      payload: { listId: string; itemIds: string[]; completed: boolean };
    }
  | { type: 'CLEAR_COMPLETED_ITEMS'; payload: string }

  // UI actions
  | { type: 'SET_EDITING_ITEM'; payload: string | null }
  | { type: 'TOGGLE_MOBILE_NAV'; payload?: boolean }
  | {
      type: 'SET_MODAL';
      payload: { type: UIState['modalType']; isOpen: boolean };
    }
  | {
      type: 'SET_LOADING';
      payload: { key: keyof UIState['loading']; loading: boolean };
    }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUCCESS'; payload: string | null }
  | { type: 'SET_IS_MOBILE'; payload: boolean }
  | { type: 'SET_FILTERS'; payload: Partial<UIState['filters']> }
  | { type: 'SET_SORT'; payload: UIState['sort'] }
  | { type: 'RESET_FILTERS' }

  // Settings actions
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }

  // Data actions
  | { type: 'LOAD_DATA'; payload: AppState }
  | { type: 'RESET_DATA' }
  | { type: 'HYDRATE_STATE'; payload: Partial<AppState> }

  // Undo actions
  | {
      type: 'UNDO_DELETE_ITEM';
      payload: { listId: string; item: ShoppingItem; position: number };
    };

// Utility types for forms and component props
export type CreateItemForm = Omit<
  ShoppingItem,
  'id' | 'createdAt' | 'updatedAt' | 'completedAt'
>;
export type UpdateItemForm = Partial<
  Omit<ShoppingItem, 'id' | 'createdAt' | 'updatedAt'>
>;
export type CreateListForm = Omit<
  ShoppingList,
  'id' | 'items' | 'createdAt' | 'updatedAt' | 'isActive'
>;
export type UpdateListForm = Partial<
  Omit<ShoppingList, 'id' | 'createdAt' | 'updatedAt'>
>;

// Component prop types
export interface ItemComponentProps {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onMove?: (itemId: string, toListId: string) => void;
  isEditing?: boolean;
  disabled?: boolean;
}

export interface ListComponentProps {
  list: ShoppingList;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  isActive?: boolean;
  disabled?: boolean;
}

// Filter and sort types
export type FilterOptions = UIState['filters'];
export type SortOptions = UIState['sort'];

// Statistics interfaces
export interface ListStats {
  totalItems: number;
  completedItems: number;
  completionPercentage: number;
  itemsByCategory: Record<ItemCategory, number>;

  estimatedTotal: number;
  lastModified: Date;
}

export interface AppStats {
  totalLists: number;
  activeLists: number;
  archivedLists: number;
  totalItems: number;
  completedItems: number;
  overallCompletionPercentage: number;
  categoriesUsed: ItemCategory[];
  mostUsedCategory: ItemCategory | null;
}
