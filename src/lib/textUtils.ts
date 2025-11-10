/**
 * Redacts an API key for logging purposes by showing only first and last 4 characters
 * @param key - The API key to redact
 * @returns Redacted string in format "abcd...wxyz" or "***" for short keys
 */
export const redactText = (key: string) => {
    if (key.length <= 8) {
        return '***';
    }
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

/**
 * Removes markdown code fences from API response text
 * @param text - Raw text from API response
 * @returns Cleaned text without markdown formatting
 */
export const sanitizeResponse = (text: string) => {
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
