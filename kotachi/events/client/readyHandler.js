// events/readyHandler.js
import { Events, ActivityType } from 'discord.js';

export function registerReadyHandler(client) {
    client.once(Events.ClientReady, (readyClient) => {
        console.log(`Logged in as ${readyClient.user.tag}`);
        readyClient.user.setActivity({
            name: "Got a plan for today?",
            type: ActivityType.Custom,
        });
    });
}