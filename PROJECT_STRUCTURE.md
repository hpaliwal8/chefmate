# ChefMate Frontend Structure

## Directory Layout

```
src/
├── components/
│   ├── VoiceInterface.jsx       # Main voice interaction component
│   ├── RecipeCard.jsx           # Individual recipe display
│   ├── RecipeList.jsx           # Grid of recipe cards
│   ├── CookingMode.jsx          # Step-by-step cooking interface
│   ├── ShoppingList.jsx         # Shopping list management
│   ├── AudioVisualizer.jsx      # Visual feedback during speech
│   └── DietaryPreferences.jsx   # User preferences modal
├── services/
│   ├── RecipeService.js         # Recipe data abstraction layer
│   ├── SpoonacularProvider.js   # Spoonacular API integration
│   ├── LexService.js            # AWS Lex integration
│   └── PollyService.js          # AWS Polly text-to-speech
├── hooks/
│   ├── useVoiceRecording.js     # Voice input hook
│   ├── useSpeechSynthesis.js    # Voice output hook
│   └── useRecipes.js            # Recipe state management
├── context/
│   └── AppContext.js            # Global app state
├── styles/
│   ├── App.css
│   ├── VoiceInterface.css
│   ├── RecipeCard.css
│   ├── CookingMode.css
│   └── ShoppingList.css
├── utils/
│   └── helpers.js               # Utility functions
├── App.jsx
└── index.js
```

## Component Hierarchy

```
App
├── AppContext.Provider
    └── VoiceInterface
        ├── AudioVisualizer
        ├── RecipeList
        │   └── RecipeCard (multiple)
        ├── CookingMode
        ├── ShoppingList
        └── DietaryPreferences
```
