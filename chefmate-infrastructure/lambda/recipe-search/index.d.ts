import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
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
 */
export declare function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
