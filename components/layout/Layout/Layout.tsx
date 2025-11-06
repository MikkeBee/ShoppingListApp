import React, { ReactNode } from 'react';
import { Header, HeaderProps } from '../Header';
import { Container } from '../Container';
import { useShoppingContext } from '@/contexts/ShoppingContext';
import styles from './Layout.module.scss';

export interface LayoutProps {
  /** Page content */
  children: ReactNode;
  /** Header configuration */
  header?: HeaderProps | false;
  /** Container size for main content */
  containerSize?: 'small' | 'medium' | 'large' | 'full';
  /** Custom class name */
  className?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  header,
  containerSize = 'medium',
  className = '',
}) => {
  const { state, dispatch } = useShoppingContext();

  const layoutClasses = [styles.layout, className].filter(Boolean).join(' ');

  // Navigation handlers
  const handleListsClick = () => {
    // Go to home/lists view
    dispatch({ type: 'SET_ACTIVE_LIST', payload: null });
  };

  const handleAddClick = () => {
    // If we have a list, trigger the FAB functionality
    // Otherwise, do nothing (user needs to create a list first)
    if (state.activeListId) {
      // This will be handled by the MobileItemManager FAB
      // For now, we could scroll to the FAB or trigger it programmatically
      const fabButton = document.querySelector(
        '[data-fab]'
      ) as HTMLButtonElement;
      if (fabButton) {
        fabButton.click();
      }
    }
  };

  const handleSettingsClick = () => {
    // TODO: Implement settings page
    alert('Settings feature coming soon!');
  };

  return (
    <div className={layoutClasses}>
      {/* Header */}
      {header !== false && <Header {...header} />}

      {/* Main content area */}
      <main className={styles.main}>
        <Container
          size={containerSize}
          as='div'
          className={styles.mainContainer}
        >
          {children}
        </Container>
      </main>

      {/* Mobile navigation placeholder */}
      <nav className={styles.mobileNav}>
        <Container size='full' noPadding className={styles.navContainer}>
          <div className={styles.navContent}>
            <button
              className={`${styles.navItem} ${!state.activeListId ? styles.navItemActive : ''}`}
              onClick={handleListsClick}
              aria-label='Go to lists view'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path d='M3 4h14v2H3V4zm0 5h14v2H3V9zm0 5h14v2H3v-2z' />
              </svg>
              <span>Lists</span>
            </button>
            <button
              className={`${styles.navItem} ${!state.activeListId ? styles.navItemDisabled : ''}`}
              onClick={handleAddClick}
              disabled={!state.activeListId}
              aria-label='Add new item to current list'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Add</span>
            </button>
            <button
              className={styles.navItem}
              onClick={handleSettingsClick}
              aria-label='Open settings'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
                  clipRule='evenodd'
                />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </Container>
      </nav>
    </div>
  );
};

Layout.displayName = 'Layout';
