import { Events, MessageFlags } from 'discord.js';

export function registerInteractionHandler(client) {
    client.on(Events.InteractionCreate, async (interaction) => {
        // 1. Handle autocomplete interactions
        if (interaction.isAutocomplete()) {
            const command = client.commands?.get(interaction.commandName);
            if (!command || !command.autocomplete) return;

            try {
                // Passes interaction first, client second
                await command.autocomplete(interaction, client);
            } catch (error) {
                console.error(`Autocomplete error in ${interaction.commandName}:`, error);
            }
            return;
        }

        // 2. Only handle slash (chat input) commands below this point
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands?.get(interaction.commandName);
        if (!command) {
            console.warn(`[Command Not Found]: No command matching "${interaction.commandName}" was found.`);
            return;
        }

        try {
            // Passes interaction first to align with: async execute(interaction)
            await command.execute(interaction, client);
        } catch (error) {
            console.error(`Error while executing ${interaction.commandName}:`, error);

            // If the interaction token expired or is unknown (10062), do not attempt another reply
            if (error?.code === 10062) return;

            const errorMessage = {
                content: '❌ | There was an error while executing this command!',
                flags: MessageFlags.Ephemeral,
            };

            try {
                if (interaction.replied) {
                    await interaction.followUp(errorMessage);
                } else if (interaction.deferred) {
                    await interaction.editReply(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            } catch (responseError) {
                console.error('Failed to send error interaction response:', responseError);
            }
        }
    });
}