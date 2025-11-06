'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useShoppingContext } from '@/contexts/ShoppingContext';
import { ItemCategory } from '@/types/shopping';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import { CategoryBadge } from '@/components/ui/CategoryBadge/CategoryBadge';
import { CATEGORY_CONFIG, suggestCategory } from '@/utils/categories';
import styles from './AddItemForm.module.scss';

export interface AddItemFormProps {
  className?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
}

interface FormData {
  name: string;
  quantity: string;
  category: ItemCategory;
  notes: string;
}

interface FormErrors {
  name?: string;
  quantity?: string;
  category?: string;
}

export function AddItemForm({
  className,
  onSubmit,
  autoFocus = false,
}: AddItemFormProps) {
  const { state, dispatch } = useShoppingContext();
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    quantity: '1',
    category: ItemCategory.OTHER,
    notes: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [suggestions, setSuggestions] = useState<ItemCategory[]>([]);

  // Get current active list
  const activeList = state.lists.find(list => list.id === state.activeListId);

  // Focus on name input when component mounts or autoFocus changes
  useEffect(() => {
    if (autoFocus && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [autoFocus]);

  // Update category suggestions based on item name
  useEffect(() => {
    if (formData.name.trim().length > 2) {
      const suggested = suggestCategory(formData.name);
      setSuggestions(suggested ? [suggested] : []);

      // Auto-suggest category if we have a strong match and current category is OTHER
      if (suggested && formData.category === ItemCategory.OTHER) {
        setFormData(prev => ({ ...prev, category: suggested }));
      }
    } else {
      setSuggestions([]);
    }
  }, [formData.name, formData.category]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'Item name is required';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Item name must be at least 2 characters';
    } else if (trimmedName.length > 100) {
      newErrors.name = 'Item name must be less than 100 characters';
    }

    // Check for duplicate items in active list
    if (activeList && trimmedName) {
      const duplicate = activeList.items.find(
        item => item.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicate) {
        newErrors.name = 'This item is already in your list';
      }
    }

    // Quantity validation
    const quantity = formData.quantity.trim();
    if (!quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (
      quantity !== '1' &&
      !/^\d+(\.\d{1,2})?(\s*(kg|g|lb|oz|ml|l|pcs?|units?|boxes?|bags?|cans?))?$/i.test(
        quantity
      )
    ) {
      newErrors.quantity =
        'Enter a number or quantity like "2 kg", "500g", "3 cans"';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeList) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the item
      const newItem = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity) || 1, // Parse quantity or default to 1
        unit: 'pcs', // Default unit
        category: formData.category,
        notes: formData.notes.trim(),
        completed: false,
        estimatedPrice: undefined,
      };

      // Dispatch add item action
      dispatch({
        type: 'ADD_ITEM',
        payload: {
          listId: activeList.id,
          item: newItem,
        },
      });

      // Reset form
      setFormData({
        name: '',
        quantity: '1',
        category: ItemCategory.OTHER,
        notes: '',
      });

      setErrors({});
      setSuggestions([]);

      // Focus back on name input
      if (nameInputRef.current) {
        nameInputRef.current.focus();
      }

      // Show success message
      setSuccessMessage(`Added "${newItem.name}" to ${activeList.name}`);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

      // Call onSubmit callback if provided
      onSubmit?.();
    } catch {
      setErrors({ name: 'Failed to add item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (validateForm()) {
        const form = e.currentTarget.closest('form');
        if (form) {
          const submitEvent = new Event('submit', {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(submitEvent);
        }
      }
    } else if (e.key === 'Escape') {
      // Clear form
      setFormData({
        name: '',
        quantity: '1',
        category: ItemCategory.OTHER,
        notes: '',
      });
      setErrors({});
    }
  };

  // Generate category options for Select component
  const categoryOptions = Object.values(ItemCategory).map(category => ({
    value: category,
    label: CATEGORY_CONFIG[category]?.name || category,
  }));

  const combinedClassName = `${styles.form} ${className || ''}`.trim();

  if (!activeList) {
    return (
      <div className={styles.noList}>
        <p>Please select or create a shopping list to add items.</p>
      </div>
    );
  }

  return (
    <form
      className={combinedClassName}
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.formHeader}>
        <h2 className={styles.formTitle}>Add Item to {activeList.name}</h2>
      </div>

      <div className={styles.formFields}>
        {/* Item Name Input */}
        <div className={styles.fieldGroup}>
          <Input
            ref={nameInputRef}
            label='Item Name'
            value={formData.name}
            onChange={value => handleChange('name', value)}
            error={errors.name}
            placeholder='e.g., Milk, Bananas, Chicken breast'
            maxLength={100}
            required
            autoComplete='off'
          />

          {/* Category suggestions */}
          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <span className={styles.suggestionsLabel}>Suggested:</span>
              {suggestions.map(category => (
                <button
                  key={category}
                  type='button'
                  className={styles.suggestionButton}
                  onClick={() => handleChange('category', category)}
                >
                  <CategoryBadge category={category} size='small' />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity and Category Row */}
        <div className={styles.fieldRow}>
          <div className={styles.fieldGroup}>
            <Input
              label='Quantity'
              value={formData.quantity}
              onChange={value => handleChange('quantity', value)}
              error={errors.quantity}
              placeholder='e.g., 2, 500g, 1 bottle'
              maxLength={20}
            />
          </div>

          <div className={styles.fieldGroup}>
            <CustomSelect
              label='Category'
              value={formData.category}
              onChange={value => handleChange('category', value)}
              options={categoryOptions}
            />
          </div>
        </div>

        {/* Notes Row */}
        <div className={styles.fieldGroup}>
          <Input
            label='Notes (Optional)'
            value={formData.notes}
            onChange={value => handleChange('notes', value)}
            placeholder='Brand, size, special instructions...'
            maxLength={200}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <Button
          type='button'
          variant='secondary'
          onClick={() => {
            setFormData({
              name: '',
              quantity: '1',
              category: ItemCategory.OTHER,
              notes: '',
            });
            setErrors({});
            if (nameInputRef.current) {
              nameInputRef.current.focus();
            }
          }}
          disabled={isSubmitting}
        >
          Clear
        </Button>

        <Button
          type='submit'
          variant='add'
          loading={isSubmitting}
          disabled={isSubmitting || !formData.name.trim()}
        >
          {isSubmitting ? 'Adding...' : 'Add Item'}
        </Button>
      </div>

      {/* Success message */}
      {successMessage && (
        <div className={styles.successMessage}>
          <span className={styles.successText}>✓ {successMessage}</span>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div className={styles.shortcuts}>
        <span className={styles.shortcutText}>
          Press <kbd>Ctrl+Enter</kbd> to add • <kbd>Esc</kbd> to clear
        </span>
      </div>
    </form>
  );
}
