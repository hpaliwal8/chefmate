"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const response_utils_1 = require("../shared/response-utils");
/**
 * User Preferences Lambda Handler
 *
 * This is a placeholder for Phase 2 (DynamoDB integration).
 * Currently returns mock data to maintain API compatibility.
 *
 * GET /user/preferences - Get user preferences
 * POST /user/preferences - Update user preferences
 */
// Default preferences for new users
const defaultPreferences = {
    dietaryRestrictions: [],
    favoriteCuisines: [],
    allergies: [],
    targetCalories: 2000,
    servingSize: 2,
    measurementSystem: 'us',
};
async function handler(event) {
    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return (0, response_utils_1.corsPreflightResponse)();
    }
    const method = event.httpMethod;
    try {
        switch (method) {
            case 'GET':
                return handleGetPreferences();
            case 'POST':
            case 'PUT':
                return handleUpdatePreferences(event);
            default:
                return (0, response_utils_1.errorResponse)('Method not allowed', 405);
        }
    }
    catch (error) {
        console.error('User preferences error:', error);
        if (error instanceof Error) {
            return (0, response_utils_1.errorResponse)(error.message, 500);
        }
        return (0, response_utils_1.errorResponse)('Failed to process preferences request', 500);
    }
}
/**
 * Handle GET request - Return user preferences
 * In Phase 2, this will fetch from DynamoDB
 */
async function handleGetPreferences() {
    // TODO: Phase 2 - Fetch from DynamoDB using user ID from Cognito
    // For now, return default preferences
    return (0, response_utils_1.successResponse)({
        preferences: defaultPreferences,
        message: 'Preferences retrieved successfully',
        // Flag to indicate this is placeholder data
        _isPlaceholder: true,
    });
}
/**
 * Handle POST/PUT request - Update user preferences
 * In Phase 2, this will persist to DynamoDB
 */
async function handleUpdatePreferences(event) {
    if (!event.body) {
        return (0, response_utils_1.errorResponse)('Request body is required', 400);
    }
    let preferences;
    try {
        preferences = JSON.parse(event.body);
    }
    catch {
        return (0, response_utils_1.errorResponse)('Invalid JSON in request body', 400);
    }
    // Validate preferences
    const validationError = validatePreferences(preferences);
    if (validationError) {
        return (0, response_utils_1.errorResponse)(validationError, 400);
    }
    // TODO: Phase 2 - Persist to DynamoDB using user ID from Cognito
    // For now, just return the merged preferences
    const mergedPreferences = {
        ...defaultPreferences,
        ...preferences,
    };
    return (0, response_utils_1.successResponse)({
        preferences: mergedPreferences,
        message: 'Preferences updated successfully',
        // Flag to indicate this is placeholder - not actually persisted
        _isPlaceholder: true,
    });
}
/**
 * Validate user preferences
 */
