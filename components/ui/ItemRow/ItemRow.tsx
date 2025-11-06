'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShoppingItem, ItemCategory } from '@/types/shopping';
import { CategoryBadge } from '@/components/ui/CategoryBadge/CategoryBadge';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { useDebounce } from '@/hooks/useDebounce';

import { useSwipeGestures } from '@/hooks/useSwipeGestures';
import { useLongPress } from '@/hooks/useLongPress';
import styles from './ItemRow.module.scss';

export interface ItemRowProps {
  item: ShoppingItem;
  isEditing?: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, showUndo?: boolean) => void;
  onSave: (id: string, updates: Partial<ShoppingItem>) => void;
  onCancel: () => void;
  onDuplicate?: (id: string) => void;
  className?: string;
}

interface EditingState {
  name: string;
  quantity: number;
  unit: string;
  category: ItemCategory;
  notes: string;
}

const CATEGORY_OPTIONS = [
  { value: ItemCategory.PRODUCE, label: 'Produce' },
  { value: ItemCategory.DAIRY, label: 'Dairy' },
  { value: ItemCategory.MEAT, label: 'Meat & Seafood' },
  { value: ItemCategory.PANTRY, label: 'Pantry' },
  { value: ItemCategory.FROZEN, label: 'Frozen' },
  { value: ItemCategory.BAKERY, label: 'Bakery' },
  { value: ItemCategory.BEVERAGES, label: 'Beverages' },
  { value: ItemCategory.SNACKS, label: 'Snacks' },
  { value: ItemCategory.HEALTH, label: 'Health & Beauty' },
  { value: ItemCategory.HOUSEHOLD, label: 'Household' },
  { value: ItemCategory.OTHER, label: 'Other' },
];

