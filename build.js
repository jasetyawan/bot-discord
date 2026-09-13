// build.js
import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads command JSON bodies from a specific directory and registers them with Discord REST.
 */
async function deployBotCommands({ botName, token, clientId, folderPath }) {
    if (!token || !clientId) {
        console.warn(`⚠️ [${botName}] Skipped: Missing Token or Client ID in .env.`);
        return;
    }

    if (!fs.existsSync(folderPath)) {
        console.warn(`⚠️ [${botName}] Skipped: Directory not found at ${folderPath}`);
        return;
    }

    const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));
    const commands = [];

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        const command = commandModule.default || commandModule;

        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.warn(`[WARNING] Command at ${filePath} is missing "data" or "execute".`);
        }
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
        console.log(`⏳ [${botName}] Registering ${commands.length} application (/) commands...`);

        await rest.put(
            Routes.applicationCommands(clientId),
            { body: commands }
        );

        console.log(`✅ [${botName}] Successfully registered application commands.`);
    } catch (error) {
        console.error(`❌ [${botName}] Failed to register commands:`, error);
    }
}

// Exportable main function for index.js
export async function deployAllCommands(target) {
    const botConfigs = [
        {
            botName: 'Tsukuyomi',
            token: process.env.TSUKUYOMI_TOKEN,
            clientId: process.env.TSUKUYOMI_CLIENT_ID,
            folderPath: path.join(__dirname, 'tsukuyomi/commands'),
        },
        {
            botName: 'Brahma',
            token: process.env.BRAHMA_TOKEN,
            clientId: process.env.BRAHMA_CLIENT_ID,
            folderPath: path.join(__dirname, 'brahma/commands'),
        },
        {
            botName: 'Kuninotokotachi',
            token: process.env.KUNINOTOKOTACHI_TOKEN,
            clientId: process.env.KUNINOTOKOTACHI_CLIENT_ID,
            folderPath: path.join(__dirname, 'kotachi/commands'),
        },
    ];

    for (const bot of botConfigs) {
        if (!target || target === bot.botName.toLowerCase()) {
            await deployBotCommands(bot);
        }
    }
}

// Automatically runs only when executed directly via "node build.js" in the terminal
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const target = process.argv[2]?.toLowerCase();
    await deployAllCommands(target);
}