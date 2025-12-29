import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from '../shared/response-utils';

/**
 * User Preferences Lambda Handler
 *
 * This is a placeholder for Phase 2 (DynamoDB integration).
 * Currently returns mock data to maintain API compatibility.
 *
 * GET /user/preferences - Get user preferences
 * POST /user/preferences - Update user preferences
 */

// Default preferences for new users
const defaultPreferences: UserPreferences = {
  dietaryRestrictions: [],
  favoriteCuisines: [],
  allergies: [],
  targetCalories: 2000,
  servingSize: 2,
  measurementSystem: 'us',
};

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return corsPreflightResponse();
  }

  const method = event.httpMethod;

  try {
    switch (method) {
      case 'GET':
        return handleGetPreferences();

      case 'POST':
      case 'PUT':
        return handleUpdatePreferences(event);

      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('User preferences error:', error);

    if (error instanceof Error) {
      return errorResponse(error.message, 500);
    }

    return errorResponse('Failed to process preferences request', 500);
  }
}

/**
 * Handle GET request - Return user preferences
 * In Phase 2, this will fetch from DynamoDB
 */
async function handleGetPreferences(): Promise<APIGatewayProxyResult> {
  // TODO: Phase 2 - Fetch from DynamoDB using user ID from Cognito
  // For now, return default preferences

  return successResponse({
    preferences: defaultPreferences,
    message: 'Preferences retrieved successfully',
    // Flag to indicate this is placeholder data
    _isPlaceholder: true,
  });
}

/**
 * Handle POST/PUT request - Update user preferences
 * In Phase 2, this will persist to DynamoDB
 */
async function handleUpdatePreferences(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  let preferences: Partial<UserPreferences>;

  try {
    preferences = JSON.parse(event.body);
  } catch {
    return errorResponse('Invalid JSON in request body', 400);
  }

  // Validate preferences
  const validationError = validatePreferences(preferences);
  if (validationError) {
    return errorResponse(validationError, 400);
  }

  // TODO: Phase 2 - Persist to DynamoDB using user ID from Cognito
  // For now, just return the merged preferences

  const mergedPreferences = {
    ...defaultPreferences,
    ...preferences,
  };

  return successResponse({
    preferences: mergedPreferences,
    message: 'Preferences updated successfully',
    // Flag to indicate this is placeholder - not actually persisted
    _isPlaceholder: true,
  });
}

/**
 * Validate user preferences
 */
function validatePreferences(preferences: Partial<UserPreferences>): string | null {
  if (preferences.dietaryRestrictions !== undefined) {
    if (!Array.isArray(preferences.dietaryRestrictions)) {
      return 'dietaryRestrictions must be an array';
    }
    const validDiets = ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'keto', 'paleo', 'lowFodmap'];
    for (const diet of preferences.dietaryRestrictions) {
      if (!validDiets.includes(diet)) {
        return `Invalid dietary restriction: ${diet}`;
      }
    }
  }

  if (preferences.favoriteCuisines !== undefined) {
    if (!Array.isArray(preferences.favoriteCuisines)) {
      return 'favoriteCuisines must be an array';
    }
  }

  if (preferences.allergies !== undefined) {
    if (!Array.isArray(preferences.allergies)) {
      return 'allergies must be an array';
    }
  }

  if (preferences.targetCalories !== undefined) {
    if (typeof preferences.targetCalories !== 'number' || preferences.targetCalories < 500 || preferences.targetCalories > 10000) {
      return 'targetCalories must be a number between 500 and 10000';
    }
  }

  if (preferences.servingSize !== undefined) {
    if (typeof preferences.servingSize !== 'number' || preferences.servingSize < 1 || preferences.servingSize > 20) {
      return 'servingSize must be a number between 1 and 20';
    }
  }

  if (preferences.measurementSystem !== undefined) {
    if (!['us', 'metric'].includes(preferences.measurementSystem)) {
      return 'measurementSystem must be "us" or "metric"';
    }
  }

  return null;
}

interface UserPreferences {
  dietaryRestrictions: string[];
  favoriteCuisines: string[];
  allergies: string[];
  targetCalories: number;
  servingSize: number;
  measurementSystem: 'us' | 'metric';
}
