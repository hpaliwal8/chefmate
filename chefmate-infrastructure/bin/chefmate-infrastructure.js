#!/usr/bin/env node
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
const cdk = __importStar(require("aws-cdk-lib"));
const chefmate_infrastructure_stack_1 = require("../lib/chefmate-infrastructure-stack");
const app = new cdk.App();
// Get Spoonacular API key from context or environment
const spoonacularApiKey = app.node.tryGetContext('spoonacularApiKey')
    || process.env.SPOONACULAR_API_KEY;
if (!spoonacularApiKey) {
    throw new Error('Spoonacular API key is required. Provide it via:\n' +
        '  cdk deploy --context spoonacularApiKey=YOUR_API_KEY\n' +
        'or set SPOONACULAR_API_KEY environment variable');
}
new chefmate_infrastructure_stack_1.ChefmateInfrastructureStack(app, 'ChefmateInfrastructureStack', {
    spoonacularApiKey,
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION || 'us-east-2',
    },
    description: 'ChefMate Voice Cooking Assistant - AWS Infrastructure',
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2hlZm1hdGUtaW5mcmFzdHJ1Y3R1cmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjaGVmbWF0ZS1pbmZyYXN0cnVjdHVyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxpREFBbUM7QUFDbkMsd0ZBQW1GO0FBRW5GLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLHNEQUFzRDtBQUN0RCxNQUFNLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDO09BQ2hFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUM7QUFFckMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDdkIsTUFBTSxJQUFJLEtBQUssQ0FDYixvREFBb0Q7UUFDcEQseURBQXlEO1FBQ3pELGlEQUFpRCxDQUNsRCxDQUFDO0FBQ0osQ0FBQztBQUVELElBQUksMkRBQTJCLENBQUMsR0FBRyxFQUFFLDZCQUE2QixFQUFFO0lBQ2xFLGlCQUFpQjtJQUNqQixHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUI7UUFDeEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLElBQUksV0FBVztLQUN0RDtJQUNELFdBQVcsRUFBRSx1REFBdUQ7Q0FDckUsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENoZWZtYXRlSW5mcmFzdHJ1Y3R1cmVTdGFjayB9IGZyb20gJy4uL2xpYi9jaGVmbWF0ZS1pbmZyYXN0cnVjdHVyZS1zdGFjayc7XG5cbmNvbnN0IGFwcCA9IG5ldyBjZGsuQXBwKCk7XG5cbi8vIEdldCBTcG9vbmFjdWxhciBBUEkga2V5IGZyb20gY29udGV4dCBvciBlbnZpcm9ubWVudFxuY29uc3Qgc3Bvb25hY3VsYXJBcGlLZXkgPSBhcHAubm9kZS50cnlHZXRDb250ZXh0KCdzcG9vbmFjdWxhckFwaUtleScpXG4gIHx8IHByb2Nlc3MuZW52LlNQT09OQUNVTEFSX0FQSV9LRVk7XG5cbmlmICghc3Bvb25hY3VsYXJBcGlLZXkpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFxuICAgICdTcG9vbmFjdWxhciBBUEkga2V5IGlzIHJlcXVpcmVkLiBQcm92aWRlIGl0IHZpYTpcXG4nICtcbiAgICAnICBjZGsgZGVwbG95IC0tY29udGV4dCBzcG9vbmFjdWxhckFwaUtleT1ZT1VSX0FQSV9LRVlcXG4nICtcbiAgICAnb3Igc2V0IFNQT09OQUNVTEFSX0FQSV9LRVkgZW52aXJvbm1lbnQgdmFyaWFibGUnXG4gICk7XG59XG5cbm5ldyBDaGVmbWF0ZUluZnJhc3RydWN0dXJlU3RhY2soYXBwLCAnQ2hlZm1hdGVJbmZyYXN0cnVjdHVyZVN0YWNrJywge1xuICBzcG9vbmFjdWxhckFwaUtleSxcbiAgZW52OiB7XG4gICAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCxcbiAgICByZWdpb246IHByb2Nlc3MuZW52LkNES19ERUZBVUxUX1JFR0lPTiB8fCAndXMtZWFzdC0yJyxcbiAgfSxcbiAgZGVzY3JpcHRpb246ICdDaGVmTWF0ZSBWb2ljZSBDb29raW5nIEFzc2lzdGFudCAtIEFXUyBJbmZyYXN0cnVjdHVyZScsXG59KTtcbiJdfQ==