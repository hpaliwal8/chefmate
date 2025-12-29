import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
interface ChefmateStackProps extends cdk.StackProps {
    spoonacularApiKey: string;
}
export declare class ChefmateInfrastructureStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: ChefmateStackProps);
}
export {};
