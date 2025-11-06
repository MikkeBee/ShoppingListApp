'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  detectHighContrast,
  detectReducedMotion,
  detectColorScheme,
  detectVoiceSupport,
  liveRegionManager,
  getFocusableElements,
  trapFocus,
  KEYBOARD_KEYS,
} from '@/utils/accessibility';

/**
 * Hook for managing user accessibility preferences
 */
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    highContrast: false,
    reducedMotion: false,
    colorScheme: 'light' as 'light' | 'dark',
    voiceSupport: false,
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        highContrast: detectHighContrast(),
        reducedMotion: detectReducedMotion(),
        colorScheme: detectColorScheme(),
        voiceSupport: detectVoiceSupport(),
      });
    };

    // Initial detection
    updatePreferences();

    // Listen for changes
    const mediaQueries = [
      window.matchMedia('(prefers-contrast: high)'),
      window.matchMedia('(prefers-reduced-motion: reduce)'),
      window.matchMedia('(prefers-color-scheme: dark)'),
    ];

    const handleChange = () => updatePreferences();
    mediaQueries.forEach(mq => mq.addEventListener('change', handleChange));

    return () => {
      mediaQueries.forEach(mq =>
        mq.removeEventListener('change', handleChange)
      );
    };
  }, []);

  return preferences;
}

/**
 * Hook for managing screen reader announcements
 */
export function useScreenReader() {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      liveRegionManager.announce(message, priority);
    },
    []
  );

  return { announce };
}

/**
 * Hook for managing focus within a container (focus trap)
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the first focusable element in the container
    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (containerRef.current) {
        trapFocus(containerRef.current, event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus to the previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for managing keyboard navigation in lists
 */
export function useKeyboardNavigation(
  items: unknown[],
  onSelect?: (index: number) => void,
  onEscape?: () => void
) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLElement>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!containerRef.current || items.length === 0) return;

      switch (event.key) {
        case KEYBOARD_KEYS.ARROW_DOWN:
          event.preventDefault();
          setActiveIndex(prev => (prev + 1) % items.length);
          break;

        case KEYBOARD_KEYS.ARROW_UP:
          event.preventDefault();
          setActiveIndex(prev => (prev - 1 + items.length) % items.length);
          break;

        case KEYBOARD_KEYS.HOME:
          event.preventDefault();
          setActiveIndex(0);
          break;

        case KEYBOARD_KEYS.END:
          event.preventDefault();
          setActiveIndex(items.length - 1);
          break;

        case KEYBOARD_KEYS.ENTER:
        case KEYBOARD_KEYS.SPACE:
          event.preventDefault();
          if (activeIndex >= 0 && onSelect) {
            onSelect(activeIndex);
          }
          break;

        case KEYBOARD_KEYS.ESCAPE:
          event.preventDefault();
          if (onEscape) {
            onEscape();
          }
          break;
      }
    },
    [items.length, activeIndex, onSelect, onEscape]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  // Focus management for active item
  useEffect(() => {
    if (activeIndex >= 0 && containerRef.current) {
      const items = containerRef.current.querySelectorAll(
        '[role="option"], [role="menuitem"], [role="button"]'
      );
      const activeItem = items[activeIndex] as HTMLElement;
      if (activeItem) {
        activeItem.focus();
      }
    }
  }, [activeIndex]);

  return {
    containerRef,
    activeIndex,
    setActiveIndex,
  };
}

/**
 * Hook for managing skip links
 */
export function useSkipLinks() {
  const skipLinksRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleFocus = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('skip-link')) {
        target.style.position = 'static';
        target.style.opacity = '1';
      }
    };

    const handleBlur = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('skip-link')) {
        target.style.position = 'absolute';
        target.style.opacity = '0';
      }
    };

    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  return skipLinksRef;
}

/**
 * Hook for voice recognition (experimental)
 */
export function useVoiceRecognition(onResult?: (transcript: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => detectVoiceSupport());
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    if (!isSupported) return;

    try {
      // Create recognition instance
      const SpeechRecognition =
        (
          window as unknown as {
            SpeechRecognition?: new () => unknown;
            webkitSpeechRecognition?: new () => unknown;
          }
        ).SpeechRecognition ||
        (
          window as unknown as {
            SpeechRecognition?: new () => unknown;
            webkitSpeechRecognition?: new () => unknown;
          }
        ).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition() as {
          continuous: boolean;
          interimResults: boolean;
          lang: string;
          onresult:
            | ((event: { results: { transcript: string }[][] }) => void)
            | null;
          onend: (() => void) | null;
          onerror: (() => void) | null;
          start: () => void;
          stop: () => void;
        };

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = event => {
          const transcript = event.results[0][0].transcript;
          if (onResult) {
            onResult(transcript);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    } catch {
      // Voice recognition not available
    }

    return () => {
      if (
        recognitionRef.current &&
        typeof (recognitionRef.current as { stop: () => void }).stop ===
          'function'
      ) {
        (recognitionRef.current as { stop: () => void }).stop();
      }
    };
  }, [onResult, isSupported]);

  const startListening = useCallback(() => {
    if (
      recognitionRef.current &&
      !isListening &&
      typeof (recognitionRef.current as { start: () => void }).start ===
        'function'
    ) {
      (recognitionRef.current as { start: () => void }).start();
      setIsListening(true);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (
      recognitionRef.current &&
      isListening &&
      typeof (recognitionRef.current as { stop: () => void }).stop ===
        'function'
    ) {
      (recognitionRef.current as { stop: () => void }).stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isSupported,
    isListening,
    startListening,
    stopListening,
  };
}

/**
 * Hook for managing ARIA attributes dynamically
 */
export function useAriaAttributes() {
  const setAriaLabel = useCallback((element: HTMLElement, label: string) => {
    element.setAttribute('aria-label', label);
  }, []);

  const setAriaDescribedBy = useCallback((element: HTMLElement, id: string) => {
    element.setAttribute('aria-describedby', id);
  }, []);

  const setAriaExpanded = useCallback(
    (element: HTMLElement, expanded: boolean) => {
      element.setAttribute('aria-expanded', String(expanded));
    },
    []
  );

  const setAriaSelected = useCallback(
    (element: HTMLElement, selected: boolean) => {
      element.setAttribute('aria-selected', String(selected));
    },
    []
  );

  const setAriaChecked = useCallback(
    (element: HTMLElement, checked: boolean) => {
      element.setAttribute('aria-checked', String(checked));
    },
    []
  );

  const setAriaDisabled = useCallback(
    (element: HTMLElement, disabled: boolean) => {
      element.setAttribute('aria-disabled', String(disabled));
    },
    []
  );

  return {
    setAriaLabel,
    setAriaDescribedBy,
    setAriaExpanded,
    setAriaSelected,
    setAriaChecked,
    setAriaDisabled,
  };
}
