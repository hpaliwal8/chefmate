import { APIGatewayProxyResult } from 'aws-lambda';
/**
 * CORS headers for API Gateway responses
 */
export declare const corsHeaders: {
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Methods': string;
    'Access-Control-Allow-Headers': string;
    'Content-Type': string;
};
/**
 * Create a successful JSON response
 */
export declare function successResponse(body: unknown, statusCode?: number): APIGatewayProxyResult;
/**
 * Create an error response
 */
export declare function errorResponse(message: string, statusCode?: number, details?: unknown): APIGatewayProxyResult;
/**
 * Create a CORS preflight response
 */
export declare function corsPreflightResponse(): APIGatewayProxyResult;
/**
 * Parse query string parameters with defaults
 */
export declare function parseQueryParams<T extends Record<string, string | undefined>>(queryParams: Record<string, string | undefined> | null, defaults: T): T;
