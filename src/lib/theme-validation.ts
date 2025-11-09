import { DEFAULT_BLOCKED_WORDS } from './constants';

/**
 * Gets blocked keywords from environment or defaults
 * Supports comma-separated list in THEME_BLOCKED_WORDS env variable
 */
const getBlockedWords = (): string[] => {
    const envWords = process.env.THEME_BLOCKED_WORDS;

    if (envWords) {
        return envWords
            .split(',')
            .map((w) => w.trim().toLowerCase())
            .filter(Boolean);
    }
    return DEFAULT_BLOCKED_WORDS;
};

const wordBoundaryPattern = new RegExp(`\\b(${getBlockedWords().join('|')})\\b`);

/**
 * Validates that a theme is appropriate for family-friendly content
 * @param theme - User-provided theme string
 * @returns true if theme is allowed (3-64 chars, alphanumeric+spaces, no blocked words)
 */
export const isThemeAllowed = (theme: string) => {
    const cleaned = theme.trim().toLowerCase();

    if (cleaned.length < 3 || cleaned.length > 64) {
        return false;
    }

    if (!/^[a-z0-9\s\-&]+$/.test(cleaned)) {
        return false;
    }

    return !wordBoundaryPattern.test(cleaned);
};
