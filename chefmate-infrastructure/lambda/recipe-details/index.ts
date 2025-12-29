import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from '../shared/response-utils';
import {
  createSpoonacularClient,
  SpoonacularError,
  RecipeDetails,
} from '../shared/spoonacular-client';

/**
 * Recipe Details Lambda Handler
 *
 * GET /recipes/{recipeId}
 *
 * Path Parameters:
 * - recipeId: The Spoonacular recipe ID
 *
 * Query Parameters:
 * - includeNutrition: Include nutrition info (default: true)
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

    // Validate recipe ID is a number
    const recipeIdNum = parseInt(recipeId, 10);
    if (isNaN(recipeIdNum)) {
      return errorResponse('Invalid recipe ID', 400);
    }

    const client = createSpoonacularClient();
    const params = event.queryStringParameters || {};

    const result = await client.get<RecipeDetails>({
      endpoint: `/recipes/${recipeIdNum}/information`,
      params: {
        includeNutrition: params.includeNutrition !== 'false',
      },
    });

    // Transform the response to include formatted instructions
    const transformedResult = {
      ...result,
      instructions: formatInstructions(result),
    };

    return successResponse(transformedResult);
  } catch (error) {
    console.error('Recipe details error:', error);

    if (error instanceof SpoonacularError) {
      return errorResponse(error.message, error.status, error.details);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }

    return errorResponse('Failed to fetch recipe details', 500);
  }
}

/**
 * Format instructions from analyzedInstructions to a simpler format
 */
function formatInstructions(recipe: RecipeDetails): FormattedInstruction[] {
  if (!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) {
    return [];
  }

  const instructions: FormattedInstruction[] = [];

  for (const instruction of recipe.analyzedInstructions) {
    for (const step of instruction.steps) {
      instructions.push({
        number: step.number,
        step: step.step,
        ingredients: step.ingredients?.map((ing) => ing.name) || [],
        equipment: step.equipment?.map((eq) => eq.name) || [],
        length: step.length,
      });
    }
  }

  return instructions;
}

interface FormattedInstruction {
  number: number;
  step: string;
  ingredients: string[];
  equipment: string[];
  length?: {
    number: number;
    unit: string;
  };
}
