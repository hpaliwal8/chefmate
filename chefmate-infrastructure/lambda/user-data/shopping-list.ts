import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  getUserIdFromEvent,
  putItem,
  deleteItem,
  queryItems,
  buildResponse,
} from '../shared/dynamodb-client';

interface ShoppingItem {
  PK: string;
  SK: string;
  itemId: string;
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
  recipeSource?: string;
  addedAt: string;
}

interface ShoppingListInput {
  items: Array<{
    id?: string;
    name: string;
    amount?: number;
    unit?: string;
    checked?: boolean;
    recipeSource?: string;
  }>;
}

/**
 * Shopping List Lambda Handler
 *
 * Routes:
 * - GET /user/shopping-list - Get the shopping list
 * - PUT /user/shopping-list - Replace entire shopping list
 */
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  console.log('Shopping List Lambda invoked:', {
    method: event.httpMethod,
    path: event.path,
  });

  const userId = getUserIdFromEvent(event);
  if (!userId) {
    return buildResponse(401, { error: 'Unauthorized: User ID not found in token' });
  }

  const userPK = `USER#${userId}`;

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await getShoppingList(userPK);

      case 'PUT':
        return await updateShoppingList(userPK, event.body);

      default:
        return buildResponse(405, { error: `Method ${event.httpMethod} not allowed` });
    }
  } catch (error) {
    console.error('Error in shopping list handler:', error);
    return buildResponse(500, {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get all shopping list items for a user
 */
async function getShoppingList(userPK: string): Promise<APIGatewayProxyResult> {
  const items = await queryItems<ShoppingItem>(userPK, 'SHOPPING#');

  // Transform to frontend format
  const shoppingList = items.map((item) => ({
    id: item.itemId,
    name: item.name,
    amount: item.amount,
    unit: item.unit,
    checked: item.checked,
    recipeSource: item.recipeSource,
    addedAt: item.addedAt,
  }));

  return buildResponse(200, { items: shoppingList });
}

/**
 * Replace entire shopping list
 * This is a full replacement - delete all existing items and add new ones
 */
async function updateShoppingList(
  userPK: string,
  body: string | null
): Promise<APIGatewayProxyResult> {
  if (!body) {
    return buildResponse(400, { error: 'Request body is required' });
  }

  let input: ShoppingListInput;
  try {
    input = JSON.parse(body);
  } catch {
    return buildResponse(400, { error: 'Invalid JSON in request body' });
  }

  if (!Array.isArray(input.items)) {
    return buildResponse(400, { error: 'Items array is required' });
  }

  // First, get all existing items to delete them
  const existingItems = await queryItems<ShoppingItem>(userPK, 'SHOPPING#');

  // Delete all existing items
  for (const item of existingItems) {
    await deleteItem(userPK, item.SK);
  }

  // Add all new items
  const addedAt = new Date().toISOString();
  const savedItems = [];

  for (const item of input.items) {
    // Generate ID if not provided - use name as a simple ID (slugified)
    const itemId = item.id || slugify(item.name);
    const sk = `SHOPPING#${itemId}`;

    await putItem(userPK, sk, {
      itemId,
      name: item.name,
      amount: item.amount || 1,
      unit: item.unit || '',
      checked: item.checked || false,
      recipeSource: item.recipeSource,
      addedAt,
    });

    savedItems.push({
      id: itemId,
      name: item.name,
      amount: item.amount || 1,
      unit: item.unit || '',
      checked: item.checked || false,
      recipeSource: item.recipeSource,
      addedAt,
    });
  }

  return buildResponse(200, {
    message: 'Shopping list updated',
    items: savedItems,
  });
}

/**
 * Simple slugify function for generating item IDs from names
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
