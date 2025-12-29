"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const response_utils_1 = require("../shared/response-utils");
const spoonacular_client_1 = require("../shared/spoonacular-client");
/**
 * Recipe Details Lambda Handler
 *
 * GET /recipes/{recipeId}
 *
 * Path Parameters:
 * - recipeId: The Spoonacular recipe ID
 *
 * Query Parameters:
 * - includeNutrition: Include nutrition info (default: true)
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
        // Validate recipe ID is a number
        const recipeIdNum = parseInt(recipeId, 10);
        if (isNaN(recipeIdNum)) {
            return (0, response_utils_1.errorResponse)('Invalid recipe ID', 400);
        }
        const client = (0, spoonacular_client_1.createSpoonacularClient)();
        const params = event.queryStringParameters || {};
        const result = await client.get({
            endpoint: `/recipes/${recipeIdNum}/information`,
            params: {
                includeNutrition: params.includeNutrition !== 'false',
            },
        });
        // Transform the response to include formatted instructions
        const transformedResult = {
            ...result,
            instructions: formatInstructions(result),
        };
        return (0, response_utils_1.successResponse)(transformedResult);
    }
    catch (error) {
        console.error('Recipe details error:', error);
        if (error instanceof spoonacular_client_1.SpoonacularError) {
            return (0, response_utils_1.errorResponse)(error.message, error.status, error.details);
        }
        if (error instanceof Error) {
            return (0, response_utils_1.errorResponse)(error.message, 500);
        }
        return (0, response_utils_1.errorResponse)('Failed to fetch recipe details', 500);
    }
}
/**
 * Format instructions from analyzedInstructions to a simpler format
 */
