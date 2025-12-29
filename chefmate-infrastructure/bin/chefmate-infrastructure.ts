#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ChefmateInfrastructureStack } from '../lib/chefmate-infrastructure-stack';

const app = new cdk.App();

// Get Spoonacular API key from context or environment
const spoonacularApiKey = app.node.tryGetContext('spoonacularApiKey')
  || process.env.SPOONACULAR_API_KEY;

if (!spoonacularApiKey) {
  throw new Error(
    'Spoonacular API key is required. Provide it via:\n' +
    '  cdk deploy --context spoonacularApiKey=YOUR_API_KEY\n' +
    'or set SPOONACULAR_API_KEY environment variable'
  );
}

new ChefmateInfrastructureStack(app, 'ChefmateInfrastructureStack', {
  spoonacularApiKey,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-2',
  },
  description: 'ChefMate Voice Cooking Assistant - AWS Infrastructure',
});
