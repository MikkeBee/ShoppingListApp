import { ItemCategory } from '@/types/shopping';

// Category configuration with colors, icons, and display names
export const CATEGORY_CONFIG: Record<
  ItemCategory,
  {
    name: string;
    color: string;
    backgroundColor: string;
    icon: string;
    description: string;
  }
> = {
  [ItemCategory.PRODUCE]: {
    name: 'Produce',
    color: '#22c55e',
    backgroundColor: '#dcfce7',
    icon: '🥬',
    description: 'Fresh fruits and vegetables',
  },
  [ItemCategory.BAKERY]: {
    name: 'Bakery',
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    icon: '🍞',
    description: 'Bread, pastries, and baked goods',
  },
  [ItemCategory.MEAT]: {
    name: 'Meat',
    color: '#dc2626',
    backgroundColor: '#fecaca',
    icon: '🥩',
    description: 'Fresh meat and poultry',
  },
  [ItemCategory.SEAFOOD]: {
    name: 'Seafood',
    color: '#0ea5e9',
    backgroundColor: '#dbeafe',
    icon: '🐟',
    description: 'Fresh fish and seafood',
  },
  [ItemCategory.DAIRY]: {
    name: 'Dairy',
    color: '#8b5cf6',
    backgroundColor: '#e9d5ff',
    icon: '🥛',
    description: 'Milk, cheese, yogurt, and dairy products',
  },
  [ItemCategory.FROZEN]: {
    name: 'Frozen',
    color: '#06b6d4',
    backgroundColor: '#cffafe',
    icon: '❄️',
    description: 'Frozen foods and ice cream',
  },
  [ItemCategory.PANTRY]: {
    name: 'Pantry',
    color: '#a855f7',
    backgroundColor: '#f3e8ff',
    icon: '🥫',
    description: 'Canned goods, spices, and staples',
  },
  [ItemCategory.SNACKS]: {
    name: 'Snacks',
    color: '#ec4899',
    backgroundColor: '#fce7f3',
    icon: '🍿',
    description: 'Chips, crackers, and treats',
  },
  [ItemCategory.BEVERAGES]: {
    name: 'Beverages',
    color: '#14b8a6',
    backgroundColor: '#ccfbf1',
    icon: '🥤',
    description: 'Drinks, juices, and beverages',
  },
  [ItemCategory.HEALTH]: {
    name: 'Health',
    color: '#f97316',
    backgroundColor: '#fed7aa',
    icon: '💊',
    description: 'Pharmacy, vitamins, and medicine',
  },
  [ItemCategory.HOUSEHOLD]: {
    name: 'Household',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    icon: '🧽',
    description: 'Cleaning supplies and household items',
  },
  [ItemCategory.PERSONAL_CARE]: {
    name: 'Personal Care',
    color: '#fbbf24',
    backgroundColor: '#fef3c7',
    icon: '🧴',
    description: 'Shampoo, soap, cosmetics, and personal hygiene',
  },
  [ItemCategory.OTHER]: {
    name: 'Other',
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    icon: '📦',
    description: 'Miscellaneous items',
  },
};

// Get category configuration
export function getCategoryConfig(category: ItemCategory) {
  return CATEGORY_CONFIG[category];
}

// Get all available categories
export function getAllCategories(): ItemCategory[] {
  return Object.values(ItemCategory);
}

// Get category options for selects/dropdowns
export function getCategoryOptions() {
  return getAllCategories().map(category => ({
    value: category,
    label: CATEGORY_CONFIG[category].name,
    icon: CATEGORY_CONFIG[category].icon,
  }));
}

// Sort categories by name
export function getSortedCategories(): ItemCategory[] {
  return getAllCategories().sort((a, b) =>
    CATEGORY_CONFIG[a].name.localeCompare(CATEGORY_CONFIG[b].name)
  );
}

// Get category by name (case-insensitive search)
export function getCategoryByName(name: string): ItemCategory | null {
  const searchName = name.toLowerCase().trim();

  for (const category of getAllCategories()) {
    const config = CATEGORY_CONFIG[category];
    if (config.name.toLowerCase() === searchName) {
      return category;
    }
  }

  return null;
}

