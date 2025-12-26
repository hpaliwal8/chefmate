// Recipe Types
export interface Ingredient {
  id?: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
  aisle: string;
}

export interface InstructionStep {
  number: number;
  step: string;
  ingredients: string[];
  equipment: string[];
  length: {
    number: number;
    unit: string;
  } | null;
}

export interface NutrientInfo {
  amount: number;
  unit: string;
}

export interface Nutrition {
  calories: NutrientInfo | null;
  protein: NutrientInfo | null;
  carbs: NutrientInfo | null;
  fat: NutrientInfo | null;
  fiber: NutrientInfo | null;
  sugar: NutrientInfo | null;
}

export interface Recipe {
  id: string;
  title: string;
  image: string;
  readyInMinutes: number | null;
  servings: number;
  summary: string;
  diets: string[];
  ingredients: Ingredient[];
  instructions: InstructionStep[];
  nutrition: Nutrition | null;
  source: string;
  sourceUrl: string;
  hasVoiceGuidance: boolean;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  pricePerServing: number | null;
  cuisines: string[];
  dishTypes: string[];
}

// Shopping List Types
export interface ShoppingListItem extends Ingredient {
  checked: boolean;
}

// User Preferences Types
export interface UserPreferences {
  diet: string | null;
  allergens: string[];
  cuisinePreferences: string[];
  maxCookingTime: number | null;
}

// Conversation Types
export interface ConversationMessage {
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

// Context Types
export interface AppContextValue {
  // State
  recipes: Recipe[];
  currentRecipe: Recipe | null;
  searchQuery: string;
  isLoading: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  cookingMode: boolean;
  currentStep: number;
  userPreferences: UserPreferences;
  shoppingList: ShoppingListItem[];
  favorites: Recipe[];
  conversationHistory: ConversationMessage[];

  // Setters
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
  setCurrentRecipe: React.Dispatch<React.SetStateAction<Recipe | null>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSpeaking: React.Dispatch<React.SetStateAction<boolean>>;
  setTranscript: React.Dispatch<React.SetStateAction<string>>;
  setResponse: React.Dispatch<React.SetStateAction<string>>;

  // Actions
  addToShoppingList: (ingredients: Ingredient[]) => void;
  removeFromShoppingList: (ingredientName: string) => void;
  toggleShoppingListItem: (ingredientName: string) => void;
  clearShoppingList: () => void;
  addToFavorites: (recipe: Recipe) => void;
  removeFromFavorites: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
  startCooking: (recipe: Recipe) => void;
  stopCooking: () => void;
  nextStep: () => void;
  previousStep: () => void;
  addToConversation: (message: ConversationMessage) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
}

// Speech Synthesis Types
export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  lang?: string;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

// Search Types
export interface SearchParams {
  query?: string;
  diet?: string;
  cuisine?: string;
  maxTime?: number;
  maxResults?: number;
}

export interface SearchByIngredientsOptions {
  limit?: number;
}

// Spoonacular API Types
export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  summary: string;
  extendedIngredients: SpoonacularIngredient[];
  analyzedInstructions: SpoonacularAnalyzedInstruction[];
  instructions: string;
  nutrition?: {
    nutrients: SpoonacularNutrient[];
  };
  sourceUrl: string;
  spoonacularSourceUrl: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  ketogenic?: boolean;
  sustainable?: boolean;
  pricePerServing: number;
  cuisines: string[];
  dishTypes: string[];
}

export interface SpoonacularIngredient {
  id: number;
  name: string;
  nameClean: string;
  amount: number;
  unit: string;
  original: string;
  aisle: string;
}

export interface SpoonacularAnalyzedInstruction {
  name: string;
  steps: SpoonacularStep[];
}

export interface SpoonacularStep {
  number: number;
  step: string;
  ingredients?: { name: string }[];
  equipment?: { name: string }[];
  length?: {
    number: number;
    unit: string;
  };
}

export interface SpoonacularNutrient {
  name: string;
  amount: number;
  unit: string;
}
