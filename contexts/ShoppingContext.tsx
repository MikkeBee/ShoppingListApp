'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  AppState,
  AppAction,
  ShoppingList,
  ShoppingItem,
} from '@/types/shopping';
import { loadState, debouncedSave } from '@/utils/storage';

// Context type
interface ShoppingContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

// Create context
const ShoppingContext = createContext<ShoppingContextType | undefined>(
  undefined
);

// Custom hook to use the context
export function useShoppingContext(): ShoppingContextType {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error(
      'useShoppingContext must be used within a ShoppingProvider'
    );
  }
  return context;
}

// Utility functions for generating IDs and dates
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getCurrentDate(): Date {
  return new Date();
}

// Reducer function
function shoppingReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // List actions
    case 'ADD_LIST': {
      const newList: ShoppingList = {
        ...action.payload,
        id: generateId(),
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
        items: [],
      };

      return {
        ...state,
        lists: [...state.lists, newList],
        activeListId: newList.id,
      };
    }

    case 'UPDATE_LIST': {
      const updatedLists = state.lists.map(list =>
        list.id === action.payload.id
          ? { ...list, ...action.payload.updates, updatedAt: getCurrentDate() }
          : list
      );

      return {
        ...state,
        lists: updatedLists,
      };
    }

    case 'DELETE_LIST': {
      const filteredLists = state.lists.filter(
        list => list.id !== action.payload
      );
      const newActiveListId =
        state.activeListId === action.payload
          ? filteredLists.length > 0
            ? filteredLists[0].id
            : null
          : state.activeListId;

      return {
        ...state,
        lists: filteredLists,
        activeListId: newActiveListId,
      };
    }

    case 'SET_ACTIVE_LIST': {
      return {
        ...state,
        activeListId: action.payload,
      };
    }

    case 'ARCHIVE_LIST': {
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload
            ? { ...list, archived: true, updatedAt: getCurrentDate() }
            : list
        ),
      };
    }

    case 'RESTORE_LIST': {
      return {
        ...state,
        lists: state.lists.map(list =>
          list.id === action.payload
            ? { ...list, archived: false, updatedAt: getCurrentDate() }
            : list
        ),
      };
    }

    // Item actions
    case 'ADD_ITEM': {
      const newItem: ShoppingItem = {
        ...action.payload.item,
        id: generateId(),
        createdAt: getCurrentDate(),
        updatedAt: getCurrentDate(),
      };

      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload.listId) {
          return {
            ...list,
            items: [...list.items, newItem],
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      return {
        ...state,
        lists: updatedLists,
      };
    }

    case 'UPDATE_ITEM': {
      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload.listId) {
          return {
            ...list,
            items: list.items.map(item =>
              item.id === action.payload.itemId
                ? {
                    ...item,
                    ...action.payload.updates,
                    updatedAt: getCurrentDate(),
                  }
                : item
            ),
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      return {
        ...state,
        lists: updatedLists,
      };
    }

    case 'DELETE_ITEM': {
      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload.listId) {
          return {
            ...list,
            items: list.items.filter(item => item.id !== action.payload.itemId),
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      return {
        ...state,
        lists: updatedLists,
      };
    }

    case 'TOGGLE_ITEM': {
      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload.listId) {
          return {
            ...list,
            items: list.items.map(item =>
              item.id === action.payload.itemId
                ? {
                    ...item,
                    completed: !item.completed,
                    completedAt: !item.completed ? getCurrentDate() : undefined,
                    updatedAt: getCurrentDate(),
                  }
                : item
            ),
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      return {
        ...state,
        lists: updatedLists,
      };
    }

    case 'MOVE_ITEM': {
      const { fromListId, toListId, itemId } = action.payload;
      let itemToMove: ShoppingItem | null = null;

      // Find and remove item from source list
      const listsAfterRemoval = state.lists.map(list => {
        if (list.id === fromListId) {
          const item = list.items.find(i => i.id === itemId);
          if (item) {
            itemToMove = item;
          }
          return {
            ...list,
            items: list.items.filter(i => i.id !== itemId),
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      // Add item to destination list
      const finalLists = listsAfterRemoval.map(list => {
        if (list.id === toListId && itemToMove) {
          return {
            ...list,
            items: [
              ...list.items,
              { ...itemToMove, updatedAt: getCurrentDate() },
            ],
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      return {
        ...state,
        lists: finalLists,
      };
    }

    case 'DUPLICATE_ITEM': {
      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload.listId) {
          const itemToDuplicate = list.items.find(
            item => item.id === action.payload.itemId
          );
          if (itemToDuplicate) {
            const duplicatedItem: ShoppingItem = {
              ...itemToDuplicate,
              id: generateId(),
              name: `${itemToDuplicate.name} (Copy)`,
              completed: false,
              completedAt: undefined,
              createdAt: getCurrentDate(),
              updatedAt: getCurrentDate(),
            };
            return {
              ...list,
              items: [...list.items, duplicatedItem],
              updatedAt: getCurrentDate(),
            };
          }
        }
        return list;
      });

      return {
        ...state,
        lists: updatedLists,
      };
    }

    case 'BULK_TOGGLE_ITEMS': {
      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload.listId) {
          return {
            ...list,
            items: list.items.map(item =>
              action.payload.itemIds.includes(item.id)
                ? {
                    ...item,
                    completed: action.payload.completed,
                    completedAt: action.payload.completed
                      ? getCurrentDate()
                      : undefined,
                    updatedAt: getCurrentDate(),
                  }
                : item
            ),
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      return {
        ...state,
        lists: updatedLists,
      };
    }

    case 'CLEAR_COMPLETED_ITEMS': {
      const updatedLists = state.lists.map(list => {
        if (list.id === action.payload) {
          return {
            ...list,
            items: list.items.filter(item => !item.completed),
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      return {
        ...state,
        lists: updatedLists,
      };
    }

    // UI actions
    case 'SET_EDITING_ITEM': {
      return {
        ...state,
        ui: {
          ...state.ui,
          editingItemId: action.payload,
        },
      };
    }

    case 'TOGGLE_MOBILE_NAV': {
      return {
        ...state,
        ui: {
          ...state.ui,
          isMobileNavOpen: action.payload ?? !state.ui.isMobileNavOpen,
        },
      };
    }

    case 'SET_MODAL': {
      return {
        ...state,
        ui: {
          ...state.ui,
          isModalOpen: action.payload.isOpen,
          modalType: action.payload.type,
        },
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: {
            ...state.ui.loading,
            [action.payload.key]: action.payload.loading,
          },
        },
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        ui: {
          ...state.ui,
          error: action.payload,
        },
      };
    }

    case 'SET_SUCCESS': {
      return {
        ...state,
        ui: {
          ...state.ui,
          successMessage: action.payload,
        },
      };
    }

    case 'SET_IS_MOBILE': {
      return {
        ...state,
        ui: {
          ...state.ui,
          isMobile: action.payload,
        },
      };
    }

    case 'SET_FILTERS': {
      return {
        ...state,
        ui: {
          ...state.ui,
          filters: {
            ...state.ui.filters,
            ...action.payload,
          },
        },
      };
    }

    case 'SET_SORT': {
      return {
        ...state,
        ui: {
          ...state.ui,
          sort: action.payload,
        },
      };
    }

    case 'RESET_FILTERS': {
      return {
        ...state,
        ui: {
          ...state.ui,
          filters: {
            category: null,
            completed: null,
            searchTerm: '',
          },
        },
      };
    }

    // Settings actions
    case 'UPDATE_SETTINGS': {
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    }

    // Data management actions
    case 'LOAD_DATA': {
      return action.payload;
    }

    case 'RESET_DATA': {
      return loadState();
    }

    case 'HYDRATE_STATE': {
      return {
        ...state,
        ...action.payload,
      };
    }

    case 'UNDO_DELETE_ITEM': {
      const { listId, item, position } = action.payload;
      const updatedLists = state.lists.map(list => {
        if (list.id === listId) {
          const newItems = [...list.items];
          newItems.splice(position, 0, item);
          return {
            ...list,
            items: newItems,
            updatedAt: getCurrentDate(),
          };
        }
        return list;
      });

      return {
        ...state,
        lists: updatedLists,
      };
    }

    default:
      return state;
  }
}

// Provider component
interface ShoppingProviderProps {
  children: React.ReactNode;
}

export function ShoppingProvider({ children }: ShoppingProviderProps) {
  const [state, dispatch] = useReducer(shoppingReducer, loadState());

  // Auto-save state changes with debouncing
  useEffect(() => {
    if (state.settings.autoSave) {
      debouncedSave(state, state.settings.autoSaveInterval);
    }
  }, [state]);

  // Clear messages after a delay
  useEffect(() => {
    if (state.ui.error || state.ui.successMessage) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
        dispatch({ type: 'SET_SUCCESS', payload: null });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [state.ui.error, state.ui.successMessage]);

  return (
    <ShoppingContext.Provider value={{ state, dispatch }}>
      {children}
    </ShoppingContext.Provider>
  );
}

// Export the context for testing purposes
export { ShoppingContext };
