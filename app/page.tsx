'use client';

import { Layout } from '@/components/layout';
import {
  ShoppingListSelector,
  ItemsList,
  MobileItemManager,
  ShoppingListGrid,
} from '@/components/ui';
import { useShoppingContext } from '@/contexts';
import styles from './page.module.scss';

export default function Home() {
  const { state } = useShoppingContext();

  return (
    <Layout
      header={{
        rightContent: <ShoppingListSelector />,
      }}
    >
      <main className={styles.main}>
        {state.activeListId ? (
          <>
            {/* Items List - Show when a list is selected */}
            <section className={styles.itemsSection}>
              <ItemsList showCompleted={true} groupByCategory={true} />
            </section>

            {/* Mobile Item Manager - FAB + Bottom Sheet */}
            <MobileItemManager />
          </>
        ) : (
          <>
            {/* Shopping Lists Grid (show when no active list) */}
            <section className={styles.listsSection}>
              <ShoppingListGrid />
            </section>
          </>
        )}
      </main>
    </Layout>
  );
}
