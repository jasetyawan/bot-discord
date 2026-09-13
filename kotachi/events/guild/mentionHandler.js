// events/mentionHandler.js
import { Events } from 'discord.js';
import { generateMentionResponse } from '../../services/gemini.js';

// Helper function to truncate response to max 200 words and max 1300 characters
function truncateText(text, maxWords = 200, maxChars = 1300) {
    let result = text.trim();

    // 1. Enforce word limit
    const words = result.split(/\s+/);
    if (words.length > maxWords) {
        result = words.slice(0, maxWords).join(' ') + '...';
    }

    // 2. Enforce character limit
    if (result.length > maxChars) {
        result = result.slice(0, maxChars - 3).trimEnd() + '...';
    }

    return result;
}

export function registerMentionHandler(client) {
    client.on(Events.MessageCreate, async (message) => {
        // Ignore bot messages, system messages, and DMs
        if (message.author.bot || message.system || !message.guild) return;

        // 1. Direct User Mention Check (ignores @everyone, @here, and role pings)
        const isMentioned = !message.mentions.everyone && message.mentions.users.has(client.user.id);

        // 2. Check if the message is a reply to this bot
        let isReplyingToBot = false;
        if (message.reference?.messageId) {
            try {
                // Fetch referenced message from cache or API
                const repliedMessage = message.channel.messages.cache.get(message.reference.messageId) 
                    || await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
                
                if (repliedMessage && repliedMessage.author.id === client.user.id) {
                    isReplyingToBot = true;
                }
            } catch (err) {
                console.error("Could not fetch referenced message:", err);
            }
        }

        // If neither directly mentioned nor replying to the bot, exit early
        if (!isMentioned && !isReplyingToBot) return;

        // Keep typing indicator active during generation
        const typingInterval = setInterval(() => {
            message.channel.sendTyping().catch(() => {});
        }, 8000);
        await message.channel.sendTyping().catch(() => {});

        try {
            // Strip out the bot's mention tags (<@ID> or <@!ID>)
            const mentionRegex = new RegExp(`<@!?${client.user.id}>`, 'g');
            let cleanContent = message.content.replace(mentionRegex, '').trim();

            // Handle empty messages (e.g. user just pinged without text or sent an attachment)
            if (!cleanContent) {
                cleanContent = message.attachments.size > 0 
                    ? "[User sent an attachment]" 
                    : "Hello";
            }

            // Generate AI response
            const displayName = message.member?.displayName || message.author.displayName || message.author.username;
            let replyText = await generateMentionResponse(displayName, cleanContent);

            // Fallback for null / empty response from the AI
            if (!replyText || !replyText.trim()) {
                replyText = `*smiles gently at ${message.author}* "I'm right here."`;
            }

            // Apply word and character length constraints
            replyText = truncateText(replyText, 200, 1300);

            // Send reply without pinging the user back
            await message.reply({
                content: replyText,
                allowedMentions: { repliedUser: false },
            });

        } catch (error) {
            console.error("Failed to handle mention/reply:", error);

            try {
                await message.reply({
                    content: `*Kotachi gives a gentle smile.* "I'm here, ${message.author}. What's on your mind?"`,
                    allowedMentions: { repliedUser: false },
                });
            } catch {
                // Ignore if the original message was deleted before fallback could send
            }
        } finally {
            clearInterval(typingInterval);
        }
    });
}