import * as cdk from 'aws-cdk-lib';
import * as lex from 'aws-cdk-lib/aws-lex';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface ChefMateLexBotProps {
  readonly botName?: string;
}

export class ChefMateLexBot extends Construct {
  public readonly botId: string;
  public readonly botAliasId: string;
  public readonly botArn: string;

  constructor(scope: Construct, id: string, props?: ChefMateLexBotProps) {
    super(scope, id);

    const botName = props?.botName || 'ChefMateBot';

    // IAM Role for Lex Bot
    const lexRole = new iam.Role(this, 'LexBotRole', {
      roleName: `${botName}-Role`,
      assumedBy: new iam.ServicePrincipal('lexv2.amazonaws.com'),
      description: 'IAM role for ChefMate Lex Bot',
    });

    // Custom Slot Type Values
    const dishTypeValues = [
      'pasta', 'chicken', 'salad', 'soup', 'curry', 'pizza', 'tacos',
      'stir fry', 'sandwich', 'burger', 'steak', 'fish', 'shrimp',
      'rice', 'noodles', 'sushi', 'ramen', 'burrito', 'wrap',
      'casserole', 'roast', 'grill', 'baked', 'fried', 'breakfast',
      'dessert', 'cake', 'cookies', 'pie', 'smoothie', 'appetizer'
    ];

    const cuisineTypeValues = [
      'italian', 'mexican', 'chinese', 'indian', 'thai', 'french',
      'japanese', 'american', 'mediterranean', 'greek', 'korean',
      'vietnamese', 'spanish', 'middle eastern', 'cajun', 'caribbean'
    ];

    const dietTypeValues = [
      'vegetarian', 'vegan', 'gluten free', 'dairy free', 'keto',
      'paleo', 'low carb', 'low fat', 'whole30', 'pescatarian'
    ];

    const ordinalValues = [
      'first', 'second', 'third', 'fourth', 'fifth',
      '1st', '2nd', '3rd', '4th', '5th',
      'one', 'two', 'three', 'four', 'five', 'last'
    ];

    // Helper to create slot type values
    const createSlotTypeValues = (values: string[]): lex.CfnBot.SlotTypeValueProperty[] => {
      return values.map(value => ({
        sampleValue: { value },
      }));
    };

    // Helper to create sample utterances
    const createUtterances = (utterances: string[]): lex.CfnBot.SampleUtteranceProperty[] => {
      return utterances.map(utterance => ({ utterance }));
    };

    // Helper to create a prompt specification
    const createPrompt = (text: string): lex.CfnBot.PromptSpecificationProperty => ({
      messageGroupsList: [{
        message: { plainTextMessage: { value: text } },
      }],
      maxRetries: 2,
      allowInterrupt: true,
    });

    // Helper to create a closing response
    const createClosingResponse = (text: string): lex.CfnBot.ResponseSpecificationProperty => ({
      messageGroupsList: [{
        message: { plainTextMessage: { value: text } },
      }],
      allowInterrupt: true,
    });

    // Helper to create a slot
    const createSlot = (
      name: string,
      slotTypeName: string,
      promptText: string,
      required: boolean = false
    ): lex.CfnBot.SlotProperty => ({
      name,
      slotTypeName,
      valueElicitationSetting: {
        slotConstraint: required ? 'Required' : 'Optional',
        promptSpecification: createPrompt(promptText),
      },
    });

    // Define all intents
    const intents: lex.CfnBot.IntentProperty[] = [
      // SearchRecipe Intent
      {
        name: 'SearchRecipe',
        description: 'Search for recipes by dish, cuisine, diet, or time',
        sampleUtterances: createUtterances([
          'find {dish} recipes',
          'find me {dish} recipes',
          'search for {dish}',
          'show me {dish} recipes',
          'I want to make {dish}',
          'I want {dish}',
          'show {cuisine} food',
          'find {cuisine} recipes',
          'I want {cuisine} food',
          '{diet} recipes',
          'find {diet} recipes',
          'show me {diet} meals',
          'what can I make in {maxTime} minutes',
          'quick {dish} recipe',
          'easy {dish}',
          'find {diet} {cuisine} recipes',
          'show me {dish} that takes {maxTime} minutes',
          '{cuisine} {dish}',
          'recipe for {dish}',
          'how to make {dish}',
        ]),
        slots: [
          createSlot('dish', 'DishType', 'What dish would you like to find?'),
          createSlot('cuisine', 'CuisineType', 'Any particular cuisine?'),
          createSlot('diet', 'DietType', 'Any dietary preferences?'),
          createSlot('maxTime', 'AMAZON.Number', 'How much time do you have in minutes?'),
        ],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Searching for recipes...'),
        },
      },

      // GetRecipeDetails Intent
      {
        name: 'GetRecipeDetails',
        description: 'Get details about a specific recipe from search results',
        sampleUtterances: createUtterances([
          'tell me about the {ordinal} one',
          'tell me more about the {ordinal} recipe',
          'show me the {ordinal} one',
          'what about the {ordinal}',
          'details on the {ordinal}',
          'the {ordinal} one',
          'number {ordinal}',
          'tell me about {recipeName}',
          'show me {recipeName}',
          'details on {recipeName}',
          'what is {recipeName}',
          'more about {recipeName}',
        ]),
        slots: [
          createSlot('ordinal', 'OrdinalType', 'Which recipe number would you like to know about?'),
          createSlot('recipeName', 'AMAZON.SearchQuery', 'Which recipe would you like details on?'),
        ],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Getting recipe details...'),
        },
      },

