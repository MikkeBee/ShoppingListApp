import React, { ReactNode, useCallback, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.scss';

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Modal title for accessibility */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Size of the modal */
  size?: 'small' | 'medium' | 'large' | 'full';
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing escape closes the modal */
  closeOnEscape?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Custom class name */
  className?: string;
  /** Initial focus element selector */
  initialFocus?: string;
  /** Return focus element selector */
  returnFocus?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
  initialFocus,
  returnFocus,
}) => {
  const titleId = useId();
  const descriptionId = useId();

  // Handle escape key
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Handle focus management
  useEffect(() => {
    if (!isOpen) return;

    const previousFocus = returnFocus
      ? (document.querySelector(returnFocus) as HTMLElement)
      : (document.activeElement as HTMLElement);

    // Add escape listener
    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Focus initial element
    const focusElement = initialFocus
      ? (document.querySelector(initialFocus) as HTMLElement)
      : (document.querySelector('[data-modal-focus]') as HTMLElement);

    if (focusElement) {
      focusElement.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';

      // Return focus
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [isOpen, handleEscape, initialFocus, returnFocus]);

  // Trap focus within modal
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isOpen || event.key !== 'Tab') return;

      const modal = event.currentTarget as HTMLElement;
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    },
    [isOpen]
  );

  if (!isOpen) {
    return null;
  }

  const modalClasses = [styles.modal, styles[size], className]
    .filter(Boolean)
    .join(' ');

  const modalContent = (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role='dialog'
      aria-modal='true'
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className={modalClasses} onKeyDown={handleKeyDown} tabIndex={-1}>
        {/* Header */}
        <div className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {showCloseButton && (
            <button
              type='button'
              className={styles.closeButton}
              onClick={onClose}
              aria-label='Close modal'
              data-modal-focus
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='m18 6-12 12' />
                <path d='m6 6 12 12' />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div id={descriptionId} className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );

  // Render in portal
  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

Modal.displayName = 'Modal';
