import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  LexRuntimeV2Client,
  RecognizeTextCommand,
  RecognizeTextCommandInput,
} from '@aws-sdk/client-lex-runtime-v2';
import {
  corsHeaders,
  successResponse,
  errorResponse,
  corsPreflightResponse,
} from '../shared/response-utils';

// Initialize Lex client
const lexClient = new LexRuntimeV2Client({
  region: process.env.AWS_REGION || 'us-east-2',
});

interface LexProxyRequest {
  text: string;
  sessionId: string;
  sessionAttributes?: Record<string, string>;
}

interface SlotValue {
  value: string;
  resolvedValues?: string[];
}

interface LexProxyResponse {
  intent: string | null;
  slots: Record<string, SlotValue | null>;
  sessionAttributes: Record<string, string>;
  message: string | null;
  confirmationState: string | null;
  intentState: string | null;
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return corsPreflightResponse();
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  // Validate environment variables
  const botId = process.env.LEX_BOT_ID;
  const botAliasId = process.env.LEX_BOT_ALIAS_ID;

  if (!botId || !botAliasId) {
    console.error('Missing Lex bot configuration');
    return errorResponse('Lex bot not configured', 500);
  }

  try {
    // Parse request body
    if (!event.body) {
      return errorResponse('Request body is required', 400);
    }

    const request: LexProxyRequest = JSON.parse(event.body);

    // Validate required fields
    if (!request.text || typeof request.text !== 'string') {
      return errorResponse('Text field is required', 400);
    }

    if (!request.sessionId || typeof request.sessionId !== 'string') {
      return errorResponse('SessionId field is required', 400);
    }

    // Build Lex request
    const lexInput: RecognizeTextCommandInput = {
      botId,
      botAliasId,
      localeId: 'en_US',
      sessionId: request.sessionId,
      text: request.text,
    };

    // Add session attributes if provided
    if (request.sessionAttributes && Object.keys(request.sessionAttributes).length > 0) {
      lexInput.sessionState = {
        sessionAttributes: request.sessionAttributes,
      };
    }

    console.log('Sending to Lex:', {
      text: request.text,
      sessionId: request.sessionId,
      hasSessionAttributes: !!request.sessionAttributes,
    });

    // Call Lex
    const command = new RecognizeTextCommand(lexInput);
    const lexResponse = await lexClient.send(command);

    console.log('Lex response:', JSON.stringify(lexResponse, null, 2));

    // Extract slots with their values
    const slots: Record<string, SlotValue | null> = {};
    const intentSlots = lexResponse.sessionState?.intent?.slots;

    if (intentSlots) {
      for (const [slotName, slotData] of Object.entries(intentSlots)) {
        // slotData is of type Slot which has a value property of type Value
        const slot = slotData as { value?: { interpretedValue?: string; resolvedValues?: string[] } };
        if (slot?.value?.interpretedValue) {
          slots[slotName] = {
            value: slot.value.interpretedValue,
            resolvedValues: slot.value.resolvedValues,
          };
        } else {
          slots[slotName] = null;
        }
      }
    }

    // Build response
    const response: LexProxyResponse = {
      intent: lexResponse.sessionState?.intent?.name || null,
      slots,
      sessionAttributes: lexResponse.sessionState?.sessionAttributes || {},
      message: lexResponse.messages?.[0]?.content || null,
      confirmationState: lexResponse.sessionState?.intent?.confirmationState || null,
      intentState: lexResponse.sessionState?.intent?.state || null,
    };

    return successResponse(response);
  } catch (error) {
    console.error('Lex proxy error:', error);

    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return errorResponse(`Failed to process request: ${errorMessage}`, 500);
  }
}
