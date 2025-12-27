import React, { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { ChefHat, Mic, ChevronUp, ChevronDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import RecipeService from '../services/RecipeService';
import RecipeList from './RecipeList';
import CookingMode from './CookingMode';
import ShoppingList from './ShoppingList';
import { ConversationMessage } from '../types';
import '../styles/VoiceInterface.css';

interface Intent {
  type: 'search' | 'details' | 'ingredients' | 'cooking' | 'general';
  params: Record<string, unknown>;
}

const VoiceInterface: React.FC = () => {
  const {
    recipes,
    setRecipes,
    currentRecipe,
    setCurrentRecipe,
    isLoading,
    setIsLoading,
    cookingMode,
    userPreferences,
    addToConversation,
  } = useAppContext();

  const [textInput, setTextInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([
    {
      type: 'assistant',
      text: "Hi! I'm ChefMate, your voice cooking assistant. What would you like to cook today?",
      timestamp: new Date(),
    },
  ]);

  const {
    isListening,
    transcript,
    error: voiceError,
    startListening,
    resetTranscript,
  } = useVoiceRecording();
  const { isSpeaking, speak, stop: stopSpeaking } = useSpeechSynthesis();

  // Add assistant message to conversation
  const addAssistantMessage = useCallback(
    (text: string) => {
      const message: ConversationMessage = {
        type: 'assistant',
        text,
        timestamp: new Date(),
      };

      setConversationMessages((prev) => [...prev, message]);
      addToConversation(message);

      // Speak the response
      speak(text);
    },
    [addToConversation, speak]
  );

  // Convert word numbers to integers
  const convertToNumber = (word: string | undefined): number => {
    const map: Record<string, number> = {
      first: 1,
      second: 2,
      third: 3,
      fourth: 4,
      fifth: 5,
      last: -1,
    };
    return map[word?.toLowerCase() || ''] || parseInt(word || '1') || 1;
  };

  // Extract search parameters from query
  const extractSearchParams = useCallback(
    (query: string): Record<string, unknown> => {
      const params: Record<string, unknown> = {};

      // Extract dish type/query
      const dishMatch = query.match(
        /(?:find|show|get|want|need)\s+(?:me\s+)?(?:a\s+)?(.+?)(?:\s+recipe|\s+for|$)/
      );
      if (dishMatch) {
        params.query = dishMatch[1].trim();
      }

      // Extract dietary restrictions
      if (query.match(/vegetarian|vegan/i)) {
        params.diet = query.match(/vegetarian/i) ? 'vegetarian' : 'vegan';
      } else if (userPreferences.diet) {
        params.diet = userPreferences.diet;
      }

      // Extract cuisine
      const cuisines = ['italian', 'mexican', 'chinese', 'indian', 'thai', 'french', 'japanese'];
      cuisines.forEach((cuisine) => {
        if (query.includes(cuisine)) {
          params.cuisine = cuisine;
        }
      });

      // Extract time constraints
      const timeMatch = query.match(/(\d+)\s*(?:min|minute)/i);
      if (timeMatch) {
        params.maxTime = parseInt(timeMatch[1]);
      }

      return params;
    },
    [userPreferences.diet]
  );

  // Extract ingredients from query
  const extractIngredients = (query: string): string[] => {
    // Simple extraction - look for common ingredients after "with" or "have"
    const match = query.match(/(?:with|have)\s+(.+?)(?:\s+and|\s*$|,)/i);
    if (match) {
      return match[1].split(/,|\sand\s/).map((ing) => ing.trim());
    }
    return [];
  };

  // Classify user intent (super duper basic regex based)
  // To be replaced by AWS Lex soon
  const classifyIntent = useCallback(
    (query: string): Intent => {
      // Search for recipes
      if (query.match(/find|search|show|get|want|need|looking for|recipe/)) {
        return {
          type: 'search',
          params: extractSearchParams(query),
        };
      }

      // Recipe details
      if (query.match(/tell me (more )?about|details|what's in|ingredients for/)) {
        const number = query.match(/(\d+|first|second|third|last)/)?.[0];
        return {
          type: 'details',
          params: { recipeNumber: convertToNumber(number) },
        };
      }

      // Search by ingredients
      if (query.match(/what can i make with|i have|using/)) {
        const ingredients = extractIngredients(query);
        return {
          type: 'ingredients',
          params: { ingredients },
        };
      }

      // Cooking mode
      if (query.match(/cook|start|begin|walk me through|instructions|steps/)) {
        return {
          type: 'cooking',
          params: {},
        };
      }

      return { type: 'general', params: {} };
    },
    [extractSearchParams]
  );

  // Handle search intent
  const handleSearchIntent = useCallback(
    async (query: string, params: Record<string, unknown>) => {
      console.log('Searching with params:', params);

      const results = await RecipeService.searchRecipes({
        query: (params.query as string) || query,
        diet: params.diet as string | undefined,
        cuisine: params.cuisine as string | undefined,
        maxTime: params.maxTime as number | undefined,
        maxResults: 10,
      });

      setRecipes(results);

      if (results.length === 0) {
        addAssistantMessage("I couldn't find any recipes matching that. Try something else?");
        // Show suggestions again since no results found
        setShowSuggestions(true);
      } else {
        const message = `I found ${results.length} delicious recipes! ${results
          .slice(0, 3)
          .map((r, i) => `${i + 1}. ${r.title}`)
          .join(', ')}${results.length > 3 ? ' and more.' : ''} Which one interests you?`;
        addAssistantMessage(message);
      }
    },
    [addAssistantMessage, setRecipes]
  );

  // Handle details intent
  const handleDetailsIntent = useCallback(
    (params: Record<string, unknown>) => {
      const recipeNumber = params.recipeNumber as number;
      const index = recipeNumber === -1 ? recipes.length - 1 : recipeNumber - 1;

      if (!recipes[index]) {
        addAssistantMessage(
          "Please search for recipes first, or specify which recipe you'd like to know about."
        );
        // Show suggestions again since no recipe context
        setShowSuggestions(true);
        return;
      }

      const recipe = recipes[index];
      setCurrentRecipe(recipe);

      const message = `${recipe.title}. Ready in ${recipe.readyInMinutes} minutes, serves ${recipe.servings}. ${recipe.diets.length > 0 ? `It's ${recipe.diets.join(', ')}.` : ''
        } ${recipe.summary.slice(0, 150)}... Would you like me to walk you through cooking it?`;

      addAssistantMessage(message);
    },
    [addAssistantMessage, recipes, setCurrentRecipe]
  );

  // Handle ingredient-based search
  const handleIngredientsSearch = useCallback(
    async (params: Record<string, unknown>) => {
      const ingredients = params.ingredients as string[];
      console.log('Searching by ingredients:', ingredients);

      const results = await RecipeService.searchByIngredients(ingredients);
      setRecipes(results);

      if (results.length === 0) {
        addAssistantMessage(
          "I couldn't find recipes with those ingredients. Try different ingredients?"
        );
        // Show suggestions again since no results found
        setShowSuggestions(true);
      } else {
        addAssistantMessage(
          `Great! I found ${results.length} recipes you can make. The top options are: ${results
            .slice(0, 3)
            .map((r, i) => `${i + 1}. ${r.title}`)
            .join(', ')}.`
        );
      }
    },
    [addAssistantMessage, setRecipes]
  );

  // Handle cooking intent
  const handleCookingIntent = useCallback(() => {
    if (!currentRecipe) {
      addAssistantMessage('Please select a recipe first!');
      // Show suggestions again since no recipe selected
      setShowSuggestions(true);
      return;
    }

    if (!currentRecipe.hasVoiceGuidance || currentRecipe.instructions.length === 0) {
      addAssistantMessage(
        "Sorry, this recipe doesn't have step-by-step instructions. Let me find you a similar recipe with voice guidance."
      );
      return;
    }

    addAssistantMessage(
      `Great! Let's cook ${currentRecipe.title}. I'll guide you through ${currentRecipe.instructions.length} steps. Ready?`
    );
  }, [addAssistantMessage, currentRecipe]);

  // Handle general queries
  const handleGeneralQuery = useCallback(() => {
    // Provide helpful response for unrecognized queries
    addAssistantMessage(
      'I can help you find recipes, get cooking instructions, or answer questions about ingredients. What would you like to do?'
    );
    // Show suggestions again since query wasn't understood
    setShowSuggestions(true);
  }, [addAssistantMessage]);

  // Process user query
  const processQuery = useCallback(
    async (query: string) => {
      setIsLoading(true);
      setError(null);
      setShowSuggestions(false);

      try {
        // Simple intent classification
        const intent = classifyIntent(query.toLowerCase());

        switch (intent.type) {
          case 'search':
            await handleSearchIntent(query, intent.params);
            break;
          case 'details':
            handleDetailsIntent(intent.params);
            break;
          case 'ingredients':
            await handleIngredientsSearch(intent.params);
            break;
          case 'cooking':
            handleCookingIntent();
            break;
          default:
            handleGeneralQuery();
        }
      } catch (err) {
        console.error('Error processing query:', err);
        const errorMessage =
          (err as Error).message || 'Sorry, I had trouble processing that. Please try again.';
        addAssistantMessage(errorMessage);
        setError(errorMessage);
        // Show suggestions again on error
        setShowSuggestions(true);
      } finally {
        setIsLoading(false);
      }
    },
    [
      addAssistantMessage,
      classifyIntent,
      handleCookingIntent,
      handleDetailsIntent,
      handleGeneralQuery,
      handleIngredientsSearch,
      handleSearchIntent,
      setIsLoading,
    ]
  );

  // Handle voice input result
  const handleVoiceResult = useCallback(
    async (speechText: string) => {
      console.log('Processing voice input:', speechText);

      // Add user message to conversation
      setConversationMessages((prev) => [
        ...prev,
        {
          type: 'user' as const,
          text: speechText,
          timestamp: new Date(),
        },
      ]);

      // Process the query
      await processQuery(speechText);
      resetTranscript();
    },
    [processQuery, resetTranscript]
  );

  // Start voice recording
  const handleVoiceClick = () => {
    if (isListening) {
      // Already listening, do nothing
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    setError(null);
    startListening(handleVoiceResult);
  };

  // Handle text input
  const handleTextSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userMessage = textInput.trim();
    setTextInput('');

    // Add user message to conversation
    setConversationMessages((prev) => [
      ...prev,
      {
        type: 'user' as const,
        text: userMessage,
        timestamp: new Date(),
      },
    ]);

    await processQuery(userMessage);
  };

  // Handle suggestion clicks
  const handleSuggestion = (suggestion: string) => {
    // Add user message to conversation
    setConversationMessages((prev) => [
      ...prev,
      {
        type: 'user' as const,
        text: suggestion,
        timestamp: new Date(),
      },
    ]);
    processQuery(suggestion);
  };

  // Handle text input change
  const handleTextInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
  };

  // Suggestions for new users
  const suggestions = [
    'Find me a pasta recipe',
    'What can I make with chicken?',
    'Show me quick dinner ideas',
    'I want something vegetarian',
    'Find me healthy breakfast recipes',
  ];

  return (
    <div className="voice-interface fade-in">
      <header className="header">
        <h1>🍳 ChefMate</h1>
        <p className="subtitle">Your Voice Cooking Assistant</p>
      </header>

      <div className="main-content">
        {/* Conversation Display */}
        <div className="conversation-container">
          <div className="conversation-messages">
            {conversationMessages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.type}-message`}>
                <div className="message-content">
                  {msg.type === 'assistant' && <span className="chef-icon"><ChefHat size={24} /></span>}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant-message">
                <div className="message-content">
                  <span className="chef-icon"><ChefHat size={24} /></span>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {showSuggestions && recipes.length === 0 && (
            <div className="suggestions">
              <p className="suggestions-label">Try saying:</p>
              <div className="suggestion-chips">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="suggestion-chip"
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recipe Results */}
        {recipes.length > 0 && !cookingMode && <RecipeList recipes={recipes} />}

        {/* Cooking Mode */}
        {cookingMode && currentRecipe && <CookingMode recipe={currentRecipe} />}

        {/* Shopping List */}
        <ShoppingList />
      </div>

      {/* Floating Mic Button (when collapsed) */}
      {isInputCollapsed && (
        <button
          className={`floating-mic-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
          onClick={handleVoiceClick}
          disabled={isListening || isSpeaking}
        >
          {isListening && <span className="pulse"></span>}
          <Mic size={24} />
        </button>
      )}

      {/* Expand Button (when collapsed) */}
      {isInputCollapsed && (
        <button
          className="expand-input-button"
          onClick={() => setIsInputCollapsed(false)}
          aria-label="Expand input panel"
        >
          <ChevronUp size={18} />
        </button>
      )}

      {/* Input Controls */}
      <div className={`input-container ${isInputCollapsed ? 'collapsed' : ''}`}>
        <button
          className="collapse-toggle"
          onClick={() => setIsInputCollapsed(!isInputCollapsed)}
          aria-label={isInputCollapsed ? 'Expand input panel' : 'Collapse input panel'}
        >
          {isInputCollapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {!isInputCollapsed && (
          <form className="unified-input-bar" onSubmit={handleTextSubmit}>
            {/* Mic Button */}
            <button
              type="button"
              className={`mic-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
              onClick={handleVoiceClick}
              disabled={isSpeaking}
              aria-label="Voice input"
            >
              {isListening && <span className="mic-pulse"></span>}
              <svg
                className="mic-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={isListening ? transcript : textInput}
              onChange={handleTextInputChange}
              placeholder={isListening ? 'Listening...' : 'Ask me anything about cooking...'}
              className="unified-text-input"
              disabled={isListening}
            />

            {/* Send Button */}
            <button
              type="submit"
              className="unified-send-button"
              disabled={isListening || (!textInput.trim() && !transcript)}
              aria-label="Send message"
            >
              <svg
                className="send-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>

            {/* Error/Status Messages */}
            {(voiceError || error) && (
              <p className="input-error">{voiceError || error}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default VoiceInterface;
