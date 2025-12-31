"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const response_utils_1 = require("../shared/response-utils");
const spoonacular_client_1 = require("../shared/spoonacular-client");
/**
 * Ingredient Substitutes Lambda Handler
 *
 * GET /food/ingredients/substitutes
 *
 * Query Parameters:
 * - ingredientName: The name of the ingredient to find substitutes for (required)
 */
async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return (0, response_utils_1.corsPreflightResponse)();
    }
    if (event.httpMethod !== 'GET') {
        return (0, response_utils_1.errorResponse)('Method not allowed', 405);
    }
    try {
        const params = event.queryStringParameters || {};
        const ingredientName = params.ingredientName;
        if (!ingredientName) {
            return (0, response_utils_1.errorResponse)('ingredientName query parameter is required', 400);
        }
        const client = (0, spoonacular_client_1.createSpoonacularClient)();
        const result = await client.get({
            endpoint: '/food/ingredients/substitutes',
            params: {
                ingredientName,
            },
        });
        return (0, response_utils_1.successResponse)(result);
    }
    catch (error) {
        console.error('Ingredient substitutes error:', error);
        if (error instanceof spoonacular_client_1.SpoonacularError) {
            // Spoonacular returns 404 when no substitutes found
            if (error.status === 404) {
                return (0, response_utils_1.successResponse)({
                    ingredient: event.queryStringParameters?.ingredientName || '',
                    substitutes: [],
                    message: 'No substitutes found for this ingredient',
                });
            }
            return (0, response_utils_1.errorResponse)(error.message, error.status, error.details);
        }
        if (error instanceof Error) {
            return (0, response_utils_1.errorResponse)(error.message, 500);
        }
        return (0, response_utils_1.errorResponse)('Failed to get ingredient substitutes', 500);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTRCQSwwQkFtREM7QUE5RUQsNkRBSWtDO0FBQ2xDLHFFQUdzQztBQVd0Qzs7Ozs7OztHQU9HO0FBQ0ksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkI7SUFFM0Isd0JBQXdCO0lBQ3hCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPLElBQUEsc0NBQXFCLEdBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQy9CLE9BQU8sSUFBQSw4QkFBYSxFQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMscUJBQXFCLElBQUksRUFBRSxDQUFDO1FBQ2pELE1BQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxjQUFjLENBQUM7UUFFN0MsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1lBQ3BCLE9BQU8sSUFBQSw4QkFBYSxFQUFDLDRDQUE0QyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzFFLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFBLDRDQUF1QixHQUFFLENBQUM7UUFFekMsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFnQztZQUM3RCxRQUFRLEVBQUUsK0JBQStCO1lBQ3pDLE1BQU0sRUFBRTtnQkFDTixjQUFjO2FBQ2Y7U0FDRixDQUFDLENBQUM7UUFFSCxPQUFPLElBQUEsZ0NBQWUsRUFBQyxNQUFNLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFdEQsSUFBSSxLQUFLLFlBQVkscUNBQWdCLEVBQUUsQ0FBQztZQUN0QyxvREFBb0Q7WUFDcEQsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUN6QixPQUFPLElBQUEsZ0NBQWUsRUFBQztvQkFDckIsVUFBVSxFQUFFLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxjQUFjLElBQUksRUFBRTtvQkFDN0QsV0FBVyxFQUFFLEVBQUU7b0JBQ2YsT0FBTyxFQUFFLDBDQUEwQztpQkFDcEQsQ0FBQyxDQUFDO1lBQ0wsQ0FBQztZQUNELE9BQU8sSUFBQSw4QkFBYSxFQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELElBQUksS0FBSyxZQUFZLEtBQUssRUFBRSxDQUFDO1lBQzNCLE9BQU8sSUFBQSw4QkFBYSxFQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELE9BQU8sSUFBQSw4QkFBYSxFQUFDLHNDQUFzQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHtcbiAgc3VjY2Vzc1Jlc3BvbnNlLFxuICBlcnJvclJlc3BvbnNlLFxuICBjb3JzUHJlZmxpZ2h0UmVzcG9uc2UsXG59IGZyb20gJy4uL3NoYXJlZC9yZXNwb25zZS11dGlscyc7XG5pbXBvcnQge1xuICBjcmVhdGVTcG9vbmFjdWxhckNsaWVudCxcbiAgU3Bvb25hY3VsYXJFcnJvcixcbn0gZnJvbSAnLi4vc2hhcmVkL3Nwb29uYWN1bGFyLWNsaWVudCc7XG5cbi8qKlxuICogSW5ncmVkaWVudCBzdWJzdGl0dXRlcyByZXNwb25zZSBmcm9tIFNwb29uYWN1bGFyXG4gKi9cbmludGVyZmFjZSBJbmdyZWRpZW50U3Vic3RpdHV0ZXNSZXNwb25zZSB7XG4gIGluZ3JlZGllbnQ6IHN0cmluZztcbiAgc3Vic3RpdHV0ZXM6IHN0cmluZ1tdO1xuICBtZXNzYWdlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogSW5ncmVkaWVudCBTdWJzdGl0dXRlcyBMYW1iZGEgSGFuZGxlclxuICpcbiAqIEdFVCAvZm9vZC9pbmdyZWRpZW50cy9zdWJzdGl0dXRlc1xuICpcbiAqIFF1ZXJ5IFBhcmFtZXRlcnM6XG4gKiAtIGluZ3JlZGllbnROYW1lOiBUaGUgbmFtZSBvZiB0aGUgaW5ncmVkaWVudCB0byBmaW5kIHN1YnN0aXR1dGVzIGZvciAocmVxdWlyZWQpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKFxuICBldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnRcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gIC8vIEhhbmRsZSBDT1JTIHByZWZsaWdodFxuICBpZiAoZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgcmV0dXJuIGNvcnNQcmVmbGlnaHRSZXNwb25zZSgpO1xuICB9XG5cbiAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgIT09ICdHRVQnKSB7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ01ldGhvZCBub3QgYWxsb3dlZCcsIDQwNSk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHBhcmFtcyA9IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycyB8fCB7fTtcbiAgICBjb25zdCBpbmdyZWRpZW50TmFtZSA9IHBhcmFtcy5pbmdyZWRpZW50TmFtZTtcblxuICAgIGlmICghaW5ncmVkaWVudE5hbWUpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdpbmdyZWRpZW50TmFtZSBxdWVyeSBwYXJhbWV0ZXIgaXMgcmVxdWlyZWQnLCA0MDApO1xuICAgIH1cblxuICAgIGNvbnN0IGNsaWVudCA9IGNyZWF0ZVNwb29uYWN1bGFyQ2xpZW50KCk7XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuZ2V0PEluZ3JlZGllbnRTdWJzdGl0dXRlc1Jlc3BvbnNlPih7XG4gICAgICBlbmRwb2ludDogJy9mb29kL2luZ3JlZGllbnRzL3N1YnN0aXR1dGVzJyxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBpbmdyZWRpZW50TmFtZSxcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHJlc3VsdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignSW5ncmVkaWVudCBzdWJzdGl0dXRlcyBlcnJvcjonLCBlcnJvcik7XG5cbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBTcG9vbmFjdWxhckVycm9yKSB7XG4gICAgICAvLyBTcG9vbmFjdWxhciByZXR1cm5zIDQwNCB3aGVuIG5vIHN1YnN0aXR1dGVzIGZvdW5kXG4gICAgICBpZiAoZXJyb3Iuc3RhdHVzID09PSA0MDQpIHtcbiAgICAgICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZSh7XG4gICAgICAgICAgaW5ncmVkaWVudDogZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy5pbmdyZWRpZW50TmFtZSB8fCAnJyxcbiAgICAgICAgICBzdWJzdGl0dXRlczogW10sXG4gICAgICAgICAgbWVzc2FnZTogJ05vIHN1YnN0aXR1dGVzIGZvdW5kIGZvciB0aGlzIGluZ3JlZGllbnQnLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UsIGVycm9yLnN0YXR1cywgZXJyb3IuZGV0YWlscyk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UsIDUwMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ0ZhaWxlZCB0byBnZXQgaW5ncmVkaWVudCBzdWJzdGl0dXRlcycsIDUwMCk7XG4gIH1cbn1cbiJdfQ==