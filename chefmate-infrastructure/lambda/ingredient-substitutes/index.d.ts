import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Ingredient Substitutes Lambda Handler
 *
 * GET /food/ingredients/substitutes
 *
 * Query Parameters:
 * - ingredientName: The name of the ingredient to find substitutes for (required)
 */
export declare function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
