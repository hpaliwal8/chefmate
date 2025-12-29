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
const aws_lambda_nodejs_1 = require("aws-cdk-lib/aws-lambda-nodejs");
const path = __importStar(require("path"));
class ChefmateInfrastructureStack extends cdk.Stack {
    constructor(scope, id, props) {
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
        const userPreferencesLambda = new aws_lambda_nodejs_1.NodejsFunction(this, 'UserPreferencesFunction', {
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
        // User Preferences: GET/POST /user/preferences
        preferencesResource.addMethod('GET', new apigateway.LambdaIntegration(userPreferencesLambda, {
            proxy: true,
        }), {
            apiKeyRequired: true,
        });
        preferencesResource.addMethod('POST', new apigateway.LambdaIntegration(userPreferencesLambda, {
            proxy: true,
        }), {
            apiKeyRequired: true,
        });
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
exports.ChefmateInfrastructureStack = ChefmateInfrastructureStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlZm1hdGUtaW5mcmFzdHJ1Y3R1cmUtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjaGVmbWF0ZS1pbmZyYXN0cnVjdHVyZS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxpREFBbUM7QUFDbkMsK0RBQWlEO0FBQ2pELHVFQUF5RDtBQUN6RCwyREFBNkM7QUFDN0MscUVBQStEO0FBRS9ELDJDQUE2QjtBQU03QixNQUFhLDJCQUE0QixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3hELFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBeUI7UUFDakUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsOEJBQThCO1FBQzlCLE1BQU0sWUFBWSxHQUFHO1lBQ25CLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBTTtZQUN4QyxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRSxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDakMsV0FBVyxFQUFFO2dCQUNYLG1CQUFtQixFQUFFLEtBQUssQ0FBQyxpQkFBaUI7Z0JBQzVDLFlBQVksRUFBRSxzQkFBc0I7YUFDckM7WUFDRCxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRO1lBQ3pDLFFBQVEsRUFBRTtnQkFDUixNQUFNLEVBQUUsSUFBSTtnQkFDWixTQUFTLEVBQUUsSUFBSTtnQkFDZixlQUFlLEVBQUUsRUFBRTthQUNwQjtTQUNGLENBQUM7UUFFRixtQkFBbUI7UUFDbkIsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLGtDQUFjLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQzFFLEdBQUcsWUFBWTtZQUNmLEtBQUssRUFBRSxJQUFJLENB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QzNCLEtBQUssRUFDTCxJQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxxQkFBcUIsRUFBRTtZQUN0RCxLQUFLLEVBQUUsSUFBSTtTQUNaLENBQUMsRUFDRjtZQUNFLGNBQWMsRUFBRSxJQUFJO1NBQ3JCLENBQ0YsQ0FBQztRQUVGLG1CQUFtQixDQUFDLFNBQVMsQ0FDM0IsTUFBTSxFQUNOLElBQUksVUFBVSxDQUFDLGlCQUFpQixDQUFDLHFCQUFxQixFQUFFO1lBQ3RELEtBQUssRUFBRSxJQUFJO1NBQ1osQ0FBQyxFQUNGO1lBQ0UsY0FBYyxFQUFFLElBQUk7U0FDckIsQ0FDRixDQUFDO1FBRUYsZ0JBQWdCO1FBQ2hCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ3JDLEtBQUssRUFBRSxHQUFHLENBQUMsR0FBRztZQUNkLFdBQVcsRUFBRSxtQ0FBbUM7WUFDaEQsVUFBVSxFQUFFLHFCQUFxQjtTQUNsQyxDQUFDLENBQUM7UUFFSCxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUNsQyxLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7WUFDbkIsV0FBVyxFQUFFLHNEQUFzRDtZQUNuRSxVQUFVLEVBQUUsa0JBQWtCO1NBQy9CLENBQUMsQ0FBQztRQUVILElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ25DLEtBQUssRUFBRSxNQUFNLENBQUMsTUFBTTtZQUNwQixXQUFXLEVBQUUsYUFBYTtZQUMxQixVQUFVLEVBQUUsbUJBQW1CO1NBQ2hDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRjtBQTdMRCxrRUE2TEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCB7IE5vZGVqc0Z1bmN0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYS1ub2RlanMnO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gJ3BhdGgnO1xuXG5pbnRlcmZhY2UgQ2hlZm1hdGVTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBzcG9vbmFjdWxhckFwaUtleTogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgQ2hlZm1hdGVJbmZyYXN0cnVjdHVyZVN0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM6IENoZWZtYXRlU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ29tbW9uIExhbWJkYSBjb25maWd1cmF0aW9uXG4gICAgY29uc3QgbGFtYmRhQ29uZmlnID0ge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzE4X1gsXG4gICAgICBhcmNoaXRlY3R1cmU6IGxhbWJkYS5BcmNoaXRlY3R1cmUuQVJNXzY0LFxuICAgICAgbWVtb3J5U2l6ZTogMjU2LFxuICAgICAgdGltZW91dDogY2RrLkR1cmF0aW9uLnNlY29uZHMoMzApLFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgU1BPT05BQ1VMQVJfQVBJX0tFWTogcHJvcHMuc3Bvb25hY3VsYXJBcGlLZXksXG4gICAgICAgIE5PREVfT1BUSU9OUzogJy0tZW5hYmxlLXNvdXJjZS1tYXBzJyxcbiAgICAgIH0sXG4gICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICAgIGJ1bmRsaW5nOiB7XG4gICAgICAgIG1pbmlmeTogdHJ1ZSxcbiAgICAgICAgc291cmNlTWFwOiB0cnVlLFxuICAgICAgICBleHRlcm5hbE1vZHVsZXM6IFtdLFxuICAgICAgfSxcbiAgICB9O1xuXG4gICAgLy8gTGFtYmRhIEZ1bmN0aW9uc1xuICAgIGNvbnN0IHJlY2lwZVNlYXJjaExhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnUmVjaXBlU2VhcmNoRnVuY3Rpb24nLCB7XG4gICAgICAuLi5sYW1iZGFDb25maWcsXG4gICAgICBlbnRyeTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYS9yZWNpcGUtc2VhcmNoL2luZGV4LnRzJyksXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICBmdW5jdGlvbk5hbWU6ICdjaGVmbWF0ZS1yZWNpcGUtc2VhcmNoJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2VhcmNoIHJlY2lwZXMgZnJvbSBTcG9vbmFjdWxhciBBUEknLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVjaXBlRGV0YWlsc0xhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnUmVjaXBlRGV0YWlsc0Z1bmN0aW9uJywge1xuICAgICAgLi4ubGFtYmRhQ29uZmlnLFxuICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvcmVjaXBlLWRldGFpbHMvaW5kZXgudHMnKSxcbiAgICAgIGhhbmRsZXI6ICdoYW5kbGVyJyxcbiAgICAgIGZ1bmN0aW9uTmFtZTogJ2NoZWZtYXRlLXJlY2lwZS1kZXRhaWxzJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnR2V0IHJlY2lwZSBkZXRhaWxzIGZyb20gU3Bvb25hY3VsYXIgQVBJJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IG1lYWxQbGFubmVyTGFtYmRhID0gbmV3IE5vZGVqc0Z1bmN0aW9uKHRoaXMsICdNZWFsUGxhbm5lckZ1bmN0aW9uJywge1xuICAgICAgLi4ubGFtYmRhQ29uZmlnLFxuICAgICAgZW50cnk6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi9sYW1iZGEvbWVhbC1wbGFubmVyL2luZGV4LnRzJyksXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICBmdW5jdGlvbk5hbWU6ICdjaGVmbWF0ZS1tZWFsLXBsYW5uZXInLFxuICAgICAgZGVzY3JpcHRpb246ICdHZW5lcmF0ZSBtZWFsIHBsYW5zIGZyb20gU3Bvb25hY3VsYXIgQVBJJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHVzZXJQcmVmZXJlbmNlc0xhbWJkYSA9IG5ldyBOb2RlanNGdW5jdGlvbih0aGlzLCAnVXNlclByZWZlcmVuY2VzRnVuY3Rpb24nLCB7XG4gICAgICAuLi5sYW1iZGFDb25maWcsXG4gICAgICBlbnRyeTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2xhbWJkYS91c2VyLXByZWZlcmVuY2VzL2luZGV4LnRzJyksXG4gICAgICBoYW5kbGVyOiAnaGFuZGxlcicsXG4gICAgICBmdW5jdGlvbk5hbWU6ICdjaGVmbWF0ZS11c2VyLXByZWZlcmVuY2VzJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnTWFuYWdlIHVzZXIgcHJlZmVyZW5jZXMgKFBoYXNlIDI6IER5bmFtb0RCKScsXG4gICAgICAvLyBSZW1vdmUgU3Bvb25hY3VsYXIga2V5IC0gbm90IG5lZWRlZCBmb3IgdGhpcyBMYW1iZGFcbiAgICAgIGVudmlyb25tZW50OiB7XG4gICAgICAgIE5PREVfT1BUSU9OUzogJy0tZW5hYmxlLXNvdXJjZS1tYXBzJyxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICAvLyBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0NoZWZtYXRlQXBpJywge1xuICAgICAgcmVzdEFwaU5hbWU6ICdDaGVmTWF0ZSBBUEknLFxuICAgICAgZGVzY3JpcHRpb246ICdDaGVmTWF0ZSBWb2ljZSBDb29raW5nIEFzc2lzdGFudCBBUEknLFxuICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICBzdGFnZU5hbWU6ICdwcm9kJyxcbiAgICAgICAgdGhyb3R0bGluZ1JhdGVMaW1pdDogMTAsXG4gICAgICAgIHRocm90dGxpbmdCdXJzdExpbWl0OiAyMCxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBhcGlnYXRld2F5LkNvcnMuQUxMX09SSUdJTlMsXG4gICAgICAgIGFsbG93TWV0aG9kczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9NRVRIT0RTLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAnWC1BbXotRGF0ZScsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAgICdYLUFtei1TZWN1cml0eS1Ub2tlbicsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQVBJIEtleSBhbmQgVXNhZ2UgUGxhblxuICAgIGNvbnN0IGFwaUtleSA9IGFwaS5hZGRBcGlLZXkoJ0NoZWZtYXRlQXBpS2V5Jywge1xuICAgICAgYXBpS2V5TmFtZTogJ2NoZWZtYXRlLWZyb250ZW5kLWtleScsXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBrZXkgZm9yIENoZWZNYXRlIGZyb250ZW5kIGFwcGxpY2F0aW9uJyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHVzYWdlUGxhbiA9IGFwaS5hZGRVc2FnZVBsYW4oJ0NoZWZtYXRlVXNhZ2VQbGFuJywge1xuICAgICAgbmFtZTogJ0NoZWZNYXRlIFN0YW5kYXJkIFBsYW4nLFxuICAgICAgZGVzY3JpcHRpb246ICdTdGFuZGFyZCB1c2FnZSBwbGFuIGZvciBDaGVmTWF0ZSBmcm9udGVuZCcsXG4gICAgICB0aHJvdHRsZToge1xuICAgICAgICByYXRlTGltaXQ6IDEwLFxuICAgICAgICBidXJzdExpbWl0OiAyMCxcbiAgICAgIH0sXG4gICAgICBxdW90YToge1xuICAgICAgICBsaW1pdDogMTAwMCxcbiAgICAgICAgcGVyaW9kOiBhcGlnYXRld2F5LlBlcmlvZC5EQVksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdXNhZ2VQbGFuLmFkZEFwaUtleShhcGlLZXkpO1xuICAgIHVzYWdlUGxhbi5hZGRBcGlTdGFnZSh7XG4gICAgICBzdGFnZTogYXBpLmRlcGxveW1lbnRTdGFnZSxcbiAgICB9KTtcblxuICAgIC8vIEFQSSBSZXNvdXJjZXMgYW5kIE1ldGhvZHNcbiAgICBjb25zdCByZWNpcGVzUmVzb3VyY2UgPSBhcGkucm9vdC5hZGRSZXNvdXJjZSgncmVjaXBlcycpO1xuICAgIGNvbnN0IHNlYXJjaFJlc291cmNlID0gcmVjaXBlc1Jlc291cmNlLmFkZFJlc291cmNlKCdzZWFyY2gnKTtcbiAgICBjb25zdCByZWNpcGVJZFJlc291cmNlID0gcmVjaXBlc1Jlc291cmNlLmFkZFJlc291cmNlKCd7cmVjaXBlSWR9Jyk7XG5cbiAgICBjb25zdCBtZWFsUGxhblJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ21lYWwtcGxhbicpO1xuICAgIGNvbnN0IGdlbmVyYXRlUmVzb3VyY2UgPSBtZWFsUGxhblJlc291cmNlLmFkZFJlc291cmNlKCdnZW5lcmF0ZScpO1xuXG4gICAgY29uc3QgdXNlclJlc291cmNlID0gYXBpLnJvb3QuYWRkUmVzb3VyY2UoJ3VzZXInKTtcbiAgICBjb25zdCBwcmVmZXJlbmNlc1Jlc291cmNlID0gdXNlclJlc291cmNlLmFkZFJlc291cmNlKCdwcmVmZXJlbmNlcycpO1xuXG4gICAgLy8gUmVjaXBlIFNlYXJjaDogR0VUIC9yZWNpcGVzL3NlYXJjaFxuICAgIHNlYXJjaFJlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdHRVQnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocmVjaXBlU2VhcmNoTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlLFxuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBSZWNpcGUgRGV0YWlsczogR0VUIC9yZWNpcGVzL3tyZWNpcGVJZH1cbiAgICByZWNpcGVJZFJlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdHRVQnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24ocmVjaXBlRGV0YWlsc0xhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gTWVhbCBQbGFubmVyOiBHRVQgL21lYWwtcGxhbi9nZW5lcmF0ZVxuICAgIGdlbmVyYXRlUmVzb3VyY2UuYWRkTWV0aG9kKFxuICAgICAgJ0dFVCcsXG4gICAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFJbnRlZ3JhdGlvbihtZWFsUGxhbm5lckxhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gVXNlciBQcmVmZXJlbmNlczogR0VUL1BPU1QgL3VzZXIvcHJlZmVyZW5jZXNcbiAgICBwcmVmZXJlbmNlc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdHRVQnLFxuICAgICAgbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24odXNlclByZWZlcmVuY2VzTGFtYmRhLCB7XG4gICAgICAgIHByb3h5OiB0cnVlLFxuICAgICAgfSksXG4gICAgICB7XG4gICAgICAgIGFwaUtleVJlcXVpcmVkOiB0cnVlLFxuICAgICAgfVxuICAgICk7XG5cbiAgICBwcmVmZXJlbmNlc1Jlc291cmNlLmFkZE1ldGhvZChcbiAgICAgICdQT1NUJyxcbiAgICAgIG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKHVzZXJQcmVmZXJlbmNlc0xhbWJkYSwge1xuICAgICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIH0pLFxuICAgICAge1xuICAgICAgICBhcGlLZXlSZXF1aXJlZDogdHJ1ZSxcbiAgICAgIH1cbiAgICApO1xuXG4gICAgLy8gU3RhY2sgT3V0cHV0c1xuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdBcGlFbmRwb2ludCcsIHtcbiAgICAgIHZhbHVlOiBhcGkudXJsLFxuICAgICAgZGVzY3JpcHRpb246ICdDaGVmTWF0ZSBBUEkgR2F0ZXdheSBlbmRwb2ludCBVUkwnLFxuICAgICAgZXhwb3J0TmFtZTogJ0NoZWZtYXRlQXBpRW5kcG9pbnQnLFxuICAgIH0pO1xuXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaUtleUlkJywge1xuICAgICAgdmFsdWU6IGFwaUtleS5rZXlJZCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnQVBJIEtleSBJRCAodXNlIEFXUyBDTEkgdG8gZ2V0IHRoZSBhY3R1YWwga2V5IHZhbHVlKScsXG4gICAgICBleHBvcnROYW1lOiAnQ2hlZm1hdGVBcGlLZXlJZCcsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQXBpS2V5QXJuJywge1xuICAgICAgdmFsdWU6IGFwaUtleS5rZXlBcm4sXG4gICAgICBkZXNjcmlwdGlvbjogJ0FQSSBLZXkgQVJOJyxcbiAgICAgIGV4cG9ydE5hbWU6ICdDaGVmbWF0ZUFwaUtleUFybicsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==