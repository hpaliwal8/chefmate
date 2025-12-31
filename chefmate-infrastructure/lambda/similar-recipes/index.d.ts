import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
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
export declare function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
