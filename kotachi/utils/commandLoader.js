// utils/commandLoader.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Collection } from 'discord.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads all command files from the /commands directory into the client.
 * @param {import('discord.js').Client} client 
 */
export async function loadCommands(client) {
    client.commands = new Collection();
    const commandsPath = path.join(__dirname, '../commands');

    if (!fs.existsSync(commandsPath)) return;

    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const commandModule = await import(pathToFileURL(filePath).href);
        const command = commandModule.default || commandModule;

        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
    }
}