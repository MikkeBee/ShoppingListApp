// Accessibility Utilities and Constants
// Comprehensive accessibility support for WCAG 2.1 AA compliance

// ARIA Labels and Messages
export const ARIA_LABELS = {
  // Navigation
  mainNavigation: 'Main navigation',
  breadcrumb: 'Breadcrumb navigation',
  pagination: 'Pagination navigation',

  // Actions
  addItem: 'Add new item to shopping list',
  editItem: 'Edit item details',
  deleteItem: 'Delete item from list',
  toggleComplete: 'Mark item as complete',
  duplicateItem: 'Duplicate this item',

  // Lists and Items
  shoppingList: 'Shopping list items',
  listSelector: 'Select shopping list',
  categoryFilter: 'Filter by category',
  priorityFilter: 'Filter by priority',
  sortOptions: 'Sort options',

  // Forms
  itemName: 'Item name',
  itemQuantity: 'Item quantity',
  itemCategory: 'Item category',
  itemPriority: 'Item priority',
  itemNotes: 'Additional notes for item',

  // Status and Feedback
  loadingContent: 'Loading content',
  errorMessage: 'Error message',
  successMessage: 'Success message',
  warningMessage: 'Warning message',

  // Mobile and PWA
  installApp: 'Install application on device',
  openMobileMenu: 'Open mobile menu',
  closeMobileMenu: 'Close mobile menu',
  swipeActions: 'Swipe left or right for actions',
} as const;

// Screen Reader Messages
export const SCREEN_READER_MESSAGES = {
  itemAdded: (itemName: string) => `Added ${itemName} to shopping list`,
  itemRemoved: (itemName: string) => `Removed ${itemName} from shopping list`,
  itemCompleted: (itemName: string) => `Marked ${itemName} as complete`,
  itemUncompleted: (itemName: string) => `Marked ${itemName} as incomplete`,
  listChanged: (listName: string) => `Switched to ${listName} shopping list`,
  filterApplied: (filterType: string, value: string) =>
    `Applied ${filterType} filter: ${value}`,
  sortApplied: (sortBy: string, order: string) =>
    `Sorted by ${sortBy} in ${order} order`,

  // Loading states
  loading: 'Loading content, please wait',
  loadingComplete: 'Content has finished loading',
  refreshing: 'Refreshing list data',

  // Errors
  connectionError: 'Connection error. Please check your internet connection',
  saveError: 'Unable to save changes. Please try again',
  loadError: 'Unable to load content. Please try again',
} as const;

// Keyboard Navigation Constants
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
} as const;

// Focus Management Utilities
export const focusableSelectors = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[role="button"]:not([disabled])',
  '[role="link"]:not([disabled])',
  '[contenteditable="true"]',
].join(', ');

export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll(focusableSelectors));
}

export function trapFocus(container: HTMLElement, event: KeyboardEvent): void {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.key === KEYBOARD_KEYS.TAB) {
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }
}

export function restoreFocus(previousElement: HTMLElement | null): void {
  if (previousElement && typeof previousElement.focus === 'function') {
    // Use setTimeout to ensure the element is ready to receive focus
    setTimeout(() => {
      previousElement.focus();
    }, 0);
  }
}

// Announce to Screen Readers
export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// High Contrast Detection
export function detectHighContrast(): boolean {
  if (typeof window === 'undefined') return false;

  // Check for Windows High Contrast mode
  return (
    window.matchMedia('(prefers-contrast: high)').matches ||
    window.matchMedia('(-ms-high-contrast: active)').matches
  );
}

// Reduced Motion Detection (already in animations.ts but included for completeness)
export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Color Scheme Detection
export function detectColorScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// Voice Recognition Support Detection
export function detectVoiceSupport(): boolean {
  if (typeof window === 'undefined') return false;
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// Skip Link Utilities
export function createSkipLink(targetId: string, label: string): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className = 'skip-link';
  skipLink.setAttribute('aria-label', label);

  return skipLink;
}

// ARIA Live Region Management
export class LiveRegionManager {
  private politeRegion: HTMLElement | null = null;
  private assertiveRegion: HTMLElement | null = null;

  constructor() {
    // Only create regions on client-side
    if (typeof window !== 'undefined') {
      this.createRegions();
    }
  }

  private createRegions(): void {
    if (typeof document === 'undefined') return;

    // Polite announcements
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.className = 'sr-only';
    document.body.appendChild(this.politeRegion);

    // Assertive announcements
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.className = 'sr-only';
    document.body.appendChild(this.assertiveRegion);
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    // Only announce on client-side
    if (typeof window === 'undefined') return;

    // Ensure regions are created
    if (!this.politeRegion || !this.assertiveRegion) {
      this.createRegions();
    }

    const region =
      priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
    if (region) {
      region.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (region) region.textContent = '';
      }, 1000);
    }
  }

  destroy(): void {
    if (typeof document === 'undefined') return;

    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
  }
}

// Export singleton instance
export const liveRegionManager = new LiveRegionManager();