      // SearchByIngredients Intent
      {
        name: 'SearchByIngredients',
        description: 'Search for recipes based on available ingredients',
        sampleUtterances: createUtterances([
          'what can I make with {ingredients}',
          'I have {ingredients}',
          'recipes with {ingredients}',
          'using {ingredients}',
          'cook with {ingredients}',
          'I have {ingredients} what can I make',
          'recipes using {ingredients}',
          'what to make with {ingredients}',
        ]),
        slots: [
          createSlot('ingredients', 'AMAZON.SearchQuery', 'What ingredients do you have?', true),
        ],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Searching for recipes with those ingredients...'),
        },
      },

      // StartCooking Intent
      {
        name: 'StartCooking',
        description: 'Start the cooking mode with step-by-step instructions',
        sampleUtterances: createUtterances([
          'start cooking',
          'let\'s cook',
          'begin cooking',
          'cook this',
          'let\'s make it',
          'walk me through it',
          'show me the steps',
          'give me the instructions',
          'how do I make this',
          'start the recipe',
          'begin the recipe',
          'let\'s cook {recipeName}',
          'start cooking {recipeName}',
        ]),
        slots: [
          createSlot('recipeName', 'AMAZON.SearchQuery', 'Which recipe would you like to cook?'),
        ],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Starting cooking mode...'),
        },
      },

      // NextStep Intent
      {
        name: 'NextStep',
        description: 'Move to the next step in cooking mode',
        sampleUtterances: createUtterances([
          'next',
          'next step',
          'what\'s next',
          'continue',
          'go on',
          'move on',
          'what do I do next',
          'done',
          'finished this step',
          'okay next',
        ]),
        slots: [],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Moving to next step...'),
        },
      },

      // PreviousStep Intent
      {
        name: 'PreviousStep',
        description: 'Go back to the previous step in cooking mode',
        sampleUtterances: createUtterances([
          'go back',
          'previous step',
          'previous',
          'back',
          'repeat that',
          'say that again',
          'what was that',
          'repeat',
          'again',
        ]),
        slots: [],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Going back...'),
        },
      },

      // AddToShoppingList Intent
      {
        name: 'AddToShoppingList',
        description: 'Add recipe ingredients to the shopping list',
        sampleUtterances: createUtterances([
          'add to shopping list',
          'add ingredients to my list',
          'save shopping list',
          'add to my list',
          'save ingredients',
          'add these ingredients',
          'shopping list',
          'put on my shopping list',
        ]),
        slots: [],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Adding to shopping list...'),
        },
      },

      // AddToFavorites Intent
      {
        name: 'AddToFavorites',
        description: 'Save a recipe to favorites',
        sampleUtterances: createUtterances([
          'save this recipe',
          'add to favorites',
          'save to favorites',
          'favorite this',
          'bookmark this',
          'save it',
          'I like this recipe',
          'keep this recipe',
        ]),
        slots: [],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Saving to favorites...'),
        },
      },

      // GetSubstitute Intent
      {
        name: 'GetSubstitute',
        description: 'Get a substitute for an ingredient',
        sampleUtterances: createUtterances([
          'what can I use instead of {ingredient}',
          'substitute for {ingredient}',
          'replacement for {ingredient}',
          'I don\'t have {ingredient}',
          'what replaces {ingredient}',
          'alternative to {ingredient}',
          '{ingredient} substitute',
        ]),
        slots: [
          createSlot('ingredient', 'AMAZON.Food', 'Which ingredient do you need a substitute for?', true),
        ],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Finding substitutes...'),
        },
      },

      // Help Intent
      {
        name: 'Help',
        description: 'Get help with using ChefMate',
        sampleUtterances: createUtterances([
          'help',
          'help me',
          'what can you do',
          'what are your capabilities',
          'how do I use this',
          'instructions',
          'guide me',
          'what should I say',
        ]),
        slots: [],
        intentClosingSetting: {
          closingResponse: createClosingResponse('Here\'s what I can help you with...'),
        },
      },

      // FallbackIntent (required)
      {
        name: 'FallbackIntent',
        description: 'Fallback intent when no other intent matches',
        parentIntentSignature: 'AMAZON.FallbackIntent',
        intentClosingSetting: {
          closingResponse: createClosingResponse(
            'I didn\'t quite understand that. You can ask me to find recipes, get recipe details, or help you cook.'
          ),
        },
      },
    ];

    // Create Lex Bot
    const bot = new lex.CfnBot(this, 'ChefMateBot', {
      name: botName,
      description: 'ChefMate Voice Cooking Assistant Bot',
      roleArn: lexRole.roleArn,
      dataPrivacy: {
        ChildDirected: false,
      },
      idleSessionTtlInSeconds: 300,
      autoBuildBotLocales: true,
      botLocales: [
        {
          localeId: 'en_US',
          nluConfidenceThreshold: 0.4,
          description: 'English (US) locale for ChefMate',
          slotTypes: [
            {
              name: 'DishType',
              description: 'Types of dishes',
              valueSelectionSetting: {
                resolutionStrategy: 'TopResolution',
              },
              slotTypeValues: createSlotTypeValues(dishTypeValues),
            },
            {
              name: 'CuisineType',
              description: 'Types of cuisines',
              valueSelectionSetting: {
                resolutionStrategy: 'TopResolution',
              },
              slotTypeValues: createSlotTypeValues(cuisineTypeValues),
            },
            {
              name: 'DietType',
              description: 'Dietary preferences',
              valueSelectionSetting: {
                resolutionStrategy: 'TopResolution',
              },
              slotTypeValues: createSlotTypeValues(dietTypeValues),
            },
            {
              name: 'OrdinalType',
              description: 'Ordinal numbers for recipe selection',
              valueSelectionSetting: {
                resolutionStrategy: 'TopResolution',
              },
              slotTypeValues: createSlotTypeValues(ordinalValues),
            },
          ],
          intents,
        },
      ],
    });

    // Create Bot Version
    const botVersion = new lex.CfnBotVersion(this, 'ChefMateBotVersion', {
      botId: bot.attrId,
      botVersionLocaleSpecification: [
        {
          localeId: 'en_US',
          botVersionLocaleDetails: {
            sourceBotVersion: 'DRAFT',
          },
        },
      ],
      description: 'ChefMate Bot Version',
    });

    // Create Bot Alias (LIVE)
    const botAlias = new lex.CfnBotAlias(this, 'ChefMateBotAlias', {
      botId: bot.attrId,
      botAliasName: 'live',
      botVersion: botVersion.attrBotVersion,
      botAliasLocaleSettings: [
        {
          localeId: 'en_US',
          botAliasLocaleSetting: {
            enabled: true,
          },
        },
      ],
      description: 'Live alias for ChefMate Bot',
    });

    // Set outputs
    this.botId = bot.attrId;
    this.botAliasId = botAlias.attrBotAliasId;
    this.botArn = bot.attrArn;
  }
}
