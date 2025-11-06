import React, { forwardRef, useId } from 'react';

import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      value,
      onChange,
      placeholder,
      error,
      required = false,
      disabled = false,
      fullWidth = false,
      id,
      name,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      className = '',
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const finalAriaDescribedBy = error
      ? [ariaDescribedBy, errorId].filter(Boolean).join(' ')
      : ariaDescribedBy;

    const wrapperClasses = [
      styles['select-wrapper'],
      fullWidth && styles['full-width'],
      error && styles['has-error'],
      disabled && styles['is-disabled'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const selectClasses = [
      styles.select,
      error && styles.error,
      fullWidth && styles['full-width'],
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(event.target.value);
    };

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={selectId}
            className={`${styles.label} ${required ? styles.required : ''}`}
          >
            {label}
          </label>
        )}
        <div className={styles['select-container']}>
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={finalAriaDescribedBy}
            aria-invalid={error ? 'true' : 'false'}
            className={selectClasses}
          >
            {placeholder && (
              <option value='' disabled>
                {placeholder}
              </option>
            )}
            {options.map(option => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className={styles['select-icon']} aria-hidden='true'>
            <svg
              width='20'
              height='20'
              viewBox='0 0 20 20'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M5 8L10 13L15 8'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </div>
        </div>
        {error && (
          <span id={errorId} className={styles['error-message']} role='alert'>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