export function ItemRow({
  item,
  isEditing = false,
  onToggle,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  onDuplicate,
  className,
}: ItemRowProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  // Initialize editing state from item
  const getEditingState = (): EditingState => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit || 'pcs',
    category: item.category,
    notes: item.notes || '',
  });

  const [editingState, setEditingState] =
    useState<EditingState>(getEditingState());

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Debounced auto-save
  const debouncedSave = useDebounce(() => {
    if (isEditing) {
      const updates: Partial<ShoppingItem> = {
        name: editingState.name,
        quantity: editingState.quantity,
        unit: editingState.unit,
        category: editingState.category,
        notes: editingState.notes,
      };
      onSave(item.id, updates);
    }
  }, 1000);

  // Focus name input when entering edit mode
  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleFieldChange = useCallback(
    (field: keyof EditingState, value: string | number | ItemCategory) => {
      setEditingState(prev => {
        const updated = { ...prev, [field]: value };
        return updated;
      });
      debouncedSave();
    },
    [debouncedSave]
  );

  const handleToggle = () => {
    onToggle(item.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(item.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id, true); // Request undo functionality
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(item.id);
    }
  };

  const handleSave = () => {
    const updates: Partial<ShoppingItem> = {
      name: editingState.name,
      quantity: editingState.quantity,
      unit: editingState.unit,
      category: editingState.category,
      notes: editingState.notes,
    };
    onSave(item.id, updates);
    onCancel(); // Exit edit mode
  };

  const handleCancel = () => {
    setEditingState(getEditingState());
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  // Mobile gesture support with improved touch handling
  const swipeGestures = useSwipeGestures(
    gesture => {
      if (gesture.direction === 'right') {
        // Swipe right to complete/uncomplete
        handleToggle();
      } else if (gesture.direction === 'left') {
        // Swipe left to delete with undo
        const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
        handleDelete(fakeEvent);
      }
    },
    {
      threshold: 60,
      velocity: 0.4,
    }
  );

  // Long press for edit mode with reduced threshold for better mobile response
  const longPressGestures = useLongPress(
    () => {
      if (!isEditing) {
        const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
        handleEdit(fakeEvent);
      }
    },
    {
      threshold: 500, // Reduced from 600ms for better responsiveness
      onStart: () => {},
      onCancel: () => {},
    }
  );

  const itemClasses = [
    styles.itemRow,
    item.completed && styles.itemCompleted,
    isEditing && styles.itemEditing,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isEditing) {
    return (
      <div className={itemClasses} onKeyDown={handleKeyDown}>
        {/* Checkbox/Toggle */}
        <button
          className={styles.itemToggle}
          onClick={handleToggle}
          aria-label={`Mark ${item.name} as ${item.completed ? 'incomplete' : 'complete'}`}
          type='button'
        >
          <div
            className={`${styles.checkbox} ${item.completed ? styles.checkboxChecked : ''}`}
          >
            {item.completed && (
              <svg
                width='16'
                height='16'
                viewBox='0 0 16 16'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'
                  clipRule='evenodd'
                />
              </svg>
            )}
          </div>
        </button>

        {/* Editing Form */}
        <div className={styles.itemContent}>
          <div className={styles.editingFields}>
            {/* Name Field */}
            <div className={styles.fieldGroup}>
              <Input
                ref={nameInputRef}
                value={editingState.name}
                onChange={value => handleFieldChange('name', value)}
                placeholder='Item name'
                className={styles.nameField}
                maxLength={100}
                required
              />
            </div>

            {/* Quantity and Unit */}
            <div className={styles.fieldRow}>
              <div className={styles.quantityField}>
                <Input
                  type='number'
                  value={editingState.quantity.toString()}
                  onChange={value =>
                    handleFieldChange('quantity', parseInt(value) || 1)
                  }
                  placeholder='Qty'
                  min='1'
                  className={styles.quantityInput}
                />
              </div>
              <div className={styles.unitField}>
                <Input
                  value={editingState.unit}
                  onChange={value => handleFieldChange('unit', value)}
                  placeholder='Unit'
                  maxLength={10}
                  className={styles.unitInput}
                />
              </div>
            </div>

            {/* Category */}
            <div className={styles.fieldGroup}>
              <Select
                value={editingState.category}
                onChange={value =>
                  handleFieldChange('category', value as ItemCategory)
                }
                options={CATEGORY_OPTIONS}
                placeholder='Select category'
                className={styles.categoryField}
              />
            </div>

            {/* Notes */}
            <div className={styles.fieldGroup}>
              <Input
                value={editingState.notes}
                onChange={value => handleFieldChange('notes', value)}
                placeholder='Notes (optional)'
                maxLength={200}
                className={styles.notesField}
              />
            </div>
          </div>

          {/* Edit Actions */}
          <div className={styles.editActions}>
            <button
              type='button'
              className={styles.saveButton}
              onClick={handleSave}
              disabled={!editingState.name.trim()}
            >
              Save
            </button>
            <button
              type='button'
              className={styles.cancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className={styles.shortcutsHint}>
            <span>Ctrl+Enter to save • Esc to cancel</span>
          </div>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div
      ref={itemRef}
      className={`${itemClasses} ${swipeGestures.isSwipeActive ? styles.swiping : ''}`}
      onMouseLeave={e => {
        longPressGestures.onMouseLeave(e);
      }}
      onClick={e => {
        // Only handle click if it's not on a button or interactive element
        if (
          e.target === e.currentTarget ||
          (e.target as Element).closest(`.${styles.itemContent}`)
        ) {
          handleToggle();
        }
      }}
      onMouseDown={longPressGestures.onMouseDown}
      onMouseUp={longPressGestures.onMouseUp}
      onTouchStart={e => {
        // Don't interfere with button touches
        if ((e.target as Element).closest('button')) {
          return;
        }
        swipeGestures.onTouchStart(e);
        longPressGestures.onTouchStart(e);
      }}
      onTouchMove={e => {
        // Don't interfere with button touches
        if ((e.target as Element).closest('button')) {
          return;
        }
        swipeGestures.onTouchMove(e);
        longPressGestures.onTouchMove(e);
      }}
      onTouchEnd={e => {
        // Don't interfere with button touches
        if ((e.target as Element).closest('button')) {
          return;
        }
        swipeGestures.onTouchEnd(e);
        longPressGestures.onTouchEnd(e);
      }}
      onTouchCancel={e => {
        // Don't interfere with button touches
        if ((e.target as Element).closest('button')) {
          return;
        }
        longPressGestures.onTouchCancel(e);
      }}
    >
      {/* Checkbox/Toggle */}
      <button
        className={styles.itemToggle}
        onClick={e => {
          e.stopPropagation();
          handleToggle();
        }}
        onTouchEnd={e => {
          e.stopPropagation();
        }}
        aria-label={`Mark ${item.name} as ${item.completed ? 'incomplete' : 'complete'}`}
        type='button'
      >
        <div
          className={`${styles.checkbox} ${item.completed ? styles.checkboxChecked : ''}`}
        >
          {item.completed && (
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z'
                clipRule='evenodd'
              />
            </svg>
          )}
        </div>
      </button>

      {/* Item Content */}
      <div className={styles.itemContent}>
        <div className={styles.itemMain}>
          <span className={styles.itemName}>{item.name}</span>
          <div className={styles.itemMeta}>
            <span className={styles.itemQuantity}>
              {item.quantity} {item.unit}
            </span>
          </div>
        </div>

        {item.notes && <div className={styles.itemNotes}>{item.notes}</div>}
      </div>

      {/* Category Badge */}
      <div className={styles.itemCategory}>
        <CategoryBadge category={item.category} size='small' />
      </div>

      {/* Actions */}
      <div className={styles.itemActions}>
        <button
          className={styles.actionButton}
          onClick={e => {
            e.stopPropagation();
            handleEdit(e);
          }}
          onTouchEnd={e => {
            e.stopPropagation();
          }}
          aria-label={`Edit ${item.name}`}
          type='button'
        >
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <path d='M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L8.5 11.207 6 12l.793-2.5L12.146.146zM11.207 2L2 11.207 2.5 13l1.793-.5L13.207 3.5 11.207 2z' />
          </svg>
        </button>

        {onDuplicate && (
          <button
            className={styles.actionButton}
            onClick={e => {
              e.stopPropagation();
              handleDuplicate(e);
            }}
            onTouchEnd={e => {
              e.stopPropagation();
            }}
            aria-label={`Duplicate ${item.name}`}
            type='button'
          >
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        )}

        <button
          className={`${styles.actionButton} ${styles.deleteButton}`}
          onClick={e => {
            e.stopPropagation();
            handleDelete(e);
          }}
          onTouchEnd={e => {
            e.stopPropagation();
          }}
          aria-label={`Delete ${item.name}`}
          type='button'
        >
          <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.575l.66-6.6a.75.75 0 00-1.492-.15L10.844 13.5a.25.25 0 01-.249.225H5.405a.25.25 0 01-.249-.225L4.496 6.675z'
              clipRule='evenodd'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
