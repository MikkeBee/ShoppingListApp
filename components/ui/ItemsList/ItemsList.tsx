'use client';

import React, { useState } from 'react';
import { useShoppingContext } from '@/contexts/ShoppingContext';
import { ItemCategory, ShoppingItem } from '@/types/shopping';
import { CategoryBadge } from '@/components/ui/CategoryBadge/CategoryBadge';
import { ItemRow } from '@/components/ui/ItemRow/ItemRow';
import { UndoNotification } from '@/components/ui/UndoNotification/UndoNotification';
import { SearchAndFilter } from '@/components/ui/SearchAndFilter/SearchAndFilter';
import { useUndoOperations } from '@/hooks/useUndoOperations';

import {
  useAccessibilityPreferences,
  useScreenReader,
  useKeyboardNavigation,
} from '@/hooks/useAccessibility';
import styles from './ItemsList.module.scss';

export interface ItemsListProps {
  className?: string;
  showCompleted?: boolean;
  groupByCategory?: boolean;
}

export function ItemsList({
  className,
  showCompleted = true,
  groupByCategory = true,
}: ItemsListProps) {
  const { state, dispatch } = useShoppingContext();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isLoading] = useState(false); // Keep for aria-busy attribute

  // Accessibility hooks
  const { reducedMotion, highContrast } = useAccessibilityPreferences();
  const { announce } = useScreenReader();

  // Initialize containerRef first, then use it in the callback
  const containerRef = React.useRef<HTMLDivElement>(null);

  const {} = useKeyboardNavigation(
    [], // Will be updated when filteredItems are calculated
    index => {
      // Handle item selection with keyboard
      const itemElements =
        containerRef.current?.querySelectorAll('[data-item-index]');
      const targetItem = itemElements?.[index] as HTMLElement;
      if (targetItem) {
        targetItem.focus();
        targetItem.click();
      }
    }
  );

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<ItemCategory | 'all'>(
    'all'
  );

  const [filterCompleted, setFilterCompleted] = useState<
    'all' | 'completed' | 'incomplete'
  >('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'dateAdded'>(
    'name'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const {
    pendingOperation,
    createUndoOperation,
    startUndoOperation,
    executeUndo,
    dismissUndo,
  } = useUndoOperations();

  // Get current active list
  const activeList = state.lists.find(list => list.id === state.activeListId);

  if (!activeList) {
    return (
      <div className={styles.noList}>
        <p>Please select a shopping list to view items.</p>
      </div>
    );
  }

  // Apply filters
  let filteredItems = activeList.items;

  // Text search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filteredItems = filteredItems.filter(
      item =>
        item.name.toLowerCase().includes(query) ||
        item.notes?.toLowerCase().includes(query)
    );
  }

  // Category filter
  if (filterCategory !== 'all') {
    filteredItems = filteredItems.filter(
      item => item.category === filterCategory
    );
  }

  // Completion status filter
  if (filterCompleted === 'completed') {
    filteredItems = filteredItems.filter(item => item.completed);
  } else if (filterCompleted === 'incomplete') {
    filteredItems = filteredItems.filter(item => !item.completed);
  }

  // Legacy showCompleted prop (for backwards compatibility)
  if (!showCompleted && filterCompleted === 'all') {
    filteredItems = filteredItems.filter(item => !item.completed);
  }

  // Apply sorting
  filteredItems = [...filteredItems].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;

      case 'dateAdded':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Group items by category if requested
  const groupedItems = groupByCategory
    ? filteredItems.reduce(
        (groups, item) => {
          if (!groups[item.category]) {
            groups[item.category] = [];
          }
          groups[item.category].push(item);
          return groups;
        },
        {} as Record<ItemCategory, ShoppingItem[]>
      )
    : { all: filteredItems };

  // Handle item actions
  const handleToggle = (itemId: string) => {
    if (activeList) {
      const item = activeList.items.find(i => i.id === itemId);
      if (item) {
        const newStatus = !item.completed;
        dispatch({
          type: 'TOGGLE_ITEM',
          payload: { listId: activeList.id, itemId },
        });

        // Announce status change to screen readers
        announce(
          `${item.name} ${newStatus ? 'completed' : 'uncompleted'}`,
          'polite'
        );
      }
    }
  };

  const handleEdit = (itemId: string) => {
    setEditingItemId(itemId);
  };

  const handleDelete = (itemId: string, showUndo: boolean = false) => {
    if (!activeList) return;

    const item = activeList.items.find(i => i.id === itemId);
    if (!item) return;

    const itemPosition = activeList.items.findIndex(i => i.id === itemId);

    if (showUndo) {
      // Create undo operation and start the timer
      const undoOperation = createUndoOperation('DELETE_ITEM', {
        item,
        listId: activeList.id,
        position: itemPosition,
      });
      startUndoOperation(undoOperation);
    }

    // Execute the delete
    dispatch({
      type: 'DELETE_ITEM',
      payload: { listId: activeList.id, itemId },
    });

    // Announce deletion to screen readers
    announce(
      showUndo
        ? `${item.name} deleted. Undo available for 5 seconds`
        : `${item.name} deleted permanently`,
      'assertive'
    );
  };

  const handleSave = (itemId: string, updates: Partial<ShoppingItem>) => {
    if (activeList) {
      dispatch({
        type: 'UPDATE_ITEM',
        payload: {
          listId: activeList.id,
          itemId,
          updates,
        },
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
  };

  const handleDuplicate = (itemId: string) => {
    if (activeList) {
      dispatch({
        type: 'DUPLICATE_ITEM',
        payload: { listId: activeList.id, itemId },
      });
    }
  };

  const handleUndo = () => {
    const operation = executeUndo();
    if (operation && operation.type === 'DELETE_ITEM') {
      dispatch({
        type: 'UNDO_DELETE_ITEM',
        payload: operation.data,
      });
    }
    dismissUndo();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterCategory('all');

    setFilterCompleted('all');
    setSortBy('name');
    setSortOrder('asc');
  };

  // Calculate statistics
  const totalItems = activeList.items.length;
  const completedItems = activeList.items.filter(item => item.completed).length;
  const completionPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const combinedClassName = `${styles.itemsList} ${className || ''}`.trim();

  if (totalItems === 0) {
    return (
      <div className={combinedClassName}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📝</div>
          <h3 className={styles.emptyTitle}>No items in your list</h3>
          <p className={styles.emptyDescription}>
            Add your first item to get started with your shopping list.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={combinedClassName}
      role='main'
      aria-label={`Shopping list: ${activeList?.name || 'Items'}`}
      aria-live='polite'
      aria-busy={isLoading}
      data-high-contrast={highContrast}
      data-reduced-motion={reducedMotion}
    >
      {/* Search and Filter Controls */}
      <div id='search-filters'>
        <SearchAndFilter
          filters={{
            searchTerm: searchQuery,
            category: filterCategory,
            completed: filterCompleted,
            sortBy: sortBy === 'dateAdded' ? 'createdAt' : sortBy,
            sortOrder: sortOrder,
          }}
          onFiltersChange={newFilters => {
            if (newFilters.searchTerm !== undefined)
              setSearchQuery(newFilters.searchTerm);
            if (newFilters.category !== undefined)
              setFilterCategory(newFilters.category);
            if (newFilters.completed !== undefined)
              setFilterCompleted(newFilters.completed);
            if (newFilters.sortBy !== undefined)
              setSortBy(
                newFilters.sortBy === 'createdAt'
                  ? 'dateAdded'
                  : newFilters.sortBy
              );
            if (newFilters.sortOrder !== undefined)
              setSortOrder(newFilters.sortOrder);
          }}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* List Header with Statistics */}
      <header className={styles.listHeader} role='banner'>
        <div className={styles.listStats}>
          <span
            className={styles.statsText}
            aria-live='polite'
            aria-atomic='true'
          >
            {completedItems} of {totalItems} items completed
          </span>
          <div
            className={styles.progressBar}
            role='progressbar'
            aria-valuenow={completionPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Shopping list completion progress: ${completionPercentage}%`}
          >
            <div
              className={styles.progressFill}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className={styles.progressPercent} aria-hidden='true'>
            {completionPercentage}%
          </span>
        </div>
      </header>

      {/* Items */}
      <main
        id='main-content'
        className={styles.itemsContainer}
        role='region'
        aria-label='Shopping items'
      >
        {groupByCategory ? (
          // Render grouped by category
          Object.entries(groupedItems).map(
            ([category, items]) =>
              items.length > 0 && (
                <section
                  key={category}
                  className={styles.categoryGroup}
                  role='group'
                  aria-labelledby={`category-${category}`}
                >
                  <header
                    className={styles.categoryHeader}
                    id={`category-${category}`}
                  >
                    <CategoryBadge
                      category={category as ItemCategory}
                      size='medium'
                    />
                    <span
                      className={styles.categoryCount}
                      aria-label={`${items.filter(item => !item.completed).length} incomplete out of ${items.length} total items`}
                    >
                      {items.filter(item => !item.completed).length} of{' '}
                      {items.length} items
                    </span>
                  </header>
                  <ul
                    className={styles.categoryItems}
                    role='list'
                    aria-label={`Items in ${category} category`}
                  >
                    {items.map((item, index) => (
                      <li
                        key={item.id}
                        data-item-index={index}
                        data-item-id={item.id}
                      >
                        <ItemRow
                          item={item}
                          isEditing={editingItemId === item.id}
                          onToggle={handleToggle}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onSave={handleSave}
                          onCancel={handleCancelEdit}
                          onDuplicate={handleDuplicate}
                        />
                      </li>
                    ))}
                  </ul>
                </section>
              )
          )
        ) : (
          // Render as flat list
          <ul
            className={styles.flatList}
            role='list'
            aria-label='Shopping list items'
          >
            {filteredItems.map((item, index) => (
              <li key={item.id} data-item-index={index} data-item-id={item.id}>
                <ItemRow
                  item={item}
                  isEditing={editingItemId === item.id}
                  onToggle={handleToggle}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onSave={handleSave}
                  onCancel={handleCancelEdit}
                  onDuplicate={handleDuplicate}
                />
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Undo Notification */}
      <UndoNotification
        isVisible={!!pendingOperation}
        message={
          pendingOperation?.type === 'DELETE_ITEM'
            ? `Deleted "${pendingOperation.data.item.name}"`
            : ''
        }
        onUndo={handleUndo}
        onDismiss={dismissUndo}
      />
    </div>
  );
}
