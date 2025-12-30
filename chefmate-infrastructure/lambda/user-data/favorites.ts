import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  getUserIdFromEvent,
  getItem,
  putItem,
  deleteItem,
  queryItems,
  buildResponse,
} from '../shared/dynamodb-client';

interface FavoriteRecipe {
  PK: string;
  SK: string;
  recipeId: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  savedAt: string;
}

/**
 * Favorites Lambda Handler
 *
 * Routes:
 * - GET /user/favorites - List all favorites
 * - POST /user/favorites - Add a favorite
 * - DELETE /user/favorites/{recipeId} - Remove a favorite
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Favorites Lambda invoked:', {
    method: event.httpMethod,
    path: event.path,
    pathParameters: event.pathParameters,
  });

  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return buildResponse(401, { error: 'Unauthorized: User ID not found in token' });
  }

  const userPK = `USER#${userId}`;

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await listFavorites(userPK);

      case 'POST':
        return await addFavorite(userPK, event.body);

      case 'DELETE':
        const recipeId = event.pathParameters?.recipeId;
        if (!recipeId) {
          return buildResponse(400, { error: 'Recipe ID is required' });
        }
        return await removeFavorite(userPK, recipeId);

      default:
        return buildResponse(405, { error: `Method ${event.httpMethod} not allowed` });
    }
  } catch (error) {
    console.error('Error in favorites handler:', error);
    return buildResponse(500, {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * List all favorite recipes for a user
 */
async function listFavorites(userPK: string): Promise<APIGatewayProxyResult> {
  const items = await queryItems<FavoriteRecipe>(userPK, 'FAVORITE#');

  // Transform to frontend format (remove PK/SK, keep recipe data)
  const favorites = items.map((item) => ({
    id: item.recipeId,
    title: item.title,
    image: item.image,
    readyInMinutes: item.readyInMinutes,
    servings: item.servings,
    savedAt: item.savedAt,
  }));

  return buildResponse(200, { favorites });
}

/**
 * Add a recipe to favorites
 */
async function addFavorite(userPK: string, body: string | null): Promise<APIGatewayProxyResult> {
  if (!body) {
    return buildResponse(400, { error: 'Request body is required' });
  }

  let recipe: {
    id?: number;
    recipeId?: number;
    title?: string;
    image?: string;
    readyInMinutes?: number;
    servings?: number;
  };

  try {
    recipe = JSON.parse(body);
  } catch {
    return buildResponse(400, { error: 'Invalid JSON in request body' });
  }

  const recipeId = recipe.id || recipe.recipeId;
  if (!recipeId || !recipe.title) {
    return buildResponse(400, { error: 'Recipe ID and title are required' });
  }

  const sk = `FAVORITE#${recipeId}`;
  const savedAt = new Date().toISOString();

  await putItem(userPK, sk, {
    recipeId,
    title: recipe.title,
    image: recipe.image || '',
    readyInMinutes: recipe.readyInMinutes,
    servings: recipe.servings,
    savedAt,
  });

  return buildResponse(201, {
    message: 'Recipe added to favorites',
    favorite: {
      id: recipeId,
      title: recipe.title,
      image: recipe.image,
      savedAt,
    },
  });
}

/**
 * Remove a recipe from favorites
 */
async function removeFavorite(userPK: string, recipeId: string): Promise<APIGatewayProxyResult> {
  const sk = `FAVORITE#${recipeId}`;

  // Check if exists first
  const existing = await getItem(userPK, sk);
  if (!existing) {
    return buildResponse(404, { error: 'Favorite not found' });
  }

  await deleteItem(userPK, sk);

  return buildResponse(200, {
    message: 'Recipe removed from favorites',
    recipeId: parseInt(recipeId, 10),
  });
}
