import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  DeleteCommand,
  QueryCommand,
  GetCommandInput,
  PutCommandInput,
  DeleteCommandInput,
  QueryCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Singleton DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'ChefMateUserData';

// Type for Cognito authorizer claims
interface CognitoAuthorizerClaims {
  sub: string;
  email?: string;
  [key: string]: unknown;
}

/**
 * Extract user ID from Cognito JWT claims
 * The API Gateway passes the claims in the requestContext
 */
export function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null {
  // Cognito User Pools authorizer puts claims directly in authorizer object
  const authorizer = event.requestContext?.authorizer;
  if (!authorizer) {
    return null;
  }

  // For Cognito User Pools authorizer, claims are under 'claims' property
  const claims = (authorizer as { claims?: CognitoAuthorizerClaims }).claims;
  if (claims?.sub) {
    return claims.sub;
  }

  // Fallback: check if sub is directly on authorizer (some configurations)
  if ((authorizer as CognitoAuthorizerClaims).sub) {
    return (authorizer as CognitoAuthorizerClaims).sub;
  }

  return null;
}

/**
 * Get a single item from DynamoDB
 */
export async function getItem<T>(pk: string, sk: string): Promise<T | null> {
  const params: GetCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  };

  const result = await docClient.send(new GetCommand(params));
  return (result.Item as T) || null;
}

/**
 * Put an item into DynamoDB
 */
export async function putItem(
  pk: string,
  sk: string,
  attributes: Record<string, unknown>
): Promise<void> {
  const params: PutCommandInput = {
    TableName: TABLE_NAME,
    Item: {
      PK: pk,
      SK: sk,
      ...attributes,
      updatedAt: new Date().toISOString(),
    },
  };

  await docClient.send(new PutCommand(params));
}

/**
 * Delete an item from DynamoDB
 */
export async function deleteItem(pk: string, sk: string): Promise<void> {
  const params: DeleteCommandInput = {
    TableName: TABLE_NAME,
    Key: { PK: pk, SK: sk },
  };

  await docClient.send(new DeleteCommand(params));
}

/**
 * Query items by partition key with optional sort key prefix
 */
export async function queryItems<T>(
  pk: string,
  skPrefix?: string
): Promise<T[]> {
  const params: QueryCommandInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: skPrefix
      ? 'PK = :pk AND begins_with(SK, :skPrefix)'
      : 'PK = :pk',
    ExpressionAttributeValues: skPrefix
      ? { ':pk': pk, ':skPrefix': skPrefix }
      : { ':pk': pk },
  };

  const result = await docClient.send(new QueryCommand(params));
  return (result.Items as T[]) || [];
}

/**
 * Build standard API response
 */
export function buildResponse(
  statusCode: number,
  body: unknown
): {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
} {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

export { TABLE_NAME, docClient };
