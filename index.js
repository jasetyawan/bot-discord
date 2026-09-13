// index.js (Root)
import { fork } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deployAllCommands } from './build.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function startBot(name, scriptRelativePath, memoryLimitMb) {
    const scriptPath = path.join(__dirname, scriptRelativePath);
    console.log(`🚀 [Launcher] Starting ${name} with ${memoryLimitMb}MB limit...`);

    const child = fork(scriptPath, [], {
        execArgv: [`--max-old-space-size=${memoryLimitMb}`],
        stdio: 'inherit',
    });

    child.on('exit', (code, signal) => {
        console.error(`⚠️ [Launcher] ${name} stopped (Code: ${code}, Signal: ${signal}). Restarting in 5s...`);
        setTimeout(() => startBot(name, scriptRelativePath, memoryLimitMb), 5000);
    });

    return child;
}

async function main() {
    try {
        // 1. Sync all slash commands with Discord API
        console.log('📡 [Launcher] Deploying slash commands...');
        await deployAllCommands();

        // 2. Start Tsukuyomi and Brahma inside their RAM limits
        startBot('Tsukuyomi', 'tsukuyomi/index.js', 285);
        startBot('Brahma', 'brahma/index.js', 285);
        startBot('Kuninotokotachi', 'kotachi/index.js', 285);
    } catch (err) {
        console.error('❌ [Launcher] Startup failed:', err);
    }
}

main();