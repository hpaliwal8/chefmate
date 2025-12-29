import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * CORS headers for API Gateway responses
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key, Authorization',
  'Content-Type': 'application/json',
};

/**
 * Create a successful JSON response
 */
export function successResponse(body: unknown, statusCode = 200): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      ...corsHeaders,
      'Cache-Control': 's-maxage=300, stale-while-revalidate',
    },
    body: JSON.stringify(body),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  message: string,
  statusCode = 500,
  details?: unknown
): APIGatewayProxyResult {
  const body: Record<string, unknown> = {
    error: message,
    status: statusCode,
  };

  if (details) {
    body.details = details;
  }

  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body),
  };
}

/**
 * Create a CORS preflight response
 */
export function corsPreflightResponse(): APIGatewayProxyResult {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: '',
  };
}

/**
 * Parse query string parameters with defaults
 */
export function parseQueryParams<T extends Record<string, string | undefined>>(
  queryParams: Record<string, string | undefined> | null,
  defaults: T
): T {
  if (!queryParams) {
    return defaults;
  }

  return {
    ...defaults,
    ...queryParams,
  };
}
