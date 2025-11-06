'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SelectOption } from '../Select/Select';
import styles from './CustomSelect.module.scss';

export interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export function CustomSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  fullWidth = false,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find selected option
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption
    ? selectedOption.label
    : placeholder || 'Select option...';

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          break;
        case 'ArrowDown':
        case 'ArrowUp':
          event.preventDefault();
          // Focus first/last option or implement navigation
          break;
        case 'Enter':
          event.preventDefault();
          break;
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const wrapperClasses = [
    styles.selectWrapper,
    fullWidth && styles.fullWidth,
    error && styles.hasError,
    disabled && styles.isDisabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className={`${styles.label} ${required ? styles.required : ''}`}>
          {label}
        </label>
      )}

      <div ref={selectRef} className={styles.selectContainer}>
        <button
          type='button'
          className={`${styles.selectButton} ${isOpen ? styles.open : ''} ${error ? styles.error : ''}`}
          onClick={handleToggle}
          disabled={disabled}
          aria-haspopup='listbox'
          aria-expanded={isOpen}
        >
          <span
            className={`${styles.selectValue} ${!selectedOption ? styles.placeholder : ''}`}
          >
            {displayValue}
          </span>
          <div
            className={`${styles.selectIcon} ${isOpen ? styles.iconOpen : ''}`}
          >
            <svg width='20' height='20' viewBox='0 0 20 20' fill='currentColor'>
              <path
                fillRule='evenodd'
                d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </button>

        {isOpen && (
          <div ref={dropdownRef} className={styles.dropdown} role='listbox'>
            {options.map(option => (
              <button
                key={option.value}
                type='button'
                className={`${styles.option} ${option.value === value ? styles.optionSelected : ''} ${option.disabled ? styles.optionDisabled : ''}`}
                onClick={() => !option.disabled && handleSelect(option.value)}
                disabled={option.disabled}
                role='option'
                aria-selected={option.value === value}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <span className={styles.errorMessage} role='alert'>
          {error}
        </span>
      )}
    </div>
  );
}
