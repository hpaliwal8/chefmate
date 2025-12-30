import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import {
  Recipe,
  Ingredient,
  ShoppingListItem,
  UserPreferences,
  ConversationMessage,
  AppContextValue,
  AuthUser,
} from '../types';
import AuthService, { isCognitoConfigured } from '../services/AuthService';
import UserDataService from '../services/UserDataService';

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
  // Auth state
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

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

  const isAuthenticated = Boolean(user);
  const cognitoEnabled = isCognitoConfigured();

  // ==================== Auth Functions ====================

  const login = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      await AuthService.signIn(email, password);
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      const err = error as { message: string };
      setAuthError(err.message);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    AuthService.signOut();
    setUser(null);
    // Clear user data on logout, but keep local storage fallback
    setFavorites([]);
    setShoppingList([]);
    setUserPreferences({
      diet: null,
      allergens: [],
      cuisinePreferences: [],
      maxCookingTime: null,
    });
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      await AuthService.signUp(email, password);
    } catch (error) {
      const err = error as { message: string };
      setAuthError(err.message);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const confirmRegistration = useCallback(async (email: string, code: string) => {
    setAuthError(null);
    setIsAuthLoading(true);
    try {
      await AuthService.confirmSignUp(email, code);
    } catch (error) {
      const err = error as { message: string };
      setAuthError(err.message);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  // ==================== Data Loading Functions ====================

  const loadUserData = useCallback(async () => {
    if (!isAuthenticated) return;

    setIsDataLoading(true);
    try {
      // Load favorites
      const favoritesData = await UserDataService.getFavorites();
      setFavorites(
        favoritesData.map((fav) => ({
          id: String(fav.id),
          title: fav.title,
          image: fav.image,
          readyInMinutes: fav.readyInMinutes ?? null,
          servings: fav.servings ?? 1,
          summary: '',
          diets: [],
          ingredients: [],
          instructions: [],
          nutrition: null,
          source: '',
          sourceUrl: '',
          hasVoiceGuidance: false,
          vegetarian: false,
          vegan: false,
          glutenFree: false,
          dairyFree: false,
          pricePerServing: null,
          cuisines: [],
          dishTypes: [],
        }))
      );

      // Load shopping list
      const shoppingData = await UserDataService.getShoppingList();
      setShoppingList(
        shoppingData.map((item) => ({
          id: Number(item.id) || 0,
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          original: item.name,
          aisle: '',
          checked: item.checked,
        }))
      );

      // Load preferences
      const prefsData = await UserDataService.getPreferences();
      if (!prefsData.isDefault) {
        setUserPreferences({
          diet: prefsData.preferences.diet ?? null,
          allergens: prefsData.preferences.allergens ?? [],
          cuisinePreferences: prefsData.preferences.cuisinePreferences ?? [],
          maxCookingTime: prefsData.preferences.maxCookingTime ?? null,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fall back to localStorage if API fails
      loadFromLocalStorage();
    } finally {
      setIsDataLoading(false);
    }
  }, [isAuthenticated]);

  const loadFromLocalStorage = useCallback(() => {
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

  // ==================== Shopping List Actions ====================

  const addToShoppingList = useCallback(
    async (ingredients: Ingredient[]) => {
      const newItems = ingredients.filter(
        (ing) => !shoppingList.some((item) => item.name === ing.name)
      );
      const updatedList = [...shoppingList, ...newItems.map((ing) => ({ ...ing, checked: false }))];
      setShoppingList(updatedList);

      // Sync to API if authenticated
      if (isAuthenticated && cognitoEnabled) {
        try {
          await UserDataService.updateShoppingList(
            updatedList.map((item) => ({
              id: String(item.id || item.name),
              name: item.name,
              amount: item.amount,
              unit: item.unit,
              checked: item.checked,
            }))
          );
        } catch (error) {
          console.error('Error syncing shopping list:', error);
        }
      }
    },
    [shoppingList, isAuthenticated, cognitoEnabled]
  );

  const removeFromShoppingList = useCallback(
    async (ingredientName: string) => {
      const updatedList = shoppingList.filter((item) => item.name !== ingredientName);
      setShoppingList(updatedList);

      if (isAuthenticated && cognitoEnabled) {
        try {
          await UserDataService.updateShoppingList(
            updatedList.map((item) => ({
              id: String(item.id || item.name),
              name: item.name,
              amount: item.amount,
              unit: item.unit,
              checked: item.checked,
            }))
          );
        } catch (error) {
          console.error('Error syncing shopping list:', error);
        }
      }
    },
    [shoppingList, isAuthenticated, cognitoEnabled]
  );

  const toggleShoppingListItem = useCallback(
    async (ingredientName: string) => {
      const updatedList = shoppingList.map((item) =>
        item.name === ingredientName ? { ...item, checked: !item.checked } : item
      );
      setShoppingList(updatedList);

      if (isAuthenticated && cognitoEnabled) {
        try {
          await UserDataService.updateShoppingList(
            updatedList.map((item) => ({
              id: String(item.id || item.name),
              name: item.name,
              amount: item.amount,
              unit: item.unit,
              checked: item.checked,
            }))
          );
        } catch (error) {
          console.error('Error syncing shopping list:', error);
        }
      }
    },
    [shoppingList, isAuthenticated, cognitoEnabled]
  );

  const clearShoppingList = useCallback(async () => {
    setShoppingList([]);

    if (isAuthenticated && cognitoEnabled) {
      try {
        await UserDataService.updateShoppingList([]);
      } catch (error) {
        console.error('Error clearing shopping list:', error);
      }
    }
  }, [isAuthenticated, cognitoEnabled]);

  // ==================== Favorites Actions ====================

  const addToFavorites = useCallback(
    async (recipe: Recipe) => {
      if (favorites.some((fav) => fav.id === recipe.id)) {
        return;
      }

      setFavorites((prev) => [...prev, recipe]);

      if (isAuthenticated && cognitoEnabled) {
        try {
          await UserDataService.addFavorite(recipe);
        } catch (error) {
          console.error('Error adding favorite:', error);
        }
      } else {
        // Save to localStorage for non-authenticated users
        localStorage.setItem('chefmate-favorites', JSON.stringify([...favorites, recipe]));
      }
    },
    [favorites, isAuthenticated, cognitoEnabled]
  );

  const removeFromFavorites = useCallback(
    async (recipeId: string) => {
      setFavorites((prev) => prev.filter((fav) => fav.id !== recipeId));

      if (isAuthenticated && cognitoEnabled) {
        try {
          await UserDataService.removeFavorite(Number(recipeId));
        } catch (error) {
          console.error('Error removing favorite:', error);
        }
      } else {
        const newFavorites = favorites.filter((fav) => fav.id !== recipeId);
        localStorage.setItem('chefmate-favorites', JSON.stringify(newFavorites));
      }
    },
    [favorites, isAuthenticated, cognitoEnabled]
  );

  const isFavorite = useCallback(
    (recipeId: string) => {
      return favorites.some((fav) => fav.id === recipeId);
    },
    [favorites]
  );

  // ==================== Cooking Actions ====================

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

  // ==================== Other Actions ====================

  const addToConversation = useCallback((message: ConversationMessage) => {
    setConversationHistory((prev) => [...prev, message]);
  }, []);

  const updateUserPreferences = useCallback(
    async (preferences: Partial<UserPreferences>) => {
      const updated = { ...userPreferences, ...preferences };
      setUserPreferences(updated);

      if (isAuthenticated && cognitoEnabled) {
        try {
          await UserDataService.updatePreferences(updated);
        } catch (error) {
          console.error('Error updating preferences:', error);
        }
      } else {
        localStorage.setItem('chefmate-preferences', JSON.stringify(updated));
      }
    },
    [userPreferences, isAuthenticated, cognitoEnabled]
  );

  // ==================== Effects ====================

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (!cognitoEnabled) {
        setIsAuthLoading(false);
        loadFromLocalStorage();
        return;
      }

      try {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, [cognitoEnabled, loadFromLocalStorage]);

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && cognitoEnabled) {
      loadUserData();
    } else if (!cognitoEnabled) {
      loadFromLocalStorage();
    }
  }, [isAuthenticated, cognitoEnabled, loadUserData, loadFromLocalStorage]);

  // Save favorites to localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated || !cognitoEnabled) {
      localStorage.setItem('chefmate-favorites', JSON.stringify(favorites));
    }
  }, [favorites, isAuthenticated, cognitoEnabled]);

  const value: AppContextValue = {
    // Auth State
    user,
    isAuthenticated,
    isAuthLoading,
    authError,

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
    isDataLoading,

    // Setters
    setRecipes,
    setCurrentRecipe,
    setSearchQuery,
    setIsLoading,
    setIsListening,
    setIsSpeaking,
    setTranscript,
    setResponse,

    // Auth Actions
    login,
    logout,
    register,
    confirmRegistration,

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