function validatePreferences(preferences) {
    if (preferences.dietaryRestrictions !== undefined) {
        if (!Array.isArray(preferences.dietaryRestrictions)) {
            return 'dietaryRestrictions must be an array';
        }
        const validDiets = ['vegetarian', 'vegan', 'glutenFree', 'dairyFree', 'keto', 'paleo', 'lowFodmap'];
        for (const diet of preferences.dietaryRestrictions) {
            if (!validDiets.includes(diet)) {
                return `Invalid dietary restriction: ${diet}`;
            }
        }
    }
    if (preferences.favoriteCuisines !== undefined) {
        if (!Array.isArray(preferences.favoriteCuisines)) {
            return 'favoriteCuisines must be an array';
        }
    }
    if (preferences.allergies !== undefined) {
        if (!Array.isArray(preferences.allergies)) {
            return 'allergies must be an array';
        }
    }
    if (preferences.targetCalories !== undefined) {
        if (typeof preferences.targetCalories !== 'number' || preferences.targetCalories < 500 || preferences.targetCalories > 10000) {
            return 'targetCalories must be a number between 500 and 10000';
        }
    }
    if (preferences.servingSize !== undefined) {
        if (typeof preferences.servingSize !== 'number' || preferences.servingSize < 1 || preferences.servingSize > 20) {
            return 'servingSize must be a number between 1 and 20';
        }
    }
    if (preferences.measurementSystem !== undefined) {
        if (!['us', 'metric'].includes(preferences.measurementSystem)) {
            return 'measurementSystem must be "us" or "metric"';
        }
    }
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQTJCQSwwQkErQkM7QUF6REQsNkRBSWtDO0FBRWxDOzs7Ozs7OztHQVFHO0FBRUgsb0NBQW9DO0FBQ3BDLE1BQU0sa0JBQWtCLEdBQW9CO0lBQzFDLG1CQUFtQixFQUFFLEVBQUU7SUFDdkIsZ0JBQWdCLEVBQUUsRUFBRTtJQUNwQixTQUFTLEVBQUUsRUFBRTtJQUNiLGNBQWMsRUFBRSxJQUFJO0lBQ3BCLFdBQVcsRUFBRSxDQUFDO0lBQ2QsaUJBQWlCLEVBQUUsSUFBSTtDQUN4QixDQUFDO0FBRUssS0FBSyxVQUFVLE9BQU8sQ0FDM0IsS0FBMkI7SUFFM0Isd0JBQXdCO0lBQ3hCLElBQUksS0FBSyxDQUFDLFVBQVUsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxPQUFPLElBQUEsc0NBQXFCLEdBQUUsQ0FBQztJQUNqQyxDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FBQztJQUVoQyxJQUFJLENBQUM7UUFDSCxRQUFRLE1BQU0sRUFBRSxDQUFDO1lBQ2YsS0FBSyxLQUFLO2dCQUNSLE9BQU8sb0JBQW9CLEVBQUUsQ0FBQztZQUVoQyxLQUFLLE1BQU0sQ0FBQztZQUNaLEtBQUssS0FBSztnQkFDUixPQUFPLHVCQUF1QixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRXhDO2dCQUNFLE9BQU8sSUFBQSw4QkFBYSxFQUFDLG9CQUFvQixFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELENBQUM7SUFDSCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFaEQsSUFBSSxLQUFLLFlBQVksS0FBSyxFQUFFLENBQUM7WUFDM0IsT0FBTyxJQUFBLDhCQUFhLEVBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMs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SyxTQUFTLEVBQUUsQ0FBQztRQUM3QyxJQUFJLE9BQU8sV0FBVyxDQUFDLGNBQWMsS0FBSyxRQUFRLElBQUksV0FBVyxDQUFDLGNBQWMsR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLGNBQWMsR0FBRyxLQUFLLEVBQUUsQ0FBQztZQUM3SCxPQUFPLHVEQUF1RCxDQUFDO1FBQ2pFLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxXQUFXLENBQUMsV0FBVyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQzFDLElBQUksT0FBTyxXQUFXLENBQUMsV0FBVyxLQUFLLFFBQVEsSUFBSSxXQUFXLENBQUMsV0FBVyxHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsV0FBVyxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQy9HLE9BQU8sK0NBQStDLENBQUM7UUFDekQsQ0FBQztJQUNILENBQUM7SUFFRCxJQUFJLFdBQVcsQ0FBQyxpQkFBaUIsS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUNoRCxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLENBQUM7WUFDOUQsT0FBTyw0Q0FBNEMsQ0FBQztRQUN0RCxDQUFDO0lBQ0gsQ0FBQztJQUVELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcbmltcG9ydCB7XG4gIHN1Y2Nlc3NSZXNwb25zZSxcbiAgZXJyb3JSZXNwb25zZSxcbiAgY29yc1ByZWZsaWdodFJlc3BvbnNlLFxufSBmcm9tICcuLi9zaGFyZWQvcmVzcG9uc2UtdXRpbHMnO1xuXG4vKipcbiAqIFVzZXIgUHJlZmVyZW5jZXMgTGFtYmRhIEhhbmRsZXJcbiAqXG4gKiBUaGlzIGlzIGEgcGxhY2Vob2xkZXIgZm9yIFBoYXNlIDIgKER5bmFtb0RCIGludGVncmF0aW9uKS5cbiAqIEN1cnJlbnRseSByZXR1cm5zIG1vY2sgZGF0YSB0byBtYWludGFpbiBBUEkgY29tcGF0aWJpbGl0eS5cbiAqXG4gKiBHRVQgL3VzZXIvcHJlZmVyZW5jZXMgLSBHZXQgdXNlciBwcmVmZXJlbmNlc1xuICogUE9TVCAvdXNlci9wcmVmZXJlbmNlcyAtIFVwZGF0ZSB1c2VyIHByZWZlcmVuY2VzXG4gKi9cblxuLy8gRGVmYXVsdCBwcmVmZXJlbmNlcyBmb3IgbmV3IHVzZXJzXG5jb25zdCBkZWZhdWx0UHJlZmVyZW5jZXM6IFVzZXJQcmVmZXJlbmNlcyA9IHtcbiAgZGlldGFyeVJlc3RyaWN0aW9uczogW10sXG4gIGZhdm9yaXRlQ3Vpc2luZXM6IFtdLFxuICBhbGxlcmdpZXM6IFtdLFxuICB0YXJnZXRDYWxvcmllczogMjAwMCxcbiAgc2VydmluZ1NpemU6IDIsXG4gIG1lYXN1cmVtZW50U3lzdGVtOiAndXMnLFxufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoXG4gIGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudFxuKTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+IHtcbiAgLy8gSGFuZGxlIENPUlMgcHJlZmxpZ2h0XG4gIGlmIChldmVudC5odHRwTWV0aG9kID09PSAnT1BUSU9OUycpIHtcbiAgICByZXR1cm4gY29yc1ByZWZsaWdodFJlc3BvbnNlKCk7XG4gIH1cblxuICBjb25zdCBtZXRob2QgPSBldmVudC5odHRwTWV0aG9kO1xuXG4gIHRyeSB7XG4gICAgc3dpdGNoIChtZXRob2QpIHtcbiAgICAgIGNhc2UgJ0dFVCc6XG4gICAgICAgIHJldHVybiBoYW5kbGVHZXRQcmVmZXJlbmNlcygpO1xuXG4gICAgICBjYXNlICdQT1NUJzpcbiAgICAgIGNhc2UgJ1BVVCc6XG4gICAgICAgIHJldHVybiBoYW5kbGVVcGRhdGVQcmVmZXJlbmNlcyhldmVudCk7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdNZXRob2Qgbm90IGFsbG93ZWQnLCA0MDUpO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdVc2VyIHByZWZlcmVuY2VzIGVycm9yOicsIGVycm9yKTtcblxuICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShlcnJvci5tZXNzYWdlLCA1MDApO1xuICAgIH1cblxuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdGYWlsZWQgdG8gcHJvY2VzcyBwcmVmZXJlbmNlcyByZXF1ZXN0JywgNTAwKTtcbiAgfVxufVxuXG4vKipcbiAqIEhhbmRsZSBHRVQgcmVxdWVzdCAtIFJldHVybiB1c2VyIHByZWZlcmVuY2VzXG4gKiBJbiBQaGFzZSAyLCB0aGlzIHdpbGwgZmV0Y2ggZnJvbSBEeW5hbW9EQlxuICovXG5hc3luYyBmdW5jdGlvbiBoYW5kbGVHZXRQcmVmZXJlbmNlcygpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4ge1xuICAvLyBUT0RPOiBQaGFzZSAyIC0gRmV0Y2ggZnJvbSBEeW5hbW9EQiB1c2luZyB1c2VyIElEIGZyb20gQ29nbml0b1xuICAvLyBGb3Igbm93LCByZXR1cm4gZGVmYXVsdCBwcmVmZXJlbmNlc1xuXG4gIHJldHVybiBzdWNjZXNzUmVzcG9uc2Uoe1xuICAgIHByZWZlcmVuY2VzOiBkZWZhdWx0UHJlZmVyZW5jZXMsXG4gICAgbWVzc2FnZTogJ1ByZWZlcmVuY2VzIHJldHJpZXZlZCBzdWNjZXNzZnVsbHknLFxuICAgIC8vIEZsYWcgdG8gaW5kaWNhdGUgdGhpcyBpcyBwbGFjZWhvbGRlciBkYXRhXG4gICAgX2lzUGxhY2Vob2xkZXI6IHRydWUsXG4gIH0pO1xufVxuXG4vKipcbiAqIEhhbmRsZSBQT1NUL1BVVCByZXF1ZXN0IC0gVXBkYXRlIHVzZXIgcHJlZmVyZW5jZXNcbiAqIEluIFBoYXNlIDIsIHRoaXMgd2lsbCBwZXJzaXN0IHRvIER5bmFtb0RCXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGhhbmRsZVVwZGF0ZVByZWZlcmVuY2VzKFxuICBldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnRcbik6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gIGlmICghZXZlbnQuYm9keSkge1xuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdSZXF1ZXN0IGJvZHkgaXMgcmVxdWlyZWQnLCA0MDApO1xuICB9XG5cbiAgbGV0IHByZWZlcmVuY2VzOiBQYXJ0aWFsPFVzZXJQcmVmZXJlbmNlcz47XG5cbiAgdHJ5IHtcbiAgICBwcmVmZXJlbmNlcyA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKCdJbnZhbGlkIEpTT04gaW4gcmVxdWVzdCBib2R5JywgNDAwKTtcbiAgfVxuXG4gIC8vIFZhbGlkYXRlIHByZWZlcmVuY2VzXG4gIGNvbnN0IHZhbGlkYXRpb25FcnJvciA9IHZhbGlkYXRlUHJlZmVyZW5jZXMocHJlZmVyZW5jZXMpO1xuICBpZiAodmFsaWRhdGlvbkVycm9yKSB7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UodmFsaWRhdGlvbkVycm9yLCA0MDApO1xuICB9XG5cbiAgLy8gVE9ETzogUGhhc2UgMiAtIFBlcnNpc3QgdG8gRHluYW1vREIgdXNpbmcgdXNlciBJRCBmcm9tIENvZ25pdG9cbiAgLy8gRm9yIG5vdywganVzdCByZXR1cm4gdGhlIG1lcmdlZCBwcmVmZXJlbmNlc1xuXG4gIGNvbnN0IG1lcmdlZFByZWZlcmVuY2VzID0ge1xuICAgIC4uLmRlZmF1bHRQcmVmZXJlbmNlcyxcbiAgICAuLi5wcmVmZXJlbmNlcyxcbiAgfTtcblxuICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHtcbiAgICBwcmVmZXJlbmNlczogbWVyZ2VkUHJlZmVyZW5jZXMsXG4gICAgbWVzc2FnZTogJ1ByZWZlcmVuY2VzIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAvLyBGbGFnIHRvIGluZGljYXRlIHRoaXMgaXMgcGxhY2Vob2xkZXIgLSBub3QgYWN0dWFsbHkgcGVyc2lzdGVkXG4gICAgX2lzUGxhY2Vob2xkZXI6IHRydWUsXG4gIH0pO1xufVxuXG4vKipcbiAqIFZhbGlkYXRlIHVzZXIgcHJlZmVyZW5jZXNcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVQcmVmZXJlbmNlcyhwcmVmZXJlbmNlczogUGFydGlhbDxVc2VyUHJlZmVyZW5jZXM+KTogc3RyaW5nIHwgbnVsbCB7XG4gIGlmIChwcmVmZXJlbmNlcy5kaWV0YXJ5UmVzdHJpY3Rpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJlZmVyZW5jZXMuZGlldGFyeVJlc3RyaWN0aW9ucykpIHtcbiAgICAgIHJldHVybiAnZGlldGFyeVJlc3RyaWN0aW9ucyBtdXN0IGJlIGFuIGFycmF5JztcbiAgICB9XG4gICAgY29uc3QgdmFsaWREaWV0cyA9IFsndmVnZXRhcmlhbicsICd2ZWdhbicsICdnbHV0ZW5GcmVlJywgJ2RhaXJ5RnJlZScsICdrZXRvJywgJ3BhbGVvJywgJ2xvd0ZvZG1hcCddO1xuICAgIGZvciAoY29uc3QgZGlldCBvZiBwcmVmZXJlbmNlcy5kaWV0YXJ5UmVzdHJpY3Rpb25zKSB7XG4gICAgICBpZiAoIXZhbGlkRGlldHMuaW5jbHVkZXMoZGlldCkpIHtcbiAgICAgICAgcmV0dXJuIGBJbnZhbGlkIGRpZXRhcnkgcmVzdHJpY3Rpb246ICR7ZGlldH1gO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmIChwcmVmZXJlbmNlcy5mYXZvcml0ZUN1aXNpbmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJlZmVyZW5jZXMuZmF2b3JpdGVDdWlzaW5lcykpIHtcbiAgICAgIHJldHVybiAnZmF2b3JpdGVDdWlzaW5lcyBtdXN0IGJlIGFuIGFycmF5JztcbiAgICB9XG4gIH1cblxuICBpZiAocHJlZmVyZW5jZXMuYWxsZXJnaWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJlZmVyZW5jZXMuYWxsZXJnaWVzKSkge1xuICAgICAgcmV0dXJuICdhbGxlcmdpZXMgbXVzdCBiZSBhbiBhcnJheSc7XG4gICAgfVxuICB9XG5cbiAgaWYgKHByZWZlcmVuY2VzLnRhcmdldENhbG9yaWVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAodHlwZW9mIHByZWZlcmVuY2VzLnRhcmdldENhbG9yaWVzICE9PSAnbnVtYmVyJyB8fCBwcmVmZXJlbmNlcy50YXJnZXRDYWxvcmllcyA8IDUwMCB8fCBwcmVmZXJlbmNlcy50YXJnZXRDYWxvcmllcyA+IDEwMDAwKSB7XG4gICAgICByZXR1cm4gJ3RhcmdldENhbG9yaWVzIG11c3QgYmUgYSBudW1iZXIgYmV0d2VlbiA1MDAgYW5kIDEwMDAwJztcbiAgICB9XG4gIH1cblxuICBpZiAocHJlZmVyZW5jZXMuc2VydmluZ1NpemUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmICh0eXBlb2YgcHJlZmVyZW5jZXMuc2VydmluZ1NpemUgIT09ICdudW1iZXInIHx8IHByZWZlcmVuY2VzLnNlcnZpbmdTaXplIDwgMSB8fCBwcmVmZXJlbmNlcy5zZXJ2aW5nU2l6ZSA+IDIwKSB7XG4gICAgICByZXR1cm4gJ3NlcnZpbmdTaXplIG11c3QgYmUgYSBudW1iZXIgYmV0d2VlbiAxIGFuZCAyMCc7XG4gICAgfVxuICB9XG5cbiAgaWYgKHByZWZlcmVuY2VzLm1lYXN1cmVtZW50U3lzdGVtICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoIVsndXMnLCAnbWV0cmljJ10uaW5jbHVkZXMocHJlZmVyZW5jZXMubWVhc3VyZW1lbnRTeXN0ZW0pKSB7XG4gICAgICByZXR1cm4gJ21lYXN1cmVtZW50U3lzdGVtIG11c3QgYmUgXCJ1c1wiIG9yIFwibWV0cmljXCInO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5pbnRlcmZhY2UgVXNlclByZWZlcmVuY2VzIHtcbiAgZGlldGFyeVJlc3RyaWN0aW9uczogc3RyaW5nW107XG4gIGZhdm9yaXRlQ3Vpc2luZXM6IHN0cmluZ1tdO1xuICBhbGxlcmdpZXM6IHN0cmluZ1tdO1xuICB0YXJnZXRDYWxvcmllczogbnVtYmVyO1xuICBzZXJ2aW5nU2l6ZTogbnVtYmVyO1xuICBtZWFzdXJlbWVudFN5c3RlbTogJ3VzJyB8ICdtZXRyaWMnO1xufVxuIl19