// Types barrel file - exports all application types
// This provides a single import point for all TypeScript interfaces and types

// Core shopping types
export type {
  ShoppingItem,
  ShoppingList,
  AppState,
  UIState,
  AppAction,
  CreateItemForm,
  UpdateItemForm,
  CreateListForm,
  UpdateListForm,
  ItemComponentProps,
  ListComponentProps,
  FilterOptions,
  SortOptions,
  ListStats,
  AppStats,
} from './shopping';

// Enums
export { ItemCategory } from './shopping';

// Re-export common React types for convenience
export type { ReactNode, FC, ComponentProps } from 'react';
