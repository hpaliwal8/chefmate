import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/**
 * User Preferences Lambda Handler
 *
 * Routes:
 * - GET /user/preferences - Get user preferences
 * - PUT /user/preferences - Update user preferences
 */
export declare function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult>;
