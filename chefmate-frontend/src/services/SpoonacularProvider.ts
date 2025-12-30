import axios, { AxiosError } from 'axios';
import { SpoonacularRecipe } from '../types';
import { isAwsBackendEnabled, getApiBaseUrl, getApiHeaders } from './ApiConfig';

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
 * Supports two backends:
 * 1. Vercel serverless proxy (/api/spoonacular) - Default MVP
 * 2. AWS Lambda + API Gateway - Phase 1+ (set REACT_APP_USE_AWS_BACKEND=true)
 *
 * AWS backend provides:
 *   - Direct Lambda function endpoints
 *   - API Key authentication
 *   - Better scalability and AWS service integration
 */
class SpoonacularProvider {
  private useAws: boolean;
  private baseUrl: string;

  constructor() {
    this.useAws = isAwsBackendEnabled();
    this.baseUrl = getApiBaseUrl();

    if (this.useAws) {
      console.log('SpoonacularProvider: Using AWS Lambda backend');
    }
  }

  /**
   * Build URL for Vercel proxy (passes endpoint as query param)
   * Always uses /api/spoonacular regardless of AWS backend setting
   * Used for endpoints not yet migrated to AWS Lambda
   */
  private buildVercelURL(endpoint: string, params: Record<string, unknown> = {}): string {
    // Always use Vercel proxy path, not the AWS base URL
    const vercelProxyPath = '/api/spoonacular';
    const url = new URL(vercelProxyPath, window.location.origin);
    url.searchParams.append('endpoint', endpoint);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Build URL for AWS API Gateway (direct endpoint paths)
   */
  private buildAwsURL(path: string, params: Record<string, unknown> = {}): string {
    // Remove leading slash from path and trailing slash from baseUrl to avoid double slashes
    const cleanBase = this.baseUrl.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    const url = new URL(`${cleanBase}/${cleanPath}`);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    return url.toString();
  }

  /**
   * Make API request with appropriate headers
   */
  private async request<T>(url: string): Promise<T> {
    const response = await axios.get<T>(url, {
      headers: getApiHeaders(),
    });
    return response.data;
  }

  /**
   * Search recipes with filters
   */
  async search({ query, diet, cuisine, maxTime, limit = 10 }: SearchParams): Promise<SpoonacularRecipe[]> {
    try {
      const params = {
        query,
        diet,
        cuisine,
        maxReadyTime: maxTime,
        number: limit,
        addRecipeInformation: true,
        fillIngredients: true,
        instructionsRequired: true,
      };

      let url: string;
      if (this.useAws) {
        // AWS endpoint: GET /recipes/search
        url = this.buildAwsURL('/recipes/search', params);
      } else {
        // Vercel proxy: passes endpoint as query param
        url = this.buildVercelURL('/recipes/complexSearch', params);
      }

      const data = await this.request<{ results: SpoonacularRecipe[] }>(url);
      return data.results || [];
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
      let url: string;
      if (this.useAws) {
        // AWS endpoint: GET /recipes/{recipeId}
        url = this.buildAwsURL(`/recipes/${recipeId}`, {
          includeNutrition: true,
        });
      } else {
        // Vercel proxy
        url = this.buildVercelURL(`/recipes/${recipeId}/information`, {
          includeNutrition: true,
        });
      }

      return await this.request<SpoonacularRecipe>(url);
    } catch (error) {
      this.handleError(error as AxiosError<ApiErrorResponse>);
      throw error;
    }
  }

  /**
   * Search recipes by available ingredients
   * AWS: Uses /recipes/search with ingredients parameter
   * Vercel: Uses /recipes/findByIngredients
   */
  async searchByIngredients(
    ingredients: string[] | string,
    options: SearchByIngredientsOptions = {}
  ): Promise<SpoonacularRecipe[]> {
    try {
      const ingredientList = Array.isArray(ingredients) ? ingredients.join(',') : ingredients;

      if (this.useAws) {
        // AWS endpoint: GET /recipes/search with ingredients param
        const url = this.buildAwsURL('/recipes/search', {
          ingredients: ingredientList,
          number: options.limit || 10,
          addRecipeInformation: true,
          fillIngredients: true,
        });

        const data = await this.request<{ results: SpoonacularRecipe[] }>(url);
        return data.results || [];
      } else {
        // Vercel proxy: use findByIngredients endpoint
        const url = this.buildVercelURL('/recipes/findByIngredients', {
          ingredients: ingredientList,
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
      }
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
      let url: string;
      if (this.useAws) {
        // AWS endpoint: GET /recipes/{recipeId}/similar
        url = this.buildAwsURL(`/recipes/${recipeId}/similar`, {
          number: limit,
        });
      } else {
        // Vercel proxy
        url = this.buildVercelURL(`/recipes/${recipeId}/similar`, {
          number: limit,
        });
      }

      return await this.request<SpoonacularRecipe[]>(url);
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
      let url: string;
      if (this.useAws) {
        // AWS endpoint: GET /food/ingredients/substitutes
        url = this.buildAwsURL('/food/ingredients/substitutes', {
          ingredientName: ingredient,
        });
      } else {
        // Vercel proxy
        url = this.buildVercelURL('/food/ingredients/substitutes', {
          ingredientName: ingredient,
        });
      }

      return await this.request<{ substitutes: string[] }>(url);
    } catch (error) {
      this.handleError(error as AxiosError<ApiErrorResponse>);
      return null;
    }
  }

  /**
   * Generate meal plan
   */
  async generateMealPlan({ timeFrame = 'day', targetCalories, diet }: MealPlanParams): Promise<unknown> {
    try {
      let url: string;
      if (this.useAws) {
        // AWS endpoint: GET /meal-plan/generate
        url = this.buildAwsURL('/meal-plan/generate', {
          timeFrame,
          targetCalories,
          diet,
        });
      } else {
        // Vercel proxy
        url = this.buildVercelURL('/mealplanner/generate', {
          timeFrame,
          targetCalories,
          diet,
        });
      }

      return await this.request<unknown>(url);
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
      } else if (status === 403) {
        throw new Error('Access forbidden. Please check your AWS API key.');
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
