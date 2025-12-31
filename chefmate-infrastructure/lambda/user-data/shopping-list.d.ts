import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * Shopping List Lambda Handler
 *
 * Routes:
 * - GET /user/shopping-list - Get the shopping list
 * - PUT /user/shopping-list - Replace entire shopping list
 */
export declare function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
