import React, { forwardRef, useId } from 'react';

import styles from './Input.module.scss';

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'tel' | 'search';
  error?: string;
  required?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      type = 'text',
      error,
      required = false,
      disabled = false,
      fullWidth = false,
      autoComplete,
      autoFocus = false,
      maxLength,
      min,
      max,
      step,
      id,
      name,
      'aria-label': ariaLabel,
      'aria-describedby': ariaDescribedBy,
      className = '',
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const finalAriaDescribedBy = error
      ? [ariaDescribedBy, errorId].filter(Boolean).join(' ')
      : ariaDescribedBy;

    const wrapperClasses = [
      styles['input-wrapper'],
      fullWidth && styles['full-width'],
      error && styles['has-error'],
      disabled && styles['is-disabled'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      styles.input,
      error && styles.error,
      fullWidth && styles['full-width'],
    ]
      .filter(Boolean)
      .join(' ');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    };

    return (
      <div className={wrapperClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className={`${styles.label} ${required ? styles.required : ''}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          aria-label={ariaLabel}
          aria-describedby={finalAriaDescribedBy}
          aria-invalid={error ? 'true' : 'false'}
          className={inputClasses}
        />
        {error && (
          <span id={errorId} className={styles['error-message']} role='alert'>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
