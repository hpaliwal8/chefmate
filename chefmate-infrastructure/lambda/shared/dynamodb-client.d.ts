import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent } from 'aws-lambda';
declare const docClient: DynamoDBDocumentClient;
declare const TABLE_NAME: string;
/**
 * Extract user ID from Cognito JWT claims
 * The API Gateway passes the claims in the requestContext
 */
export declare function getUserIdFromEvent(event: APIGatewayProxyEvent): string | null;
/**
 * Get a single item from DynamoDB
 */
export declare function getItem<T>(pk: string, sk: string): Promise<T | null>;
/**
 * Put an item into DynamoDB
 */
export declare function putItem(pk: string, sk: string, attributes: Record<string, unknown>): Promise<void>;
/**
 * Delete an item from DynamoDB
 */
export declare function deleteItem(pk: string, sk: string): Promise<void>;
/**
 * Query items by partition key with optional sort key prefix
 */
export declare function queryItems<T>(pk: string, skPrefix?: string): Promise<T[]>;
/**
 * Build standard API response
 */
export declare function buildResponse(statusCode: number, body: unknown): {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
};
export { TABLE_NAME, docClient };
