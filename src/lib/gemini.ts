import { setTimeout } from 'node:timers/promises';
import { GoogleGenAI } from '@google/genai';
import { redactText, sanitizeResponse } from './textUtils';

/**
 * Available Gemini model versions
 */
export enum GeminiModel {
    FlashLiteV2_5 = 'gemini-2.5-flash-lite',
    ProV2_5 = 'gemini-2.5-pro',
}

const RATE_LIMIT_KEYWORDS = ['429', 'rate limit', 'Too Many Requests', 'model is overloaded'];

/**
 * Configuration options for Gemini API generation
 */
type GenerateOptions = {
    /** Maximum retry attempts on failure */
    maxRetries?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
};

/**
 * Generates content using Google Gemini API with retry logic and validation
 * @param prompt - The prompt to send to the model
 * @param apiKey - Google AI API key
 * @param validate - Validation function that returns true if response is valid
 * @param model - Gemini model to use (default: FlashLiteV2_5)
 * @param options - Generation options (maxRetries, timeout)
 * @returns Sanitized response text
 * @throws Error if all retries fail or validation never passes
 */
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
