import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Favorites Lambda Handler
 *
 * Routes:
 * - GET /user/favorites - List all favorites
 * - POST /user/favorites - Add a favorite
 * - DELETE /user/favorites/{recipeId} - Remove a favorite
 */
export declare function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
