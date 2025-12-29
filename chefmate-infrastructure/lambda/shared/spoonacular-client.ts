/**
 * Spoonacular API Client
 * Reusable client for making requests to Spoonacular API
 */

const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

interface SpoonacularClientOptions {
  apiKey: string;
}

interface RequestOptions {
  endpoint: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export class SpoonacularClient {
  private apiKey: string;

  constructor(options: SpoonacularClientOptions) {
    this.apiKey = options.apiKey;
  }

  /**
   * Make a GET request to Spoonacular API
   */
  async get<T>(options: RequestOptions): Promise<T> {
    const { endpoint, params = {} } = options;
    const url = new URL(endpoint, SPOONACULAR_BASE_URL);

    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    // Add API key
    url.searchParams.append('apiKey', this.apiKey);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data: unknown = await response.json();

    if (!response.ok) {
      const errorData = data as { message?: string };
      throw new SpoonacularError(
        errorData.message || 'Spoonacular API error',
        response.status,
        data
      );
    }

    return data as T;
  }
}

export class SpoonacularError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'SpoonacularError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Create a Spoonacular client instance from environment variables
 */
export function createSpoonacularClient(): SpoonacularClient {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    throw new Error('SPOONACULAR_API_KEY environment variable is not set');
  }

  return new SpoonacularClient({ apiKey });
}

// Type definitions for Spoonacular API responses

export interface RecipeSearchResult {
  results: RecipeSummary[];
  offset: number;
  number: number;
  totalResults: number;
}

export interface RecipeSummary {
  id: number;
  title: string;
  image: string;
  imageType: string;
  nutrition?: {
    nutrients: Nutrient[];
  };
}

export interface RecipeDetails {
  id: number;
  title: string;
  image: string;
  servings: number;
  readyInMinutes: number;
  sourceName?: string;
  sourceUrl?: string;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  instructions?: string;
  analyzedInstructions: AnalyzedInstruction[];
  extendedIngredients: Ingredient[];
  nutrition?: RecipeNutrition;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  veryHealthy: boolean;
  cheap: boolean;
  veryPopular: boolean;
  sustainable: boolean;
  lowFodmap: boolean;
  weightWatcherSmartPoints: number;
  healthScore: number;
  pricePerServing: number;
}

export interface AnalyzedInstruction {
  name: string;
  steps: InstructionStep[];
}

export interface InstructionStep {
  number: number;
  step: string;
  ingredients?: StepIngredient[];
  equipment?: StepEquipment[];
  length?: {
    number: number;
    unit: string;
  };
}

export interface StepIngredient {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface StepEquipment {
  id: number;
  name: string;
  localizedName: string;
  image: string;
}

export interface Ingredient {
  id: number;
  aisle: string;
  image: string;
  consistency: string;
  name: string;
  nameClean: string;
  original: string;
  originalName: string;
  amount: number;
  unit: string;
  measures: {
    us: Measure;
    metric: Measure;
  };
}

export interface Measure {
  amount: number;
  unitShort: string;
  unitLong: string;
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
  percentOfDailyNeeds?: number;
}

export interface RecipeNutrition {
  nutrients: Nutrient[];
  caloricBreakdown: {
    percentProtein: number;
    percentFat: number;
    percentCarbs: number;
  };
}

export interface MealPlanDay {
  meals: MealPlanMeal[];
  nutrients: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

export interface MealPlanWeek {
  week: {
    monday: MealPlanDay;
    tuesday: MealPlanDay;
    wednesday: MealPlanDay;
    thursday: MealPlanDay;
    friday: MealPlanDay;
    saturday: MealPlanDay;
    sunday: MealPlanDay;
  };
}

export interface MealPlanMeal {
  id: number;
  imageType: string;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
}
