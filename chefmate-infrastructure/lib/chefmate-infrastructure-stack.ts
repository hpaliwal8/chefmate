import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import { ChefMateLexBot } from './lex-bot-construct';

interface ChefmateStackProps extends cdk.StackProps {
  spoonacularApiKey: string;
}

export class ChefmateInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ChefmateStackProps) {
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
    const recipeSearchLambda = new NodejsFunction(this, 'RecipeSearchFunction', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../lambda/recipe-search/index.ts'),
      handler: 'handler',
      functionName: 'chefmate-recipe-search',
      description: 'Search recipes from Spoonacular API',
    });

    const recipeDetailsLambda = new NodejsFunction(this, 'RecipeDetailsFunction', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../lambda/recipe-details/index.ts'),
      handler: 'handler',
      functionName: 'chefmate-recipe-details',
      description: 'Get recipe details from Spoonacular API',
    });

    const mealPlannerLambda = new NodejsFunction(this, 'MealPlannerFunction', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../lambda/meal-planner/index.ts'),
      handler: 'handler',
      functionName: 'chefmate-meal-planner',
      description: 'Generate meal plans from Spoonacular API',
    });

    const similarRecipesLambda = new NodejsFunction(this, 'SimilarRecipesFunction', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../lambda/similar-recipes/index.ts'),
      handler: 'handler',
      functionName: 'chefmate-similar-recipes',
      description: 'Get similar recipes from Spoonacular API',
    });

    const ingredientSubstitutesLambda = new NodejsFunction(this, 'IngredientSubstitutesFunction', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../lambda/ingredient-substitutes/index.ts'),
      handler: 'handler',
      functionName: 'chefmate-ingredient-substitutes',
      description: 'Get ingredient substitutes from Spoonacular API',
    });

    // ==================== User Data Lambda Functions ====================
    const userPreferencesLambda = new NodejsFunction(this, 'UserPreferencesFunction', {
      ...userDataLambdaConfig,
      entry: path.join(__dirname, '../lambda/user-data/preferences.ts'),
      handler: 'handler',
      functionName: 'chefmate-user-preferences',
      description: 'Manage user preferences (DynamoDB)',
    });

    const favoritesLambda = new NodejsFunction(this, 'FavoritesFunction', {
      ...userDataLambdaConfig,
      entry: path.join(__dirname, '../lambda/user-data/favorites.ts'),
      handler: 'handler',
      functionName: 'chefmate-favorites',
      description: 'Manage user favorite recipes (DynamoDB)',
    });

    const shoppingListLambda = new NodejsFunction(this, 'ShoppingListFunction', {
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
    const lexBot = new ChefMateLexBot(this, 'ChefMateLexBot', {
      botName: 'ChefMateBot',
    });

    // Lex Proxy Lambda
    const lexProxyLambda = new NodejsFunction(this, 'LexProxyFunction', {
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
    lexProxyLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['lex:RecognizeText', 'lex:RecognizeUtterance'],
        resources: [
          `arn:aws:lex:${this.region}:${this.account}:bot-alias/${lexBot.botId}/${lexBot.botAliasId}`,
        ],
      })
    );

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
    searchResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(recipeSearchLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true,
      }
    );

    // Recipe Details: GET /recipes/{recipeId}
    recipeIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(recipeDetailsLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true,
      }
    );

    // Meal Planner: GET /meal-plan/generate
    generateResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(mealPlannerLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true,
      }
    );

    // Similar Recipes: GET /recipes/{recipeId}/similar
    similarResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(similarRecipesLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true,
      }
    );

    // Ingredient Substitutes: GET /food/ingredients/substitutes
    substitutesResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(ingredientSubstitutesLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true,
      }
    );

    // ==================== Lex Routes ====================

    // Lex Recognize: POST /lex/recognize
    recognizeResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(lexProxyLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true,
      }
    );

    // ==================== User Data Routes (Cognito Auth Required) ====================

    // User Preferences: GET/PUT /user/preferences
    preferencesResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(userPreferencesLambda, { proxy: true }),
      {
        apiKeyRequired: true,
        authorizer: cognitoAuthorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    preferencesResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(userPreferencesLambda, { proxy: true }),
      {
        apiKeyRequired: true,
        authorizer: cognitoAuthorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // Favorites: GET/POST /user/favorites
    favoritesResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(favoritesLambda, { proxy: true }),
      {
        apiKeyRequired: true,
        authorizer: cognitoAuthorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    favoritesResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(favoritesLambda, { proxy: true }),
      {
        apiKeyRequired: true,
        authorizer: cognitoAuthorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // Favorites: DELETE /user/favorites/{recipeId}
    favoriteIdResource.addMethod(
      'DELETE',
      new apigateway.LambdaIntegration(favoritesLambda, { proxy: true }),
      {
        apiKeyRequired: true,
        authorizer: cognitoAuthorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    // Shopping List: GET/PUT /user/shopping-list
    shoppingListResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(shoppingListLambda, { proxy: true }),
      {
        apiKeyRequired: true,
        authorizer: cognitoAuthorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

    shoppingListResource.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(shoppingListLambda, { proxy: true }),
      {
        apiKeyRequired: true,
        authorizer: cognitoAuthorizer,
        authorizationType: apigateway.AuthorizationType.COGNITO,
      }
    );

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
