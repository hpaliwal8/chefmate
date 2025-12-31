"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const client_lex_runtime_v2_1 = require("@aws-sdk/client-lex-runtime-v2");
const response_utils_1 = require("../shared/response-utils");
// Initialize Lex client
const lexClient = new client_lex_runtime_v2_1.LexRuntimeV2Client({
    region: process.env.AWS_REGION || 'us-east-2',
});
async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return (0, response_utils_1.corsPreflightResponse)();
    }
    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return (0, response_utils_1.errorResponse)('Method not allowed', 405);
    }
    // Validate environment variables
    const botId = process.env.LEX_BOT_ID;
    const botAliasId = process.env.LEX_BOT_ALIAS_ID;
    if (!botId || !botAliasId) {
        console.error('Missing Lex bot configuration');
        return (0, response_utils_1.errorResponse)('Lex bot not configured', 500);
    }
    try {
        // Parse request body
        if (!event.body) {
            return (0, response_utils_1.errorResponse)('Request body is required', 400);
        }
        const request = JSON.parse(event.body);
        // Validate required fields
        if (!request.text || typeof request.text !== 'string') {
            return (0, response_utils_1.errorResponse)('Text field is required', 400);
        }
        if (!request.sessionId || typeof request.sessionId !== 'string') {
            return (0, response_utils_1.errorResponse)('SessionId field is required', 400);
        }
        // Build Lex request
        const lexInput = {
            botId,
            botAliasId,
            localeId: 'en_US',
            sessionId: request.sessionId,
            text: request.text,
        };
        // Add session attributes if provided
        if (request.sessionAttributes && Object.keys(request.sessionAttributes).length > 0) {
            lexInput.sessionState = {
                sessionAttributes: request.sessionAttributes,
            };
        }
        console.log('Sending to Lex:', {
            text: request.text,
            sessionId: request.sessionId,
            hasSessionAttributes: !!request.sessionAttributes,
        });
        // Call Lex
        const command = new client_lex_runtime_v2_1.RecognizeTextCommand(lexInput);
        const lexResponse = await lexClient.send(command);
        console.log('Lex response:', JSON.stringify(lexResponse, null, 2));
        // Extract slots with their values
        const slots = {};
        const intentSlots = lexResponse.sessionState?.intent?.slots;
        if (intentSlots) {
            for (const [slotName, slotData] of Object.entries(intentSlots)) {
                // slotData is of type Slot which has a value property of type Value
                const slot = slotData;
                if (slot?.value?.interpretedValue) {
                    slots[slotName] = {
                        value: slot.value.interpretedValue,
                        resolvedValues: slot.value.resolvedValues,
                    };
                }
                else {
                    slots[slotName] = null;
                }
            }
        }
        // Build response
        const response = {
            intent: lexResponse.sessionState?.intent?.name || null,
            slots,
            sessionAttributes: lexResponse.sessionState?.sessionAttributes || {},
            message: lexResponse.messages?.[0]?.content || null,
            confirmationState: lexResponse.sessionState?.intent?.confirmationState || null,
            intentState: lexResponse.sessionState?.intent?.state || null,
        };
        return (0, response_utils_1.successResponse)(response);
    }
    catch (error) {
        console.error('Lex proxy error:', error);
        if (error instanceof SyntaxError) {
            return (0, response_utils_1.errorResponse)('Invalid JSON in request body', 400);
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return (0, response_utils_1.errorResponse)(`Failed to process request: ${errorMessage}`, 500);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXNDQSwwQkEyR0M7QUFoSkQsMEVBSXdDO0FBQ3hDLDZEQUtrQztBQUVsQyx3QkFBd0I7QUFDeEIsTUFBTSxTQUFTLEdBQUcsSUFBSSwwQ0FBa0IsQ0FBQztJQUN2QyxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksV0FBVztDQUM5QyxDQUFDLENBQUM7QUFzQkksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkI7SUFFM0Isd0JBQXdCO0lBQ3hCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPLElBQUEsc0NBQXFCLEdBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsa0JBQWtCO0lBQ2xCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxNQUFNLEVBQUUsQ0FBQztRQUNoQyxPQUFPLElBQUEsOEJBQWEsRUFBQyxvQkFBb0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQsaUNBQWlDO0lBQ2pDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0lBQ3JDLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUM7SUFFaEQsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztRQUMvQyxPQUFPLElBQUEsOEJBQWEsRUFBQyx3QkFBd0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0gscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsT0FBTyxJQUFBLDhCQUFhLEVBQUMsMEJBQTBCLEVBQUUsR0FBRyxDQUFDLENB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WUFDcEUsT0FBTyxFQUFFLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLElBQUksSUFBSTtZQUNuRCxpQkFBaUIsRUFBRSxXQUFXLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxpQkFBaUIsSUFBSSxJQUFJO1lBQzlFLFdBQVcsRUFBRSxXQUFXLENBQUMsWUFBWSxFQUFFLE1BQU0sRUFBRSxLQUFLLElBQUksSUFBSTtTQUM3RCxDQUFDO1FBRUYsT0FBTyxJQUFBLGdDQUFlLEVBQUMsUUFBUSxDQUFDLENBQUM7SUFDbkMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXpDLElBQUksS0FBSyxZQUFZLFdBQVcsRUFBRSxDQUFDO1lBQ2pDLE9BQU8sSUFBQSw4QkFBYSxFQUFDLDhCQUE4QixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzVELENBQUM7UUFFRCxNQUFNLFlBQVksR0FBRyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUM7UUFDOUUsT0FBTyxJQUFBLDhCQUFhLEVBQUMsOEJBQThCLFlBQVksRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzFFLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHtcbiAgTGV4UnVudGltZVYyQ2xpZW50LFxuICBSZWNvZ25pemVUZXh0Q29tbWFuZCxcbiAgUmVjb2duaXplVGV4dENvbW1hbmRJbnB1dCxcbn0gZnJvbSAnQGF3cy1zZGsvY2xpZW50LWxleC1ydW50aW1lLXYyJztcbmltcG9ydCB7XG4gIGNvcnNIZWFkZXJzLFxuICBzdWNjZXNzUmVzcG9uc2UsXG4gIGVycm9yUmVzcG9uc2UsXG4gIGNvcnNQcmVmbGlnaHRSZXNwb25zZSxcbn0gZnJvbSAnLi4vc2hhcmVkL3Jlc3BvbnNlLXV0aWxzJztcblxuLy8gSW5pdGlhbGl6ZSBMZXggY2xpZW50XG5jb25zdCBsZXhDbGllbnQgPSBuZXcgTGV4UnVudGltZVYyQ2xpZW50KHtcbiAgcmVnaW9uOiBwcm9jZXNzLmVudi5BV1NfUkVHSU9OIHx8ICd1cy1lYXN0LTInLFxufSk7XG5cbmludGVyZmFjZSBMZXhQcm94eVJlcXVlc3Qge1xuICB0ZXh0OiBzdHJpbmc7XG4gIHNlc3Npb25JZDogc3RyaW5nO1xuICBzZXNzaW9uQXR0cmlidXRlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmludGVyZmFjZSBTbG90VmFsdWUge1xuICB2YWx1ZTogc3RyaW5nO1xuICByZXNvbHZlZFZhbHVlcz86IHN0cmluZ1tdO1xufVxuXG5pbnRlcmZhY2UgTGV4UHJveHlSZXNwb25zZSB7XG4gIGludGVudDogc3RyaW5nIHwgbnVsbDtcbiAgc2xvdHM6IFJlY29yZDxzdHJpbmcsIFNsb3RWYWx1ZSB8IG51bGw+O1xuICBzZXNzaW9uQXR0cmlidXRlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgbWVzc2FnZTogc3RyaW5nIHwgbnVsbDtcbiAgY29uZmlybWF0aW9uU3RhdGU6IHN0cmluZyB8IG51bGw7XG4gIGludGVudFN0YXRlOiBzdHJpbmcgfCBudWxsO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4ge1xuICAvLyBIYW5kbGUgQ09SUyBwcmVmbGlnaHRcbiAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgIHJldHVybiBjb3JzUHJlZmxpZ2h0UmVzcG9uc2UoKTtcbiAgfVxuXG4gIC8vIE9ubHkgYWxsb3cgUE9TVFxuICBpZiAoZXZlbnQuaHR0cE1ldGhvZCAhPT0gJ1BPU1QnKSB7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ01ldGhvZCBub3QgYWxsb3dlZCcsIDQwNSk7XG4gIH1cblxuICAvLyBWYWxpZGF0ZSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbiAgY29uc3QgYm90SWQgPSBwcm9jZXNzLmVudi5MRVhfQk9UX0lEO1xuICBjb25zdCBib3RBbGlhc0lkID0gcHJvY2Vzcy5lbnYuTEVYX0JPVF9BTElBU19JRDtcblxuICBpZiAoIWJvdElkIHx8ICFib3RBbGlhc0lkKSB7XG4gICAgY29uc29sZS5lcnJvcignTWlzc2luZyBMZXggYm90IGNvbmZpZ3VyYXRpb24nKTtcbiAgICByZXR1cm4gZXJyb3JSZXNwb25zZSgnTGV4IGJvdCBub3QgY29uZmlndXJlZCcsIDUwMCk7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIFBhcnNlIHJlcXVlc3QgYm9keVxuICAgIGlmICghZXZlbnQuYm9keSkge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ1JlcXVlc3QgYm9keSBpcyByZXF1aXJlZCcsIDQwMCk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVxdWVzdDogTGV4UHJveHlSZXF1ZXN0ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcblxuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghcmVxdWVzdC50ZXh0IHx8IHR5cGVvZiByZXF1ZXN0LnRleHQgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSgnVGV4dCBmaWVsZCBpcyByZXF1aXJlZCcsIDQwMCk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXF1ZXN0LnNlc3Npb25JZCB8fCB0eXBlb2YgcmVxdWVzdC5zZXNzaW9uSWQgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSgnU2Vzc2lvbklkIGZpZWxkIGlzIHJlcXVpcmVkJywgNDAwKTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCBMZXggcmVxdWVzdFxuICAgIGNvbnN0IGxleElucHV0OiBSZWNvZ25pemVUZXh0Q29tbWFuZElucHV0ID0ge1xuICAgICAgYm90SWQsXG4gICAgICBib3RBbGlhc0lkLFxuICAgICAgbG9jYWxlSWQ6ICdlbl9VUycsXG4gICAgICBzZXNzaW9uSWQ6IHJlcXVlc3Quc2Vzc2lvbklkLFxuICAgICAgdGV4dDogcmVxdWVzdC50ZXh0LFxuICAgIH07XG5cbiAgICAvLyBBZGQgc2Vzc2lvbiBhdHRyaWJ1dGVzIGlmIHByb3ZpZGVkXG4gICAgaWYgKHJlcXVlc3Quc2Vzc2lvbkF0dHJpYnV0ZXMgJiYgT2JqZWN0LmtleXMocmVxdWVzdC5zZXNzaW9uQXR0cmlidXRlcykubGVuZ3RoID4gMCkge1xuICAgICAgbGV4SW5wdXQuc2Vzc2lvblN0YXRlID0ge1xuICAgICAgICBzZXNzaW9uQXR0cmlidXRlczogcmVxdWVzdC5zZXNzaW9uQXR0cmlidXRlcyxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coJ1NlbmRpbmcgdG8gTGV4OicsIHtcbiAgICAgIHRleHQ6IHJlcXVlc3QudGV4dCxcbiAgICAgIHNlc3Npb25JZDogcmVxdWVzdC5zZXNzaW9uSWQsXG4gICAgICBoYXNTZXNzaW9uQXR0cmlidXRlczogISFyZXF1ZXN0LnNlc3Npb25BdHRyaWJ1dGVzLFxuICAgIH0pO1xuXG4gICAgLy8gQ2FsbCBMZXhcbiAgICBjb25zdCBjb21tYW5kID0gbmV3IFJlY29nbml6ZVRleHRDb21tYW5kKGxleElucHV0KTtcbiAgICBjb25zdCBsZXhSZXNwb25zZSA9IGF3YWl0IGxleENsaWVudC5zZW5kKGNvbW1hbmQpO1xuXG4gICAgY29uc29sZS5sb2coJ0xleCByZXNwb25zZTonLCBKU09OLnN0cmluZ2lmeShsZXhSZXNwb25zZSwgbnVsbCwgMikpO1xuXG4gICAgLy8gRXh0cmFjdCBzbG90cyB3aXRoIHRoZWlyIHZhbHVlc1xuICAgIGNvbnN0IHNsb3RzOiBSZWNvcmQ8c3RyaW5nLCBTbG90VmFsdWUgfCBudWxsPiA9IHt9O1xuICAgIGNvbnN0IGludGVudFNsb3RzID0gbGV4UmVzcG9uc2Uuc2Vzc2lvblN0YXRlPy5pbnRlbnQ/LnNsb3RzO1xuXG4gICAgaWYgKGludGVudFNsb3RzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtzbG90TmFtZSwgc2xvdERhdGFdIG9mIE9iamVjdC5lbnRyaWVzKGludGVudFNsb3RzKSkge1xuICAgICAgICAvLyBzbG90RGF0YSBpcyBvZiB0eXBlIFNsb3Qgd2hpY2ggaGFzIGEgdmFsdWUgcHJvcGVydHkgb2YgdHlwZSBWYWx1ZVxuICAgICAgICBjb25zdCBzbG90ID0gc2xvdERhdGEgYXMgeyB2YWx1ZT86IHsgaW50ZXJwcmV0ZWRWYWx1ZT86IHN0cmluZzsgcmVzb2x2ZWRWYWx1ZXM/OiBzdHJpbmdbXSB9IH07XG4gICAgICAgIGlmIChzbG90Py52YWx1ZT8uaW50ZXJwcmV0ZWRWYWx1ZSkge1xuICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiBzbG90LnZhbHVlLmludGVycHJldGVkVmFsdWUsXG4gICAgICAgICAgICByZXNvbHZlZFZhbHVlczogc2xvdC52YWx1ZS5yZXNvbHZlZFZhbHVlcyxcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNsb3RzW3Nsb3ROYW1lXSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBCdWlsZCByZXNwb25zZVxuICAgIGNvbnN0IHJlc3BvbnNlOiBMZXhQcm94eVJlc3BvbnNlID0ge1xuICAgICAgaW50ZW50OiBsZXhSZXNwb25zZS5zZXNzaW9uU3RhdGU/LmludGVudD8ubmFtZSB8fCBudWxsLFxuICAgICAgc2xvdHMsXG4gICAgICBzZXNzaW9uQXR0cmlidXRlczogbGV4UmVzcG9uc2Uuc2Vzc2lvblN0YXRlPy5zZXNzaW9uQXR0cmlidXRlcyB8fCB7fSxcbiAgICAgIG1lc3NhZ2U6IGxleFJlc3BvbnNlLm1lc3NhZ2VzPy5bMF0/LmNvbnRlbnQgfHwgbnVsbCxcbiAgICAgIGNvbmZpcm1hdGlvblN0YXRlOiBsZXhSZXNwb25zZS5zZXNzaW9uU3RhdGU/LmludGVudD8uY29uZmlybWF0aW9uU3RhdGUgfHwgbnVsbCxcbiAgICAgIGludGVudFN0YXRlOiBsZXhSZXNwb25zZS5zZXNzaW9uU3RhdGU/LmludGVudD8uc3RhdGUgfHwgbnVsbCxcbiAgICB9O1xuXG4gICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZShyZXNwb25zZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignTGV4IHByb3h5IGVycm9yOicsIGVycm9yKTtcblxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSgnSW52YWxpZCBKU09OIGluIHJlcXVlc3QgYm9keScsIDQwMCk7XG4gICAgfVxuXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcic7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoYEZhaWxlZCB0byBwcm9jZXNzIHJlcXVlc3Q6ICR7ZXJyb3JNZXNzYWdlfWAsIDUwMCk7XG4gIH1cbn1cbiJdfQ==