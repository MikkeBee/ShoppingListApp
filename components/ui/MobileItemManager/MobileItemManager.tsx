'use client';

import React, { useState } from 'react';
import { useShoppingContext } from '@/contexts/ShoppingContext';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton/FloatingActionButton';
import { BottomSheet } from '@/components/ui/BottomSheet/BottomSheet';
import { AddItemForm } from '@/components/ui/AddItemForm/AddItemForm';
// Simple Plus icon component
const PlusIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
  >
    <path d='M12 5v14M5 12h14' />
  </svg>
);
import styles from './MobileItemManager.module.scss';

export interface MobileItemManagerProps {
  className?: string;
}

export function MobileItemManager({ className }: MobileItemManagerProps) {
  const { state } = useShoppingContext();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeList = state.activeListId
    ? state.lists.find(list => list.id === state.activeListId)
    : null;

  // Don't show FAB if no active list
  if (!activeList) {
    return null;
  }

  const handleFABClick = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
  };

  const handleFormSubmit = () => {
    // Keep form open for quick adding of multiple items
    // User can swipe down to close when done
  };

  return (
    <div className={className}>
      {/* Floating Action Button */}
      <FloatingActionButton
        icon={<PlusIcon size={24} />}
        label='Add Item'
        onClick={handleFABClick}
        size='large'
        variant='primary'
        className={styles.fab}
      />

      {/* Bottom Sheet with Add Item Form */}
      <BottomSheet
        isOpen={isFormOpen}
        onClose={handleFormClose}
        height='full'
        title={`Add to ${activeList.name}`}
        className={styles.bottomSheet}
      >
        <div className={styles.formContainer}>
          <AddItemForm
            onSubmit={handleFormSubmit}
            autoFocus={true}
            className={styles.mobileForm}
          />

          <div className={styles.formHint}>
            <p>Swipe down or tap outside to close</p>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
