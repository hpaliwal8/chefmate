import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
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
export declare function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
