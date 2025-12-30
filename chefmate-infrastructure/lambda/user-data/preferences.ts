import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  getUserIdFromEvent,
  getItem,
  putItem,
  buildResponse,
} from '../shared/dynamodb-client';

interface UserPreferences {
  PK: string;
  SK: string;
  dietaryRestrictions: string[];
  allergies: string[];
  favoriteCuisines: string[];
  dislikedIngredients: string[];
  cookingSkillLevel: 'beginner' | 'intermediate' | 'advanced';
  maxCookingTime: number;
  servingSize: number;
  createdAt: string;
  updatedAt: string;
}

interface PreferencesInput {
  dietaryRestrictions?: string[];
  allergies?: string[];
  favoriteCuisines?: string[];
  dislikedIngredients?: string[];
  cookingSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
  maxCookingTime?: number;
  servingSize?: number;
}

const DEFAULT_PREFERENCES: Omit<UserPreferences, 'PK' | 'SK' | 'createdAt' | 'updatedAt'> = {
  dietaryRestrictions: [],
  allergies: [],
  favoriteCuisines: [],
  dislikedIngredients: [],
  cookingSkillLevel: 'intermediate',
  maxCookingTime: 60,
  servingSize: 2,
};

/**
 * User Preferences Lambda Handler
 *
 * Routes:
 * - GET /user/preferences - Get user preferences
 * - PUT /user/preferences - Update user preferences
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Preferences Lambda invoked:', {
    method: event.httpMethod,
    path: event.path,
  });

  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return buildResponse(401, { error: 'Unauthorized: User ID not found in token' });
  }

  const userPK = `USER#${userId}`;
  const sk = 'PREFERENCES';

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getPreferences(userPK, sk);

      case 'PUT':
        return await updatePreferences(userPK, sk, event.body);

      default:
        return buildResponse(405, { error: `Method ${event.httpMethod} not allowed` });
    }
  } catch (error) {
    console.error('Error in preferences handler:', error);
    return buildResponse(500, {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get user preferences, return defaults if none exist
 */
async function getPreferences(userPK: string, sk: string): Promise<APIGatewayProxyResult> {
  const item = await getItem<UserPreferences>(userPK, sk);

  if (!item) {
    // Return default preferences for new users
    return buildResponse(200, {
      preferences: DEFAULT_PREFERENCES,
      isDefault: true,
    });
  }

  // Transform to frontend format (remove PK/SK)
  const preferences: PreferencesInput = {
    dietaryRestrictions: item.dietaryRestrictions,
    allergies: item.allergies,
    favoriteCuisines: item.favoriteCuisines,
    dislikedIngredients: item.dislikedIngredients,
    cookingSkillLevel: item.cookingSkillLevel,
    maxCookingTime: item.maxCookingTime,
    servingSize: item.servingSize,
  };

  return buildResponse(200, { preferences, isDefault: false });
}

/**
 * Update user preferences (merge with existing)
 */
async function updatePreferences(
  userPK: string,
  sk: string,
  body: string | null
): Promise<APIGatewayProxyResult> {
  if (!body) {
    return buildResponse(400, { error: 'Request body is required' });
  }

  let input: PreferencesInput;
  try {
    input = JSON.parse(body);
  } catch {
    return buildResponse(400, { error: 'Invalid JSON in request body' });
  }

  // Validate input
  const validationError = validatePreferences(input);
  if (validationError) {
    return buildResponse(400, { error: validationError });
  }

  // Get existing preferences to merge
  const existing = await getItem<UserPreferences>(userPK, sk);
  const now = new Date().toISOString();

  const preferences = {
    dietaryRestrictions: input.dietaryRestrictions ?? existing?.dietaryRestrictions ?? DEFAULT_PREFERENCES.dietaryRestrictions,
    allergies: input.allergies ?? existing?.allergies ?? DEFAULT_PREFERENCES.allergies,
    favoriteCuisines: input.favoriteCuisines ?? existing?.favoriteCuisines ?? DEFAULT_PREFERENCES.favoriteCuisines,
    dislikedIngredients: input.dislikedIngredients ?? existing?.dislikedIngredients ?? DEFAULT_PREFERENCES.dislikedIngredients,
    cookingSkillLevel: input.cookingSkillLevel ?? existing?.cookingSkillLevel ?? DEFAULT_PREFERENCES.cookingSkillLevel,
    maxCookingTime: input.maxCookingTime ?? existing?.maxCookingTime ?? DEFAULT_PREFERENCES.maxCookingTime,
    servingSize: input.servingSize ?? existing?.servingSize ?? DEFAULT_PREFERENCES.servingSize,
    createdAt: existing?.createdAt ?? now,
  };

  await putItem(userPK, sk, preferences);

  return buildResponse(200, {
    message: 'Preferences updated',
    preferences,
  });
}

/**
 * Validate preferences input
 */
function validatePreferences(input: PreferencesInput): string | null {
  if (input.dietaryRestrictions && !Array.isArray(input.dietaryRestrictions)) {
    return 'dietaryRestrictions must be an array';
  }
  if (input.allergies && !Array.isArray(input.allergies)) {
    return 'allergies must be an array';
  }
  if (input.favoriteCuisines && !Array.isArray(input.favoriteCuisines)) {
    return 'favoriteCuisines must be an array';
  }
  if (input.dislikedIngredients && !Array.isArray(input.dislikedIngredients)) {
    return 'dislikedIngredients must be an array';
  }
  if (input.cookingSkillLevel && !['beginner', 'intermediate', 'advanced'].includes(input.cookingSkillLevel)) {
    return 'cookingSkillLevel must be beginner, intermediate, or advanced';
  }
  if (input.maxCookingTime !== undefined && (typeof input.maxCookingTime !== 'number' || input.maxCookingTime < 0)) {
    return 'maxCookingTime must be a positive number';
  }
  if (input.servingSize !== undefined && (typeof input.servingSize !== 'number' || input.servingSize < 1)) {
    return 'servingSize must be a positive number';
  }
  return null;
}
