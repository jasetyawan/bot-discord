// client.js
import { Client, GatewayIntentBits, Options } from 'discord.js';

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
    makeCache: Options.cacheWithLimits({
        MessageManager: 20,          // Keep only 20 messages per channel in memory
        GuildMemberManager: 50,      // Keep only 50 members in cache
        UserManager: 50,
        PresenceManager: 0,          // Disable presence tracking
        ReactionManager: 0,
        ThreadManager: 0,
        VoiceStateManager: Infinity, // Keep enabled for Tsukuyomi's music player
    }),
});