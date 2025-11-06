'use client';

import React from 'react';
import { useShoppingContext } from '@/contexts/ShoppingContext';
import { ShoppingList } from '@/types/shopping';
// Simple date formatting utility
const formatTimeAgo = (date: Date) => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString();
};
import styles from './ShoppingListGrid.module.scss';

export interface ShoppingListGridProps {
  className?: string;
}

export function ShoppingListGrid({ className }: ShoppingListGridProps) {
  const { state, dispatch } = useShoppingContext();

  const handleSelectList = (listId: string) => {
    dispatch({
      type: 'SET_ACTIVE_LIST',
      payload: listId,
    });
  };

  const getListStats = (list: ShoppingList) => {
    const totalItems = list.items.length;
    const completedItems = list.items.filter(item => item.completed).length;
    const pendingItems = totalItems - completedItems;
    return { totalItems, completedItems, pendingItems };
  };

  const formatLastUpdated = (date: Date) => {
    return formatTimeAgo(date);
  };

  if (state.lists.length === 0) {
    return (
      <div className={`${styles.emptyState} ${className || ''}`}>
        <div className={styles.emptyIcon}>📝</div>
        <h3 className={styles.emptyTitle}>No Shopping Lists</h3>
        <p className={styles.emptyDescription}>
          Create your first shopping list using the selector in the header
          above!
        </p>
      </div>
    );
  }

  return (
    <div className={`${styles.gridContainer} ${className || ''}`}>
      <div className={styles.gridHeader}>
        <h2 className={styles.gridTitle}>Your Shopping Lists</h2>
        <p className={styles.gridSubtitle}>Select a list to get started</p>
      </div>

      <div className={styles.grid}>
        {state.lists
          .filter(list => !list.archived)
          .sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .map(list => {
            const stats = getListStats(list);
            return (
              <button
                key={list.id}
                className={styles.listCard}
                onClick={() => handleSelectList(list.id)}
                type='button'
              >
                <div className={styles.listHeader}>
                  <h3 className={styles.listName}>{list.name}</h3>
                  <div className={styles.listDate}>
                    {formatLastUpdated(list.updatedAt)}
                  </div>
                </div>

                <div className={styles.listStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>
                      {stats.totalItems}
                    </span>
                    <span className={styles.statLabel}>items</span>
                  </div>

                  {stats.pendingItems > 0 && (
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>
                        {stats.pendingItems}
                      </span>
                      <span className={styles.statLabel}>pending</span>
                    </div>
                  )}

                  {stats.completedItems > 0 && (
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>
                        {stats.completedItems}
                      </span>
                      <span className={styles.statLabel}>done</span>
                    </div>
                  )}
                </div>

                {stats.totalItems > 0 && (
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(stats.completedItems / stats.totalItems) * 100}%`,
                      }}
                    />
                  </div>
                )}

                {list.description && (
                  <p className={styles.listDescription}>{list.description}</p>
                )}
              </button>
            );
          })}
      </div>
    </div>
  );
}
