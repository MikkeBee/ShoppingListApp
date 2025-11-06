import { useState, useCallback } from 'react';
import { ShoppingItem } from '@/types/shopping';

export interface UndoOperation {
  id: string;
  type: 'DELETE_ITEM';
  data: {
    item: ShoppingItem;
    listId: string;
    position: number;
  };
  timestamp: number;
}

export function useUndoOperations() {
  const [pendingOperation, setPendingOperation] =
    useState<UndoOperation | null>(null);

  const createUndoOperation = useCallback(
    (
      type: UndoOperation['type'],
      data: UndoOperation['data']
    ): UndoOperation => {
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        data,
        timestamp: Date.now(),
      };
    },
    []
  );

  const startUndoOperation = useCallback((operation: UndoOperation) => {
    setPendingOperation(operation);
  }, []);

  const executeUndo = useCallback(() => {
    return pendingOperation;
  }, [pendingOperation]);

  const dismissUndo = useCallback(() => {
    setPendingOperation(null);
  }, []);

  return {
    pendingOperation,
    createUndoOperation,
    startUndoOperation,
    executeUndo,
    dismissUndo,
  };
}
