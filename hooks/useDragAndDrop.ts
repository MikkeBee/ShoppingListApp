import { useState, useRef, useCallback } from 'react';

export interface DragItem<T = unknown> {
  id: string;
  type: 'ITEM';
  data: T;
  sourceIndex: number;
  sourceCategory?: string;
}

export interface DropResult {
  targetIndex: number;
  targetCategory?: string;
}

export function useDragAndDrop<T = unknown>() {
  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<DragItem<T> | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    index: number;
    category?: string;
  } | null>(null);

  const dragRef = useRef<HTMLElement | null>(null);
  const dropRef = useRef<HTMLElement | null>(null);

  const startDrag = useCallback((item: DragItem<T>) => {
    setDragItem(item);
    setIsDragging(true);
  }, []);

  const endDrag = useCallback(() => {
    setDragItem(null);
    setIsDragging(false);
    setDropTarget(null);
  }, []);

  const setDropTargetPosition = useCallback(
    (index: number, category?: string) => {
      setDropTarget({ index, category });
    },
    []
  );

  const clearDropTarget = useCallback(() => {
    setDropTarget(null);
  }, []);

  // Touch event handlers for mobile drag and drop
  const handleTouchStart = useCallback(
    (e: TouchEvent, item: DragItem<T>) => {
      e.preventDefault();
      startDrag(item);
    },
    [startDrag]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !dragItem) return;

      e.preventDefault();
      const touch = e.touches[0];
      const elementBelow = document.elementFromPoint(
        touch.clientX,
        touch.clientY
      );

      if (elementBelow) {
        const dropZone = elementBelow.closest('[data-drop-zone]');
        if (dropZone) {
          const index = parseInt(
            dropZone.getAttribute('data-drop-index') || '0'
          );
          const category =
            dropZone.getAttribute('data-drop-category') || undefined;
          setDropTargetPosition(index, category);
        }
      }
    },
    [isDragging, dragItem, setDropTargetPosition]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !dragItem || !dropTarget) {
        endDrag();
        return;
      }

      e.preventDefault();
      endDrag();
    },
    [isDragging, dragItem, dropTarget, endDrag]
  );

  // Mouse event handlers for desktop drag and drop
  const handleMouseDown = useCallback(
    (e: MouseEvent, item: DragItem<T>) => {
      e.preventDefault();
      startDrag(item);
    },
    [startDrag]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragItem) return;

      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
      if (elementBelow) {
        const dropZone = elementBelow.closest('[data-drop-zone]');
        if (dropZone) {
          const index = parseInt(
            dropZone.getAttribute('data-drop-index') || '0'
          );
          const category =
            dropZone.getAttribute('data-drop-category') || undefined;
          setDropTargetPosition(index, category);
        }
      }
    },
    [isDragging, dragItem, setDropTargetPosition]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragItem) return;
    endDrag();
  }, [isDragging, dragItem, endDrag]);

  return {
    isDragging,
    dragItem,
    dropTarget,
    startDrag,
    endDrag,
    setDropTargetPosition,
    clearDropTarget,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    dragRef,
    dropRef,
  };
}
