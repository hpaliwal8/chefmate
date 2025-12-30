import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from '../shared/response-utils';
import {
  createSpoonacularClient,
  SpoonacularError,
  RecipeSearchResult,
} from '../shared/spoonacular-client';

/**
 * Recipe Search Lambda Handler
 *
 * GET /recipes/search
 *
 * Query Parameters:
 * - query: Search query string
 * - diet: Diet type (vegetarian, vegan, glutenFree, etc.)
 * - cuisine: Cuisine type (italian, mexican, indian, etc.)
 * - maxReadyTime: Maximum preparation time in minutes
 * - number: Number of results (default: 10, max: 100)
 * - offset: Results offset for pagination
 * - includeNutrition: Include nutrition info (default: true)
 * - ingredients: Comma-separated list of ingredients to include (for ingredient-based search)
 * - excludeIngredients: Comma-separated list of ingredients to exclude
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return corsPreflightResponse();
  }

  if (event.httpMethod !== 'GET') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const client = createSpoonacularClient();
    const params = event.queryStringParameters || {};

    // Build search parameters
    const searchParams: Record<string, string | number | boolean | undefined> = {
      query: params.query,
      diet: params.diet,
      cuisine: params.cuisine,
      maxReadyTime: params.maxReadyTime ? parseInt(params.maxReadyTime, 10) : undefined,
      number: params.number ? parseInt(params.number, 10) : 10,
      offset: params.offset ? parseInt(params.offset, 10) : 0,
      addRecipeNutrition: params.includeNutrition !== 'false',
      addRecipeInformation: true,
      fillIngredients: true,
      instructionsRequired: true,
    };

    // Add ingredient-based search parameters
    if (params.ingredients) {
      searchParams.includeIngredients = params.ingredients;
    }
    if (params.excludeIngredients) {
      searchParams.excludeIngredients = params.excludeIngredients;
    }

    // Add multiple diet/intolerances if provided
    if (params.intolerances) {
      searchParams.intolerances = params.intolerances;
    }

    if (params.type) {
      searchParams.type = params.type;
    }

    const result = await client.get<RecipeSearchResult>({
      endpoint: '/recipes/complexSearch',
      params: searchParams,
    });

    return successResponse(result);
  } catch (error) {
    console.error('Recipe search error:', error);

    if (error instanceof SpoonacularError) {
      return errorResponse(error.message, error.status, error.details);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }

    return errorResponse('Failed to search recipes', 500);
  }
}
