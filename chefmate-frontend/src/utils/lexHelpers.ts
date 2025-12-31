/**
 * Lex Helper Utilities
 *
 * Helper functions for processing Lex slot values and converting them
 * to formats usable by the application.
 */

/**
 * Convert ordinal slot value to a number
 * Handles both word ordinals ("first", "second") and numeric ("1", "2")
 */
export function convertOrdinalToNumber(ordinal: string | null | undefined): number {
  if (!ordinal) return 1;

  const normalizedOrdinal = ordinal.toLowerCase().trim();

  const ordinalMap: Record<string, number> = {
    // Word ordinals
    'first': 1,
    'second': 2,
    'third': 3,
    'fourth': 4,
    'fifth': 5,
    'sixth': 6,
    'seventh': 7,
    'eighth': 8,
    'ninth': 9,
    'tenth': 10,
    'last': -1,

    // Shortened ordinals
    '1st': 1,
    '2nd': 2,
    '3rd': 3,
    '4th': 4,
    '5th': 5,
    '6th': 6,
    '7th': 7,
    '8th': 8,
    '9th': 9,
    '10th': 10,

    // Word numbers
    'one': 1,
    'two': 2,
    'three': 3,
    'four': 4,
    'five': 5,
  };

  // Check if it's in our map
  if (ordinalMap[normalizedOrdinal] !== undefined) {
    return ordinalMap[normalizedOrdinal];
  }

  // Try parsing as a number directly
  const parsed = parseInt(normalizedOrdinal, 10);
  if (!isNaN(parsed)) {
    return parsed;
  }

  // Default to first if we can't parse
  return 1;
}

/**
 * Parse ingredients from a slot value
 * Handles comma-separated and "and" separated lists
 */
export function parseIngredientsSlot(ingredients: string | null | undefined): string[] {
  if (!ingredients) return [];

  // Split on commas, "and", or both
  const parts = ingredients
    .split(/,\s*|\s+and\s+/i)
    .map(part => part.trim())
    .filter(part => part.length > 0);

  return parts;
}

/**
 * Normalize diet type from Lex slot to API format
 * Handles spaces and variations
 */
export function normalizeDietType(diet: string | null | undefined): string | undefined {
  if (!diet) return undefined;

  const normalized = diet.toLowerCase().trim();

  const dietMap: Record<string, string> = {
    'gluten free': 'gluten-free',
    'dairy free': 'dairy-free',
    'low carb': 'low-carb',
    'low fat': 'low-fat',
  };

  return dietMap[normalized] || normalized;
}

/**
 * Normalize cuisine type from Lex slot
 */
export function normalizeCuisineType(cuisine: string | null | undefined): string | undefined {
  if (!cuisine) return undefined;

  const normalized = cuisine.toLowerCase().trim();

  const cuisineMap: Record<string, string> = {
    'middle eastern': 'middle-eastern',
  };

  return cuisineMap[normalized] || normalized;
}

/**
 * Parse max time from slot value
 * Handles strings like "30", "30 minutes", etc.
 */
export function parseMaxTime(maxTime: string | null | undefined): number | undefined {
  if (!maxTime) return undefined;

  // Extract just the number
  const match = maxTime.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return undefined;
}
