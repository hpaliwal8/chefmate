/**
 * LexService
 *
 * Service for communicating with AWS Lex v2 via API Gateway proxy.
 * Handles intent recognition and slot extraction for voice commands.
 */

import { getApiBaseUrl, getAwsApiKey, isAwsBackendEnabled } from './ApiConfig';

// Lex response types
export interface LexSlotValue {
  value: string;
  resolvedValues?: string[];
}

export interface LexResponse {
  intent: string | null;
  slots: Record<string, LexSlotValue | null>;
  sessionAttributes: Record<string, string>;
  message: string | null;
  confirmationState: string | null;
  intentState: string | null;
}

// Lex intent types matching the bot configuration
export type LexIntentType =
  | 'SearchRecipe'
  | 'GetRecipeDetails'
  | 'SearchByIngredients'
  | 'StartCooking'
  | 'NextStep'
  | 'PreviousStep'
  | 'AddToShoppingList'
  | 'AddToFavorites'
  | 'GetSubstitute'
  | 'Help'
  | 'FallbackIntent';

class LexService {
  private sessionId: string;
  private sessionAttributes: Record<string, string>;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionAttributes = {};
  }

  /**
   * Generate a unique session ID for Lex conversations
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Check if Lex integration is enabled
   */
  isLexEnabled(): boolean {
    return (
      isAwsBackendEnabled() &&
      process.env.REACT_APP_LEX_ENABLED === 'true'
    );
  }

  /**
   * Send text to Lex and get intent/slots
   */
  async recognizeText(
    text: string,
    additionalAttributes?: Record<string, string>
  ): Promise<LexResponse> {
    if (!this.isLexEnabled()) {
      throw new Error('Lex integration is not enabled');
    }

    const baseUrl = getApiBaseUrl();
    const apiKey = getAwsApiKey();

    // Merge session attributes with any additional attributes
    const sessionAttributes = {
      ...this.sessionAttributes,
      ...additionalAttributes,
    };

    try {
      const response = await fetch(`${baseUrl}/lex/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'X-Api-Key': apiKey }),
        },
        body: JSON.stringify({
          text,
          sessionId: this.sessionId,
          sessionAttributes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Lex request failed with status ${response.status}`
        );
      }

      const lexResponse: LexResponse = await response.json();

      // Update session attributes from response
      if (lexResponse.sessionAttributes) {
        this.sessionAttributes = {
          ...this.sessionAttributes,
          ...lexResponse.sessionAttributes,
        };
      }

      return lexResponse;
    } catch (error) {
      console.error('LexService error:', error);
      throw error;
    }
  }

  /**
   * Get the value of a slot from a Lex response
   */
  getSlotValue(response: LexResponse, slotName: string): string | null {
    const slot = response.slots[slotName];
    return slot?.value || null;
  }

  /**
   * Get all resolved values for a slot (if multiple matches)
   */
  getSlotResolvedValues(
    response: LexResponse,
    slotName: string
  ): string[] | null {
    const slot = response.slots[slotName];
    return slot?.resolvedValues || null;
  }

  /**
   * Check if the response is for a specific intent
   */
  isIntent(response: LexResponse, intentName: LexIntentType): boolean {
    return response.intent === intentName;
  }

  /**
   * Update session attributes (e.g., to store context like current recipe)
   */
  setSessionAttribute(key: string, value: string): void {
    this.sessionAttributes[key] = value;
  }

  /**
   * Get a session attribute
   */
  getSessionAttribute(key: string): string | undefined {
    return this.sessionAttributes[key];
  }

  /**
   * Clear all session attributes
   */
  clearSessionAttributes(): void {
    this.sessionAttributes = {};
  }

  /**
   * Reset the session (new session ID and clear attributes)
   */
  resetSession(): void {
    this.sessionId = this.generateSessionId();
    this.sessionAttributes = {};
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Export singleton instance
const lexService = new LexService();
export default lexService;

// Also export the class for testing
export { LexService };
