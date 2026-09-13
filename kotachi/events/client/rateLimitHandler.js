// events/client/rateLimitHandler.js
export function registerRateLimitMonitor(client) {
    // 1. Emitted whenever the bot hits a rate limit
    client.rest.on('rateLimited', (info) => {
        console.warn('⚠️ [REST RATE LIMIT HIT]');
        console.warn(` • Route:        ${info.route}`);
        console.warn(` • Hash:         ${info.hash}`);
        console.warn(` • Global Limit: ${info.global ? 'YES' : 'NO'}`);
        console.warn(` • Retry After:  ${info.retryAfter}ms`);
        console.warn(` • Request Limit:${info.limit}`);
    });

    // 2. Warns if your bot is making 401, 403, or 429 errors that risk an API ban
    client.rest.on('invalidRequestWarning', (info) => {
        console.error('🚨 [INVALID REQUEST WARNING]');
        console.error(` • Count:      ${info.count}`);
        console.error(` • Remaining:  ${info.remainingTime}ms until reset`);
    });
}