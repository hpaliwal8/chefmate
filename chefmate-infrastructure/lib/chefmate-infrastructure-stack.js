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
exports.ChefmateInfrastructureStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const logs = __importStar(require("aws-cdk-lib/aws-logs"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const cognito = __importStar(require("aws-cdk-lib/aws-cognito"));
const iam = __importStar(require("aws-cdk-lib/aws-iam"));
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path = __importStar(require("path"));
const lex_bot_construct_1 = require("./lex-bot-construct");
class ChefmateInfrastructureStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // ==================== DynamoDB Table ====================
        const userDataTable = new dynamodb.Table(this, 'UserDataTable', {
            tableName: 'ChefMateUserData',
            partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
            sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand (free tier friendly)
            removalPolicy: cdk.RemovalPolicy.RETAIN, // Don't delete data on stack destroy
            pointInTimeRecovery: true, // Enable backups
        });
        // ==================== Cognito User Pool ====================
        const userPool = new cognito.UserPool(this, 'ChefMateUserPool', {
            userPoolName: 'chefmate-users',
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
            autoVerify: {
                email: true,
            },
            standardAttributes: {
                email: {
                    required: true,
                    mutable: true,
                },
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            removalPolicy: cdk.RemovalPolicy.RETAIN,
        });
        // Cognito User Pool Client (for frontend)
        const userPoolClient = new cognito.UserPoolClient(this, 'ChefMateUserPoolClient', {
            userPool,
            userPoolClientName: 'chefmate-frontend-client',
            authFlows: {
                userPassword: true,
                userSrp: true,
            },
            preventUserExistenceErrors: true,
        });
        // ==================== Lambda Configuration ====================
        // Common Lambda configuration (for Spoonacular API functions)
        const lambdaConfig = {
            runtime: lambda.Runtime.NODEJS_18_X,
            architecture: lambda.Architecture.ARM_64,
            memorySize: 256,
            timeout: cdk.Duration.seconds(30),
            environment: {
                SPOONACULAR_API_KEY: props.spoonacularApiKey,
                NODE_OPTIONS: '--enable-source-maps',
            },
            logRetention: logs.RetentionDays.ONE_WEEK,
            bundling: {
                minify: true,
                sourceMap: true,
                externalModules: [],
            },
        };
        // Lambda configuration for user data functions (DynamoDB access)
        const userDataLambdaConfig = {
            runtime: lambda.Runtime.NODEJS_18_X,
            architecture: lambda.Architecture.ARM_64,
            memorySize: 256,
            timeout: cdk.Duration.seconds(30),
            environment: {
                DYNAMODB_TABLE_NAME: userDataTable.tableName,
                NODE_OPTIONS: '--enable-source-maps',
            },
            logRetention: logs.RetentionDays.ONE_WEEK,
            bundling: {
                minify: true,
                sourceMap: true,
                externalModules: [],
            },
        };
        // Lambda Functions
        const recipeSearchLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'RecipeSearchFunction', {
            ...lambdaConfig,
            entry: path.join(__dirname, '../lambda/recipe-search/index.ts'),
            handler: 'handler',
            functionName: 'chefmate-recipe-search',
            description: 'Search recipes from Spoonacular API',
        });
        const recipeDetailsLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'RecipeDetailsFunction', {
            ...lambdaConfig,
            entry: path.join(__dirname, '../lambda/recipe-details/index.ts'),
            handler: 'handler',
            functionName: 'chefmate-recipe-details',
            description: 'Get recipe details from Spoonacular API',
        });
        const mealPlannerLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'MealPlannerFunction', {
            ...lambdaConfig,
            entry: path.join(__dirname, '../lambda/meal-planner/index.ts'),
            handler: 'handler',
            functionName: 'chefmate-meal-planner',
            description: 'Generate meal plans from Spoonacular API',
        });
        const similarRecipesLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'SimilarRecipesFunction', {
            ...lambdaConfig,
            entry: path.join(__dirname, '../lambda/similar-recipes/index.ts'),
            handler: 'handler',
            functionName: 'chefmate-similar-recipes',
            description: 'Get similar recipes from Spoonacular API',
        });
        const ingredientSubstitutesLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'IngredientSubstitutesFunction', {
            ...lambdaConfig,
            entry: path.join(__dirname, '../lambda/ingredient-substitutes/index.ts'),
            handler: 'handler',
            functionName: 'chefmate-ingredient-substitutes',
            description: 'Get ingredient substitutes from Spoonacular API',
        });
        // ==================== User Data Lambda Functions ====================
        const userPreferencesLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'UserPreferencesFunction', {
            ...userDataLambdaConfig,
            entry: path.join(__dirname, '../lambda/user-data/preferences.ts'),
            handler: 'handler',
            functionName: 'chefmate-user-preferences',
            description: 'Manage user preferences (DynamoDB)',
        });
        const favoritesLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'FavoritesFunction', {
            ...userDataLambdaConfig,
            entry: path.join(__dirname, '../lambda/user-data/favorites.ts'),
            handler: 'handler',
            functionName: 'chefmate-favorites',
            description: 'Manage user favorite recipes (DynamoDB)',
        });
        const shoppingListLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'ShoppingListFunction', {
            ...userDataLambdaConfig,
            entry: path.join(__dirname, '../lambda/user-data/shopping-list.ts'),
            handler: 'handler',
            functionName: 'chefmate-shopping-list',
            description: 'Manage user shopping list (DynamoDB)',
        });
        // Grant DynamoDB permissions to user data Lambdas
        userDataTable.grantReadWriteData(userPreferencesLambda);
        userDataTable.grantReadWriteData(favoritesLambda);
        userDataTable.grantReadWriteData(shoppingListLambda);
        // ==================== AWS Lex Bot ====================
        const lexBot = new lex_bot_construct_1.ChefMateLexBot(this, 'ChefMateLexBot', {
            botName: 'ChefMateBot',
        });
        // Lex Proxy Lambda
        const lexProxyLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'LexProxyFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            architecture: lambda.Architecture.ARM_64,
            memorySize: 256,
            timeout: cdk.Duration.seconds(30),
            entry: path.join(__dirname, '../lambda/lex-proxy/index.ts'),
            handler: 'handler',
            functionName: 'chefmate-lex-proxy',
            description: 'Proxy requests to AWS Lex for intent recognition',
            environment: {
                LEX_BOT_ID: lexBot.botId,
                LEX_BOT_ALIAS_ID: lexBot.botAliasId,
                NODE_OPTIONS: '--enable-source-maps',
            },
            logRetention: logs.RetentionDays.ONE_WEEK,
            bundling: {
                minify: true,
                sourceMap: true,
                externalModules: [],
            },
        });
        // Grant Lex permissions to the proxy Lambda
        lexProxyLambda.addToRolePolicy(new iam.PolicyStatement({
            actions: ['lex:RecognizeText', 'lex:RecognizeUtterance'],
            resources: [
                `arn:aws:lex:${this.region}:${this.account}:bot-alias/${lexBot.botId}/${lexBot.botAliasId}`,
            ],
        }));
        // API Gateway
        const api = new apigateway.RestApi(this, 'ChefmateApi', {
            restApiName: 'ChefMate API',
            description: 'ChefMate Voice Cooking Assistant API',
            deployOptions: {
                stageName: 'prod',
                throttlingRateLimit: 10,
                throttlingBurstLimit: 20,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS,
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                ],
            },
        });
        // API Key and Usage Plan
        const apiKey = api.addApiKey('ChefmateApiKey', {
            apiKeyName: 'chefmate-frontend-key',
            description: 'API key for ChefMate frontend application',
        });
        const usagePlan = api.addUsagePlan('ChefmateUsagePlan', {
            name: 'ChefMate Standard Plan',
            description: 'Standard usage plan for ChefMate frontend',
            throttle: {
                rateLimit: 10,
                burstLimit: 20,
            },
            quota: {
                limit: 1000,
                period: apigateway.Period.DAY,
            },
        });
        usagePlan.addApiKey(apiKey);
        usagePlan.addApiStage({
            stage: api.deploymentStage,
        });
        // Cognito Authorizer for user data endpoints
        const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [userPool],
            authorizerName: 'ChefMateCognitoAuthorizer',
            identitySource: 'method.request.header.Authorization',
        });
        // API Resources and Methods
        const recipesResource = api.root.addResource('recipes');
        const searchResource = recipesResource.addResource('search');
        const recipeIdResource = recipesResource.addResource('{recipeId}');
        const mealPlanResource = api.root.addResource('meal-plan');
        const generateResource = mealPlanResource.addResource('generate');
        // Similar recipes resource: /recipes/{recipeId}/similar
        const similarResource = recipeIdResource.addResource('similar');
        // Food/ingredients resources
        const foodResource = api.root.addResource('food');
        const ingredientsResource = foodResource.addResource('ingredients');
        const substitutesResource = ingredientsResource.addResource('substitutes');
        const userResource = api.root.addResource('user');
        const preferencesResource = userResource.addResource('preferences');
        const favoritesResource = userResource.addResource('favorites');
        const favoriteIdResource = favoritesResource.addResource('{recipeId}');
        const shoppingListResource = userResource.addResource('shopping-list');
        // Lex resource: /lex/recognize
        const lexResource = api.root.addResource('lex');
        const recognizeResource = lexResource.addResource('recognize');
        // Recipe Search: GET /recipes/search
        searchResource.addMethod('GET', new apigateway.LambdaIntegration(recipeSearchLambda, {
            proxy: true,
        }), {
            apiKeyRequired: true,
        });
        // Recipe Details: GET /recipes/{recipeId}
        recipeIdResource.addMethod('GET', new apigateway.LambdaIntegration(recipeDetailsLambda, {
            proxy: true,
        }), {
            apiKeyRequired: true,
        });
        // Meal Planner: GET /meal-plan/generate
        generateResource.addMethod('GET', new apigateway.LambdaIntegration(mealPlannerLambda, {
            proxy: true,
        }), {
            apiKeyRequired: true,
        });
        // Similar Recipes: GET /recipes/{recipeId}/similar
        similarResource.addMethod('GET', new apigateway.LambdaIntegration(similarRecipesLambda, {
            proxy: true,
        }), {
            apiKeyRequired: true,
        });
        // Ingredient Substitutes: GET /food/ingredients/substitutes
        substitutesResource.addMethod('GET', new apigateway.LambdaIntegration(ingredientSubstitutesLambda, {
            proxy: true,
        }), {
            apiKeyRequired: true,
        });
        // ==================== Lex Routes ====================
        // Lex Recognize: POST /lex/recognize
        recognizeResource.addMethod('POST', new apigateway.LambdaIntegration(lexProxyLambda, {
            proxy: true,
        }), {
            apiKeyRequired: true,
        });
        // ==================== User Data Routes (Cognito Auth Required) ====================
        // User Preferences: GET/PUT /user/preferences
        preferencesResource.addMethod('GET', new apigateway.LambdaIntegration(userPreferencesLambda, { proxy: true }), {
            apiKeyRequired: true,
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        preferencesResource.addMethod('PUT', new apigateway.LambdaIntegration(userPreferencesLambda, { proxy: true }), {
            apiKeyRequired: true,
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        // Favorites: GET/POST /user/favorites
        favoritesResource.addMethod('GET', new apigateway.LambdaIntegration(favoritesLambda, { proxy: true }), {
            apiKeyRequired: true,
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        favoritesResource.addMethod('POST', new apigateway.LambdaIntegration(favoritesLambda, { proxy: true }), {
            apiKeyRequired: true,
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        // Favorites: DELETE /user/favorites/{recipeId}
        favoriteIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(favoritesLambda, { proxy: true }), {
            apiKeyRequired: true,
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        // Shopping List: GET/PUT /user/shopping-list
        shoppingListResource.addMethod('GET', new apigateway.LambdaIntegration(shoppingListLambda, { proxy: true }), {
            apiKeyRequired: true,
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        shoppingListResource.addMethod('PUT', new apigateway.LambdaIntegration(shoppingListLambda, { proxy: true }), {
            apiKeyRequired: true,
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        // ==================== Stack Outputs ====================
        new cdk.CfnOutput(this, 'ApiEndpoint', {
            value: api.url,
            description: 'ChefMate API Gateway endpoint URL',
            exportName: 'ChefmateApiEndpoint',
        });
        new cdk.CfnOutput(this, 'ApiKeyId', {
            value: apiKey.keyId,
            description: 'API Key ID (use AWS CLI to get the actual key value)',
            exportName: 'ChefmateApiKeyId',
        });
        new cdk.CfnOutput(this, 'ApiKeyArn', {
            value: apiKey.keyArn,
            description: 'API Key ARN',
            exportName: 'ChefmateApiKeyArn',
        });
        // Cognito Outputs
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
            description: 'Cognito User Pool ID',
            exportName: 'ChefmateUserPoolId',
        });
        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
            exportName: 'ChefmateUserPoolClientId',
        });
        // DynamoDB Output
        new cdk.CfnOutput(this, 'DynamoDBTableName', {
            value: userDataTable.tableName,
            description: 'DynamoDB Table Name for user data',
            exportName: 'ChefmateDynamoDBTable',
        });
        // Lex Bot Outputs
        new cdk.CfnOutput(this, 'LexBotId', {
            value: lexBot.botId,
            description: 'Lex Bot ID',
            exportName: 'ChefmateLexBotId',
        });
        new cdk.CfnOutput(this, 'LexBotAliasId', {
            value: lexBot.botAliasId,
            description: 'Lex Bot Alias ID',
            exportName: 'ChefmateLexBotAliasId',
        });
    }
}
exports.ChefmateInfrastructureStack = ChefmateInfrastructureStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlZm1hdGUtaW5mcmFzdHJ1Y3R1cmUtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjaGVmbWF0ZS1pbmZyYXN0cnVjdHVyZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBQ2pELHVFQUF5RDtBQUN6RCwyREFBNkM7QUFDN0MsbUVBQXFEO0FBQ3JELGlFQUFtRDtBQUNuRCx5REFBMkM7QUFDM0MscUVBQStEO0FBRS9ELDJDQUE2QjtBQUM3QiwyREFBcUQ7QUFNckQsTUFBYSwyQkFBNEIsU0FBUSxHQUFHLENBQUMsS0FBSztJQUN4RCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXlCO1FBQ2pFLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLDJEQUEyRDtRQUMzRCxNQUFNLGFBQWEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUM5RCxTQUFTLEVBQUUsa0JBQWtCO1lBQzdCLFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ2pFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQzVELFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWUsRUFBRSxpQ0FBaUM7WUFDcEYsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLHFDQUFxQztZQUM5RSxtQkFBbUIsRUFBRSxJQUFJLEVBQUUsaUJBQWlCO1NBQzdDLENBQUMsQ0FBQztRQUVILDhEQUE4RDtRQUM5RCxNQUFNLFFBQVEsR0FBRyxJQUFJLE9BQU8sQ0FB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OUIsV0FBVyxFQUFFLG1DQUFtQztZQUNoRCxVQUFVLEVBQUUsdUJBQXVCO1NBQ3BDLENBQUMsQ0FBQztRQUVILGtCQUFrQjtRQUNsQixJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNsQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7WUFDbkIsV0FBVyxFQUFFLFlBQVk7WUFDekIsVUFBVSxFQUFFLGtCQUFrQjtTQUMvQixDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUN2QyxLQUFLLEVBQUUsTUFBTSxDQUFDLFVBQVU7WUFDeEIsV0FBVyxFQUFFLGtCQUFrQjtZQUMvQixVQUFVLEVBQUUsdUJBQXVCO1NBQ3BDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQXpkRCxrRUF5ZEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgKiBhcyBjb2duaXRvIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jb2duaXRvJztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCB7IE5vZGVqc0Z1bmN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgQ2hlZk1hdGVMZXhCb3QgfSBmcm9tICcuL2xleC1ib3QtY29uc3RydWN0JztcblxuaW50ZXJmYWNlIENoZWZtYXRlU3RhY2tQcm9wcyBleHRlbmRzIGNkay5TdGFja1Byb3BzIHtcbiAgc3Bvb25hY3VsYXJBcGlLZXk6IHN0cmluZztcbn1cblxuZXhwb3J0IGNsYXNzIENoZWZtYXRlSW5mcmFzdHJ1Y3R1cmVTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBDaGVmbWF0ZVN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IER5bmFtb0RCIFRhYmxlID09PT09PT09PT09PT09PT09PT09XG4gICAgY29uc3QgdXNlckRhdGFUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnVXNlckRhdGFUYWJsZScsIHtcbiAgICAgIHRhYmxlTmFtZTogJ0NoZWZNYXRlVXNlckRhdGEnLFxuICAgICAgcGFydGl0aW9uS2V5OiB7IG5hbWU6ICdQSycsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBzb3J0S2V5OiB7IG5hbWU6ICdTSycsIHR5cGU6IGR5bmFtb2RiLkF0dHJpYnV0ZVR5cGUuU1RSSU5HIH0sXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULCAvLyBPbi1kZW1hbmQgKGZyZWUgdGllciBmcmllbmRseSlcbiAgICAgIHJlbW92YWxQb2xpY3k6IGNkay5SZW1vdmFsUG9saWN5LlJFVEFJTiwgLy8gRG9uJ3QgZGVsZXRlIGRhdGEgb24gc3RhY2sgZGVzdHJveVxuICAgICAgcG9pbnRJblRpbWVSZWNvdmVyeTogdHJ1ZSwgLy8gRW5hYmxlIGJhY2t1cHNcbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IENvZ25pdG8gVXNlciBQb29sID09PT09PT09PT09PT09PT09PT09XG4gICAgY29uc3QgdXNlclBvb2wgPSBuZXcgY29nbml0by5Vc2VyUG9vbCh0aGlzLCAnQ2hlZk1hdGVVc2VyUG9vbCcsIHtcbiAgICAgIHVzZXJQb29sTmFtZTogJ2NoZWZtYXRlLXVzZXJzJyxcbiAgICAgIHNlbGZTaWduVXBFbmFibGVkOiB0cnVlLFxuICAgICAgc2lnbkluQWxpYXNlczoge1xuICAgICAgICBlbWFpbDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBhdXRvVmVyaWZ5OiB7XG4gICAgICAgIGVtYWlsOiB0cnVlLFxuICAgICAgfSxcbiAgICAgIHN0YW5kYXJkQXR0cmlidXRlczoge1xuICAgICAgICBlbWFpbDoge1xuICAgICAgICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgICAgICAgIG11dGFibGU6IHRydWUsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcGFzc3dvcmRQb2xpY3k6IHtcbiAgICAgICAgbWluTGVuZ3RoOiA4LFxuICAgICAgICByZXF1aXJlTG93ZXJjYXNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlVXBwZXJjYXNlOiB0cnVlLFxuICAgICAgICByZXF1aXJlRGlnaXRzOiB0cnVlLFxuICAgICAgICByZXF1aXJlU3ltYm9sczogZmFsc2UsXG4gICAgICB9LFxuICAgICAgYWNjb3VudFJlY292ZXJ5OiBjb2duaXRvLkFjY291bnRSZWNvdmVyeS5FTUFJTF9PTkxZLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuUkVUQUlOLFxuICAgIH0pO1xuXG4gICAgLy8gQ29nbml0byBVc2VyIFBvb2wgQ2xpZW50IChmb3IgZnJvbnRlbmQpXG4gICAgY29uc3QgdXNlclBvb2xDbGllbnQgPSBuZXcgY29nbml0by5Vc2VyUG9vbENsaWVudCh0aGlzLCAnQ2hlZk1hdGVVc2VyUG9vbENsaWVudCcsIHtcbiAgICAgIHVzZXJQb29sLFxuICAgICAgdXNlclBvb2xDbGllbnROYW1lOiAnY2hlZm1hdGUtZnJvbnRlbmQtY2xpZW50JyxcbiAgICAgIGF1dGhGbG93czoge1xuICAgICAgICB1c2VyUGFzc3dvcmQ6IHRydWUsXG4gICAgICAgIHVzZXJTcnA6IHRydWUsXG4gICAgICB9LFxuICAgICAgcHJldmVudFVzZXJFeGlzdGVuY2VFcnJvcnM6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBMYW1iZGEgQ29uZmlndXJhdGlvbiA9PT09PT09PT09PT09PT09PT09PVxuICAgIC8vIENvbW1vbiBMYW1iZGEgY29uZmlndXJhdGlvbiAoZm9yIFNwb29uYWN1bGFyIEFQSSBmdW5jdGlvbnMpXG4gICAgY29uc3QgbGFtYmRhQ29uZmlnID0ge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBhcmNoaXRlY3R1cmU6IGxhbWJkYS5BcmNoaXRlY3R1cmUuQVJNXzY0LFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgU1BPT05BQ1VMQVJfQVBJX0tFWTogcHJvcHMuc3Bvb25hY3VsYXJBcGlLZXksXG4gICAgICAgIE5PREVfT1BUSU9OUzogJy0tZW5hYmxlLXNvdXJjZS1tYXBzJyxcbiAgICAgIH0sXG4gICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgIG1pbmlmeTogdHJ1ZSxcbiAgICAgICAgc291cmNlTWFwOiB0cnVlLFxuICAgICAgICBleHRlcm5hbE1vZHVsZXM6IFtdLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gTGFtYmRhIGNvbmZpZ3VyYXRpb24gZm9yIHVzZXIgZGF0YSBmdW5jdGlvbnMgKER5bmFtb0RCIGFjY2VzcylcbiAgICBjb25zdCB1c2VyRGF0YUxhbWJkYUNvbmZpZyA9IHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18xOF9YLFxuICAgICAgYXJjaGl0ZWN0dXJlOiBsYW1iZGEuQXJjaGl0ZWN0dXJlLkFSTV82NCxcbiAgICAgIG1lbW9yeVNpemU6IDI1NixcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIERZTkFNT0RCX1RBQkxFX05BTUU6IHVzZXJEYXRhVGFibGUudGFibGVOYW1lLFxuICAgICAgICBOT0RFX09QVElPTlM6ICctLWVuYWJsZS1zb3VyY2UtbWFwcycsXG4gICAgICB9LFxuICAgICAgbG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICBidW5kbGluZzoge1xuICAgICAgICBtaW5pZnk6IHRydWUsXG4gICAgICAgIHNvdXJjZU1hcDogdHJ1ZSxcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbXSxcbiAgICAgIH0sXG4gICAgfTtcblxuICAgIC8vIExhbWJkYSBGdW5jdGlvbnNcbiAgICBjb25zdCByZWNpcGVTZWFyY2hMYW1iZGEgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ1JlY2lwZVNlYXJjaEZ1bmN0aW9uJywge1xuICAgICAgLi4ubGFtYmRhQ29uZmlnLFxuICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvcmVjaXBlLXNlYXJjaC9pbmRleC50cycpLFxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXInLFxuICAgICAgZnVuY3Rpb25OYW1lOiAnY2hlZm1hdGUtcmVjaXBlLXNlYXJjaCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ1NlYXJjaCByZWNpcGVzIGZyb20gU3Bvb25hY3VsYXIgQVBJJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlY2lwZURldGFpbHNMYW1iZGEgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ1JlY2lwZURldGFpbHNGdW5jdGlvbicsIHtcbiAgICAgIC4uLmxhbWJkYUNvbmZpZyxcbiAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhL3JlY2lwZS1kZXRhaWxzL2luZGV4LnRzJyksXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICBmdW5jdGlvbk5hbWU6ICdjaGVmbWF0ZS1yZWNpcGUtZGV0YWlscycsXG4gICAgICBkZXNjcmlwdGlvbjogJ0dldCByZWNpcGUgZGV0YWlscyBmcm9tIFNwb29uYWN1bGFyIEFQSScsXG4gICAgfSk7XG5cbiAgICBjb25zdCBtZWFsUGxhbm5lckxhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnTWVhbFBsYW5uZXJGdW5jdGlvbicsIHtcbiAgICAgIC4uLmxhbWJkYUNvbmZpZyxcbiAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhL21lYWwtcGxhbm5lci9pbmRleC50cycpLFxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXInLFxuICAgICAgZnVuY3Rpb25OYW1lOiAnY2hlZm1hdGUtbWVhbC1wbGFubmVyJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnR2VuZXJhdGUgbWVhbCBwbGFucyBmcm9tIFNwb29uYWN1bGFyIEFQSScsXG4gICAgfSk7XG5cbiAgICBjb25zdCBzaW1pbGFyUmVjaXBlc0xhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnU2ltaWxhclJlY2lwZXNGdW5jdGlvbicsIHtcbiAgICAgIC4uLmxhbWJkYUNvbmZpZyxcbiAgICAgIGVudHJ5OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vbGFtYmRhL3NpbWlsYXItcmVjaXBlcy9pbmRleC50cycpLFxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXInLFxuICAgICAgZnVuY3Rpb25OYW1lOiAnY2hlZm1hdGUtc2ltaWxhci1yZWNpcGVzJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnR2V0IHNpbWlsYXIgcmVjaXBlcyBmcm9tIFNwb29uYWN1bGFyIEFQSScsXG4gICAgfSk7XG5cbiAgICBjb25zdCBpbmdyZWRpZW50U3Vic3RpdHV0ZXNMYW1iZGEgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ0luZ3JlZGllbnRTdWJzdGl0dXRlc0Z1bmN0aW9uJywge1xuICAgICAgLi4ubGFtYmRhQ29uZmlnLFxuICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvaW5ncmVkaWVudC1zdWJzdGl0dXRlcy9pbmRleC50cycpLFxuICAgICAgaGFuZGxlcjogJ2hhbmRsZXInLFxuICAgICAgZnVuY3Rpb25OYW1lOiAnY2hlZm1hdGUtaW5ncmVkaWVudC1zdWJzdGl0dXRlcycsXG4gICAgICBkZXNjcmlwdGlvbjogJ0dldCBpbmdyZWRpZW50IHN1YnN0aXR1dGVzIGZyb20gU3Bvb25hY3VsYXIgQVBJJyxcbiAgICB9KTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IFVzZXIgRGF0YSBMYW1iZGEgRnVuY3Rpb25zID09PT09PT09PT09PT09PT09PT09XG4gICAgY29uc3QgdXNlclByZWZlcmVuY2VzTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdVc2VyUHJlZmVyZW5jZXNGdW5jdGlvbicsIHtcbiAgICAgIC4uLnVzZXJEYXRhTGFtYmRhQ29uZmlnLFxuICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvdXNlci1kYXRhL3ByZWZlcmVuY2VzLnRzJyksXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICBmdW5jdGlvbk5hbWU6ICdjaGVmbWF0ZS11c2VyLXByZWZlcmVuY2VzJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWFuYWdlIHVzZXIgcHJlZmVyZW5jZXMgKER5bmFtb0RCKScsXG4gICAgfSk7XG5cbiAgICBjb25zdCBmYXZvcml0ZXNMYW1iZGEgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ0Zhdm9yaXRlc0Z1bmN0aW9uJywge1xuICAgICAgLi4udXNlckRhdGFMYW1iZGFDb25maWcsXG4gICAgICBlbnRyeTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYS91c2VyLWRhdGEvZmF2b3JpdGVzLnRzJyksXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICBmdW5jdGlvbk5hbWU6ICdjaGVmbWF0ZS1mYXZvcml0ZXMnLFxuICAgICAgZGVzY3JpcHRpb246ICdNYW5hZ2UgdXNlciBmYXZvcml0ZSByZWNpcGVzIChEeW5hbW9EQiknLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2hvcHBpbmdMaXN0TGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdTaG9wcGluZ0xpc3RGdW5jdGlvbicsIHtcbiAgICAgIC4uLnVzZXJEYXRhTGFtYmRhQ29uZmlnLFxuICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvdXNlci1kYXRhL3Nob3BwaW5nLWxpc3QudHMnKSxcbiAgICAgIGhhbmRsZXI6ICdoYW5kbGVyJyxcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ2NoZWZtYXRlLXNob3BwaW5nLWxpc3QnLFxuICAgICAgZGVzY3JpcHRpb246ICdNYW5hZ2UgdXNlciBzaG9wcGluZyBsaXN0IChEeW5hbW9EQiknLFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgRHluYW1vREIgcGVybWlzc2lvbnMgdG8gdXNlciBkYXRhIExhbWJkYXNcbiAgICB1c2VyRGF0YVRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YSh1c2VyUHJlZmVyZW5jZXNMYW1iZGEpO1xuICAgIHVzZXJEYXRhVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGZhdm9yaXRlc0xhbWJkYSk7XG4gICAgdXNlckRhdGFUYWJsZS5ncmFudFJlYWRXcml0ZURhdGEoc2hvcHBpbmdMaXN0TGFtYmRhKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IEFXUyBMZXggQm90ID09PT09PT09PT09PT09PT09PT09XG4gICAgY29uc3QgbGV4Qm90ID0gbmV3IENoZWZNYXRlTGV4Qm90KHRoaXMsICdDaGVmTWF0ZUxleEJvdCcsIHtcbiAgICAgIGJvdE5hbWU6ICdDaGVmTWF0ZUJvdCcsXG4gICAgfSk7XG5cbiAgICAvLyBMZXggUHJveHkgTGFtYmRhXG4gICAgY29uc3QgbGV4UHJveHlMYW1iZGEgPSBuZXcgTm9kZWpzRnVuY3Rpb24odGhpcywgJ0xleFByb3h5RnVuY3Rpb24nLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCxcbiAgICAgIGFyY2hpdGVjdHVyZTogbGFtYmRhLkFyY2hpdGVjdHVyZS5BUk1fNjQsXG4gICAgICBtZW1vcnlTaXplOiAyNTYsXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBlbnRyeTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYS9sZXgtcHJveHkvaW5kZXgudHMnKSxcbiAgICAgIGhhbmRsZXI6ICdoYW5kbGVyJyxcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ2NoZWZtYXRlLWxleC1wcm94eScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1Byb3h5IHJlcXVlc3RzIHRvIEFXUyBMZXggZm9yIGludGVudCByZWNvZ25pdGlvbicsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBMRVhfQk9UX0lEOiBsZXhCb3QuYm90SWQsXG4gICAgICAgIExFWF9CT1RfQUxJQVNfSUQ6IGxleEJvdC5ib3RBbGlhc0lkLFxuICAgICAgICBOT0RFX09QVElPTlM6ICctLWVuYWJsZS1zb3VyY2UtbWFwcycsXG4gICAgICB9LFxuICAgICAgbG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgICBidW5kbGluZzoge1xuICAgICAgICBtaW5pZnk6IHRydWUsXG4gICAgICAgIHNvdXJjZU1hcDogdHJ1ZSxcbiAgICAgICAgZXh0ZXJuYWxNb2R1bGVzOiBbXSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCBMZXggcGVybWlzc2lvbnMgdG8gdGhlIHByb3h5IExhbWJkYVxuICAgIGxleFByb3h5TGFtYmRhLmFkZFRvUm9sZVBvbGljeShcbiAgICAgIG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgICAgYWN0aW9uczogWydsZXg6UmVjb2duaXplVGV4dCcsICdsZXg6UmVjb2duaXplVXR0ZXJhbmNlJ10sXG4gICAgICAgIHJlc291cmNlczogW1xuICAgICAgICAgIGBhcm46YXdzOmxleDoke3RoaXMucmVnaW9ufToke3RoaXMuYWNjb3VudH06Ym90LWFsaWFzLyR7bGV4Qm90LmJvdElkfS8ke2xleEJvdC5ib3RBbGlhc0lkfWAsXG4gICAgICAgIF0sXG4gICAgICB9KVxuICAgICk7XG5cbiAgICAvLyBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0NoZWZtYXRlQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdDaGVmTWF0ZSBBUEknLFxuICAgICAgZGVzY3JpcHRpb246ICdDaGVmTWF0ZSBWb2ljZSBDb29raW5nIEFzc2lzdGFudCBBUEknLFxuICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICBzdGFnZU5hbWU6ICdwcm9kJyxcbiAgICAgICAgdGhyb3R0bGluZ1JhdGVMaW1pdDogMTAsXG4gICAgICAgIHRocm90dGxpbmdCdXJzdExpbWl0OiAyMCxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXG4gICAgICAgIGFsbG93TWV0aG9kczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9NRVRIT0RTLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAnWC1BbXotRGF0ZScsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAgICdYLUFtei1TZWN1cml0eS1Ub2tlbicsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQVBJIEtleSBhbmQgVXNhZ2UgUGxhblxuICAgIGNvbnN0IGFwaUtleSA9IGFwaS5hZGRBcGlLZXkoJ0NoZWZtYXRlQXBpS2V5Jywge1xuICAgICAgYXBpS2V5TmFtZTogJ2NoZWZtYXRlLWZyb250ZW5kLWtleScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBrZXkgZm9yIENoZWZNYXRlIGZyb250ZW5kIGFwcGxpY2F0aW9uJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHVzYWdlUGxhbiA9IGFwaS5hZGRVc2FnZVBsYW4oJ0NoZWZtYXRlVXNhZ2VQbGFuJywge1xuICAgICAgbmFtZTogJ0NoZWZNYXRlIFN0YW5kYXJkIFBsYW4nLFxuICAgICAgZGVzY3JpcHRpb246ICdTdGFuZGFyZCB1c2FnZSBwbGFuIGZvciBDaGVmTWF0ZSBmcm9udGVuZCcsXG4gICAgICB0aHJvdHRsZToge1xuICAgICAgICByYXRlTGltaXQ6IDEwLFxuICAgICAgICBidXJzdExpbWl0OiAyMCxcbiAgICAgIH0sXG4gICAgICBxdW90YToge1xuICAgICAgICBsaW1pdDogMTAwMCxcbiAgICAgICAgcGVyaW9kOiBhcGlnYXRld2F5LlBlcmlvZC5EQVksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdXNhZ2VQbGFuLmFkZEFwaUtleShhcGlLZXkpO1xuICAgIHVzYWdlUGxhbi5hZGRBcGlTdGFnZSh7XG4gICAgICBzdGFnZTogYXBpLmRlcGxveW1lbnRTdGFnZSxcbiAgICB9KTtcblxuICAgIC8vIENvZ25pdG8gQXV0aG9yaXplciBmb3IgdXNlciBkYXRhIGVuZHBvaW50c1xuICAgIGNvbnN0IGNvZ25pdG9BdXRob3JpemVyID0gbmV3IGFwaWdhdGV3YXkuQ29nbml0b1VzZXJQb29sc0F1dGhvcml6ZXIodGhpcywgJ0NvZ25pdG9BdXRob3JpemVyJywge1xuICAgICAgY29nbml0b1VzZXJQb29sczogW3VzZXJQb29sXSxcbiAgICAgIGF1dGhvcml6ZXJOYW1lOiAnQ2hlZk1hdGVDb2duaXRvQXV0aG9yaXplcicsXG4gICAgICBpZGVudGl0eVNvdXJjZTogJ21ldGhvZC5yZXF1ZXN0LmhlYWRlci5BdXRob3JpemF0aW9uJyxcbiAgICB9KTtcblxuICAgIC8vIEFQSSBSZXNvdXJjZXMgYW5kIE1ldGhvZHNcbiAgICBjb25zdCByZWNpcGVzUmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgncmVjaXBlcycpO1xuICAgIGNvbnN0IHNlYXJjaFJlc291cmNlID0gcmVjaXBlc1Jlc291cmNlLmFkZFJlc291cmNlKCdzZWFyY2gnKTtcbiAgICBjb25zdCByZWNpcGVJZFJlc291cmNlID0gcmVjaXBlc1Jlc291cmNlLmFkZFJlc291cmNlKCd7cmVjaXBlSWR9Jyk7XG5cbiAgICBjb25zdCBtZWFsUGxhblJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ21lYWwtcGxhbicpO1xuICAgIGNvbnN0IGdlbmVyYXRlUmVzb3VyY2UgPSBtZWFsUGxhblJlc291cmNlLmFkZFJlc291cmNlKCdnZW5lcmF0ZScpO1xuXG4gICAgLy8gU2ltaWxhciByZWNpcGVzIHJlc291cmNlOiAvcmVjaXBlcy97cmVjaXBlSWR9L3NpbWlsYXJcbiAgICBjb25zdCBzaW1pbGFyUmVzb3VyY2UgPSByZWNpcGVJZFJlc291cmNlLmFkZFJlc291cmNlKCdzaW1pbGFyJyk7XG5cbiAgICAvLyBGb29kL2luZ3JlZGllbnRzIHJlc291cmNlc1xuICAgIGNvbnN0IGZvb2RSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCdmb29kJyk7XG4gICAgY29uc3QgaW5ncmVkaWVudHNSZXNvdXJjZSA9IGZvb2RSZXNvdXJjZS5hZGRSZXNvdXJjZSgnaW5ncmVkaWVudHMnKTtcbiAgICBjb25zdCBzdWJzdGl0dXRlc1Jlc291cmNlID0gaW5ncmVkaWVudHNSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc3Vic3RpdHV0ZXMnKTtcblxuICAgIGNvbnN0IHVzZXJSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKCd1c2VyJyk7XG4gICAgY29uc3QgcHJlZmVyZW5jZXNSZXNvdXJjZSA9IHVzZXJSZXNvdXJjZS5hZGRSZXNvdXJjZSgncHJlZmVyZW5jZXMnKTtcbiAgICBjb25zdCBmYXZvcml0ZXNSZXNvdXJjZSA9IHVzZXJSZXNvdXJjZS5hZGRSZXNvdXJjZSgnZmF2b3JpdGVzJyk7XG4gICAgY29uc3QgZmF2b3JpdGVJZFJlc291cmNlID0gZmF2b3JpdGVzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3tyZWNpcGVJZH0nKTtcbiAgICBjb25zdCBzaG9wcGluZ0xpc3RSZXNvdXJjZSA9IHVzZXJSZXNvdXJjZS5hZGRSZXNvdXJjZSgnc2hvcHBpbmctbGlzdCcpO1xuXG4gICAgLy8gTGV4IHJlc291cmNlOiAvbGV4L3JlY29nbml6ZVxuICAgIGNvbnN0IGxleFJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ2xleCcpO1xuICAgIGNvbnN0IHJlY29nbml6ZVJlc291cmNlID0gbGV4UmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3JlY29nbml6ZScpO1xuXG4gICAgLy8gUmVjaXBlIFNlYXJjaDogR0VUIC9yZWNpcGVzL3NlYXJjaFxuICAgIHNlYXJjaFJlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdHRVQnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocmVjaXBlU2VhcmNoTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBSZWNpcGUgRGV0YWlsczogR0VUIC9yZWNpcGVzL3tyZWNpcGVJZH1cbiAgICByZWNpcGVJZFJlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdHRVQnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocmVjaXBlRGV0YWlsc0xhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gTWVhbCBQbGFubmVyOiBHRVQgL21lYWwtcGxhbi9nZW5lcmF0ZVxuICAgIGdlbmVyYXRlUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgJ0dFVCcsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihtZWFsUGxhbm5lckxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gU2ltaWxhciBSZWNpcGVzOiBHRVQgL3JlY2lwZXMve3JlY2lwZUlkfS9zaW1pbGFyXG4gICAgc2ltaWxhclJlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdHRVQnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oc2ltaWxhclJlY2lwZXNMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWUsXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIEluZ3JlZGllbnQgU3Vic3RpdHV0ZXM6IEdFVCAvZm9vZC9pbmdyZWRpZW50cy9zdWJzdGl0dXRlc1xuICAgIHN1YnN0aXR1dGVzUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgJ0dFVCcsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihpbmdyZWRpZW50U3Vic3RpdHV0ZXNMYW1iZGEsIHtcbiAgICAgICAgcHJveHk6IHRydWUsXG4gICAgICB9KSxcbiAgICAgIHtcbiAgICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWUsXG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vID09PT09PT09PT09PT09PT09PT09IExleCBSb3V0ZXMgPT09PT09PT09PT09PT09PT09PT1cblxuICAgIC8vIExleCBSZWNvZ25pemU6IFBPU1QgL2xleC9yZWNvZ25pemVcbiAgICByZWNvZ25pemVSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICAnUE9TVCcsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihsZXhQcm94eUxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gPT09PT09PT09PT09PT09PT09PT0gVXNlciBEYXRhIFJvdXRlcyAoQ29nbml0byBBdXRoIFJlcXVpcmVkKSA9PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLy8gVXNlciBQcmVmZXJlbmNlczogR0VUL1BVVCAvdXNlci9wcmVmZXJlbmNlc1xuICAgIHByZWZlcmVuY2VzUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgJ0dFVCcsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbih1c2VyUHJlZmVyZW5jZXNMYW1iZGEsIHsgcHJveHk6IHRydWUgfSksXG4gICAgICB7XG4gICAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlLFxuICAgICAgICBhdXRob3JpemVyOiBjb2duaXRvQXV0aG9yaXplcixcbiAgICAgICAgYXV0aG9yaXphdGlvblR5cGU6IGFwaWdhdGV3YXkuQXV0aG9yaXphdGlvblR5cGUuQ09HTklUTyxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgcHJlZmVyZW5jZXNSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICAnUFVUJyxcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJQcmVmZXJlbmNlc0xhbWJkYSwgeyBwcm94eTogdHJ1ZSB9KSxcbiAgICAgIHtcbiAgICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBGYXZvcml0ZXM6IEdFVC9QT1NUIC91c2VyL2Zhdm9yaXRlc1xuICAgIGZhdm9yaXRlc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdHRVQnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oZmF2b3JpdGVzTGFtYmRhLCB7IHByb3h5OiB0cnVlIH0pLFxuICAgICAge1xuICAgICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZSxcbiAgICAgICAgYXV0aG9yaXplcjogY29nbml0b0F1dGhvcml6ZXIsXG4gICAgICAgIGF1dGhvcml6YXRpb25UeXBlOiBhcGlnYXRld2F5LkF1dGhvcml6YXRpb25UeXBlLkNPR05JVE8sXG4gICAgICB9XG4gICAgKTtcblxuICAgIGZhdm9yaXRlc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdQT1NUJyxcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGZhdm9yaXRlc0xhbWJkYSwgeyBwcm94eTogdHJ1ZSB9KSxcbiAgICAgIHtcbiAgICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBGYXZvcml0ZXM6IERFTEVURSAvdXNlci9mYXZvcml0ZXMve3JlY2lwZUlkfVxuICAgIGZhdm9yaXRlSWRSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICAnREVMRVRFJyxcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGZhdm9yaXRlc0xhbWJkYSwgeyBwcm94eTogdHJ1ZSB9KSxcbiAgICAgIHtcbiAgICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBTaG9wcGluZyBMaXN0OiBHRVQvUFVUIC91c2VyL3Nob3BwaW5nLWxpc3RcbiAgICBzaG9wcGluZ0xpc3RSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICAnR0VUJyxcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHNob3BwaW5nTGlzdExhbWJkYSwgeyBwcm94eTogdHJ1ZSB9KSxcbiAgICAgIHtcbiAgICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBzaG9wcGluZ0xpc3RSZXNvdXJjZS5hZGRNZXRob2QoXG4gICAgICAnUFVUJyxcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHNob3BwaW5nTGlzdExhbWJkYSwgeyBwcm94eTogdHJ1ZSB9KSxcbiAgICAgIHtcbiAgICAgICAgYXBpS2V5UmVxdWlyZWQ6IHRydWUsXG4gICAgICAgIGF1dGhvcml6ZXI6IGNvZ25pdG9BdXRob3JpemVyLFxuICAgICAgICBhdXRob3JpemF0aW9uVHlwZTogYXBpZ2F0ZXdheS5BdXRob3JpemF0aW9uVHlwZS5DT0dOSVRPLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09PSBTdGFjayBPdXRwdXRzID09PT09PT09PT09PT09PT09PT09XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaUVuZHBvaW50Jywge1xuICAgICAgdmFsdWU6IGFwaS51cmwsXG4gICAgICBkZXNjcmlwdGlvbjogJ0NoZWZNYXRlIEFQSSBHYXRld2F5IGVuZHBvaW50IFVSTCcsXG4gICAgICBleHBvcnROYW1lOiAnQ2hlZm1hdGVBcGlFbmRwb2ludCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpS2V5SWQnLCB7XG4gICAgICB2YWx1ZTogYXBpS2V5LmtleUlkLFxuICAgICAgZGVzY3JpcHRpb246ICdBUEkgS2V5IElEICh1c2UgQVdTIENMSSB0byBnZXQgdGhlIGFjdHVhbCBrZXkgdmFsdWUpJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdDaGVmbWF0ZUFwaUtleUlkJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlLZXlBcm4nLCB7XG4gICAgICB2YWx1ZTogYXBpS2V5LmtleUFybixcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEtleSBBUk4nLFxuICAgICAgZXhwb3J0TmFtZTogJ0NoZWZtYXRlQXBpS2V5QXJuJyxcbiAgICB9KTtcblxuICAgIC8vIENvZ25pdG8gT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdVc2VyUG9vbElkJywge1xuICAgICAgdmFsdWU6IHVzZXJQb29sLnVzZXJQb29sSWQsXG4gICAgICBkZXNjcmlwdGlvbjogJ0NvZ25pdG8gVXNlciBQb29sIElEJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdDaGVmbWF0ZVVzZXJQb29sSWQnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ1VzZXJQb29sQ2xpZW50SWQnLCB7XG4gICAgICB2YWx1ZTogdXNlclBvb2xDbGllbnQudXNlclBvb2xDbGllbnRJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQ29nbml0byBVc2VyIFBvb2wgQ2xpZW50IElEJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdDaGVmbWF0ZVVzZXJQb29sQ2xpZW50SWQnLFxuICAgIH0pO1xuXG4gICAgLy8gRHluYW1vREIgT3V0cHV0XG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0R5bmFtb0RCVGFibGVOYW1lJywge1xuICAgICAgdmFsdWU6IHVzZXJEYXRhVGFibGUudGFibGVOYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdEeW5hbW9EQiBUYWJsZSBOYW1lIGZvciB1c2VyIGRhdGEnLFxuICAgICAgZXhwb3J0TmFtZTogJ0NoZWZtYXRlRHluYW1vREJUYWJsZScsXG4gICAgfSk7XG5cbiAgICAvLyBMZXggQm90IE91dHB1dHNcbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnTGV4Qm90SWQnLCB7XG4gICAgICB2YWx1ZTogbGV4Qm90LmJvdElkLFxuICAgICAgZGVzY3JpcHRpb246ICdMZXggQm90IElEJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdDaGVmbWF0ZUxleEJvdElkJyxcbiAgICB9KTtcblxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdMZXhCb3RBbGlhc0lkJywge1xuICAgICAgdmFsdWU6IGxleEJvdC5ib3RBbGlhc0lkLFxuICAgICAgZGVzY3JpcHRpb246ICdMZXggQm90IEFsaWFzIElEJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdDaGVmbWF0ZUxleEJvdEFsaWFzSWQnLFxuICAgIH0pO1xuICB9XG59XG4iXX0=