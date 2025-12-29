"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const response_utils_1 = require("../shared/response-utils");
const spoonacular_client_1 = require("../shared/spoonacular-client");
/**
 * Meal Planner Lambda Handler
 *
 * GET /meal-plan/generate
 *
 * Query Parameters:
 * - timeFrame: 'day' or 'week' (default: 'day')
 * - targetCalories: Target calories per day (default: 2000)
 * - diet: Diet type (vegetarian, vegan, etc.)
 * - exclude: Ingredients to exclude (comma-separated)
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
        const timeFrame = params.timeFrame || 'day';
        const targetCalories = params.targetCalories
            ? parseInt(params.targetCalories, 10)
            : 2000;
        if (timeFrame !== 'day' && timeFrame !== 'week') {
            return (0, response_utils_1.errorResponse)('timeFrame must be "day" or "week"', 400);
        }
        const searchParams = {
            timeFrame,
            targetCalories,
            diet: params.diet,
            exclude: params.exclude,
        };
        const result = await client.get({
            endpoint: '/mealplanner/generate',
            params: searchParams,
        });
        // Transform the response based on timeFrame
        const transformedResult = transformMealPlan(result, timeFrame);
        return (0, response_utils_1.successResponse)(transformedResult);
    }
    catch (error) {
        console.error('Meal planner error:', error);
        if (error instanceof spoonacular_client_1.SpoonacularError) {
            return (0, response_utils_1.errorResponse)(error.message, error.status, error.details);
        }
        if (error instanceof Error) {
            return (0, response_utils_1.errorResponse)(error.message, 500);
        }
        return (0, response_utils_1.errorResponse)('Failed to generate meal plan', 500);
    }
}
/**
 * Transform meal plan response to a consistent format
 */
