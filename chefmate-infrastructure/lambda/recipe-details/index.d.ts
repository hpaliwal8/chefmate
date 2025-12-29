import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
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
export declare function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
