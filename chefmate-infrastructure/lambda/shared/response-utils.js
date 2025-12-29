"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsHeaders = void 0;
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
exports.corsPreflightResponse = corsPreflightResponse;
exports.parseQueryParams = parseQueryParams;
/**
 * CORS headers for API Gateway responses
 */
exports.corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key, Authorization',
    'Content-Type': 'application/json',
};
/**
 * Create a successful JSON response
 */
function successResponse(body, statusCode = 200) {
    return {
        statusCode,
        headers: {
            ...exports.corsHeaders,
            'Cache-Control': 's-maxage=300, stale-while-revalidate',
        },
        body: JSON.stringify(body),
    };
}
/**
 * Create an error response
 */
function errorResponse(message, statusCode = 500, details) {
    const body = {
        error: message,
        status: statusCode,
    };
    if (details) {
        body.details = details;
    }
    return {
        statusCode,
        headers: exports.corsHeaders,
        body: JSON.stringify(body),
    };
}
/**
 * Create a CORS preflight response
 */
function corsPreflightResponse() {
    return {
        statusCode: 200,
        headers: exports.corsHeaders,
        body: '',
    };
}
/**
 * Parse query string parameters with defaults
 */
function parseQueryParams(queryParams, defaults) {
    if (!queryParams) {
        return defaults;
    }
    return {
        ...defaults,
        ...queryParams,
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UtdXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZXNwb25zZS11dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFlQSwwQ0FTQztBQUtELHNDQW1CQztBQUtELHNEQU1DO0FBS0QsNENBWUM7QUExRUQ7O0dBRUc7QUFDVSxRQUFBLFdBQVcsR0FBRztJQUN6Qiw2QkFBNkIsRUFBRSxHQUFHO0lBQ2xDLDhCQUE4QixFQUFFLGlDQUFpQztJQUNqRSw4QkFBOEIsRUFBRSx3Q0FBd0M7SUFDeEUsY0FBYyxFQUFFLGtCQUFrQjtDQUNuQyxDQUFDO0FBRUY7O0dBRUc7QUFDSCxTQUFnQixlQUFlLENBQUMsSUFBYSxFQUFFLFVBQVUsR0FBRyxHQUFHO0lBQzdELE9BQU87UUFDTCxVQUFVO1FBQ1YsT0FBTyxFQUFFO1lBQ1AsR0FBRyxtQkFBVztZQUNkLGVBQWUsRUFBRSxzQ0FBc0M7U0FDeEQ7UUFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUM7S0FDM0IsQ0FBQztBQUNKLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQWdCLGFBQWEsQ0FDM0IsT0FBZSxFQUNmLFVBQVUsR0FBRyxHQUFHLEVBQ2hCLE9BQWlCO0lBRWpCLE1BQU0sSUFBSSxHQUE0QjtRQUNwQyxLQUFLLEVBQUUsT0FBTztRQUNkLE1BQU0sRUFBRSxVQUFVO0tBQ25CLENBQUM7SUFFRixJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ1osSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7SUFDekIsQ0FBQztJQUVELE9BQU87UUFDTCxVQUFVO1FBQ1YsT0FBTyxFQUFFLG1CQUFXO1FBQ3BCLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztLQUMzQixDQUFDO0FBQ0osQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBZ0IscUJBQXFCO0lBQ25DLE9BQU87UUFDTCxVQUFVLEVBQUUsR0FBRztRQUNmLE9BQU8sRUFBRSxtQkFBVztRQUNwQixJQUFJLEVBQUUsRUFBRTtLQUNULENBQUM7QUFDSixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFnQixnQkFBZ0IsQ0FDOUIsV0FBc0QsRUFDdEQsUUFBVztJQUVYLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQixPQUFPLFFBQVEsQ0FBQztJQUNsQixDQUFDO0lBRUQsT0FBTztRQUNMLEdBQUcsUUFBUTtRQUNYLEdBQUcsV0FBVztLQUNmLENBQUM7QUFDSixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5cbi8qKlxuICogQ09SUyBoZWFkZXJzIGZvciBBUEkgR2F0ZXdheSByZXNwb25zZXNcbiAqL1xuZXhwb3J0IGNvbnN0IGNvcnNIZWFkZXJzID0ge1xuICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogJyonLFxuICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsIFBPU1QsIFBVVCwgREVMRVRFLCBPUFRJT05TJyxcbiAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLCBYLUFwaS1LZXksIEF1dGhvcml6YXRpb24nLFxuICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxufTtcblxuLyoqXG4gKiBDcmVhdGUgYSBzdWNjZXNzZnVsIEpTT04gcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1Y2Nlc3NSZXNwb25zZShib2R5OiB1bmtub3duLCBzdGF0dXNDb2RlID0gMjAwKTogQVBJR2F0ZXdheVByb3h5UmVzdWx0IHtcbiAgcmV0dXJuIHtcbiAgICBzdGF0dXNDb2RlLFxuICAgIGhlYWRlcnM6IHtcbiAgICAgIC4uLmNvcnNIZWFkZXJzLFxuICAgICAgJ0NhY2hlLUNvbnRyb2wnOiAncy1tYXhhZ2U9MzAwLCBzdGFsZS13aGlsZS1yZXZhbGlkYXRlJyxcbiAgICB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGJvZHkpLFxuICB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhbiBlcnJvciByZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JSZXNwb25zZShcbiAgbWVzc2FnZTogc3RyaW5nLFxuICBzdGF0dXNDb2RlID0gNTAwLFxuICBkZXRhaWxzPzogdW5rbm93blxuKTogQVBJR2F0ZXdheVByb3h5UmVzdWx0IHtcbiAgY29uc3QgYm9keTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4gPSB7XG4gICAgZXJyb3I6IG1lc3NhZ2UsXG4gICAgc3RhdHVzOiBzdGF0dXNDb2RlLFxuICB9O1xuXG4gIGlmIChkZXRhaWxzKSB7XG4gICAgYm9keS5kZXRhaWxzID0gZGV0YWlscztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3RhdHVzQ29kZSxcbiAgICBoZWFkZXJzOiBjb3JzSGVhZGVycyxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KSxcbiAgfTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBDT1JTIHByZWZsaWdodCByZXNwb25zZVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29yc1ByZWZsaWdodFJlc3BvbnNlKCk6IEFQSUdhdGV3YXlQcm94eVJlc3VsdCB7XG4gIHJldHVybiB7XG4gICAgc3RhdHVzQ29kZTogMjAwLFxuICAgIGhlYWRlcnM6IGNvcnNIZWFkZXJzLFxuICAgIGJvZHk6ICcnLFxuICB9O1xufVxuXG4vKipcbiAqIFBhcnNlIHF1ZXJ5IHN0cmluZyBwYXJhbWV0ZXJzIHdpdGggZGVmYXVsdHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlUXVlcnlQYXJhbXM8VCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZD4+KFxuICBxdWVyeVBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nIHwgdW5kZWZpbmVkPiB8IG51bGwsXG4gIGRlZmF1bHRzOiBUXG4pOiBUIHtcbiAgaWYgKCFxdWVyeVBhcmFtcykge1xuICAgIHJldHVybiBkZWZhdWx0cztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLi4uZGVmYXVsdHMsXG4gICAgLi4ucXVlcnlQYXJhbXMsXG4gIH07XG59XG4iXX0=