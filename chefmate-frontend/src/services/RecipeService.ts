import SpoonacularProvider from './SpoonacularProvider';
import {
  Recipe,
  Ingredient,
  InstructionStep,
  Nutrition,
  NutrientInfo,
  SearchParams,
  SearchByIngredientsOptions,
  SpoonacularRecipe,
  SpoonacularIngredient,
} from '../types';

/**
 * RecipeService - Abstraction layer for recipe data
 * Makes it easy to add new providers (Edamam, MealDB, etc.) later
 */
class RecipeService {
  private providers: {
    spoonacular: SpoonacularProvider;
  };
  private primaryProvider: string;

  constructor() {
    this.providers = {
      spoonacular: new SpoonacularProvider(),
      // Future: edamam: new EdamamProvider(),
      // Future: mealdb: new MealDBProvider()
    };

    this.primaryProvider = 'spoonacular';
  }

  /**
   * Search recipes with various filters
   */
  async searchRecipes(params: SearchParams): Promise<Recipe[]> {
    const { query, diet, cuisine, maxTime, maxResults = 10 } = params;

    try {
      const results = await this.providers.spoonacular.search({
        query,
        diet,
        cuisine,
        maxTime,
        limit: maxResults,
      });

      return results.map((recipe) => this.normalizeRecipe(recipe, 'spoonacular'));
    } catch (error) {
      console.error('Recipe search failed:', error);
      throw new Error('Failed to search recipes. Please try again.');
    }
  }

  /**
   * Get detailed recipe information
   */
  async getRecipeDetails(recipeId: string | number, source = 'spoonacular'): Promise<Recipe> {
    try {
      const provider = this.providers[source as keyof typeof this.providers];
      const recipe = await provider.getDetails(recipeId);
      return this.normalizeRecipe(recipe, source);
    } catch (error) {
      console.error('Failed to get recipe details:', error);
      throw new Error('Failed to load recipe details.');
    }
  }

  /**
   * Search recipes by available ingredients
   */
  async searchByIngredients(
    ingredients: string[],
    options: SearchByIngredientsOptions = {}
  ): Promise<Recipe[]> {
    try {
      const results = await this.providers.spoonacular.searchByIngredients(
        ingredients,
        options
      );

      return results.map((recipe) => this.normalizeRecipe(recipe, 'spoonacular'));
    } catch (error) {
      console.error('Ingredient search failed:', error);
      throw new Error('Failed to search by ingredients.');
    }
  }

  /**
   * Get ingredient substitutions
   */
  async getSubstitutes(ingredient: string): Promise<{ substitutes: string[] } | null> {
    try {
      return await this.providers.spoonacular.getSubstitutes(ingredient);
    } catch (error) {
      console.error('Failed to get substitutes:', error);
      return null;
    }
  }

  /**
   * Normalize recipe from any provider to common format
   */
  private normalizeRecipe(recipe: SpoonacularRecipe, source: string): Recipe {
    switch (source) {
      case 'spoonacular':
        return this.normalizeSpoonacular(recipe);
      default:
        throw new Error(`Unknown provider: ${source}`);
    }
  }

  /**
   * Convert Spoonacular recipe to common format
   */
  private normalizeSpoonacular(recipe: SpoonacularRecipe): Recipe {
    return {
      id: recipe.id?.toString() || 'unknown',
      title: recipe.title || 'Untitled Recipe',
      image: recipe.image || 'https://via.placeholder.com/312x231?text=No+Image',
      readyInMinutes: recipe.readyInMinutes || null,
      servings: recipe.servings || 1,
      summary: this.stripHtml(recipe.summary || ''),
      diets: this.extractDiets(recipe),
      ingredients: this.normalizeIngredients(recipe.extendedIngredients || []),
      instructions: this.normalizeSpoonacularInstructions(recipe),
      nutrition: this.normalizeNutrition(recipe.nutrition),
      source: 'spoonacular',
      sourceUrl: recipe.sourceUrl || recipe.spoonacularSourceUrl || '',
      hasVoiceGuidance: this.hasInstructions(recipe),
      vegetarian: recipe.vegetarian || false,
      vegan: recipe.vegan || false,
      glutenFree: recipe.glutenFree || false,
      dairyFree: recipe.dairyFree || false,
      pricePerServing: recipe.pricePerServing || null,
      cuisines: recipe.cuisines || [],
      dishTypes: recipe.dishTypes || [],
    };
  }

  private normalizeIngredients(ingredients: SpoonacularIngredient[]): Ingredient[] {
    return ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name || ing.nameClean || 'Unknown ingredient',
      amount: ing.amount || 0,
      unit: ing.unit || '',
      original: ing.original || `${ing.amount} ${ing.unit} ${ing.name}`,
      aisle: ing.aisle || 'Unknown',
    }));
  }

  private normalizeSpoonacularInstructions(recipe: SpoonacularRecipe): InstructionStep[] {
    if (!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) {
      // Try to parse instructions from string if available
      if (recipe.instructions && typeof recipe.instructions === 'string') {
        return this.parseInstructionsString(recipe.instructions);
      }
      return [];
    }

    return recipe.analyzedInstructions[0].steps.map((step) => ({
      number: step.number,
      step: step.step,
      ingredients: step.ingredients?.map((ing) => ing.name) || [],
      equipment: step.equipment?.map((eq) => eq.name) || [],
      length: step.length
        ? {
            number: step.length.number,
            unit: step.length.unit,
          }
        : null,
    }));
  }

  private parseInstructionsString(instructionsStr: string): InstructionStep[] {
    // Simple parser for instruction strings
    const cleaned = this.stripHtml(instructionsStr);
    const steps = cleaned.split(/\d+\.\s+/).filter((s) => s.trim());

    return steps.map((step, index) => ({
      number: index + 1,
      step: step.trim(),
      ingredients: [],
      equipment: [],
      length: null,
    }));
  }

  private normalizeNutrition(
    nutrition?: { nutrients: { name: string; amount: number; unit: string }[] }
  ): Nutrition | null {
    if (!nutrition || !nutrition.nutrients) return null;

    const findNutrient = (name: string): NutrientInfo | null => {
      const nutrient = nutrition.nutrients.find((n) => n.name === name);
      return nutrient
        ? {
            amount: nutrient.amount,
            unit: nutrient.unit,
          }
        : null;
    };

    return {
      calories: findNutrient('Calories'),
      protein: findNutrient('Protein'),
      carbs: findNutrient('Carbohydrates'),
      fat: findNutrient('Fat'),
      fiber: findNutrient('Fiber'),
      sugar: findNutrient('Sugar'),
    };
  }

  private extractDiets(recipe: SpoonacularRecipe): string[] {
    const diets: string[] = [];
    if (recipe.vegetarian) diets.push('vegetarian');
    if (recipe.vegan) diets.push('vegan');
    if (recipe.glutenFree) diets.push('gluten-free');
    if (recipe.dairyFree) diets.push('dairy-free');
    if (recipe.ketogenic) diets.push('keto');
    if (recipe.sustainable) diets.push('sustainable');
    return diets;
  }

  private hasInstructions(recipe: SpoonacularRecipe): boolean {
    return (
      (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) ||
      (!!recipe.instructions && recipe.instructions.length > 0)
    );
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '');
  }
}

const recipeService = new RecipeService();
export default recipeService;
