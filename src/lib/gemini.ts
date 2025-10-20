import { setTimeout } from 'node:timers/promises';
import { GoogleGenAI } from '@google/genai';

export enum GeminiModel {
    FlashLiteV2_5 = 'gemini-2.5-flash-lite',
    ProV2_5 = 'gemini-2.5-pro',
}

const RATE_LIMIT_KEYWORDS = ['429', 'rate limit', 'Too Many Requests', 'model is overloaded'];

const redactText = (key: string): string => {
    if (key.length <= 8) {
        return '***';
    }
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

const sanitizeResponse = (text: string): string => {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
};

type GenerateOptions = { maxRetries?: number; timeout?: number };

export const generateWithGemini = async (
    prompt: string,
    apiKey: string,
    validate: (responseText: string) => boolean,
    model: GeminiModel = GeminiModel.FlashLiteV2_5,
    { maxRetries = 3, timeout = 60000 }: GenerateOptions = {},
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout } });
    const redactedKey = redactText(apiKey);
    const serializedSize = new TextEncoder().encode(prompt).length;
    const content = { config: { temperature: 0.1 }, contents: prompt, model };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log(
                `[gemini: Sending ${serializedSize} bytes to ${content.model} with key=${redactedKey}] (attempt ${attempt + 1}/${maxRetries})`,
            );

            const response = await ai.models.generateContent(content);
            const rawText = response.text;

            if (!rawText) {
                console.warn(`[API ${redactedKey}] Empty response on attempt ${attempt + 1}`);
                lastError = new Error('Empty response from API');
                continue;
            }

            const sanitized = sanitizeResponse(rawText);

            if (validate(sanitized)) {
                return sanitized;
            }

            console.warn(
                `[API ${redactedKey}] Invalid response format on attempt ${attempt + 1}`,
                sanitized.substring(0, 500),
            );
            lastError = new Error('Invalid response format');
        } catch (error: any) {
            console.error(`[API ${redactedKey}] Error on attempt ${attempt + 1}:`, error.message);
            lastError = error;

            const msg = String(error.message || '').toLowerCase();

            if (RATE_LIMIT_KEYWORDS.some((k) => msg.includes(k.toLowerCase()))) {
                const waitTime = Math.min(2 ** attempt * 1000, 30000);
                console.log(`[API ${redactedKey}] Rate limited. Waiting ${waitTime}ms...`);
                await setTimeout(waitTime);
                continue;
            }

            if (attempt < maxRetries - 1) {
                await setTimeout(2000);
            }
        }
    }

    throw lastError || new Error('Failed to generate valid response after all retries');
};
