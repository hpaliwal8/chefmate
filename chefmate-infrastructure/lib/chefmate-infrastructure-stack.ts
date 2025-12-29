import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

interface ChefmateStackProps extends cdk.StackProps {
  spoonacularApiKey: string;
}

export class ChefmateInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ChefmateStackProps) {
    super(scope, id, props);

    // Common Lambda configuration
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

    const userPreferencesLambda = new NodejsFunction(this, 'UserPreferencesFunction', {
      ...lambdaConfig,
      entry: path.join(__dirname, '../lambda/user-preferences/index.ts'),
      handler: 'handler',
      functionName: 'chefmate-user-preferences',
      description: 'Manage user preferences (Phase 2: DynamoDB)',
      // Remove Spoonacular key - not needed for this Lambda
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

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

    // API Resources and Methods
    const recipesResource = api.root.addResource('recipes');
    const searchResource = recipesResource.addResource('search');
    const recipeIdResource = recipesResource.addResource('{recipeId}');

    const mealPlanResource = api.root.addResource('meal-plan');
    const generateResource = mealPlanResource.addResource('generate');

    const userResource = api.root.addResource('user');
    const preferencesResource = userResource.addResource('preferences');

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

    // User Preferences: GET/POST /user/preferences
    preferencesResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(userPreferencesLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true,
      }
    );

    preferencesResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(userPreferencesLambda, {
        proxy: true,
      }),
      {
        apiKeyRequired: true,
      }
    );

    // Stack Outputs
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
  }
}
