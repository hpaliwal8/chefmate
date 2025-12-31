"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChefMateLexBot = void 0;
const lex = __importStar(require("aws-cdk-lib/aws-lex"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const constructs_1 = require("constructs");
class ChefMateLexBot extends constructs_1.Construct {
    botId;
    botAliasId;
    botArn;
    constructor(scope, id, props) {
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
        const createSlotTypeValues = (values) => {
            return values.map(value => ({
                sampleValue: { value },
            }));
        };
        // Helper to create sample utterances
        const createUtterances = (utterances) => {
            return utterances.map(utterance => ({ utterance }));
        };
        // Helper to create a prompt specification
        const createPrompt = (text) => ({
            messageGroupsList: [{
                    message: { plainTextMessage: { value: text } },
                }],
            maxRetries: 2,
            allowInterrupt: true,
        });
        // Helper to create a closing response
        const createClosingResponse = (text) => ({
            messageGroupsList: [{
                    message: { plainTextMessage: { value: text } },
                }],
            allowInterrupt: true,
        });
        // Helper to create a slot
        const createSlot = (name, slotTypeName, promptText, required = false) => ({
            name,
            slotTypeName,
            valueElicitationSetting: {
                slotConstraint: required ? 'Required' : 'Optional',
                promptSpecification: createPrompt(promptText),
            },
        });
        // Define all intents
        const intents = [
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
                    closingResponse: createClosingResponse('I didn\'t quite understand that. You can ask me to find recipes, get recipe details, or help you cook.'),
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
exports.ChefMateLexBot = ChefMateLexBot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGV4LWJvdC1jb25zdHJ1Y3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsZXgtYm90LWNvbnN0cnVjdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSx5REFBMkM7QUFDM0MseURBQTJDO0FBQzNDLDJDQUF1QztBQU12QyxNQUFhLGNBQWUsU0FBUSxzQkFBUztJQUMzQixLQUFLLENBQVM7SUFDZCxVQUFVLENBQVM7SUFDbkIsTUFBTSxDQUFTO0lBRS9CLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBMkI7UUFDbkUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsT0FBTyxJQUFJLGFBQWEsQ0FBQztRQUVoRCx1QkFBdUI7UUFDdkIsTUFBTSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDL0MsUUFBUSxFQUFFLEdBQUcsT0FBTyxPQUFPO1lBQzNCLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxxQkFBcUIsQ0FBQztZQUMxRCxXQUFXLEVBQUUsK0JBQStCO1NBQzdDLENBQUMsQ0FBQztRQUVILDBCQUEwQjtRQUMxQixNQUFNLGNBQWMsR0FBRztZQUNyQixPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxPQUFPO1lBQzlELFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUTtZQUMzRCxNQUFNLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU07WUFDdEQsV0FBVyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxXQUFXO1lBQzVELFNBQVMsRUFB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Q0FBQyxNQUFNLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDO1FBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztJQUM1QixDQUFDO0NBQ0Y7QUE1YUQsd0NBNGFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCAqIGFzIGxleCBmcm9tICdhd3MtY2RrLWxpYi9hd3MtbGV4JztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgaW50ZXJmYWNlIENoZWZNYXRlTGV4Qm90UHJvcHMge1xuICByZWFkb25seSBib3ROYW1lPzogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hlZk1hdGVMZXhCb3QgZXh0ZW5kcyBDb25zdHJ1Y3Qge1xuICBwdWJsaWMgcmVhZG9ubHkgYm90SWQ6IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IGJvdEFsaWFzSWQ6IHN0cmluZztcbiAgcHVibGljIHJlYWRvbmx5IGJvdEFybjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogQ2hlZk1hdGVMZXhCb3RQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCk7XG5cbiAgICBjb25zdCBib3ROYW1lID0gcHJvcHM/LmJvdE5hbWUgfHwgJ0NoZWZNYXRlQm90JztcblxuICAgIC8vIElBTSBSb2xlIGZvciBMZXggQm90XG4gICAgY29uc3QgbGV4Um9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnTGV4Qm90Um9sZScsIHtcbiAgICAgIHJvbGVOYW1lOiBgJHtib3ROYW1lfS1Sb2xlYCxcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdsZXh2Mi5hbWF6b25hd3MuY29tJyksXG4gICAgICBkZXNjcmlwdGlvbjogJ0lBTSByb2xlIGZvciBDaGVmTWF0ZSBMZXggQm90JyxcbiAgICB9KTtcblxuICAgIC8vIEN1c3RvbSBTbG90IFR5cGUgVmFsdWVzXG4gICAgY29uc3QgZGlzaFR5cGVWYWx1ZXMgPSBbXG4gICAgICAncGFzdGEnLCAnY2hpY2tlbicsICdzYWxhZCcsICdzb3VwJywgJ2N1cnJ5JywgJ3BpenphJywgJ3RhY29zJyxcbiAgICAgICdzdGlyIGZyeScsICdzYW5kd2ljaCcsICdidXJnZXInLCAnc3RlYWsnLCAnZmlzaCcsICdzaHJpbXAnLFxuICAgICAgJ3JpY2UnLCAnbm9vZGxlcycsICdzdXNoaScsICdyYW1lbicsICdidXJyaXRvJywgJ3dyYXAnLFxuICAgICAgJ2Nhc3Nlcm9sZScsICdyb2FzdCcsICdncmlsbCcsICdiYWtlZCcsICdmcmllZCcsICdicmVha2Zhc3QnLFxuICAgICAgJ2Rlc3NlcnQnLCAnY2FrZScsICdjb29raWVzJywgJ3BpZScsICdzbW9vdGhpZScsICdhcHBldGl6ZXInXG4gICAgXTtcblxuICAgIGNvbnN0IGN1aXNpbmVUeXBlVmFsdWVzID0gW1xuICAgICAgJ2l0YWxpYW4nLCAnbWV4aWNhbicsICdjaGluZXNlJywgJ2luZGlhbicsICd0aGFpJywgJ2ZyZW5jaCcsXG4gICAgICAnamFwYW5lc2UnLCAnYW1lcmljYW4nLCAnbWVkaXRlcnJhbmVhbicsICdncmVlaycsICdrb3JlYW4nLFxuICAgICAgJ3ZpZXRuYW1lc2UnLCAnc3BhbmlzaCcsICdtaWRkbGUgZWFzdGVybicsICdjYWp1bicsICdjYXJpYmJlYW4nXG4gICAgXTtcblxuICAgIGNvbnN0IGRpZXRUeXBlVmFsdWVzID0gW1xuICAgICAgJ3ZlZ2V0YXJpYW4nLCAndmVnYW4nLCAnZ2x1dGVuIGZyZWUnLCAnZGFpcnkgZnJlZScsICdrZXRvJyxcbiAgICAgICdwYWxlbycsICdsb3cgY2FyYicsICdsb3cgZmF0JywgJ3dob2xlMzAnLCAncGVzY2F0YXJpYW4nXG4gICAgXTtcblxuICAgIGNvbnN0IG9yZGluYWxWYWx1ZXMgPSBbXG4gICAgICAnZmlyc3QnLCAnc2Vjb25kJywgJ3RoaXJkJywgJ2ZvdXJ0aCcsICdmaWZ0aCcsXG4gICAgICAnMXN0JywgJzJuZCcsICczcmQnLCAnNHRoJywgJzV0aCcsXG4gICAgICAnb25lJywgJ3R3bycsICd0aHJlZScsICdmb3VyJywgJ2ZpdmUnLCAnbGFzdCdcbiAgICBdO1xuXG4gICAgLy8gSGVscGVyIHRvIGNyZWF0ZSBzbG90IHR5cGUgdmFsdWVzXG4gICAgY29uc3QgY3JlYXRlU2xvdFR5cGVWYWx1ZXMgPSAodmFsdWVzOiBzdHJpbmdbXSk6IGxleC5DZm5Cb3QuU2xvdFR5cGVWYWx1ZVByb3BlcnR5W10gPT4ge1xuICAgICAgcmV0dXJuIHZhbHVlcy5tYXAodmFsdWUgPT4gKHtcbiAgICAgICAgc2FtcGxlVmFsdWU6IHsgdmFsdWUgfSxcbiAgICAgIH0pKTtcbiAgICB9O1xuXG4gICAgLy8gSGVscGVyIHRvIGNyZWF0ZSBzYW1wbGUgdXR0ZXJhbmNlc1xuICAgIGNvbnN0IGNyZWF0ZVV0dGVyYW5jZXMgPSAodXR0ZXJhbmNlczogc3RyaW5nW10pOiBsZXguQ2ZuQm90LlNhbXBsZVV0dGVyYW5jZVByb3BlcnR5W10gPT4ge1xuICAgICAgcmV0dXJuIHV0dGVyYW5jZXMubWFwKHV0dGVyYW5jZSA9PiAoeyB1dHRlcmFuY2UgfSkpO1xuICAgIH07XG5cbiAgICAvLyBIZWxwZXIgdG8gY3JlYXRlIGEgcHJvbXB0IHNwZWNpZmljYXRpb25cbiAgICBjb25zdCBjcmVhdGVQcm9tcHQgPSAodGV4dDogc3RyaW5nKTogbGV4LkNmbkJvdC5Qcm9tcHRTcGVjaWZpY2F0aW9uUHJvcGVydHkgPT4gKHtcbiAgICAgIG1lc3NhZ2VHcm91cHNMaXN0OiBbe1xuICAgICAgICBtZXNzYWdlOiB7IHBsYWluVGV4dE1lc3NhZ2U6IHsgdmFsdWU6IHRleHQgfSB9LFxuICAgICAgfV0sXG4gICAgICBtYXhSZXRyaWVzOiAyLFxuICAgICAgYWxsb3dJbnRlcnJ1cHQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBIZWxwZXIgdG8gY3JlYXRlIGEgY2xvc2luZyByZXNwb25zZVxuICAgIGNvbnN0IGNyZWF0ZUNsb3NpbmdSZXNwb25zZSA9ICh0ZXh0OiBzdHJpbmcpOiBsZXguQ2ZuQm90LlJlc3BvbnNlU3BlY2lmaWNhdGlvblByb3BlcnR5ID0+ICh7XG4gICAgICBtZXNzYWdlR3JvdXBzTGlzdDogW3tcbiAgICAgICAgbWVzc2FnZTogeyBwbGFpblRleHRNZXNzYWdlOiB7IHZhbHVlOiB0ZXh0IH0gfSxcbiAgICAgIH1dLFxuICAgICAgYWxsb3dJbnRlcnJ1cHQ6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBIZWxwZXIgdG8gY3JlYXRlIGEgc2xvdFxuICAgIGNvbnN0IGNyZWF0ZVNsb3QgPSAoXG4gICAgICBuYW1lOiBzdHJpbmcsXG4gICAgICBzbG90VHlwZU5hbWU6IHN0cmluZyxcbiAgICAgIHByb21wdFRleHQ6IHN0cmluZyxcbiAgICAgIHJlcXVpcmVkOiBib29sZWFuID0gZmFsc2VcbiAgICApOiBsZXguQ2ZuQm90LlNsb3RQcm9wZXJ0eSA9PiAoe1xuICAgICAgbmFtZSxcbiAgICAgIHNsb3RUeXBlTmFtZSxcbiAgICAgIHZhbHVlRWxpY2l0YXRpb25TZXR0aW5nOiB7XG4gICAgICAgIHNsb3RDb25zdHJhaW50OiByZXF1aXJlZCA/ICdSZXF1aXJlZCcgOiAnT3B0aW9uYWwnLFxuICAgICAgICBwcm9tcHRTcGVjaWZpY2F0aW9uOiBjcmVhdGVQcm9tcHQocHJvbXB0VGV4dCksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gRGVmaW5lIGFsbCBpbnRlbnRzXG4gICAgY29uc3QgaW50ZW50czogbGV4LkNmbkJvdC5JbnRlbnRQcm9wZXJ0eVtdID0gW1xuICAgICAgLy8gU2VhcmNoUmVjaXBlIEludGVudFxuICAgICAge1xuICAgICAgICBuYW1lOiAnU2VhcmNoUmVjaXBlJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdTZWFyY2ggZm9yIHJlY2lwZXMgYnkgZGlzaCwgY3Vpc2luZSwgZGlldCwgb3IgdGltZScsXG4gICAgICAgIHNhbXBsZVV0dGVyYW5jZXM6IGNyZWF0ZVV0dGVyYW5jZXMoW1xuICAgICAgICAgICdmaW5kIHtkaXNofSByZWNpcGVzJyxcbiAgICAgICAgICAnZmluZCBtZSB7ZGlzaH0gcmVjaXBlcycsXG4gICAgICAgICAgJ3NlYXJjaCBmb3Ige2Rpc2h9JyxcbiAgICAgICAgICAnc2hvdyBtZSB7ZGlzaH0gcmVjaXBlcycsXG4gICAgICAgICAgJ0kgd2FudCB0byBtYWtlIHtkaXNofScsXG4gICAgICAgICAgJ0kgd2FudCB7ZGlzaH0nLFxuICAgICAgICAgICdzaG93IHtjdWlzaW5lfSBmb29kJyxcbiAgICAgICAgICAnZmluZCB7Y3Vpc2luZX0gcmVjaXBlcycsXG4gICAgICAgICAgJ0kgd2FudCB7Y3Vpc2luZX0gZm9vZCcsXG4gICAgICAgICAgJ3tkaWV0fSByZWNpcGVzJyxcbiAgICAgICAgICAnZmluZCB7ZGlldH0gcmVjaXBlcycsXG4gICAgICAgICAgJ3Nob3cgbWUge2RpZXR9IG1lYWxzJyxcbiAgICAgICAgICAnd2hhdCBjYW4gSSBtYWtlIGluIHttYXhUaW1lfSBtaW51dGVzJyxcbiAgICAgICAgICAncXVpY2sge2Rpc2h9IHJlY2lwZScsXG4gICAgICAgICAgJ2Vhc3kge2Rpc2h9JyxcbiAgICAgICAgICAnZmluZCB7ZGlldH0ge2N1aXNpbmV9IHJlY2lwZXMnLFxuICAgICAgICAgICdzaG93IG1lIHtkaXNofSB0aGF0IHRha2VzIHttYXhUaW1lfSBtaW51dGVzJyxcbiAgICAgICAgICAne2N1aXNpbmV9IHtkaXNofScsXG4gICAgICAgICAgJ3JlY2lwZSBmb3Ige2Rpc2h9JyxcbiAgICAgICAgICAnaG93IHRvIG1ha2Uge2Rpc2h9JyxcbiAgICAgICAgXSksXG4gICAgICAgIHNsb3RzOiBbXG4gICAgICAgICAgY3JlYXRlU2xvdCgnZGlzaCcsICdEaXNoVHlwZScsICdXaGF0IGRpc2ggd291bGQgeW91IGxpa2UgdG8gZmluZD8nKSxcbiAgICAgICAgICBjcmVhdGVTbG90KCdjdWlzaW5lJywgJ0N1aXNpbmVUeXBlJywgJ0FueSBwYXJ0aWN1bGFyIGN1aXNpbmU/JyksXG4gICAgICAgICAgY3JlYXRlU2xvdCgnZGlldCcsICdEaWV0VHlwZScsICdBbnkgZGlldGFyeSBwcmVmZXJlbmNlcz8nKSxcbiAgICAgICAgICBjcmVhdGVTbG90KCdtYXhUaW1lJywgJ0FNQVpPTi5OdW1iZXInLCAnSG93IG11Y2ggdGltZSBkbyB5b3UgaGF2ZSBpbiBtaW51dGVzPycpLFxuICAgICAgICBdLFxuICAgICAgICBpbnRlbnRDbG9zaW5nU2V0dGluZzoge1xuICAgICAgICAgIGNsb3NpbmdSZXNwb25zZTogY3JlYXRlQ2xvc2luZ1Jlc3BvbnNlKCdTZWFyY2hpbmcgZm9yIHJlY2lwZXMuLi4nKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG5cbiAgICAgIC8vIEdldFJlY2lwZURldGFpbHMgSW50ZW50XG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdHZXRSZWNpcGVEZXRhaWxzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdHZXQgZGV0YWlscyBhYm91dCBhIHNwZWNpZmljIHJlY2lwZSBmcm9tIHNlYXJjaCByZXN1bHRzJyxcbiAgICAgICAgc2FtcGxlVXR0ZXJhbmNlczogY3JlYXRlVXR0ZXJhbmNlcyhbXG4gICAgICAgICAgJ3RlbGwgbWUgYWJvdXQgdGhlIHtvcmRpbmFsfSBvbmUnLFxuICAgICAgICAgICd0ZWxsIG1lIG1vcmUgYWJvdXQgdGhlIHtvcmRpbmFsfSByZWNpcGUnLFxuICAgICAgICAgICdzaG93IG1lIHRoZSB7b3JkaW5hbH0gb25lJyxcbiAgICAgICAgICAnd2hhdCBhYm91dCB0aGUge29yZGluYWx9JyxcbiAgICAgICAgICAnZGV0YWlscyBvbiB0aGUge29yZGluYWx9JyxcbiAgICAgICAgICAndGhlIHtvcmRpbmFsfSBvbmUnLFxuICAgICAgICAgICdudW1iZXIge29yZGluYWx9JyxcbiAgICAgICAgICAndGVsbCBtZSBhYm91dCB7cmVjaXBlTmFtZX0nLFxuICAgICAgICAgICdzaG93IG1lIHtyZWNpcGVOYW1lfScsXG4gICAgICAgICAgJ2RldGFpbHMgb24ge3JlY2lwZU5hbWV9JyxcbiAgICAgICAgICAnd2hhdCBpcyB7cmVjaXBlTmFtZX0nLFxuICAgICAgICAgICdtb3JlIGFib3V0IHtyZWNpcGVOYW1lfScsXG4gICAgICAgIF0pLFxuICAgICAgICBzbG90czogW1xuICAgICAgICAgIGNyZWF0ZVNsb3QoJ29yZGluYWwnLCAnT3JkaW5hbFR5cGUnLCAnV2hpY2ggcmVjaXBlIG51bWJlciB3b3VsZCB5b3UgbGlrZSB0byBrbm93IGFib3V0PycpLFxuICAgICAgICAgIGNyZWF0ZVNsb3QoJ3JlY2lwZU5hbWUnLCAnQU1BWk9OLlNlYXJjaFF1ZXJ5JywgJ1doaWNoIHJlY2lwZSB3b3VsZCB5b3UgbGlrZSBkZXRhaWxzIG9uPycpLFxuICAgICAgICBdLFxuICAgICAgICBpbnRlbnRDbG9zaW5nU2V0dGluZzoge1xuICAgICAgICAgIGNsb3NpbmdSZXNwb25zZTogY3JlYXRlQ2xvc2luZ1Jlc3BvbnNlKCdHZXR0aW5nIHJlY2lwZSBkZXRhaWxzLi4uJyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuXG4gICAgICAvLyBTZWFyY2hCeUluZ3JlZGllbnRzIEludGVudFxuICAgICAge1xuICAgICAgICBuYW1lOiAnU2VhcmNoQnlJbmdyZWRpZW50cycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIGZvciByZWNpcGVzIGJhc2VkIG9uIGF2YWlsYWJsZSBpbmdyZWRpZW50cycsXG4gICAgICAgIHNhbXBsZVV0dGVyYW5jZXM6IGNyZWF0ZVV0dGVyYW5jZXMoW1xuICAgICAgICAgICd3aGF0IGNhbiBJIG1ha2Ugd2l0aCB7aW5ncmVkaWVudHN9JyxcbiAgICAgICAgICAnSSBoYXZlIHtpbmdyZWRpZW50c30nLFxuICAgICAgICAgICdyZWNpcGVzIHdpdGgge2luZ3JlZGllbnRzfScsXG4gICAgICAgICAgJ3VzaW5nIHtpbmdyZWRpZW50c30nLFxuICAgICAgICAgICdjb29rIHdpdGgge2luZ3JlZGllbnRzfScsXG4gICAgICAgICAgJ0kgaGF2ZSB7aW5ncmVkaWVudHN9IHdoYXQgY2FuIEkgbWFrZScsXG4gICAgICAgICAgJ3JlY2lwZXMgdXNpbmcge2luZ3JlZGllbnRzfScsXG4gICAgICAgICAgJ3doYXQgdG8gbWFrZSB3aXRoIHtpbmdyZWRpZW50c30nLFxuICAgICAgICBdKSxcbiAgICAgICAgc2xvdHM6IFtcbiAgICAgICAgICBjcmVhdGVTbG90KCdpbmdyZWRpZW50cycsICdBTUFaT04uU2VhcmNoUXVlcnknLCAnV2hhdCBpbmdyZWRpZW50cyBkbyB5b3UgaGF2ZT8nLCB0cnVlKSxcbiAgICAgICAgXSxcbiAgICAgICAgaW50ZW50Q2xvc2luZ1NldHRpbmc6IHtcbiAgICAgICAgICBjbG9zaW5nUmVzcG9uc2U6IGNyZWF0ZUNsb3NpbmdSZXNwb25zZSgnU2VhcmNoaW5nIGZvciByZWNpcGVzIHdpdGggdGhvc2UgaW5ncmVkaWVudHMuLi4nKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG5cbiAgICAgIC8vIFN0YXJ0Q29va2luZyBJbnRlbnRcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ1N0YXJ0Q29va2luZycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU3RhcnQgdGhlIGNvb2tpbmcgbW9kZSB3aXRoIHN0ZXAtYnktc3RlcCBpbnN0cnVjdGlvbnMnLFxuICAgICAgICBzYW1wbGVVdHRlcmFuY2VzOiBjcmVhdGVVdHRlcmFuY2VzKFtcbiAgICAgICAgICAnc3RhcnQgY29va2luZycsXG4gICAgICAgICAgJ2xldFxcJ3MgY29vaycsXG4gICAgICAgICAgJ2JlZ2luIGNvb2tpbmcnLFxuICAgICAgICAgICdjb29rIHRoaXMnLFxuICAgICAgICAgICdsZXRcXCdzIG1ha2UgaXQnLFxuICAgICAgICAgICd3YWxrIG1lIHRocm91Z2ggaXQnLFxuICAgICAgICAgICdzaG93IG1lIHRoZSBzdGVwcycsXG4gICAgICAgICAgJ2dpdmUgbWUgdGhlIGluc3RydWN0aW9ucycsXG4gICAgICAgICAgJ2hvdyBkbyBJIG1ha2UgdGhpcycsXG4gICAgICAgICAgJ3N0YXJ0IHRoZSByZWNpcGUnLFxuICAgICAgICAgICdiZWdpbiB0aGUgcmVjaXBlJyxcbiAgICAgICAgICAnbGV0XFwncyBjb29rIHtyZWNpcGVOYW1lfScsXG4gICAgICAgICAgJ3N0YXJ0IGNvb2tpbmcge3JlY2lwZU5hbWV9JyxcbiAgICAgICAgXSksXG4gICAgICAgIHNsb3RzOiBbXG4gICAgICAgICAgY3JlYXRlU2xvdCgncmVjaXBlTmFtZScsICdBTUFaT04uU2VhcmNoUXVlcnknLCAnV2hpY2ggcmVjaXBlIHdvdWxkIHlvdSBsaWtlIHRvIGNvb2s/JyksXG4gICAgICAgIF0sXG4gICAgICAgIGludGVudENsb3NpbmdTZXR0aW5nOiB7XG4gICAgICAgICAgY2xvc2luZ1Jlc3BvbnNlOiBjcmVhdGVDbG9zaW5nUmVzcG9uc2UoJ1N0YXJ0aW5nIGNvb2tpbmcgbW9kZS4uLicpLFxuICAgICAgICB9LFxuICAgICAgfSxcblxuICAgICAgLy8gTmV4dFN0ZXAgSW50ZW50XG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdOZXh0U3RlcCcsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnTW92ZSB0byB0aGUgbmV4dCBzdGVwIGluIGNvb2tpbmcgbW9kZScsXG4gICAgICAgIHNhbXBsZVV0dGVyYW5jZXM6IGNyZWF0ZVV0dGVyYW5jZXMoW1xuICAgICAgICAgICduZXh0JyxcbiAgICAgICAgICAnbmV4dCBzdGVwJyxcbiAgICAgICAgICAnd2hhdFxcJ3MgbmV4dCcsXG4gICAgICAgICAgJ2NvbnRpbnVlJyxcbiAgICAgICAgICAnZ28gb24nLFxuICAgICAgICAgICdtb3ZlIG9uJyxcbiAgICAgICAgICAnd2hhdCBkbyBJIGRvIG5leHQnLFxuICAgICAgICAgICdkb25lJyxcbiAgICAgICAgICAnZmluaXNoZWQgdGhpcyBzdGVwJyxcbiAgICAgICAgICAnb2theSBuZXh0JyxcbiAgICAgICAgXSksXG4gICAgICAgIHNsb3RzOiBbXSxcbiAgICAgICAgaW50ZW50Q2xvc2luZ1NldHRpbmc6IHtcbiAgICAgICAgICBjbG9zaW5nUmVzcG9uc2U6IGNyZWF0ZUNsb3NpbmdSZXNwb25zZSgnTW92aW5nIHRvIG5leHQgc3RlcC4uLicpLFxuICAgICAgICB9LFxuICAgICAgfSxcblxuICAgICAgLy8gUHJldmlvdXNTdGVwIEludGVudFxuICAgICAge1xuICAgICAgICBuYW1lOiAnUHJldmlvdXNTdGVwJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdHbyBiYWNrIHRvIHRoZSBwcmV2aW91cyBzdGVwIGluIGNvb2tpbmcgbW9kZScsXG4gICAgICAgIHNhbXBsZVV0dGVyYW5jZXM6IGNyZWF0ZVV0dGVyYW5jZXMoW1xuICAgICAgICAgICdnbyBiYWNrJyxcbiAgICAgICAgICAncHJldmlvdXMgc3RlcCcsXG4gICAgICAgICAgJ3ByZXZpb3VzJyxcbiAgICAgICAgICAnYmFjaycsXG4gICAgICAgICAgJ3JlcGVhdCB0aGF0JyxcbiAgICAgICAgICAnc2F5IHRoYXQgYWdhaW4nLFxuICAgICAgICAgICd3aGF0IHdhcyB0aGF0JyxcbiAgICAgICAgICAncmVwZWF0JyxcbiAgICAgICAgICAnYWdhaW4nLFxuICAgICAgICBdKSxcbiAgICAgICAgc2xvdHM6IFtdLFxuICAgICAgICBpbnRlbnRDbG9zaW5nU2V0dGluZzoge1xuICAgICAgICAgIGNsb3NpbmdSZXNwb25zZTogY3JlYXRlQ2xvc2luZ1Jlc3BvbnNlKCdHb2luZyBiYWNrLi4uJyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuXG4gICAgICAvLyBBZGRUb1Nob3BwaW5nTGlzdCBJbnRlbnRcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ0FkZFRvU2hvcHBpbmdMaXN0JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBZGQgcmVjaXBlIGluZ3JlZGllbnRzIHRvIHRoZSBzaG9wcGluZyBsaXN0JyxcbiAgICAgICAgc2FtcGxlVXR0ZXJhbmNlczogY3JlYXRlVXR0ZXJhbmNlcyhbXG4gICAgICAgICAgJ2FkZCB0byBzaG9wcGluZyBsaXN0JyxcbiAgICAgICAgICAnYWRkIGluZ3JlZGllbnRzIHRvIG15IGxpc3QnLFxuICAgICAgICAgICdzYXZlIHNob3BwaW5nIGxpc3QnLFxuICAgICAgICAgICdhZGQgdG8gbXkgbGlzdCcsXG4gICAgICAgICAgJ3NhdmUgaW5ncmVkaWVudHMnLFxuICAgICAgICAgICdhZGQgdGhlc2UgaW5ncmVkaWVudHMnLFxuICAgICAgICAgICdzaG9wcGluZyBsaXN0JyxcbiAgICAgICAgICAncHV0IG9uIG15IHNob3BwaW5nIGxpc3QnLFxuICAgICAgICBdKSxcbiAgICAgICAgc2xvdHM6IFtdLFxuICAgICAgICBpbnRlbnRDbG9zaW5nU2V0dGluZzoge1xuICAgICAgICAgIGNsb3NpbmdSZXNwb25zZTogY3JlYXRlQ2xvc2luZ1Jlc3BvbnNlKCdBZGRpbmcgdG8gc2hvcHBpbmcgbGlzdC4uLicpLFxuICAgICAgICB9LFxuICAgICAgfSxcblxuICAgICAgLy8gQWRkVG9GYXZvcml0ZXMgSW50ZW50XG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdBZGRUb0Zhdm9yaXRlcycsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnU2F2ZSBhIHJlY2lwZSB0byBmYXZvcml0ZXMnLFxuICAgICAgICBzYW1wbGVVdHRlcmFuY2VzOiBjcmVhdGVVdHRlcmFuY2VzKFtcbiAgICAgICAgICAnc2F2ZSB0aGlzIHJlY2lwZScsXG4gICAgICAgICAgJ2FkZCB0byBmYXZvcml0ZXMnLFxuICAgICAgICAgICdzYXZlIHRvIGZhdm9yaXRlcycsXG4gICAgICAgICAgJ2Zhdm9yaXRlIHRoaXMnLFxuICAgICAgICAgICdib29rbWFyayB0aGlzJyxcbiAgICAgICAgICAnc2F2ZSBpdCcsXG4gICAgICAgICAgJ0kgbGlrZSB0aGlzIHJlY2lwZScsXG4gICAgICAgICAgJ2tlZXAgdGhpcyByZWNpcGUnLFxuICAgICAgICBdKSxcbiAgICAgICAgc2xvdHM6IFtdLFxuICAgICAgICBpbnRlbnRDbG9zaW5nU2V0dGluZzoge1xuICAgICAgICAgIGNsb3NpbmdSZXNwb25zZTogY3JlYXRlQ2xvc2luZ1Jlc3BvbnNlKCdTYXZpbmcgdG8gZmF2b3JpdGVzLi4uJyksXG4gICAgICAgIH0sXG4gICAgICB9LFxuXG4gICAgICAvLyBHZXRTdWJzdGl0dXRlIEludGVudFxuICAgICAge1xuICAgICAgICBuYW1lOiAnR2V0U3Vic3RpdHV0ZScsXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnR2V0IGEgc3Vic3RpdHV0ZSBmb3IgYW4gaW5ncmVkaWVudCcsXG4gICAgICAgIHNhbXBsZVV0dGVyYW5jZXM6IGNyZWF0ZVV0dGVyYW5jZXMoW1xuICAgICAgICAgICd3aGF0IGNhbiBJIHVzZSBpbnN0ZWFkIG9mIHtpbmdyZWRpZW50fScsXG4gICAgICAgICAgJ3N1YnN0aXR1dGUgZm9yIHtpbmdyZWRpZW50fScsXG4gICAgICAgICAgJ3JlcGxhY2VtZW50IGZvciB7aW5ncmVkaWVudH0nLFxuICAgICAgICAgICdJIGRvblxcJ3QgaGF2ZSB7aW5ncmVkaWVudH0nLFxuICAgICAgICAgICd3aGF0IHJlcGxhY2VzIHtpbmdyZWRpZW50fScsXG4gICAgICAgICAgJ2FsdGVybmF0aXZlIHRvIHtpbmdyZWRpZW50fScsXG4gICAgICAgICAgJ3tpbmdyZWRpZW50fSBzdWJzdGl0dXRlJyxcbiAgICAgICAgXSksXG4gICAgICAgIHNsb3RzOiBbXG4gICAgICAgICAgY3JlYXRlU2xvdCgnaW5ncmVkaWVudCcsICdBTUFaT04uRm9vZCcsICdXaGljaCBpbmdyZWRpZW50IGRvIHlvdSBuZWVkIGEgc3Vic3RpdHV0ZSBmb3I/JywgdHJ1ZSksXG4gICAgICAgIF0sXG4gICAgICAgIGludGVudENsb3NpbmdTZXR0aW5nOiB7XG4gICAgICAgICAgY2xvc2luZ1Jlc3BvbnNlOiBjcmVhdGVDbG9zaW5nUmVzcG9uc2UoJ0ZpbmRpbmcgc3Vic3RpdHV0ZXMuLi4nKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG5cbiAgICAgIC8vIEhlbHAgSW50ZW50XG4gICAgICB7XG4gICAgICAgIG5hbWU6ICdIZWxwJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdHZXQgaGVscCB3aXRoIHVzaW5nIENoZWZNYXRlJyxcbiAgICAgICAgc2FtcGxlVXR0ZXJhbmNlczogY3JlYXRlVXR0ZXJhbmNlcyhbXG4gICAgICAgICAgJ2hlbHAnLFxuICAgICAgICAgICdoZWxwIG1lJyxcbiAgICAgICAgICAnd2hhdCBjYW4geW91IGRvJyxcbiAgICAgICAgICAnd2hhdCBhcmUgeW91ciBjYXBhYmlsaXRpZXMnLFxuICAgICAgICAgICdob3cgZG8gSSB1c2UgdGhpcycsXG4gICAgICAgICAgJ2luc3RydWN0aW9ucycsXG4gICAgICAgICAgJ2d1aWRlIG1lJyxcbiAgICAgICAgICAnd2hhdCBzaG91bGQgSSBzYXknLFxuICAgICAgICBdKSxcbiAgICAgICAgc2xvdHM6IFtdLFxuICAgICAgICBpbnRlbnRDbG9zaW5nU2V0dGluZzoge1xuICAgICAgICAgIGNsb3NpbmdSZXNwb25zZTogY3JlYXRlQ2xvc2luZ1Jlc3BvbnNlKCdIZXJlXFwncyB3aGF0IEkgY2FuIGhlbHAgeW91IHdpdGguLi4nKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG5cbiAgICAgIC8vIEZhbGxiYWNrSW50ZW50IChyZXF1aXJlZClcbiAgICAgIHtcbiAgICAgICAgbmFtZTogJ0ZhbGxiYWNrSW50ZW50JyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdGYWxsYmFjayBpbnRlbnQgd2hlbiBubyBvdGhlciBpbnRlbnQgbWF0Y2hlcycsXG4gICAgICAgIHBhcmVudEludGVudFNpZ25hdHVyZTogJ0FNQVpPTi5GYWxsYmFja0ludGVudCcsXG4gICAgICAgIGludGVudENsb3NpbmdTZXR0aW5nOiB7XG4gICAgICAgICAgY2xvc2luZ1Jlc3BvbnNlOiBjcmVhdGVDbG9zaW5nUmVzcG9uc2UoXG4gICAgICAgICAgICAnSSBkaWRuXFwndCBxdWl0ZSB1bmRlcnN0YW5kIHRoYXQuIFlvdSBjYW4gYXNrIG1lIHRvIGZpbmQgcmVjaXBlcywgZ2V0IHJlY2lwZSBkZXRhaWxzLCBvciBoZWxwIHlvdSBjb29rLidcbiAgICAgICAgICApLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdO1xuXG4gICAgLy8gQ3JlYXRlIExleCBCb3RcbiAgICBjb25zdCBib3QgPSBuZXcgbGV4LkNmbkJvdCh0aGlzLCAnQ2hlZk1hdGVCb3QnLCB7XG4gICAgICBuYW1lOiBib3ROYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdDaGVmTWF0ZSBWb2ljZSBDb29raW5nIEFzc2lzdGFudCBCb3QnLFxuICAgICAgcm9sZUFybjogbGV4Um9sZS5yb2xlQXJuLFxuICAgICAgZGF0YVByaXZhY3k6IHtcbiAgICAgICAgQ2hpbGREaXJlY3RlZDogZmFsc2UsXG4gICAgICB9LFxuICAgICAgaWRsZVNlc3Npb25UdGxJblNlY29uZHM6IDMwMCxcbiAgICAgIGF1dG9CdWlsZEJvdExvY2FsZXM6IHRydWUsXG4gICAgICBib3RMb2NhbGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBsb2NhbGVJZDogJ2VuX1VTJyxcbiAgICAgICAgICBubHVDb25maWRlbmNlVGhyZXNob2xkOiAwLjQsXG4gICAgICAgICAgZGVzY3JpcHRpb246ICdFbmdsaXNoIChVUykgbG9jYWxlIGZvciBDaGVmTWF0ZScsXG4gICAgICAgICAgc2xvdFR5cGVzOiBbXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5hbWU6ICdEaXNoVHlwZScsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnVHlwZXMgb2YgZGlzaGVzJyxcbiAgICAgICAgICAgICAgdmFsdWVTZWxlY3Rpb25TZXR0aW5nOiB7XG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvblN0cmF0ZWd5OiAnVG9wUmVzb2x1dGlvbicsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNsb3RUeXBlVmFsdWVzOiBjcmVhdGVTbG90VHlwZVZhbHVlcyhkaXNoVHlwZVZhbHVlcyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiAnQ3Vpc2luZVR5cGUnLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ1R5cGVzIG9mIGN1aXNpbmVzJyxcbiAgICAgICAgICAgICAgdmFsdWVTZWxlY3Rpb25TZXR0aW5nOiB7XG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvblN0cmF0ZWd5OiAnVG9wUmVzb2x1dGlvbicsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNsb3RUeXBlVmFsdWVzOiBjcmVhdGVTbG90VHlwZVZhbHVlcyhjdWlzaW5lVHlwZVZhbHVlcyksXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBuYW1lOiAnRGlldFR5cGUnLFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJ0RpZXRhcnkgcHJlZmVyZW5jZXMnLFxuICAgICAgICAgICAgICB2YWx1ZVNlbGVjdGlvblNldHRpbmc6IHtcbiAgICAgICAgICAgICAgICByZXNvbHV0aW9uU3RyYXRlZ3k6ICdUb3BSZXNvbHV0aW9uJyxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2xvdFR5cGVWYWx1ZXM6IGNyZWF0ZVNsb3RUeXBlVmFsdWVzKGRpZXRUeXBlVmFsdWVzKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIG5hbWU6ICdPcmRpbmFsVHlwZScsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnT3JkaW5hbCBudW1iZXJzIGZvciByZWNpcGUgc2VsZWN0aW9uJyxcbiAgICAgICAgICAgICAgdmFsdWVTZWxlY3Rpb25TZXR0aW5nOiB7XG4gICAgICAgICAgICAgICAgcmVzb2x1dGlvblN0cmF0ZWd5OiAnVG9wUmVzb2x1dGlvbicsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHNsb3RUeXBlVmFsdWVzOiBjcmVhdGVTbG90VHlwZVZhbHVlcyhvcmRpbmFsVmFsdWVzKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgICBpbnRlbnRzLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBCb3QgVmVyc2lvblxuICAgIGNvbnN0IGJvdFZlcnNpb24gPSBuZXcgbGV4LkNmbkJvdFZlcnNpb24odGhpcywgJ0NoZWZNYXRlQm90VmVyc2lvbicsIHtcbiAgICAgIGJvdElkOiBib3QuYXR0cklkLFxuICAgICAgYm90VmVyc2lvbkxvY2FsZVNwZWNpZmljYXRpb246IFtcbiAgICAgICAge1xuICAgICAgICAgIGxvY2FsZUlkOiAnZW5fVVMnLFxuICAgICAgICAgIGJvdFZlcnNpb25Mb2NhbGVEZXRhaWxzOiB7XG4gICAgICAgICAgICBzb3VyY2VCb3RWZXJzaW9uOiAnRFJBRlQnLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZGVzY3JpcHRpb246ICdDaGVmTWF0ZSBCb3QgVmVyc2lvbicsXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgQm90IEFsaWFzIChMSVZFKVxuICAgIGNvbnN0IGJvdEFsaWFzID0gbmV3IGxleC5DZm5Cb3RBbGlhcyh0aGlzLCAnQ2hlZk1hdGVCb3RBbGlhcycsIHtcbiAgICAgIGJvdElkOiBib3QuYXR0cklkLFxuICAgICAgYm90QWxpYXNOYW1lOiAnbGl2ZScsXG4gICAgICBib3RWZXJzaW9uOiBib3RWZXJzaW9uLmF0dHJCb3RWZXJzaW9uLFxuICAgICAgYm90QWxpYXNMb2NhbGVTZXR0aW5nczogW1xuICAgICAgICB7XG4gICAgICAgICAgbG9jYWxlSWQ6ICdlbl9VUycsXG4gICAgICAgICAgYm90QWxpYXNMb2NhbGVTZXR0aW5nOiB7XG4gICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZGVzY3JpcHRpb246ICdMaXZlIGFsaWFzIGZvciBDaGVmTWF0ZSBCb3QnLFxuICAgIH0pO1xuXG4gICAgLy8gU2V0IG91dHB1dHNcbiAgICB0aGlzLmJvdElkID0gYm90LmF0dHJJZDtcbiAgICB0aGlzLmJvdEFsaWFzSWQgPSBib3RBbGlhcy5hdHRyQm90QWxpYXNJZDtcbiAgICB0aGlzLmJvdEFybiA9IGJvdC5hdHRyQXJuO1xuICB9XG59XG4iXX0=