function formatInstructions(recipe) {
    if (!recipe.analyzedInstructions || recipe.analyzedInstructions.length === 0) {
        return [];
    }
    const instructions = [];
    for (const instruction of recipe.analyzedInstructions) {
        for (const step of instruction.steps) {
            instructions.push({
                number: step.number,
                step: step.step,
                ingredients: step.ingredients?.map((ing) => ing.name) || [],
                equipment: step.equipment?.map((eq) => eq.name) || [],
                length: step.length,
            });
        }
    }
    return instructions;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXVCQSwwQkF1REM7QUE3RUQsNkRBSWtDO0FBQ2xDLHFFQUlzQztBQUV0Qzs7Ozs7Ozs7OztHQVVHO0FBQ0ksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkI7SUFFM0Isd0JBQXdCO0lBQ3hCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPLElBQUEsc0NBQXFCLEdBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQy9CLE9BQU8sSUFBQSw4QkFBYSxFQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQztRQUVoRCxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDZCxPQUFPLElBQUEsOEJBQWEsRUFBQyx1QkFBdUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNyRCxDQUFDO1FBRUQsaUNBQWlDO1FBQ2pDLE1BQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0MsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUN2QixPQUFPLElBQUEsOEJBQWEsRUFBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBQSw0Q0FBdUIsR0FBRSxDQUFDO1FBQ3pDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxxQkFBcUIsSUFBSSxFQUFFLENBQUM7UUFFakQsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFnQjtZQUM3QyxRQUFRLEVBQUUsWUFBWSxXQUFXLGNBQWM7WUFDL0MsTUFBTSxFQUFFO2dCQUNOLGdCQUFnQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxPQUFPO2FBQ3REO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsMkRBQTJEO1FBQzNELE1BQU0saUJBQWlCLEdBQUc7WUFDeEIsR0FBRyxNQUFNO1lBQ1QsWUFBWSxFQUFFLGtCQUFrQixDQUFDLE1BQU0sQ0FBQztTQUN6QyxDQUFDO1FBRUYsT0FBTyxJQUFBLGdDQUFlLEVBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsdUJBQXVCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFOUMsSUFBSSxLQUFLLFlBQVkscUNBQWdCLEVBQUUsQ0FBQztZQUN0QyxPQUFPLElBQUEsOEJBQWEsRUFBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxJQUFJLEtBQUssWUFBWSxLQUFLLEVBQUUsQ0FBQztZQUMzQixPQUFPLElBQUEsOEJBQWEsRUFBQyxLQUFLLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQzNDLENBQUM7UUFFRCxPQUFPLElBQUEsOEJBQWEsRUFBQyxnQ0FBZ0MsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUM5RCxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxrQkFBa0IsQ0FBQyxNQUFxQjtJQUMvQyxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7UUFDN0UsT0FBTyxFQUFFLENBQUM7SUFDWixDQUFDO0lBRUQsTUFBTSxZQUFZLEdBQTJCLEVBQUUsQ0FBQztJQUVoRCxLQUFLLE1BQU0sV0FBVyxJQUFJLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDO1FBQ3RELEtBQUssTUFBTSxJQUFJLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3JDLFlBQVksQ0FBQyxJQUFJLENBQUM7Z0JBQ2hCLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTtnQkFDbkIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO2dCQUNmLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQzNELFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ3JELE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTTthQUNwQixDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sWUFBWSxDQUFDO0FBQ3RCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQge1xuICBzdWNjZXNzUmVzcG9uc2UsXG4gIGVycm9yUmVzcG9uc2UsXG4gIGNvcnNQcmVmbGlnaHRSZXNwb25zZSxcbn0gZnJvbSAnLi4vc2hhcmVkL3Jlc3BvbnNlLXV0aWxzJztcbmltcG9ydCB7XG4gIGNyZWF0ZVNwb29uYWN1bGFyQ2xpZW50LFxuICBTcG9vbmFjdWxhckVycm9yLFxuICBSZWNpcGVEZXRhaWxzLFxufSBmcm9tICcuLi9zaGFyZWQvc3Bvb25hY3VsYXItY2xpZW50JztcblxuLyoqXG4gKiBSZWNpcGUgRGV0YWlscyBMYW1iZGEgSGFuZGxlclxuICpcbiAqIEdFVCAvcmVjaXBlcy97cmVjaXBlSWR9XG4gKlxuICogUGF0aCBQYXJhbWV0ZXJzOlxuICogLSByZWNpcGVJZDogVGhlIFNwb29uYWN1bGFyIHJlY2lwZSBJRFxuICpcbiAqIFF1ZXJ5IFBhcmFtZXRlcnM6XG4gKiAtIGluY2x1ZGVOdXRyaXRpb246IEluY2x1ZGUgbnV0cml0aW9uIGluZm8gKGRlZmF1bHQ6IHRydWUpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKFxuICBldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnRcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gIC8vIEhhbmRsZSBDT1JTIHByZWZsaWdodFxuICBpZiAoZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgcmV0dXJuIGNvcnNQcmVmbGlnaHRSZXNwb25zZSgpO1xuICB9XG5cbiAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgIT09ICdHRVQnKSB7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ01ldGhvZCBub3QgYWxsb3dlZCcsIDQwNSk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHJlY2lwZUlkID0gZXZlbnQucGF0aFBhcmFtZXRlcnM/LnJlY2lwZUlkO1xuXG4gICAgaWYgKCFyZWNpcGVJZCkge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ1JlY2lwZSBJRCBpcyByZXF1aXJlZCcsIDQwMCk7XG4gICAgfVxuXG4gICAgLy8gVmFsaWRhdGUgcmVjaXBlIElEIGlzIGEgbnVtYmVyXG4gICAgY29uc3QgcmVjaXBlSWROdW0gPSBwYXJzZUludChyZWNpcGVJZCwgMTApO1xuICAgIGlmIChpc05hTihyZWNpcGVJZE51bSkpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdJbnZhbGlkIHJlY2lwZSBJRCcsIDQwMCk7XG4gICAgfVxuXG4gICAgY29uc3QgY2xpZW50ID0gY3JlYXRlU3Bvb25hY3VsYXJDbGllbnQoKTtcbiAgICBjb25zdCBwYXJhbXMgPSBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMgfHwge307XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuZ2V0PFJlY2lwZURldGFpbHM+KHtcbiAgICAgIGVuZHBvaW50OiBgL3JlY2lwZXMvJHtyZWNpcGVJZE51bX0vaW5mb3JtYXRpb25gLFxuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIGluY2x1ZGVOdXRyaXRpb246IHBhcmFtcy5pbmNsdWRlTnV0cml0aW9uICE9PSAnZmFsc2UnLFxuICAgICAgfSxcbiAgICB9KTtcblxuICAgIC8vIFRyYW5zZm9ybSB0aGUgcmVzcG9uc2UgdG8gaW5jbHVkZSBmb3JtYXR0ZWQgaW5zdHJ1Y3Rpb25zXG4gICAgY29uc3QgdHJhbnNmb3JtZWRSZXN1bHQgPSB7XG4gICAgICAuLi5yZXN1bHQsXG4gICAgICBpbnN0cnVjdGlvbnM6IGZvcm1hdEluc3RydWN0aW9ucyhyZXN1bHQpLFxuICAgIH07XG5cbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHRyYW5zZm9ybWVkUmVzdWx0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSZWNpcGUgZGV0YWlscyBlcnJvcjonLCBlcnJvcik7XG5cbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBTcG9vbmFjdWxhckVycm9yKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlLCBlcnJvci5zdGF0dXMsIGVycm9yLmRldGFpbHMpO1xuICAgIH1cblxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlLCA1MDApO1xuICAgIH1cblxuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdGYWlsZWQgdG8gZmV0Y2ggcmVjaXBlIGRldGFpbHMnLCA1MDApO1xuICB9XG59XG5cbi8qKlxuICogRm9ybWF0IGluc3RydWN0aW9ucyBmcm9tIGFuYWx5emVkSW5zdHJ1Y3Rpb25zIHRvIGEgc2ltcGxlciBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gZm9ybWF0SW5zdHJ1Y3Rpb25zKHJlY2lwZTogUmVjaXBlRGV0YWlscyk6IEZvcm1hdHRlZEluc3RydWN0aW9uW10ge1xuICBpZiAoIXJlY2lwZS5hbmFseXplZEluc3RydWN0aW9ucyB8fCByZWNpcGUuYW5hbHl6ZWRJbnN0cnVjdGlvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgY29uc3QgaW5zdHJ1Y3Rpb25zOiBGb3JtYXR0ZWRJbnN0cnVjdGlvbltdID0gW107XG5cbiAgZm9yIChjb25zdCBpbnN0cnVjdGlvbiBvZiByZWNpcGUuYW5hbHl6ZWRJbnN0cnVjdGlvbnMpIHtcbiAgICBmb3IgKGNvbnN0IHN0ZXAgb2YgaW5zdHJ1Y3Rpb24uc3RlcHMpIHtcbiAgICAgIGluc3RydWN0aW9ucy5wdXNoKHtcbiAgICAgICAgbnVtYmVyOiBzdGVwLm51bWJlcixcbiAgICAgICAgc3RlcDogc3RlcC5zdGVwLFxuICAgICAgICBpbmdyZWRpZW50czogc3RlcC5pbmdyZWRpZW50cz8ubWFwKChpbmcpID0+IGluZy5uYW1lKSB8fCBbXSxcbiAgICAgICAgZXF1aXBtZW50OiBzdGVwLmVxdWlwbWVudD8ubWFwKChlcSkgPT4gZXEubmFtZSkgfHwgW10sXG4gICAgICAgIGxlbmd0aDogc3RlcC5sZW5ndGgsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaW5zdHJ1Y3Rpb25zO1xufVxuXG5pbnRlcmZhY2UgRm9ybWF0dGVkSW5zdHJ1Y3Rpb24ge1xuICBudW1iZXI6IG51bWJlcjtcbiAgc3RlcDogc3RyaW5nO1xuICBpbmdyZWRpZW50czogc3RyaW5nW107XG4gIGVxdWlwbWVudDogc3RyaW5nW107XG4gIGxlbmd0aD86IHtcbiAgICBudW1iZXI6IG51bWJlcjtcbiAgICB1bml0OiBzdHJpbmc7XG4gIH07XG59XG4iXX0=