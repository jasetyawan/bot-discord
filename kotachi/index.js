import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Client & Loaders
import { client } from './client.js';
import { loadCommands } from '../utils/commandLoader.js';

// Event Handlers
import { registerReadyHandler } from './events/client/readyHandler.js';
import { registerMentionHandler } from './events/guild/mentionHandler.js';
import { registerInteractionHandler } from './events/guild/interactionHandler.js';
import { registerRateLimitMonitor } from './events/client/rateLimitHandler.js';

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Error Handling
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

// Register Event Handlers
registerReadyHandler(client);
registerMentionHandler(client);
registerInteractionHandler(client);
registerRateLimitMonitor(client);

async function main() {
    try {
        // Load commands from local bot directory
        await loadCommands(client, path.join(__dirname, 'commands'));
        console.log('Commands loaded successfully.');

        // Login (Use TSUKUYOMI_TOKEN or BRAHMA_TOKEN accordingly)
        const token = process.env.KUNINOTOKOTACHI_TOKEN;
        await client.login(token);
    } catch (error) {
        console.error('Fatal startup error:', error);
        process.exit(1);
    }
}

main();