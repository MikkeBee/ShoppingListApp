'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import styles from './ConfirmDialog.module.scss';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'add' | 'edit' | 'delete';
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      className={className}
    >
      <div className={styles.confirmDialog}>
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.actions}>
          <Button
            variant='secondary'
            onClick={onCancel}
            className={styles.cancelButton}
          >
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            className={styles.confirmButton}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
