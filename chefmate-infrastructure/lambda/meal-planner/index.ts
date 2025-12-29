import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from '../shared/response-utils';
import {
  createSpoonacularClient,
  SpoonacularError,
  MealPlanDay,
  MealPlanWeek,
} from '../shared/spoonacular-client';

/**
 * Meal Planner Lambda Handler
 *
 * GET /meal-plan/generate
 *
 * Query Parameters:
 * - timeFrame: 'day' or 'week' (default: 'day')
 * - targetCalories: Target calories per day (default: 2000)
 * - diet: Diet type (vegetarian, vegan, etc.)
 * - exclude: Ingredients to exclude (comma-separated)
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

    const timeFrame = params.timeFrame || 'day';
    const targetCalories = params.targetCalories
      ? parseInt(params.targetCalories, 10)
      : 2000;

    if (timeFrame !== 'day' && timeFrame !== 'week') {
      return errorResponse('timeFrame must be "day" or "week"', 400);
    }

    const searchParams: Record<string, string | number | boolean | undefined> = {
      timeFrame,
      targetCalories,
      diet: params.diet,
      exclude: params.exclude,
    };

    const result = await client.get<MealPlanDay | MealPlanWeek>({
      endpoint: '/mealplanner/generate',
      params: searchParams,
    });

    // Transform the response based on timeFrame
    const transformedResult = transformMealPlan(result, timeFrame);

    return successResponse(transformedResult);
  } catch (error) {
    console.error('Meal planner error:', error);

    if (error instanceof SpoonacularError) {
      return errorResponse(error.message, error.status, error.details);
    }

    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }

    return errorResponse('Failed to generate meal plan', 500);
  }
}

/**
 * Transform meal plan response to a consistent format
 */
function transformMealPlan(
  result: MealPlanDay | MealPlanWeek,
  timeFrame: 'day' | 'week'
): TransformedMealPlan {
  if (timeFrame === 'day') {
    const dayPlan = result as MealPlanDay;
    return {
      timeFrame: 'day',
      days: [
        {
          day: 'today',
          meals: dayPlan.meals.map(transformMeal),
          nutrients: dayPlan.nutrients,
        },
      ],
    };
  }

  const weekPlan = result as MealPlanWeek;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

  return {
    timeFrame: 'week',
    days: days.map((day) => ({
      day,
      meals: weekPlan.week[day].meals.map(transformMeal),
      nutrients: weekPlan.week[day].nutrients,
    })),
  };
}

function transformMeal(meal: MealPlanDay['meals'][0]): TransformedMeal {
  return {
    id: meal.id,
    title: meal.title,
    readyInMinutes: meal.readyInMinutes,
    servings: meal.servings,
    sourceUrl: meal.sourceUrl,
    image: `https://spoonacular.com/recipeImages/${meal.id}-556x370.${meal.imageType}`,
  };
}

interface TransformedMeal {
  id: number;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  image: string;
}

interface TransformedMealPlanDay {
  day: string;
  meals: TransformedMeal[];
  nutrients: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

interface TransformedMealPlan {
  timeFrame: 'day' | 'week';
  days: TransformedMealPlanDay[];
}
