/**
 * API Configuration
 *
 * Manages switching between Vercel serverless functions (MVP)
 * and AWS Lambda + API Gateway (Phase 1+)
 *
 * Set REACT_APP_USE_AWS_BACKEND=true in .env.local to use AWS backend
 */

export interface ApiConfig {
  useAws: boolean;
  baseUrl: string;
  apiKey?: string;
}

/**
 * Check if AWS backend is enabled
 */
export const isAwsBackendEnabled = (): boolean => {
  return process.env.REACT_APP_USE_AWS_BACKEND === 'true';
};

/**
 * Get the API base URL based on configuration
 */
export const getApiBaseUrl = (): string => {
  if (isAwsBackendEnabled()) {
    const awsEndpoint = process.env.REACT_APP_AWS_API_ENDPOINT;
    if (!awsEndpoint) {
      console.warn('AWS backend enabled but REACT_APP_AWS_API_ENDPOINT not set, falling back to Vercel');
      return '/api/spoonacular';
    }
    return awsEndpoint;
  }
  return '/api/spoonacular';
};

/**
 * Get the AWS API key if configured
 */
export const getAwsApiKey = (): string | undefined => {
  return process.env.REACT_APP_AWS_API_KEY;
};

/**
 * Get complete API configuration
 */
export const getApiConfig = (): ApiConfig => {
  const useAws = isAwsBackendEnabled();
  return {
    useAws,
    baseUrl: getApiBaseUrl(),
    apiKey: useAws ? getAwsApiKey() : undefined,
  };
};

/**
 * Build request headers for API calls
 * AWS endpoints require X-Api-Key header
 */
export const getApiHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (isAwsBackendEnabled()) {
    const apiKey = getAwsApiKey();
    if (apiKey) {
      headers['X-Api-Key'] = apiKey;
    }
  }

  return headers;
};

export default {
  isAwsBackendEnabled,
  getApiBaseUrl,
  getAwsApiKey,
  getApiConfig,
  getApiHeaders,
};
