'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useShoppingContext } from '@/contexts/ShoppingContext';
import { ShoppingList } from '@/types/shopping';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './ShoppingListSelector.module.scss';

export interface ShoppingListSelectorProps {
  className?: string;
}

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  listName: string;
}

function CreateListModal({ isOpen, onClose, onSubmit }: CreateListModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Removed competing focus management - Modal handles initial focus via initialFocus prop
  // useEffect(() => {
  //   if (isOpen && inputRef.current) {
  //     const timer = setTimeout(() => {
  //       if (inputRef.current) {
  //         inputRef.current.focus();
  //       }
  //     }, 150);
  //     return () => clearTimeout(timer);
  //   }
  // }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('List name is required');
      return;
    }

    if (trimmedName.length < 2) {
      setError('List name must be at least 2 characters');
      return;
    }

    if (trimmedName.length > 50) {
      setError('List name must be less than 50 characters');
      return;
    }

    onSubmit(trimmedName);
    setName('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title='Create New Shopping List'
      initialFocus='#create-list-name-input'
    >
      <form onSubmit={handleSubmit} className={styles.createForm}>
        <Input
          ref={inputRef}
          id='create-list-name-input'
          label='List Name'
          value={name}
          onChange={value => {
            setName(value);
            if (error) setError('');
          }}
          error={error}
          placeholder='e.g., Weekly Groceries, Party Supplies'
          maxLength={50}
          required
          autoFocus
        />
        <div className={styles.createFormActions}>
          <Button type='button' variant='secondary' onClick={handleClose}>
            Cancel
          </Button>
          <Button type='submit' variant='primary'>
            Create List
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  listName,
}: DeleteConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Delete Shopping List'>
      <div className={styles.deleteConfirm}>
        <p className={styles.deleteMessage}>
          Are you sure you want to delete{' '}
          <strong>&ldquo;{listName}&rdquo;</strong>?
        </p>
        <p className={styles.deleteWarning}>
          This action cannot be undone. All items in this list will be
          permanently removed.
        </p>
        <div className={styles.deleteActions}>
          <Button type='button' variant='secondary' onClick={onClose}>
            Cancel
          </Button>
          <Button type='button' variant='delete' onClick={onConfirm}>
            Delete List
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ShoppingListSelector({ className }: ShoppingListSelectorProps) {
  const { state, dispatch } = useShoppingContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteModalListId, setDeleteModalListId] = useState<string | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get current active list
  const activeList = state.lists.find(list => list.id === state.activeListId);
  const deleteModalList = state.lists.find(
    list => list.id === deleteModalListId
  );

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isDropdownOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsDropdownOpen(false);
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          // Focus management would go here for full accessibility
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen]);

  // Calculate statistics for a list
  const getListStats = (list: ShoppingList) => {
    const totalItems = list.items.length;
    const completedItems = list.items.filter(item => item.completed).length;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return { totalItems, completedItems, completionPercentage };
  };

  // Handle list selection
  const handleSelectList = (listId: string) => {
    dispatch({ type: 'SET_ACTIVE_LIST', payload: listId });
    setIsDropdownOpen(false);
  };

  // Handle creating new list
  const handleCreateList = (name: string) => {
    dispatch({
      type: 'ADD_LIST',
      payload: {
        name,
        description: `Created on ${new Date().toLocaleDateString()}`,
        items: [],
        isActive: false,
        archived: false,
      },
    });
  };

  // Handle deleting list
  const handleDeleteList = () => {
    if (deleteModalListId) {
      dispatch({ type: 'DELETE_LIST', payload: deleteModalListId });
      setDeleteModalListId(null);
    }
  };

  const combinedClassName = `${styles.selector} ${className || ''}`.trim();

  return (
    <>
      <div className={combinedClassName} ref={dropdownRef}>
        <button
          className={styles.selectorButton}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          aria-expanded={isDropdownOpen}
          aria-haspopup='listbox'
          type='button'
        >
          <div className={styles.selectorContent}>
            <span className={styles.selectorTitle}>
              {activeList ? activeList.name : 'Select Shopping List'}
            </span>
            {activeList && (
              <span className={styles.selectorStats}>
                {(() => {
                  const stats = getListStats(activeList);
                  return `${stats.completedItems}/${stats.totalItems} items • ${stats.completionPercentage}% complete`;
                })()}
              </span>
            )}
          </div>
          <svg
            className={`${styles.selectorIcon} ${isDropdownOpen ? styles.selectorIconOpen : ''}`}
            width='20'
            height='20'
            viewBox='0 0 20 20'
            fill='currentColor'
          >
            <path
              fillRule='evenodd'
              d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
              clipRule='evenodd'
            />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className={styles.dropdown} role='listbox'>
            <div className={styles.dropdownHeader}>
              {activeList && (
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => {
                    dispatch({ type: 'SET_ACTIVE_LIST', payload: null });
                    setIsDropdownOpen(false);
                  }}
                  className={styles.homeButton}
                >
                  🏠 Home
                </Button>
              )}
              <Button
                variant='add'
                size='sm'
                onClick={() => {
                  setIsCreateModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className={styles.createButton}
              >
                + New List
              </Button>
            </div>

            <div className={styles.dropdownList}>
              {state.lists.length === 0 ? (
                <div className={styles.dropdownEmpty}>
                  No shopping lists yet. Create your first list!
                </div>
              ) : (
                state.lists.map(list => {
                  const stats = getListStats(list);
                  const isActive = list.id === state.activeListId;

                  return (
                    <div
                      key={list.id}
                      className={`${styles.dropdownItem} ${isActive ? styles.dropdownItemActive : ''}`}
                      role='option'
                      aria-selected={isActive}
                    >
                      <button
                        className={styles.dropdownItemButton}
                        onClick={() => handleSelectList(list.id)}
                        type='button'
                      >
                        <div className={styles.dropdownItemContent}>
                          <span className={styles.dropdownItemName}>
                            {list.name}
                          </span>
                          <span className={styles.dropdownItemStats}>
                            {stats.totalItems} items •{' '}
                            {stats.completionPercentage}% complete
                          </span>
                        </div>
                      </button>

                      {state.lists.length > 1 && (
                        <button
                          className={styles.dropdownItemDelete}
                          onClick={e => {
                            e.stopPropagation();
                            setDeleteModalListId(list.id);
                            setIsDropdownOpen(false);
                          }}
                          aria-label={`Delete ${list.name}`}
                          type='button'
                        >
                          <svg
                            width='16'
                            height='16'
                            viewBox='0 0 16 16'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.575l.66-6.6a.75.75 0 00-1.492-.15L10.844 13.5a.25.25 0 01-.249.225H5.405a.25.25 0 01-.249-.225L4.496 6.675z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create List Modal */}
      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateList}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalListId !== null}
        onClose={() => setDeleteModalListId(null)}
        onConfirm={handleDeleteList}
        listName={deleteModalList?.name || ''}
      />
    </>
  );
}
