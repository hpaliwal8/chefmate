import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  Recipe,
  Ingredient,
  ShoppingListItem,
  UserPreferences,
  ConversationMessage,
  AppContextValue,
} from '../types';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Recipe state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  // Cooking mode state
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // User preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    diet: null,
    allergens: [],
    cuisinePreferences: [],
    maxCookingTime: null,
  });

  // Shopping list
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  // Favorites
  const [favorites, setFavorites] = useState<Recipe[]>([]);

  // Conversation history
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);

  // Actions
  const addToShoppingList = useCallback((ingredients: Ingredient[]) => {
    setShoppingList((prev) => {
      const newItems = ingredients.filter(
        (ing) => !prev.some((item) => item.name === ing.name)
      );
      return [...prev, ...newItems.map((ing) => ({ ...ing, checked: false }))];
    });
  }, []);

  const removeFromShoppingList = useCallback((ingredientName: string) => {
    setShoppingList((prev) => prev.filter((item) => item.name !== ingredientName));
  }, []);

  const toggleShoppingListItem = useCallback((ingredientName: string) => {
    setShoppingList((prev) =>
      prev.map((item) =>
        item.name === ingredientName ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const clearShoppingList = useCallback(() => {
    setShoppingList([]);
  }, []);

  const addToFavorites = useCallback((recipe: Recipe) => {
    setFavorites((prev) => {
      if (prev.some((fav) => fav.id === recipe.id)) {
        return prev;
      }
      return [...prev, recipe];
    });
  }, []);

  const removeFromFavorites = useCallback((recipeId: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== recipeId));
  }, []);

  const isFavorite = useCallback(
    (recipeId: string) => {
      return favorites.some((fav) => fav.id === recipeId);
    },
    [favorites]
  );

  const startCooking = useCallback((recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setCurrentStep(0);
    setCookingMode(true);
  }, []);

  const stopCooking = useCallback(() => {
    setCookingMode(false);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    if (currentRecipe && currentStep < currentRecipe.instructions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentRecipe, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const addToConversation = useCallback((message: ConversationMessage) => {
    setConversationHistory((prev) => [...prev, message]);
  }, []);

  const updateUserPreferences = useCallback(
    (preferences: Partial<UserPreferences>) => {
      setUserPreferences((prev) => {
        const updated = { ...prev, ...preferences };
        localStorage.setItem('chefmate-preferences', JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  // Load preferences from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('chefmate-preferences');
    if (saved) {
      try {
        setUserPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load preferences:', e);
      }
    }

    const savedFavorites = localStorage.getItem('chefmate-favorites');
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to load favorites:', e);
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('chefmate-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const value: AppContextValue = {
    // State
    recipes,
    currentRecipe,
    searchQuery,
    isLoading,
    isListening,
    isSpeaking,
    transcript,
    response,
    cookingMode,
    currentStep,
    userPreferences,
    shoppingList,
    favorites,
    conversationHistory,

    // Setters
    setRecipes,
    setCurrentRecipe,
    setSearchQuery,
    setIsLoading,
    setIsListening,
    setIsSpeaking,
    setTranscript,
    setResponse,

    // Actions
    addToShoppingList,
    removeFromShoppingList,
    toggleShoppingListItem,
    clearShoppingList,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    startCooking,
    stopCooking,
    nextStep,
    previousStep,
    addToConversation,
    updateUserPreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
