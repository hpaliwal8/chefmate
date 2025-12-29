# ChefMate AWS Infrastructure Roadmap

This document outlines the incremental migration from the current Vercel-based MVP to the full AWS architecture specified in the original project requirements.

## Current State (MVP - Vercel)

| Component | Current Implementation |
|-----------|----------------------|
| Frontend | React + TypeScript on Vercel |
| Voice Input | Web Speech API (browser) |
| Voice Output | Browser Speech Synthesis |
| Backend | Vercel Serverless Functions |
| Database | localStorage |
| NLU | Regex-based intent matching |

## Target State (Full AWS)

| Component | Target Implementation |
|-----------|----------------------|
| Frontend | React + TypeScript (S3 + CloudFront or Vercel) |
| Voice Input | AWS Lex v2 |
| Voice Output | AWS Polly (Neural TTS) |
| Backend | AWS Lambda + API Gateway |
| Database | DynamoDB |
| NLU | AWS Lex (built-in NLU) |

---

## Phase 1: AWS Lambda Backend Migration

**Priority: High**
**Estimated Effort: Medium**

### Objective
Replace Vercel serverless functions with AWS Lambda for better integration with other AWS services.

### Tasks

1. **Create Lambda Functions**
   ```
   /lambda
   ├── recipe-search/          # Search recipes
   ├── recipe-details/         # Get recipe details
   ├── meal-planner/           # Generate meal plans
   └── user-preferences/       # Manage user settings
   ```

2. **Set Up API Gateway**
   - Create REST API
   - Configure CORS
   - Set up API key authentication
   - Create usage plans for rate limiting

3. **Update Frontend**
   - Replace `/api/spoonacular` calls with API Gateway endpoints
   - Add API key header to requests

### Files to Modify
- `src/services/SpoonacularProvider.ts` - Update base URL to API Gateway
- Create new `infrastructure/` directory for AWS CDK/SAM templates

### Environment Variables (AWS)
```
SPOONACULAR_API_KEY=xxx
AWS_REGION=us-east-1
```

---

## Phase 2: DynamoDB Integration

**Priority: High**
**Estimated Effort: Medium**

### Objective
Replace localStorage with DynamoDB for persistent, cross-device data storage.

### Data Models

```typescript
// User Preferences Table
{
  PK: "USER#<userId>",
  SK: "PREFERENCES",
  dietaryRestrictions: string[],
  favoriteCuisines: string[],
  allergies: string[],
  createdAt: string,
  updatedAt: string
}

// Favorites Table
{
  PK: "USER#<userId>",
  SK: "FAVORITE#<recipeId>",
  recipeId: number,
  recipeName: string,
  recipeImage: string,
  savedAt: string
}

// Shopping List Table
{
  PK: "USER#<userId>",
  SK: "SHOPPING#<itemId>",
  ingredient: string,
  quantity: string,
  checked: boolean,
  recipeSource: string
}

// Session/Conversation Table
{
  PK: "USER#<userId>",
  SK: "SESSION#<timestamp>",
  conversationHistory: object[],
  currentRecipe: object,
  cookingStep: number
}
```

### Tasks

1. **Create DynamoDB Tables**
   - Single-table design for efficiency
   - Configure on-demand capacity (free tier friendly)
   - Set up TTL for session data

2. **Create Lambda Functions for Data Access**
   ```
   /lambda
   ├── user-data/
   │   ├── get-preferences.js
   │   ├── update-preferences.js
   │   ├── get-favorites.js
   │   ├── add-favorite.js
   │   ├── remove-favorite.js
   │   ├── get-shopping-list.js
   │   └── update-shopping-list.js
   ```

3. **Add User Authentication (Cognito)**
   - User pools for authentication
   - Identity pools for AWS credentials
   - Social login (Google, Apple) optional

### Files to Modify
- `src/context/AppContext.tsx` - Replace localStorage with API calls
- Create `src/services/UserService.ts` - Handle user data operations

---

## Phase 3: AWS Lex Integration (NLU)

**Priority: Medium**
**Estimated Effort: High**

### Objective
Replace browser-based regex intent matching with AWS Lex for superior natural language understanding.

### Lex Bot Design

**Bot Name:** ChefMateBot

**Intents:**
| Intent | Sample Utterances | Slots |
|--------|------------------|-------|
| SearchRecipe | "Find me {dish} recipes", "Show {cuisine} food", "What can I make in {time} minutes" | dish, cuisine, diet, time |
| GetRecipeDetails | "Tell me about the {ordinal} one", "Show me {recipeName}" | ordinal, recipeName |
| StartCooking | "Let's cook {recipeName}", "Start cooking", "Begin recipe" | recipeName |
| NextStep | "Next step", "What's next", "Continue" | - |
| PreviousStep | "Go back", "Previous step", "Repeat that" | - |
| AddToShoppingList | "Add ingredients to my list", "Save shopping list" | - |
| AddToFavorites | "Save this recipe", "Add to favorites" | - |
| GetSubstitute | "What can I use instead of {ingredient}" | ingredient |
| GetNutrition | "How many calories", "Nutritional info" | - |
| Help | "Help", "What can you do" | - |