function transformMealPlan(result, timeFrame) {
    if (timeFrame === 'day') {
        const dayPlan = result;
        return {
            timeFrame: 'day',
            days: [
                {
                    day: 'today',
                    meals: dayPlan.meals.map(transformMeal),
                    nutrients: dayPlan.nutrients,
                },
            ],
        };
    }
    const weekPlan = result;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return {
        timeFrame: 'week',
        days: days.map((day) => ({
            day,
            meals: weekPlan.week[day].meals.map(transformMeal),
            nutrients: weekPlan.week[day].nutrients,
        })),
    };
}
function transformMeal(meal) {
    return {
        id: meal.id,
        title: meal.title,
        readyInMinutes: meal.readyInMinutes,
        servings: meal.servings,
        sourceUrl: meal.sourceUrl,
        image: `https://spoonacular.com/recipeImages/${meal.id}-556x370.${meal.imageType}`,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQXdCQSwwQkFzREM7QUE3RUQsNkRBSWtDO0FBQ2xDLHFFQUtzQztBQUV0Qzs7Ozs7Ozs7OztHQVVHO0FBQ0ksS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkI7SUFFM0Isd0JBQXdCO0lBQ3hCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPLElBQUEsc0NBQXFCLEdBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsSUFBSSxLQUFLLENBQUMsVUFBVSxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQy9CLE9BQU8sSUFBQSw4QkFBYSxFQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxJQUFBLDRDQUF1QixHQUFFLENBQUM7UUFDekMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixJQUFJLEVBQUUsQ0FBQztRQUVqRCxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxJQUFJLEtBQUssQ0FBQztRQUM1QyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsY0FBYztZQUMxQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFFVCxJQUFJLFNBQVMsS0FBSyxLQUFLLElBQUksU0FBUyxLQUFLLE1BQU0sRUFBRSxDQUFDO1lBQ2hELE9BQU8sSUFBQSw4QkFBYSxFQUFDLG1DQUFtQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFFRCxNQUFNLFlBQVksR0FBMEQ7WUFDMUUsU0FBUztZQUNULGNBQWM7WUFDZCxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7WUFDakIsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO1NBQ3hCLENBQUM7UUFFRixNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQTZCO1lBQzFELFFBQVEsRUFBRSx1QkFBdUI7WUFDakMsTUFBTSxFQUFFLFlBQVk7U0FDckIsQ0FBQyxDQUFDO1FBRUgsNENBQTRDO1FBQzVDLE1BQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBRS9ELE9BQU8sSUFBQSxnQ0FBZSxFQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTVDLElBQUksS0FBSyxZQUFZLHFDQUFnQixFQUFFLENBQUM7WUFDdEMsT0FBTyxJQUFBLDhCQUFhLEVBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFLENBQUM7WUFDM0IsT0FBTyxJQUFBLDhCQUFhLEVBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBRUQsT0FBTyxJQUFBLDhCQUFhLEVBQUMsOEJBQThCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDNUQsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsaUJBQWlCLENBQ3hCLE1BQWtDLEVBQ2xDLFNBQXlCO0lBRXpCLElBQUksU0FBUyxLQUFLLEtBQUssRUFBRSxDQUFDO1FBQ3hCLE1BQU0sT0FBTyxHQUFHLE1BQXFCLENBQUM7UUFDdEMsT0FBTztZQUNMLFNBQVMsRUFBRSxLQUFLO1lBQ2hCLElBQUksRUFBRTtnQkFDSjtvQkFDRSxHQUFHLEVBQUUsT0FBTztvQkFDWixLQUFLLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO29CQUN2QyxTQUFTLEVBQUUsT0FBTyxDQUFDLFNBQVM7aUJBQzdCO2FBQ0Y7U0FDRixDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sUUFBUSxHQUFHLE1BQXNCLENBQUM7SUFDeEMsTUFBTSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQVUsQ0FBQztJQUVyRyxPQUFPO1FBQ0wsU0FBUyxFQUFFLE1BQU07UUFDakIsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDdkIsR0FBRztZQUNILEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDO1lBQ2xELFNBQVMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVM7U0FDeEMsQ0FBQyxDQUFDO0tBQ0osQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLGFBQWEsQ0FBQyxJQUE2QjtJQUNsRCxPQUFPO1FBQ0wsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1FBQ1gsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1FBQ2pCLGNBQWMsRUFBRSxJQUFJLENBQUMsY0FBYztRQUNuQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7UUFDdkIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1FBQ3pCLEtBQUssRUFBRSx3Q0FBd0MsSUFBSSxDQUFDLEVBQUUsWUFBWSxJQUFJLENBQUMsU0FBUyxFQUFFO0tBQ25GLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHtcbiAgc3VjY2Vzc1Jlc3BvbnNlLFxuICBlcnJvclJlc3BvbnNlLFxuICBjb3JzUHJlZmxpZ2h0UmVzcG9uc2UsXG59IGZyb20gJy4uL3NoYXJlZC9yZXNwb25zZS11dGlscyc7XG5pbXBvcnQge1xuICBjcmVhdGVTcG9vbmFjdWxhckNsaWVudCxcbiAgU3Bvb25hY3VsYXJFcnJvcixcbiAgTWVhbFBsYW5EYXksXG4gIE1lYWxQbGFuV2Vlayxcbn0gZnJvbSAnLi4vc2hhcmVkL3Nwb29uYWN1bGFyLWNsaWVudCc7XG5cbi8qKlxuICogTWVhbCBQbGFubmVyIExhbWJkYSBIYW5kbGVyXG4gKlxuICogR0VUIC9tZWFsLXBsYW4vZ2VuZXJhdGVcbiAqXG4gKiBRdWVyeSBQYXJhbWV0ZXJzOlxuICogLSB0aW1lRnJhbWU6ICdkYXknIG9yICd3ZWVrJyAoZGVmYXVsdDogJ2RheScpXG4gKiAtIHRhcmdldENhbG9yaWVzOiBUYXJnZXQgY2Fsb3JpZXMgcGVyIGRheSAoZGVmYXVsdDogMjAwMClcbiAqIC0gZGlldDogRGlldCB0eXBlICh2ZWdldGFyaWFuLCB2ZWdhbiwgZXRjLilcbiAqIC0gZXhjbHVkZTogSW5ncmVkaWVudHMgdG8gZXhjbHVkZSAoY29tbWEtc2VwYXJhdGVkKVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihcbiAgZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50XG4pOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4ge1xuICAvLyBIYW5kbGUgQ09SUyBwcmVmbGlnaHRcbiAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgIHJldHVybiBjb3JzUHJlZmxpZ2h0UmVzcG9uc2UoKTtcbiAgfVxuXG4gIGlmIChldmVudC5odHRwTWV0aG9kICE9PSAnR0VUJykge1xuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdNZXRob2Qgbm90IGFsbG93ZWQnLCA0MDUpO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBjbGllbnQgPSBjcmVhdGVTcG9vbmFjdWxhckNsaWVudCgpO1xuICAgIGNvbnN0IHBhcmFtcyA9IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycyB8fCB7fTtcblxuICAgIGNvbnN0IHRpbWVGcmFtZSA9IHBhcmFtcy50aW1lRnJhbWUgfHwgJ2RheSc7XG4gICAgY29uc3QgdGFyZ2V0Q2Fsb3JpZXMgPSBwYXJhbXMudGFyZ2V0Q2Fsb3JpZXNcbiAgICAgID8gcGFyc2VJbnQocGFyYW1zLnRhcmdldENhbG9yaWVzLCAxMClcbiAgICAgIDogMjAwMDtcblxuICAgIGlmICh0aW1lRnJhbWUgIT09ICdkYXknICYmIHRpbWVGcmFtZSAhPT0gJ3dlZWsnKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSgndGltZUZyYW1lIG11c3QgYmUgXCJkYXlcIiBvciBcIndlZWtcIicsIDQwMCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VhcmNoUGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgdW5kZWZpbmVkPiA9IHtcbiAgICAgIHRpbWVGcmFtZSxcbiAgICAgIHRhcmdldENhbG9yaWVzLFxuICAgICAgZGlldDogcGFyYW1zLmRpZXQsXG4gICAgICBleGNsdWRlOiBwYXJhbXMuZXhjbHVkZSxcbiAgICB9O1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LmdldDxNZWFsUGxhbkRheSB8IE1lYWxQbGFuV2Vlaz4oe1xuICAgICAgZW5kcG9pbnQ6ICcvbWVhbHBsYW5uZXIvZ2VuZXJhdGUnLFxuICAgICAgcGFyYW1zOiBzZWFyY2hQYXJhbXMsXG4gICAgfSk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIHJlc3BvbnNlIGJhc2VkIG9uIHRpbWVGcmFtZVxuICAgIGNvbnN0IHRyYW5zZm9ybWVkUmVzdWx0ID0gdHJhbnNmb3JtTWVhbFBsYW4ocmVzdWx0LCB0aW1lRnJhbWUpO1xuXG4gICAgcmV0dXJuIHN1Y2Nlc3NSZXNwb25zZSh0cmFuc2Zvcm1lZFJlc3VsdCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignTWVhbCBwbGFubmVyIGVycm9yOicsIGVycm9yKTtcblxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIFNwb29uYWN1bGFyRXJyb3IpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UsIGVycm9yLnN0YXR1cywgZXJyb3IuZGV0YWlscyk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKGVycm9yLm1lc3NhZ2UsIDUwMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoJ0ZhaWxlZCB0byBnZW5lcmF0ZSBtZWFsIHBsYW4nLCA1MDApO1xuICB9XG59XG5cbi8qKlxuICogVHJhbnNmb3JtIG1lYWwgcGxhbiByZXNwb25zZSB0byBhIGNvbnNpc3RlbnQgZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIHRyYW5zZm9ybU1lYWxQbGFuKFxuICByZXN1bHQ6IE1lYWxQbGFuRGF5IHwgTWVhbFBsYW5XZWVrLFxuICB0aW1lRnJhbWU6ICdkYXknIHwgJ3dlZWsnXG4pOiBUcmFuc2Zvcm1lZE1lYWxQbGFuIHtcbiAgaWYgKHRpbWVGcmFtZSA9PT0gJ2RheScpIHtcbiAgICBjb25zdCBkYXlQbGFuID0gcmVzdWx0IGFzIE1lYWxQbGFuRGF5O1xuICAgIHJldHVybiB7XG4gICAgICB0aW1lRnJhbWU6ICdkYXknLFxuICAgICAgZGF5czogW1xuICAgICAgICB7XG4gICAgICAgICAgZGF5OiAndG9kYXknLFxuICAgICAgICAgIG1lYWxzOiBkYXlQbGFuLm1lYWxzLm1hcCh0cmFuc2Zvcm1NZWFsKSxcbiAgICAgICAgICBudXRyaWVudHM6IGRheVBsYW4ubnV0cmllbnRzLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuICB9XG5cbiAgY29uc3Qgd2Vla1BsYW4gPSByZXN1bHQgYXMgTWVhbFBsYW5XZWVrO1xuICBjb25zdCBkYXlzID0gWydtb25kYXknLCAndHVlc2RheScsICd3ZWRuZXNkYXknLCAndGh1cnNkYXknLCAnZnJpZGF5JywgJ3NhdHVyZGF5JywgJ3N1bmRheSddIGFzIGNvbnN0O1xuXG4gIHJldHVybiB7XG4gICAgdGltZUZyYW1lOiAnd2VlaycsXG4gICAgZGF5czogZGF5cy5tYXAoKGRheSkgPT4gKHtcbiAgICAgIGRheSxcbiAgICAgIG1lYWxzOiB3ZWVrUGxhbi53ZWVrW2RheV0ubWVhbHMubWFwKHRyYW5zZm9ybU1lYWwpLFxuICAgICAgbnV0cmllbnRzOiB3ZWVrUGxhbi53ZWVrW2RheV0ubnV0cmllbnRzLFxuICAgIH0pKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gdHJhbnNmb3JtTWVhbChtZWFsOiBNZWFsUGxhbkRheVsnbWVhbHMnXVswXSk6IFRyYW5zZm9ybWVkTWVhbCB7XG4gIHJldHVybiB7XG4gICAgaWQ6IG1lYWwuaWQsXG4gICAgdGl0bGU6IG1lYWwudGl0bGUsXG4gICAgcmVhZHlJbk1pbnV0ZXM6IG1lYWwucmVhZHlJbk1pbnV0ZXMsXG4gICAgc2VydmluZ3M6IG1lYWwuc2VydmluZ3MsXG4gICAgc291cmNlVXJsOiBtZWFsLnNvdXJjZVVybCxcbiAgICBpbWFnZTogYGh0dHBzOi8vc3Bvb25hY3VsYXIuY29tL3JlY2lwZUltYWdlcy8ke21lYWwuaWR9LTU1NngzNzAuJHttZWFsLmltYWdlVHlwZX1gLFxuICB9O1xufVxuXG5pbnRlcmZhY2UgVHJhbnNmb3JtZWRNZWFsIHtcbiAgaWQ6IG51bWJlcjtcbiAgdGl0bGU6IHN0cmluZztcbiAgcmVhZHlJbk1pbnV0ZXM6IG51bWJlcjtcbiAgc2VydmluZ3M6IG51bWJlcjtcbiAgc291cmNlVXJsOiBzdHJpbmc7XG4gIGltYWdlOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBUcmFuc2Zvcm1lZE1lYWxQbGFuRGF5IHtcbiAgZGF5OiBzdHJpbmc7XG4gIG1lYWxzOiBUcmFuc2Zvcm1lZE1lYWxbXTtcbiAgbnV0cmllbnRzOiB7XG4gICAgY2Fsb3JpZXM6IG51bWJlcjtcbiAgICBwcm90ZWluOiBudW1iZXI7XG4gICAgZmF0OiBudW1iZXI7XG4gICAgY2FyYm9oeWRyYXRlczogbnVtYmVyO1xuICB9O1xufVxuXG5pbnRlcmZhY2UgVHJhbnNmb3JtZWRNZWFsUGxhbiB7XG4gIHRpbWVGcmFtZTogJ2RheScgfCAnd2Vlayc7XG4gIGRheXM6IFRyYW5zZm9ybWVkTWVhbFBsYW5EYXlbXTtcbn1cbiJdfQ==