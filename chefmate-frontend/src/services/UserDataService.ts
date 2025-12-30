import axios, { AxiosError } from 'axios';
import { getApiBaseUrl, getAwsApiKey } from './ApiConfig';
import { getIdToken } from './AuthService';
import { Recipe, ShoppingItem, UserPreferences } from '../types';

const baseUrl = getApiBaseUrl().replace(/\/+$/, '');

/**
 * Build headers for authenticated API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add API key
  const apiKey = getAwsApiKey();
  if (apiKey) {
    headers['X-Api-Key'] = apiKey;
  }

  // Add JWT token for authenticated endpoints
  const idToken = await getIdToken();
  if (idToken) {
    headers['Authorization'] = idToken;
  }

  return headers;
}

// ==================== Favorites API ====================

export interface FavoriteRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  savedAt: string;
}

/**
 * Get all favorite recipes
 */
export async function getFavorites(): Promise<FavoriteRecipe[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${baseUrl}/user/favorites`, { headers });
    return response.data.favorites || [];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw formatApiError(error);
  }
}

/**
 * Add a recipe to favorites
 */
export async function addFavorite(recipe: Recipe): Promise<FavoriteRecipe> {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${baseUrl}/user/favorites`,
      {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
      },
      { headers }
    );
    return response.data.favorite;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw formatApiError(error);
  }
}

/**
 * Remove a recipe from favorites
 */
export async function removeFavorite(recipeId: number): Promise<void> {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${baseUrl}/user/favorites/${recipeId}`, { headers });
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw formatApiError(error);
  }
}

// ==================== Shopping List API ====================

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
  recipeSource?: string;
  addedAt?: string;
}

/**
 * Get the shopping list
 */
export async function getShoppingList(): Promise<ShoppingListItem[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${baseUrl}/user/shopping-list`, { headers });
    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    throw formatApiError(error);
  }
}

/**
 * Update the entire shopping list
 */
export async function updateShoppingList(items: ShoppingItem[]): Promise<ShoppingListItem[]> {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${baseUrl}/user/shopping-list`,
      {
        items: items.map((item) => ({
          id: item.id,
          name: item.name,
          amount: item.amount || 1,
          unit: item.unit || '',
          checked: item.checked || false,
          recipeSource: item.recipeSource,
        })),
      },
      { headers }
    );
    return response.data.items || [];
  } catch (error) {
    console.error('Error updating shopping list:', error);
    throw formatApiError(error);
  }
}

// ==================== Preferences API ====================

export interface UserPreferencesResponse {
  preferences: UserPreferences;
  isDefault: boolean;
}

/**
 * Get user preferences
 */
export async function getPreferences(): Promise<UserPreferencesResponse> {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${baseUrl}/user/preferences`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching preferences:', error);
    throw formatApiError(error);
  }
}

/**
 * Update user preferences
 */
export async function updatePreferences(
  preferences: Partial<UserPreferences>
): Promise<UserPreferences> {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${baseUrl}/user/preferences`,
      preferences,
      { headers }
    );
    return response.data.preferences;
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw formatApiError(error);
  }
}

// ==================== Error Handling ====================

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

/**
 * Format API errors into a consistent format
 */
function formatApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    return {
      message:
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'An error occurred',
      status: axiosError.response?.status,
      code: axiosError.code,
    };
  }
  return {
    message: error instanceof Error ? error.message : 'An unknown error occurred',
  };
}

export default {
  getFavorites,
  addFavorite,
  removeFavorite,
  getShoppingList,
  updateShoppingList,
  getPreferences,
  updatePreferences,
};