// Suggest category based on item name
export function suggestCategory(itemName: string): ItemCategory {
  const name = itemName.toLowerCase();

  // Produce keywords
  const produceKeywords = [
    'apple',
    'banana',
    'orange',
    'lettuce',
    'tomato',
    'onion',
    'potato',
    'carrot',
    'broccoli',
    'spinach',
    'fruit',
    'vegetable',
  ];
  if (produceKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.PRODUCE;
  }

  // Bakery keywords
  const bakeryKeywords = [
    'bread',
    'bagel',
    'muffin',
    'croissant',
    'cake',
    'cookie',
    'donut',
    'pastry',
  ];
  if (bakeryKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.BAKERY;
  }

  // Meat keywords
  const meatKeywords = [
    'chicken',
    'beef',
    'pork',
    'turkey',
    'ham',
    'bacon',
    'sausage',
    'ground beef',
    'steak',
  ];
  if (meatKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.MEAT;
  }

  // Seafood keywords
  const seafoodKeywords = [
    'fish',
    'salmon',
    'tuna',
    'shrimp',
    'crab',
    'lobster',
    'cod',
    'tilapia',
  ];
  if (seafoodKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.SEAFOOD;
  }

  // Dairy keywords
  const dairyKeywords = [
    'milk',
    'cheese',
    'yogurt',
    'butter',
    'cream',
    'eggs',
    'sour cream',
  ];
  if (dairyKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.DAIRY;
  }

  // Frozen keywords
  const frozenKeywords = [
    'frozen',
    'ice cream',
    'frozen pizza',
    'frozen vegetables',
    'frozen fruit',
  ];
  if (frozenKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.FROZEN;
  }

  // Pantry keywords
  const pantryKeywords = [
    'rice',
    'pasta',
    'flour',
    'sugar',
    'salt',
    'pepper',
    'oil',
    'vinegar',
    'can',
    'jar',
    'sauce',
    'soup',
  ];
  if (pantryKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.PANTRY;
  }

  // Snacks keywords
  const snacksKeywords = [
    'chips',
    'crackers',
    'nuts',
    'candy',
    'chocolate',
    'popcorn',
    'pretzels',
  ];
  if (snacksKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.SNACKS;
  }

  // Beverages keywords
  const beveragesKeywords = [
    'water',
    'juice',
    'soda',
    'coffee',
    'tea',
    'beer',
    'wine',
    'milk',
  ];
  if (beveragesKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.BEVERAGES;
  }

  // Health keywords
  const healthKeywords = [
    'vitamin',
    'medicine',
    'pill',
    'tablet',
    'supplement',
    'pharmacy',
    'prescription',
  ];
  if (healthKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.HEALTH;
  }

  // Household keywords
  const householdKeywords = [
    'detergent',
    'bleach',
    'sponge',
    'paper towels',
    'toilet paper',
    'trash bags',
  ];
  if (householdKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.HOUSEHOLD;
  }

  // Personal care keywords
  const personalCareKeywords = [
    'shampoo',
    'soap',
    'toothpaste',
    'deodorant',
    'lotion',
    'cosmetics',
    'perfume',
    'razor',
    'brush',
  ];
  if (personalCareKeywords.some(keyword => name.includes(keyword))) {
    return ItemCategory.PERSONAL_CARE;
  }

  // Default to OTHER if no match
  return ItemCategory.OTHER;
}

// Group items by category
export function groupItemsByCategory<T extends { category: ItemCategory }>(
  items: T[]
): Record<ItemCategory, T[]> {
  const grouped = {} as Record<ItemCategory, T[]>;

  // Initialize all categories with empty arrays
  getAllCategories().forEach(category => {
    grouped[category] = [];
  });

  // Group items
  items.forEach(item => {
    grouped[item.category].push(item);
  });

  return grouped;
}

// Filter items by category
export function filterItemsByCategory<T extends { category: ItemCategory }>(
  items: T[],
  categories: ItemCategory[]
): T[] {
  if (categories.length === 0) return items;
  return items.filter(item => categories.includes(item.category));
}

// Get category statistics
export function getCategoryStats<
  T extends { category: ItemCategory; completed?: boolean },
>(items: T[]) {
  const stats = {} as Record<
    ItemCategory,
    { total: number; completed: number }
  >;

  getAllCategories().forEach(category => {
    stats[category] = { total: 0, completed: 0 };
  });

  items.forEach(item => {
    stats[item.category].total++;
    if (item.completed) {
      stats[item.category].completed++;
    }
  });

  return stats;
}
