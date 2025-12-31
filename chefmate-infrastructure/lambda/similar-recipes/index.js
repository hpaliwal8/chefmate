"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const response_utils_1 = require("../shared/response-utils");
const spoonacular_client_1 = require("../shared/spoonacular-client");
/**
 * Similar Recipes Lambda Handler
 *
 * GET /recipes/{recipeId}/similar
 *
 * Path Parameters:
 * - recipeId: The ID of the recipe to find similar recipes for
 *
 * Query Parameters:
 * - number: Number of similar recipes to return (default: 5, max: 100)
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
        const recipeId = event.pathParameters?.recipeId;
        if (!recipeId) {
            return (0, response_utils_1.errorResponse)('Recipe ID is required', 400);
        }
        const client = (0, spoonacular_client_1.createSpoonacularClient)();
        const params = event.queryStringParameters || {};
        const result = await client.get({
            endpoint: `/recipes/${recipeId}/similar`,
            params: {
                number: params.number ? parseInt(params.number, 10) : 5,
            },
        });
        return (0, response_utils_1.successResponse)(result);
    }
    catch (error) {
        console.error('Similar recipes error:', error);
        if (error instanceof spoonacular_client_1.SpoonacularError) {
            return (0, response_utils_1.errorResponse)(error.message, error.status, error.details);
        }
        if (error instanceof Error) {
            return (0, response_utils_1.errorResponse)(error.message, 500);
        }
        return (0, response_utils_1.errorResponse)('Failed to get similar recipes', 500);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWtDQSwwQkEyQ0M7QUE1RUQsNkRBSWtDO0FBQ2xDLHFFQUdzQztBQWN0Qzs7Ozs7Ozs7OztHQVVHO0FBQ0ksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkI7SUFFM0Isd0JBQXdCO0lBQ3hCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPLElBQUEsc0NBQXFCLEdBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQy9CLE9BQU8sSUFBQSw4QkFBYSxFQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQztRQUVoRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZCxPQUFPLElBQUEsOEJBQWEsRUFBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBQSw0Q0FBdUIsR0FBRSxDQUFDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsSUFBSSxFQUFFLENBQUM7UUFFakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFrQjtZQUMvQyxRQUFRLEVBQUUsWUFBWSxRQUFRLFVBQVU7WUFDeEMsTUFBTSxFQUFFO2dCQUNOLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN4RDtTQUNGLENBQUMsQ0FBQztRQUVILE9BQU8sSUFBQSxnQ0FBZSxFQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUUvQyxJQUFJLEtBQUssWUFBWSxxQ0FBZ0IsRUFBRSxDQUFDO1lBQ3RDLE9BQU8sSUFBQSw4QkFBYSxFQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELElBQUksS0FBSyxZQUFZLEtBQUssRUFBRSxDQUFDO1lBQzNCLE9BQU8sSUFBQSw4QkFBYSxFQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDM0MsQ0FBQztRQUVELE9BQU8sSUFBQSw4QkFBYSxFQUFDLCtCQUErQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQzdELENBQUM7QUFDSCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHtcbiAgc3VjY2Vzc1Jlc3BvbnNlLFxuICBlcnJvclJlc3BvbnNlLFxuICBjb3JzUHJlZmxpZ2h0UmVzcG9uc2UsXG59IGZyb20gJy4uL3NoYXJlZC9yZXNwb25zZS11dGlscyc7XG5pbXBvcnQge1xuICBjcmVhdGVTcG9vbmFjdWxhckNsaWVudCxcbiAgU3Bvb25hY3VsYXJFcnJvcixcbn0gZnJvbSAnLi4vc2hhcmVkL3Nwb29uYWN1bGFyLWNsaWVudCc7XG5cbi8qKlxuICogU2ltaWxhciByZWNpcGUgcmVzcG9uc2UgZnJvbSBTcG9vbmFjdWxhclxuICovXG5pbnRlcmZhY2UgU2ltaWxhclJlY2lwZSB7XG4gIGlkOiBudW1iZXI7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIGltYWdlVHlwZTogc3RyaW5nO1xuICByZWFkeUluTWludXRlczogbnVtYmVyO1xuICBzZXJ2aW5nczogbnVtYmVyO1xuICBzb3VyY2VVcmw6IHN0cmluZztcbn1cblxuLyoqXG4gKiBTaW1pbGFyIFJlY2lwZXMgTGFtYmRhIEhhbmRsZXJcbiAqXG4gKiBHRVQgL3JlY2lwZXMve3JlY2lwZUlkfS9zaW1pbGFyXG4gKlxuICogUGF0aCBQYXJhbWV0ZXJzOlxuICogLSByZWNpcGVJZDogVGhlIElEIG9mIHRoZSByZWNpcGUgdG8gZmluZCBzaW1pbGFyIHJlY2lwZXMgZm9yXG4gKlxuICogUXVlcnkgUGFyYW1ldGVyczpcbiAqIC0gbnVtYmVyOiBOdW1iZXIgb2Ygc2ltaWxhciByZWNpcGVzIHRvIHJldHVybiAoZGVmYXVsdDogNSwgbWF4OiAxMDApXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKFxuICBldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnRcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gIC8vIEhhbmRsZSBDT1JTIHByZWZsaWdodFxuICBpZiAoZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgcmV0dXJuIGNvcnNQcmVmbGlnaHRSZXNwb25zZSgpO1xuICB9XG5cbiAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgIT09ICdHRVQnKSB7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ01ldGhvZCBub3QgYWxsb3dlZCcsIDQwNSk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHJlY2lwZUlkID0gZXZlbnQucGF0aFBhcmFtZXRlcnM/LnJlY2lwZUlkO1xuXG4gICAgaWYgKCFyZWNpcGVJZCkge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ1JlY2lwZSBJRCBpcyByZXF1aXJlZCcsIDQwMCk7XG4gICAgfVxuXG4gICAgY29uc3QgY2xpZW50ID0gY3JlYXRlU3Bvb25hY3VsYXJDbGllbnQoKTtcbiAgICBjb25zdCBwYXJhbXMgPSBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMgfHwge307XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuZ2V0PFNpbWlsYXJSZWNpcGVbXT4oe1xuICAgICAgZW5kcG9pbnQ6IGAvcmVjaXBlcy8ke3JlY2lwZUlkfS9zaW1pbGFyYCxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBudW1iZXI6IHBhcmFtcy5udW1iZXIgPyBwYXJzZUludChwYXJhbXMubnVtYmVyLCAxMCkgOiA1LFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2UocmVzdWx0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdTaW1pbGFyIHJlY2lwZXMgZXJyb3I6JywgZXJyb3IpO1xuXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgU3Bvb25hY3VsYXJFcnJvcikge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSwgZXJyb3Iuc3RhdHVzLCBlcnJvci5kZXRhaWxzKTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSwgNTAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXJyb3JSZXNwb25zZSgnRmFpbGVkIHRvIGdldCBzaW1pbGFyIHJlY2lwZXMnLCA1MDApO1xuICB9XG59XG4iXX0=