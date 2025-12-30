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
 * Similar recipe response from Spoonacular
 */
interface SimilarRecipe {
  id: number;
  title: string;
  imageType: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
}

/**
 * Similar Recipes Lambda Handler
 *
 * GET /recipes/{recipeId}/similar
 *
 * Path Parameters:
 * - recipeId: The ID of the recipe to find similar recipes for
 *
 * Query Parameters:
 * - number: Number of similar recipes to return (default: 5, max: 100)
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
    const recipeId = event.pathParameters?.recipeId;

    if (!recipeId) {
      return errorResponse('Recipe ID is required', 400);
    }

    const client = createSpoonacularClient();
    const params = event.queryStringParameters || {};

    const result = await client.get<SimilarRecipe[]>({
      endpoint: `/recipes/${recipeId}/similar`,
      params: {
        number: params.number ? parseInt(params.number, 10) : 5,
      },
    });

    return successResponse(result);
  } catch (error) {
    console.error('Similar recipes error:', error);

    if (error instanceof SpoonacularError) {
      return errorResponse(error.message, error.status, error.details);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }

    return errorResponse('Failed to get similar recipes', 500);
  }
}
