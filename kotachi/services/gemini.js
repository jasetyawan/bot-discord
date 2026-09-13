// services/gemini.js
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Initialize the Google Gen AI client once
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 2. Load the System Instruction / Dialogue text file once
const personalityPath = path.join(__dirname, '../personality/kotachi_personality.txt');
let systemInstruction = "You are Kuninotokotachi, a trusted companion who also rather cynical, and likes to tease her juniors.";

try {
    if (fs.existsSync(personalityPath)) {
        systemInstruction = fs.readFileSync(personalityPath, 'utf-8');
    }
} catch (error) {
    console.error("Could not load kotachi_personality.txt:", error);
}

/**
 * Generate a dynamic mention response in bot's persona
 * @param {string} username - Name of the user mentioning the bot
 * @param {string} userMessage - The message content (stripped of bot mention)
 */
export async function generateMentionResponse(username, userMessage) {
    const prompt = userMessage || "*gently calls your name or looks over at you*";

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: `User "${username}" says: "${prompt}" Keep responses concise, natural, and under 70-100 words.`,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.9,
            maxOutputTokens: 150,
        },
    });

    return response.text;
}

/**
 * Answer a direct question from a user
 * @param {string} username - Name of the user asking
 * @param {string} question - The user's question
 */
export async function generateAnswer(username, question) {
    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: `User "${username}" asks: "${question}" Keep responses concise, natural, and under 70-100 words.`,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.9,
            maxOutputTokens: 150,
        },
    });

    return response.text;
}

/**
* Generate a dynamic narrative when a user hugs bot
* @param {string} username - Name of the user hugging bot
*/
export async function generateHugResponse(username) {
    const prompt = `User "${username}" gives you a warm hug. Describe your affectionate and gentle reaction/embrace toward them, speaking/acting in character. Keep it brief, warm, and comforting (2-3 sentences max).`;

    const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.9,
            maxOutputTokens: 200,
        },
    });

    return response.text;
}