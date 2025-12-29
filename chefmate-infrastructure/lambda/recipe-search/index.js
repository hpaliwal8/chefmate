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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTBCQSwwQkEwREM7QUFuRkQsNkRBSWtDO0FBQ2xDLHFFQUlzQztBQUV0Qzs7Ozs7Ozs7Ozs7OztHQWFHO0FBQ0ksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkI7SUFFM0Isd0JBQXdCO0lBQ3hCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPLElBQUEsc0NBQXFCLEdBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQy9CLE9BQU8sSUFBQSw4QkFBYSxFQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxJQUFBLDRDQUF1QixHQUFFLENBQUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixJQUFJLEVBQUUsQ0FBQztRQUVqRCwwQkFBMEI7UUFDMUIsTUFBTSxZQUFZLEdBQTBEO1lBQzFFLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSztZQUNuQixJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1lBQ3ZCLFlBQVksRUFBRSxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUztZQUNqRixNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDeEQsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZELGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxnQkFBZ0IsS0FBSyxPQUFPO1lBQ3ZELG9CQUFvQixFQUFFLElBQUk7WUFDMUIsZUFBZSxFQUFFLElBQUk7WUFDckIsb0JBQW9CLEVBQUUsSUFBSTtTQUMzQixDQUFDO1FBRUYsNkNBQTZDO1FBQzdDLElBQUksTUFBTSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3hCLFlBQVksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQztRQUNsRCxDQUFDO1FBRUQsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsWUFBWSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQXFCO1lBQ2xELFFBQVEsRUFBRSx3QkFBd0I7WUFDbEMsTUFBTSxFQUFFLFlBQVk7U0FDckIsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFBLGdDQUFlLEVBQUMsTUFBTSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTdDLElBQUksS0FBSyxZQUFZLHFDQUFnQixFQUFFLENBQUM7WUFDdEMsT0FBTyxJQUFBLDhCQUFhLEVBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFLENBQUM7WUFDM0IsT0FBTyxJQUFBLDhCQUFhLEVBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsT0FBTyxJQUFBLDhCQUFhLEVBQUMsMEJBQTBCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDeEQsQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQge1xuICBzdWNjZXNzUmVzcG9uc2UsXG4gIGVycm9yUmVzcG9uc2UsXG4gIGNvcnNQcmVmbGlnaHRSZXNwb25zZSxcbn0gZnJvbSAnLi4vc2hhcmVkL3Jlc3BvbnNlLXV0aWxzJztcbmltcG9ydCB7XG4gIGNyZWF0ZVNwb29uYWN1bGFyQ2xpZW50LFxuICBTcG9vbmFjdWxhckVycm9yLFxuICBSZWNpcGVTZWFyY2hSZXN1bHQsXG59IGZyb20gJy4uL3NoYXJlZC9zcG9vbmFjdWxhci1jbGllbnQnO1xuXG4vKipcbiAqIFJlY2lwZSBTZWFyY2ggTGFtYmRhIEhhbmRsZXJcbiAqXG4gKiBHRVQgL3JlY2lwZXMvc2VhcmNoXG4gKlxuICogUXVlcnkgUGFyYW1ldGVyczpcbiAqIC0gcXVlcnk6IFNlYXJjaCBxdWVyeSBzdHJpbmdcbiAqIC0gZGlldDogRGlldCB0eXBlICh2ZWdldGFyaWFuLCB2ZWdhbiwgZ2x1dGVuRnJlZSwgZXRjLilcbiAqIC0gY3Vpc2luZTogQ3Vpc2luZSB0eXBlIChpdGFsaWFuLCBtZXhpY2FuLCBpbmRpYW4sIGV0Yy4pXG4gKiAtIG1heFJlYWR5VGltZTogTWF4aW11bSBwcmVwYXJhdGlvbiB0aW1lIGluIG1pbnV0ZXNcbiAqIC0gbnVtYmVyOiBOdW1iZXIgb2YgcmVzdWx0cyAoZGVmYXVsdDogMTAsIG1heDogMTAwKVxuICogLSBvZmZzZXQ6IFJlc3VsdHMgb2Zmc2V0IGZvciBwYWdpbmF0aW9uXG4gKiAtIGluY2x1ZGVOdXRyaXRpb246IEluY2x1ZGUgbnV0cml0aW9uIGluZm8gKGRlZmF1bHQ6IHRydWUpXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKFxuICBldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnRcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gIC8vIEhhbmRsZSBDT1JTIHByZWZsaWdodFxuICBpZiAoZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgcmV0dXJuIGNvcnNQcmVmbGlnaHRSZXNwb25zZSgpO1xuICB9XG5cbiAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgIT09ICdHRVQnKSB7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ01ldGhvZCBub3QgYWxsb3dlZCcsIDQwNSk7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IGNsaWVudCA9IGNyZWF0ZVNwb29uYWN1bGFyQ2xpZW50KCk7XG4gICAgY29uc3QgcGFyYW1zID0gZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzIHx8IHt9O1xuXG4gICAgLy8gQnVpbGQgc2VhcmNoIHBhcmFtZXRlcnNcbiAgICBjb25zdCBzZWFyY2hQYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfCB1bmRlZmluZWQ+ID0ge1xuICAgICAgcXVlcnk6IHBhcmFtcy5xdWVyeSxcbiAgICAgIGRpZXQ6IHBhcmFtcy5kaWV0LFxuICAgICAgY3Vpc2luZTogcGFyYW1zLmN1aXNpbmUsXG4gICAgICBtYXhSZWFkeVRpbWU6IHBhcmFtcy5tYXhSZWFkeVRpbWUgPyBwYXJzZUludChwYXJhbXMubWF4UmVhZHlUaW1lLCAxMCkgOiB1bmRlZmluZWQsXG4gICAgICBudW1iZXI6IHBhcmFtcy5udW1iZXIgPyBwYXJzZUludChwYXJhbXMubnVtYmVyLCAxMCkgOiAxMCxcbiAgICAgIG9mZnNldDogcGFyYW1zLm9mZnNldCA/IHBhcnNlSW50KHBhcmFtcy5vZmZzZXQsIDEwKSA6IDAsXG4gICAgICBhZGRSZWNpcGVOdXRyaXRpb246IHBhcmFtcy5pbmNsdWRlTnV0cml0aW9uICE9PSAnZmFsc2UnLFxuICAgICAgYWRkUmVjaXBlSW5mb3JtYXRpb246IHRydWUsXG4gICAgICBmaWxsSW5ncmVkaWVudHM6IHRydWUsXG4gICAgICBpbnN0cnVjdGlvbnNSZXF1aXJlZDogdHJ1ZSxcbiAgICB9O1xuXG4gICAgLy8gQWRkIG11bHRpcGxlIGRpZXQvaW50b2xlcmFuY2VzIGlmIHByb3ZpZGVkXG4gICAgaWYgKHBhcmFtcy5pbnRvbGVyYW5jZXMpIHtcbiAgICAgIHNlYXJjaFBhcmFtcy5pbnRvbGVyYW5jZXMgPSBwYXJhbXMuaW50b2xlcmFuY2VzO1xuICAgIH1cblxuICAgIGlmIChwYXJhbXMudHlwZSkge1xuICAgICAgc2VhcmNoUGFyYW1zLnR5cGUgPSBwYXJhbXMudHlwZTtcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBjbGllbnQuZ2V0PFJlY2lwZVNlYXJjaFJlc3VsdD4oe1xuICAgICAgZW5kcG9pbnQ6ICcvcmVjaXBlcy9jb21wbGV4U2VhcmNoJyxcbiAgICAgIHBhcmFtczogc2VhcmNoUGFyYW1zLFxuICAgIH0pO1xuXG4gICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZShyZXN1bHQpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1JlY2lwZSBzZWFyY2ggZXJyb3I6JywgZXJyb3IpO1xuXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgU3Bvb25hY3VsYXJFcnJvcikge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSwgZXJyb3Iuc3RhdHVzLCBlcnJvci5kZXRhaWxzKTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoZXJyb3IubWVzc2FnZSwgNTAwKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXJyb3JSZXNwb25zZSgnRmFpbGVkIHRvIHNlYXJjaCByZWNpcGVzJywgNTAwKTtcbiAgfVxufVxuIl19