import axios, { AxiosError } from 'axios';
import { SpoonacularRecipe } from '../types';

interface SearchParams {
  query?: string;
  diet?: string;
  cuisine?: string;
  maxTime?: number;
  limit?: number;
}

interface SearchByIngredientsOptions {
  limit?: number;
}

interface MealPlanParams {
  timeFrame?: string;
  targetCalories?: number;
  diet?: string;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

/**
 * Spoonacular API Provider
 *
 * Routes all API calls through the Vercel serverless proxy (/api/spoonacular)
 * to keep the API key secure on the server side.
 *
 * TODO: Phase 2 - Replace with AWS Lambda + API Gateway for:
 *   - Better NLU with AWS Lex integration
 *   - Response caching with DynamoDB
 *   - User session management
 */
class SpoonacularProvider {
  private proxyURL: string;

  constructor() {
    // Use the Vercel serverless proxy endpoint
    // In development: http://localhost:3000/api/spoonacular
    // In production: https://your-app.vercel.app/api/spoonacular
    this.proxyURL = '/api/spoonacular';
  }

  /**
   * Build proxy URL with query parameters
   */
  private buildURL(endpoint: string, params: Record<string, unknown> = {}): string {
    const url = new URL(this.proxyURL, window.location.origin);
    url.searchParams.append('endpoint', endpoint);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Search recipes with filters
   */
  async search({ query, diet, cuisine, maxTime, limit = 10 }: SearchParams): Promise<SpoonacularRecipe[]> {
    try {
      const url = this.buildURL('/recipes/complexSearch', {
        query,
        diet,
        cuisine,
        maxReadyTime: maxTime,
        number: limit,
        addRecipeInformation: true,
        fillIngredients: true,
        instructionsRequired: true,
      });

      const response = await axios.get(url);
      return response.data.results || [];
    } catch (error) {
      this.handleError(error as AxiosError<ApiErrorResponse>);
      return [];
    }
  }

  /**
   * Get detailed recipe information
   */
  async getDetails(recipeId: number | string): Promise<SpoonacularRecipe> {
    try {
      const url = this.buildURL(`/recipes/${recipeId}/information`, {
        includeNutrition: true,
      });

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiErrorResponse>);
      throw error;
    }
  }

  /**
   * Search recipes by available ingredients
   */
  async searchByIngredients(
    ingredients: string[] | string,
    options: SearchByIngredientsOptions = {}
  ): Promise<SpoonacularRecipe[]> {
    try {
      const url = this.buildURL('/recipes/findByIngredients', {
        ingredients: Array.isArray(ingredients) ? ingredients.join(',') : ingredients,
        number: options.limit || 10,
        ranking: 1,
        ignorePantry: true,
      });

      const response = await axios.get(url);

      // Get full details for each recipe
      const detailedRecipes = await Promise.all(
        response.data.map((recipe: { id: number }) => this.getDetails(recipe.id))
      );

      return detailedRecipes;
    } catch (error) {
      this.handleError(error as AxiosError<ApiErrorResponse>);
      return [];
    }
  }

  /**
   * Get similar recipes
   */
  async getSimilar(recipeId: number | string, limit = 5): Promise<SpoonacularRecipe[]> {
    try {
      const url = this.buildURL(`/recipes/${recipeId}/similar`, {
        number: limit,
      });

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiErrorResponse>);
      return [];
    }
  }

  /**
   * Get ingredient substitutes
   */
  async getSubstitutes(ingredient: string): Promise<{ substitutes: string[] } | null> {
    try {
      const url = this.buildURL('/food/ingredients/substitutes', {
        ingredientName: ingredient,
      });

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiErrorResponse>);
      return null;
    }
  }

  /**
   * Generate meal plan
   * TODO: Enhance with AWS Lambda for user-specific meal planning with DynamoDB persistence
   */
  async generateMealPlan({ timeFrame = 'day', targetCalories, diet }: MealPlanParams): Promise<unknown> {
    try {
      const url = this.buildURL('/mealplanner/generate', {
        timeFrame,
        targetCalories,
        diet,
      });

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.handleError(error as AxiosError<ApiErrorResponse>);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError<ApiErrorResponse>): never {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.response.data?.error || 'Unknown error';

      if (status === 401) {
        throw new Error('Invalid API key. Please check your Spoonacular API key.');
      } else if (status === 402) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (status === 404) {
        throw new Error('Recipe not found.');
      } else {
        throw new Error(`API Error: ${message}`);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
}

export default SpoonacularProvider;
