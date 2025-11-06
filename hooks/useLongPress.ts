import { useCallback, useRef } from 'react';

export interface LongPressOptions {
  threshold?: number; // Time in ms before long press is triggered (default: 500ms)
  onStart?: () => void; // Called when long press starts
  onFinish?: () => void; // Called when long press completes
  onCancel?: () => void; // Called when long press is cancelled
}

export interface UseLongPressReturn {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseUp: (e: React.MouseEvent) => void;
  onMouseLeave: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
  onTouchCancel: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
}

export function useLongPress(
  onLongPress: () => void,
  options: LongPressOptions = {}
): UseLongPressReturn {
  const { threshold = 500, onStart, onFinish, onCancel } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const startPositionRef = useRef<{ x: number; y: number } | null>(null);

  const start = useCallback(
    (clientX: number, clientY: number) => {
      isLongPressRef.current = false;
      startPositionRef.current = { x: clientX, y: clientY };

      onStart?.();

      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        onLongPress();
        onFinish?.();
      }, threshold);
    },
    [onLongPress, onStart, onFinish, threshold]
  );

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isLongPressRef.current) {
      onCancel?.();
    }

    isLongPressRef.current = false;
    startPositionRef.current = null;
  }, [onCancel]);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!startPositionRef.current) return;

      // Cancel long press if user moves too far (more than 10px)
      const deltaX = Math.abs(clientX - startPositionRef.current.x);
      const deltaY = Math.abs(clientY - startPositionRef.current.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 10) {
        clear();
      }
    },
    [clear]
  );

  return {
    onMouseDown: useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        start(e.clientX, e.clientY);
      },
      [start]
    ),

    onMouseUp: useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        clear();
      },
      [clear]
    ),

    onMouseLeave: useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        clear();
      },
      [clear]
    ),

    onTouchStart: useCallback(
      (e: React.TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        start(touch.clientX, touch.clientY);
      },
      [start]
    ),

    onTouchEnd: useCallback(
      (e: React.TouchEvent) => {
        e.preventDefault();
        clear();
      },
      [clear]
    ),

    onTouchCancel: useCallback(
      (e: React.TouchEvent) => {
        e.preventDefault();
        clear();
      },
      [clear]
    ),

    onTouchMove: useCallback(
      (e: React.TouchEvent) => {
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      },
      [handleMove]
    ),
  };
}
