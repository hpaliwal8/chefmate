import React, { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { useAppContext } from '../context/AppContext';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import RecipeService from '../services/RecipeService';
import RecipeList from './RecipeList';
import CookingMode from './CookingMode';
import ShoppingList from './ShoppingList';
import { ConversationMessage } from '../types';
import '../styles/VoiceInterface.css';

type InputMode = 'voice' | 'text';

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

  const [inputMode, setInputMode] = useState<InputMode>('voice');
  const [textInput, setTextInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([
    {
      type: 'assistant',
      text: "👋 Hi! I'm ChefMate, your voice cooking assistant. What would you like to cook today?",
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

  // Classify user intent
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
                  {msg.type === 'assistant' && <span className="chef-icon">👨‍🍳</span>}
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message assistant-message">
                <div className="message-content">
                  <span className="chef-icon">👨‍🍳</span>
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

      {/* Input Controls */}
      <div className="input-container">
        <div className="mode-toggle">
          <button
            className={inputMode === 'voice' ? 'active' : ''}
            onClick={() => setInputMode('voice')}
          >
            🎤 Voice
          </button>
          <button
            className={inputMode === 'text' ? 'active' : ''}
            onClick={() => setInputMode('text')}
          >
            ⌨️ Text
          </button>
        </div>

        {inputMode === 'voice' ? (
          <div className="voice-controls">
            <button
              className={`voice-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
              onClick={handleVoiceClick}
              disabled={isListening || isSpeaking}
            >
              {isListening && <span className="pulse"></span>}
              🎤 {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap to Speak'}
            </button>
            {transcript && <p className="transcript">You said: "{transcript}"</p>}
            {voiceError && <p className="error-message">{voiceError}</p>}
          </div>
        ) : (
          <form className="text-input-form" onSubmit={handleTextSubmit}>
            <input
              type="text"
              value={textInput}
              onChange={handleTextInputChange}
              placeholder="Type your question..."
              className="text-input"
            />
            <button type="submit" className="send-button" disabled={!textInput.trim()}>
              Send
            </button>
          </form>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default VoiceInterface;
