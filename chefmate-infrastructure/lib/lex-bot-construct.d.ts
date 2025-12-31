import { Construct } from 'constructs';
export interface ChefMateLexBotProps {
    readonly botName?: string;
}
export declare class ChefMateLexBot extends Construct {
    readonly botId: string;
    readonly botAliasId: string;
    readonly botArn: string;
    constructor(scope: Construct, id: string, props?: ChefMateLexBotProps);
}
