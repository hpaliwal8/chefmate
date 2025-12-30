import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from '../shared/response-utils';
import {
  createSpoonacularClient,
  SpoonacularError,
} from '../shared/spoonacular-client';

/**
 * Ingredient substitutes response from Spoonacular
 */
interface IngredientSubstitutesResponse {
  ingredient: string;
  substitutes: string[];
  message: string;
}

/**
 * Ingredient Substitutes Lambda Handler
 *
 * GET /food/ingredients/substitutes
 *
 * Query Parameters:
 * - ingredientName: The name of the ingredient to find substitutes for (required)
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
    const params = event.queryStringParameters || {};
    const ingredientName = params.ingredientName;

    if (!ingredientName) {
      return errorResponse('ingredientName query parameter is required', 400);
    }

    const client = createSpoonacularClient();

    const result = await client.get<IngredientSubstitutesResponse>({
      endpoint: '/food/ingredients/substitutes',
      params: {
        ingredientName,
      },
    });

    return successResponse(result);
  } catch (error) {
    console.error('Ingredient substitutes error:', error);

    if (error instanceof SpoonacularError) {
      // Spoonacular returns 404 when no substitutes found
      if (error.status === 404) {
        return successResponse({
          ingredient: event.queryStringParameters?.ingredientName || '',
          substitutes: [],
          message: 'No substitutes found for this ingredient',
        });
      }
      return errorResponse(error.message, error.status, error.details);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }

    return errorResponse('Failed to get ingredient substitutes', 500);
  }
}
