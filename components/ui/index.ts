// Base UI Components
// This directory contains reusable UI components like Button, Input, Modal, etc.
// Each component should have its own folder with:
// - ComponentName.tsx (main component file)
// - ComponentName.module.scss (styles)
// - ComponentName.test.tsx (tests)
// - index.ts (export barrel)

export { Button } from './Button';
export type { ButtonProps } from './Button';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { CustomSelect } from './CustomSelect';
export type { CustomSelectProps } from './CustomSelect';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { CategoryBadge } from './CategoryBadge';
export type { CategoryBadgeProps } from './CategoryBadge';

export { ShoppingListSelector } from './ShoppingListSelector';
export type { ShoppingListSelectorProps } from './ShoppingListSelector/ShoppingListSelector';

export { ShoppingListGrid } from './ShoppingListGrid';
export type { ShoppingListGridProps } from './ShoppingListGrid';

export { AddItemForm } from './AddItemForm';
export type { AddItemFormProps } from './AddItemForm/AddItemForm';

export { ItemsList } from './ItemsList';
export type { ItemsListProps } from './ItemsList/ItemsList';

export { ItemRow } from './ItemRow';
export type { ItemRowProps } from './ItemRow/ItemRow';

export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog/ConfirmDialog';

export { UndoNotification } from './UndoNotification';
export type { UndoNotificationProps } from './UndoNotification/UndoNotification';

// Mobile UI Components
export { FloatingActionButton } from './FloatingActionButton';
export type { FloatingActionButtonProps } from './FloatingActionButton';

export { BottomSheet } from './BottomSheet';
export type { BottomSheetProps } from './BottomSheet';

export { SafeArea } from './SafeArea';
export type { SafeAreaProps } from './SafeArea';

export { MobileItemManager } from './MobileItemManager';
export type { MobileItemManagerProps } from './MobileItemManager';

export { PWAInstallButton } from './PWAInstallButton';
export type { PWAInstallButtonProps } from './PWAInstallButton';

// Animation & Feedback Components
export {
  SkeletonLoader,
  ItemSkeleton,
  ListSkeleton,
  HeaderSkeleton,
} from './SkeletonLoader';
export type { SkeletonLoaderProps } from './SkeletonLoader';

export { AnimatedFeedback, GlobalFeedback } from './AnimatedFeedback';
export type { AnimatedFeedbackProps } from './AnimatedFeedback';
