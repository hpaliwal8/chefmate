"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const response_utils_1 = require("../shared/response-utils");
const spoonacular_client_1 = require("../shared/spoonacular-client");
/**
 * Recipe Search Lambda Handler
 *
 * GET /recipes/search
 *
 * Query Parameters:
 * - query: Search query string
 * - diet: Diet type (vegetarian, vegan, glutenFree, etc.)
 * - cuisine: Cuisine type (italian, mexican, indian, etc.)
 * - maxReadyTime: Maximum preparation time in minutes
 * - number: Number of results (default: 10, max: 100)
 * - offset: Results offset for pagination
 * - includeNutrition: Include nutrition info (default: true)
 * - ingredients: Comma-separated list of ingredients to include (for ingredient-based search)
 * - excludeIngredients: Comma-separated list of ingredients to exclude
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
        const client = (0, spoonacular_client_1.createSpoonacularClient)();
        const params = event.queryStringParameters || {};
        // Build search parameters
        const searchParams = {
            query: params.query,
            diet: params.diet,
            cuisine: params.cuisine,
            maxReadyTime: params.maxReadyTime ? parseInt(params.maxReadyTime, 10) : undefined,
            number: params.number ? parseInt(params.number, 10) : 10,
            offset: params.offset ? parseInt(params.offset, 10) : 0,
            addRecipeNutrition: params.includeNutrition !== 'false',
            addRecipeInformation: true,
            fillIngredients: true,
            instructionsRequired: true,
        };
        // Add ingredient-based search parameters
        if (params.ingredients) {
            searchParams.includeIngredients = params.ingredients;
        }
        if (params.excludeIngredients) {
            searchParams.excludeIngredients = params.excludeIngredients;
        }
        // Add multiple diet/intolerances if provided
        if (params.intolerances) {
            searchParams.intolerances = params.intolerances;
        }
        if (params.type) {
            searchParams.type = params.type;
        }
        const result = await client.get({
            endpoint: '/recipes/complexSearch',
            params: searchParams,
        });
        return (0, response_utils_1.successResponse)(result);
    }
    catch (error) {
        console.error('Recipe search error:', error);
        if (error instanceof spoonacular_client_1.SpoonacularError) {
            return (0, response_utils_1.errorResponse)(error.message, error.status, error.details);
        }
        if (error instanceof Error) {
            return (0, response_utils_1.errorResponse)(error.message, 500);
        }
        return (0, response_utils_1.errorResponse)('Failed to search recipes', 500);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTRCQSwwQkFrRUM7QUE3RkQsNkRBSWtDO0FBQ2xDLHFFQUlzQztBQUV0Qzs7Ozs7Ozs7Ozs7Ozs7O0dBZUc7QUFDSSxLQUFLLFVBQVUsT0FBTyxDQUMzQixLQUEyQjtJQUUzQix3QkFBd0I7SUFDeEIsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ25DLE9BQU8sSUFBQSxzQ0FBcUIsR0FBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssS0FBSyxFQUFFLENBQUM7UUFDL0IsT0FBTyxJQUFBLDhCQUFhLEVBQUMsb0JBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELElBQUksQ0FBQztRQUNILE1BQU0sTUFBTSxHQUFHLElBQUEsNENBQXVCLEdBQUUsQ0FBQztRQUN6QyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMscUJBQXFCLElBQUksRUFBRSxDQUFDO1FBRWpELDBCQUEwQjtRQUMxQixNQUFNLFlBQVksR0FBMEQ7WUFDMUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO1lBQ25CLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtZQUNqQixPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU87WUFDdkIsWUFBWSxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ2pGLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN4RCxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkQsa0JBQWtCLEVBQUUsTUFBTSxDQUFDLGdCQUFnQixLQUFLLE9BQU87WUFDdkQsb0JBQW9CLEVBQUUsSUFBSTtZQUMxQixlQUFlLEVBQUUsSUFBSTtZQUNyQixvQkFBb0IsRUFBRSxJQUFJO1NBQzNCLENBQUM7UUFFRix5Q0FBeUM7UUFDekMsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdkIsWUFBWSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDdkQsQ0FBQztRQUNELElBQUksTUFBTSxDQUFDLGtCQUFrQixFQUFFLENBQUM7WUFDOUIsWUFBWSxDQUFDLGtCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQztRQUM5RCxDQUFDO1FBRUQsNkNBQTZDO1FBQzdDLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3hCLFlBQVksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsWUFBWSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQXFCO1lBQ2xELFFBQVEsRUFBRSx3QkFBd0I7WUFDbEMsTUFBTSxFQUFFLFlBQVk7U0FDckIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLGdDQUFlLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTdDLElBQUksS0FBSyxZQUFZLHFDQUFnQixFQUFFLENBQUM7WUFDdEMsT0FBTyxJQUFBLDhCQUFhLEVBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFLENBQUM7WUFDM0IsT0FBTyxJQUFBLDhCQUFhLEVBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsT0FBTyxJQUFBLDhCQUFhLEVBQUMsMEJBQTBCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEQsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQge1xuICBzdWNjZXNzUmVzcG9uc2UsXG4gIGVycm9yUmVzcG9uc2UsXG4gIGNvcnNQcmVmbGlnaHRSZXNwb25zZSxcbn0gZnJvbSAnLi4vc2hhcmVkL3Jlc3BvbnNlLXV0aWxzJztcbmltcG9ydCB7XG4gIGNyZWF0ZVNwb29uYWN1bGFyQ2xpZW50LFxuICBTcG9vbmFjdWxhckVycm9yLFxuICBSZWNpcGVTZWFyY2hSZXN1bHQsXG59IGZyb20gJy4uL3NoYXJlZC9zcG9vbmFjdWxhci1jbGllbnQnO1xuXG4vKipcbiAqIFJlY2lwZSBTZWFyY2ggTGFtYmRhIEhhbmRsZXJcbiAqXG4gKiBHRVQgL3JlY2lwZXMvc2VhcmNoXG4gKlxuICogUXVlcnkgUGFyYW1ldGVyczpcbiAqIC0gcXVlcnk6IFNlYXJjaCBxdWVyeSBzdHJpbmdcbiAqIC0gZGlldDogRGlldCB0eXBlICh2ZWdldGFyaWFuLCB2ZWdhbiwgZ2x1dGVuRnJlZSwgZXRjLilcbiAqIC0gY3Vpc2luZTogQ3Vpc2luZSB0eXBlIChpdGFsaWFuLCBtZXhpY2FuLCBpbmRpYW4sIGV0Yy4pXG4gKiAtIG1heFJlYWR5VGltZTogTWF4aW11bSBwcmVwYXJhdGlvbiB0aW1lIGluIG1pbnV0ZXNcbiAqIC0gbnVtYmVyOiBOdW1iZXIgb2YgcmVzdWx0cyAoZGVmYXVsdDogMTAsIG1heDogMTAwKVxuICogLSBvZmZzZXQ6IFJlc3VsdHMgb2Zmc2V0IGZvciBwYWdpbmF0aW9uXG4gKiAtIGluY2x1ZGVOdXRyaXRpb246IEluY2x1ZGUgbnV0cml0aW9uIGluZm8gKGRlZmF1bHQ6IHRydWUpXG4gKiAtIGluZ3JlZGllbnRzOiBDb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBpbmdyZWRpZW50cyB0byBpbmNsdWRlIChmb3IgaW5ncmVkaWVudC1iYXNlZCBzZWFyY2gpXG4gKiAtIGV4Y2x1ZGVJbmdyZWRpZW50czogQ29tbWEtc2VwYXJhdGVkIGxpc3Qgb2YgaW5ncmVkaWVudHMgdG8gZXhjbHVkZVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4ge1xuICAvLyBIYW5kbGUgQ09SUyBwcmVmbGlnaHRcbiAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgIHJldHVybiBjb3JzUHJlZmxpZ2h0UmVzcG9uc2UoKTtcbiAgfVxuXG4gIGlmIChldmVudC5odHRwTWV0aG9kICE9PSAnR0VUJykge1xuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdNZXRob2Qgbm90IGFsbG93ZWQnLCA0MDUpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVTcG9vbmFjdWxhckNsaWVudCgpO1xuICAgIGNvbnN0IHBhcmFtcyA9IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycyB8fCB7fTtcblxuICAgIC8vIEJ1aWxkIHNlYXJjaCBwYXJhbWV0ZXJzXG4gICAgY29uc3Qgc2VhcmNoUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgdW5kZWZpbmVkPiA9IHtcbiAgICAgIHF1ZXJ5OiBwYXJhbXMucXVlcnksXG4gICAgICBkaWV0OiBwYXJhbXMuZGlldCxcbiAgICAgIGN1aXNpbmU6IHBhcmFtcy5jdWlzaW5lLFxuICAgICAgbWF4UmVhZHlUaW1lOiBwYXJhbXMubWF4UmVhZHlUaW1lID8gcGFyc2VJbnQocGFyYW1zLm1heFJlYWR5VGltZSwgMTApIDogdW5kZWZpbmVkLFxuICAgICAgbnVtYmVyOiBwYXJhbXMubnVtYmVyID8gcGFyc2VJbnQocGFyYW1zLm51bWJlciwgMTApIDogMTAsXG4gICAgICBvZmZzZXQ6IHBhcmFtcy5vZmZzZXQgPyBwYXJzZUludChwYXJhbXMub2Zmc2V0LCAxMCkgOiAwLFxuICAgICAgYWRkUmVjaXBlTnV0cml0aW9uOiBwYXJhbXMuaW5jbHVkZU51dHJpdGlvbiAhPT0gJ2ZhbHNlJyxcbiAgICAgIGFkZFJlY2lwZUluZm9ybWF0aW9uOiB0cnVlLFxuICAgICAgZmlsbEluZ3JlZGllbnRzOiB0cnVlLFxuICAgICAgaW5zdHJ1Y3Rpb25zUmVxdWlyZWQ6IHRydWUsXG4gICAgfTtcblxuICAgIC8vIEFkZCBpbmdyZWRpZW50LWJhc2VkIHNlYXJjaCBwYXJhbWV0ZXJzXG4gICAgaWYgKHBhcmFtcy5pbmdyZWRpZW50cykge1xuICAgICAgc2VhcmNoUGFyYW1zLmluY2x1ZGVJbmdyZWRpZW50cyA9IHBhcmFtcy5pbmdyZWRpZW50cztcbiAgICB9XG4gICAgaWYgKHBhcmFtcy5leGNsdWRlSW5ncmVkaWVudHMpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy5leGNsdWRlSW5ncmVkaWVudHMgPSBwYXJhbXMuZXhjbHVkZUluZ3JlZGllbnRzO1xuICAgIH1cblxuICAgIC8vIEFkZCBtdWx0aXBsZSBkaWV0L2ludG9sZXJhbmNlcyBpZiBwcm92aWRlZFxuICAgIGlmIChwYXJhbXMuaW50b2xlcmFuY2VzKSB7XG4gICAgICBzZWFyY2hQYXJhbXMuaW50b2xlcmFuY2VzID0gcGFyYW1zLmludG9sZXJhbmNlcztcbiAgICB9XG5cbiAgICBpZiAocGFyYW1zLnR5cGUpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy50eXBlID0gcGFyYW1zLnR5cGU7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LmdldDxSZWNpcGVTZWFyY2hSZXN1bHQ+KHtcbiAgICAgIGVuZHBvaW50OiAnL3JlY2lwZXMvY29tcGxleFNlYXJjaCcsXG4gICAgICBwYXJhbXM6IHNlYXJjaFBhcmFtcyxcbiAgICB9KTtcblxuICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2UocmVzdWx0KTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdSZWNpcGUgc2VhcmNoIGVycm9yOicsIGVycm9yKTtcblxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFNwb29uYWN1bGFyRXJyb3IpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UsIGVycm9yLnN0YXR1cywgZXJyb3IuZGV0YWlscyk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UsIDUwMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ0ZhaWxlZCB0byBzZWFyY2ggcmVjaXBlcycsIDUwMCk7XG4gIH1cbn1cbiJdfQ==