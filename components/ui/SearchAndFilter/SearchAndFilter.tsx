'use client';

import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/Input/Input';
import { CustomSelect } from '@/components/ui/CustomSelect/CustomSelect';
import { Button } from '@/components/ui/Button/Button';
import { ItemCategory } from '@/types/shopping';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './SearchAndFilter.module.scss';

export interface FilterState {
  searchTerm: string;
  category: ItemCategory | 'all';
  completed: 'all' | 'completed' | 'incomplete';
  sortBy: 'name' | 'category' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface SearchAndFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  onClearFilters: () => void;
  className?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
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

const COMPLETION_OPTIONS = [
  { value: 'all', label: 'All Items' },
  { value: 'incomplete', label: 'To Buy' },
  { value: 'completed', label: 'Completed' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'category', label: 'Category' },
  { value: 'priority', label: 'Priority' },
  { value: 'createdAt', label: 'Date Added' },
];

export function SearchAndFilter({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: SearchAndFilterProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(filters.searchTerm);
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced search to avoid excessive updates
  const debouncedSearch = useDebounce((searchTerm: string) => {
    onFiltersChange({ searchTerm });
  }, 300);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearchTerm(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleFilterChange = useCallback(
    (key: keyof FilterState, value: string) => {
      onFiltersChange({ [key]: value });
    },
    [onFiltersChange]
  );

  const toggleSortOrder = useCallback(() => {
    const newOrder = filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFiltersChange({ sortOrder: newOrder });
  }, [filters.sortOrder, onFiltersChange]);

  const hasActiveFilters =
    filters.searchTerm !== '' ||
    filters.category !== 'all' ||
    filters.completed !== 'all';

  const combinedClassName = [
    styles.searchAndFilter,
    isExpanded && styles.expanded,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={combinedClassName}>
      {/* Search Bar */}
      <div className={styles.searchSection}>
        <div className={styles.searchInput}>
          <Input
            value={localSearchTerm}
            onChange={handleSearchChange}
            placeholder='Search items...'
            className={styles.searchField}
          />
          <button
            type='button'
            className={styles.searchIcon}
            aria-label='Search'
          >
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>

        <div className={styles.searchActions}>
          <button
            type='button'
            className={`${styles.filterToggle} ${isExpanded ? styles.active : ''}`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label='Toggle filters'
          >
            <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
              <path d='M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z' />
            </svg>
            {hasActiveFilters && <span className={styles.filterBadge} />}
          </button>

          {hasActiveFilters && (
            <Button
              variant='secondary'
              size='sm'
              onClick={onClearFilters}
              className={styles.clearButton}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className={styles.filtersSection}>
          <div className={styles.filtersGrid}>
            {/* Category Filter */}
            <div className={styles.filterGroup}>
              <CustomSelect
                label='Category'
                value={filters.category}
                onChange={value => handleFilterChange('category', value)}
                options={CATEGORY_OPTIONS}
                placeholder='All Categories'
                className={styles.filterSelect}
              />
            </div>

            {/* Completion Filter */}
            <div className={styles.filterGroup}>
              <CustomSelect
                label='Status'
                value={filters.completed}
                onChange={value => handleFilterChange('completed', value)}
                options={COMPLETION_OPTIONS}
                placeholder='All Items'
                className={styles.filterSelect}
              />
            </div>

            {/* Sort Options */}
            <div className={styles.filterGroup}>
              <div className={styles.sortControls}>
                <CustomSelect
                  label='Sort By'
                  value={filters.sortBy}
                  onChange={value => handleFilterChange('sortBy', value)}
                  options={SORT_OPTIONS}
                  className={styles.sortSelect}
                />
                <button
                  type='button'
                  className={styles.sortOrder}
                  onClick={toggleSortOrder}
                  aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                >
                  <svg
                    width='16'
                    height='16'
                    viewBox='0 0 16 16'
                    fill='currentColor'
                  >
                    {filters.sortOrder === 'asc' ? (
                      <path d='m7.247 4.86-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z' />
                    ) : (
                      <path d='m7.247 11.14 4.796-5.481c.566-.647.106-1.659-.753-1.659H2.698a1 1 0 0 0-.753 1.659l4.796 5.48a1 1 0 0 0 1.506 0z' />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