**Slot Types:**
- `DishType` - pizza, pasta, curry, salad, soup, etc.
- `CuisineType` - italian, mexican, indian, chinese, etc.
- `DietType` - vegetarian, vegan, gluten-free, keto, etc.
- `TimeConstraint` - AMAZON.NUMBER (minutes)
- `Ordinal` - first, second, third, etc.

### Architecture
```
User Voice → Web Speech API → Text → AWS Lex → Intent + Slots
                                         ↓
                                    Lambda Fulfillment
                                         ↓
                                    Response → AWS Polly → Audio
```

### Tasks

1. **Create Lex Bot**
   - Define intents and slot types
   - Add sample utterances (20+ per intent)
   - Configure fulfillment Lambda

2. **Create Fulfillment Lambda**
   - Process Lex events
   - Call Spoonacular API
   - Format responses for Polly

3. **Update Frontend**
   - Replace `VoiceInterface.tsx` intent classification with Lex API calls
   - Use AWS SDK for JavaScript v3

### Files to Modify
- `src/components/VoiceInterface.tsx` - Replace intent classification
- Create `src/services/LexService.ts` - Lex bot integration

---

## Phase 4: AWS Polly Integration (TTS)

**Priority: Medium**
**Estimated Effort: Low**

### Objective
Replace browser Speech Synthesis with AWS Polly for higher-quality, more natural voice responses.

### Configuration
- **Voice:** Joanna (Neural) - Natural, conversational
- **Engine:** Neural (higher quality)
- **Output Format:** MP3 for browser playback

### Tasks

1. **Create Polly Lambda Function**
   ```javascript
   // Synthesize speech and return audio URL
   async function synthesizeSpeech(text) {
     const polly = new PollyClient({ region: 'us-east-1' });
     const command = new SynthesizeSpeechCommand({
       Text: text,
       OutputFormat: 'mp3',
       VoiceId: 'Joanna',
       Engine: 'neural'
     });
     // Return presigned S3 URL or stream
   }
   ```

2. **Update Frontend**
   - Replace `useSpeechSynthesis.ts` with Polly API calls
   - Use HTML5 Audio API for playback

### Files to Modify
- `src/hooks/useSpeechSynthesis.ts` - Replace with Polly integration
- Create `src/services/PollyService.ts`

---

## Phase 5: Production Optimizations

**Priority: Low**
**Estimated Effort: Medium**

### Caching Layer
- **CloudFront** for static assets
- **ElastiCache (Redis)** for API response caching
- **DynamoDB caching** for frequently accessed recipes

### Monitoring & Logging
- **CloudWatch** for Lambda logs and metrics
- **X-Ray** for distributed tracing
- **CloudWatch Alarms** for error rates

### Security
- **WAF** for API Gateway protection
- **Secrets Manager** for API keys
- **IAM** least-privilege policies

---

## AWS Free Tier Considerations

| Service | Free Tier Limit | Estimated Usage |
|---------|-----------------|-----------------|
| Lambda | 1M requests/month | ~10K requests ✅ |
| API Gateway | 1M calls/month | ~10K calls ✅ |
| DynamoDB | 25GB storage, 25 RCU/WCU | <1GB ✅ |
| Lex | 10K text requests/month | ~5K requests ✅ |
| Polly | 5M characters/month | ~1M chars ✅ |
| S3 | 5GB storage | <100MB ✅ |
| CloudWatch | 10 metrics, 5GB logs | Minimal ✅ |

**Projected Cost: $0/month** (within free tier limits for personal use)

---

## Migration Checklist

### Phase 1: Lambda Backend
- [ ] Set up AWS account and IAM users
- [ ] Create Lambda functions
- [ ] Configure API Gateway
- [ ] Update frontend API calls
- [ ] Test end-to-end

### Phase 2: DynamoDB
- [ ] Design table schema
- [ ] Create DynamoDB table
- [ ] Create data access Lambdas
- [ ] Set up Cognito (optional)
- [ ] Migrate localStorage to DynamoDB
- [ ] Test data persistence

### Phase 3: AWS Lex
- [ ] Create Lex bot
- [ ] Define all intents and slots
- [ ] Train the model
- [ ] Create fulfillment Lambda
- [ ] Replace frontend intent classification
- [ ] Test voice interactions

### Phase 4: AWS Polly
- [ ] Create Polly Lambda
- [ ] Set up audio streaming
- [ ] Replace browser TTS
- [ ] Test voice output quality

### Phase 5: Production
- [ ] Set up CloudFront CDN
- [ ] Configure caching
- [ ] Add monitoring
- [ ] Security hardening
- [ ] Load testing

---

## Quick Start Commands

```bash
# Install AWS CLI
brew install awscli

# Configure AWS credentials
aws configure

# Install AWS SAM CLI (for Lambda development)
brew install aws-sam-cli

# Install AWS CDK (for infrastructure as code)
npm install -g aws-cdk

# Initialize CDK project
cdk init app --language typescript
```

---

## Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Lex V2 Documentation](https://docs.aws.amazon.com/lexv2/)
- [AWS Polly Documentation](https://docs.aws.amazon.com/polly/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS Free Tier](https://aws.amazon.com/free/)

---

**Last Updated:** December 26, 2024
**Current Phase:** MVP (Vercel) - Ready for deployment
**Next Phase:** Phase 1 (Lambda Backend) after MVP validation
