/**
 * Spoonacular API Client
 * Reusable client for making requests to Spoonacular API
 */
interface SpoonacularClientOptions {
    apiKey: string;
}
interface RequestOptions {
    endpoint: string;
    params?: Record<string, string | number | boolean | undefined>;
}
export declare class SpoonacularClient {
    private apiKey;
    constructor(options: SpoonacularClientOptions);
    /**
     * Make a GET request to Spoonacular API
     */
    get<T>(options: RequestOptions): Promise<T>;
}
export declare class SpoonacularError extends Error {
    status: number;
    details?: unknown;
    constructor(message: string, status: number, details?: unknown);
}
/**
 * Create a Spoonacular client instance from environment variables
 */
export declare function createSpoonacularClient(): SpoonacularClient;
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
export {};
