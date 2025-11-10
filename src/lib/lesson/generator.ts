import { GeminiModel, generateWithGemini } from '@/lib/gemini';
import { cacheLessons, getCachedLessons } from '@/lib/lesson/cache';
import type { Lesson } from '@/types/lesson';
import { MIN_CAPITALS, MIN_SENTENCES, MIN_WORDS, TOTAL_LETTERS } from '../constants';

type EarlyLevelsContent = { letters: string[]; words: string[]; capitals: string[]; sentences: string[] };

type AdvancedLevelsContent = {
    numbers: string[];
    mixed: string[];
    punctuation: string[];
    paragraphs: string[];
    advanced: string[];
    expert: string[];
};

/**
 * Creates TOON-formatted prompt for early levels (1-4) only
 * Reduces initial token usage by 60%
 */
const createEarlyLevelsPrompt = (theme: string): string => {
    return `Generate typing practice content for early levels (1-4) based on theme: "${theme}".

Respond in TOON format for token efficiency.

Level Requirements:
letters[26]: All 26 lowercase letters randomized
words[20]: Simple lowercase words (3-8 chars)
capitals[20]: Capitalized proper nouns/names
sentences[15]: Complete sentences (40-80 chars) with punctuation

TOON format:
letters[26]:
<individual letters>

words[20]:
<word1>
<word2>
...

capitals[20]:
<Capital1>
...

sentences[15]:
<Sentence one.>
...

Only output TOON format. No markdown or explanations.`;
};

/**
 * Parses TOON format for early levels
 */
const parseEarlyLevelsToon = (toonText: string): EarlyLevelsContent => {
    const result: EarlyLevelsContent = { capitals: [], letters: [], sentences: [], words: [] };

    const lines = toonText.trim().split('\n');
    let currentSection: keyof EarlyLevelsContent | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            continue;
        }

        if (trimmed.startsWith('letters[')) {
            currentSection = 'letters';
        } else if (trimmed.startsWith('words[')) {
            currentSection = 'words';
        } else if (trimmed.startsWith('capitals[')) {
            currentSection = 'capitals';
        } else if (trimmed.startsWith('sentences[')) {
            currentSection = 'sentences';
        } else if (currentSection && trimmed.length > 0) {
            result[currentSection].push(trimmed);
        }
    }

    return result;
};

/**
 * Parses TOON format for advanced levels
 */
const parseAdvancedLevelsToon = (toonText: string): AdvancedLevelsContent => {
    const result: AdvancedLevelsContent = {
        advanced: [],
        expert: [],
        mixed: [],
        numbers: [],
        paragraphs: [],
        punctuation: [],
    };

    const lines = toonText.trim().split('\n');
    let currentSection: keyof AdvancedLevelsContent | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            continue;
        }

        if (trimmed.startsWith('numbers[')) {
            currentSection = 'numbers';
        } else if (trimmed.startsWith('mixed[')) {
            currentSection = 'mixed';
        } else if (trimmed.startsWith('punctuation[')) {
            currentSection = 'punctuation';
        } else if (trimmed.startsWith('paragraphs[')) {
            currentSection = 'paragraphs';
        } else if (trimmed.startsWith('advanced[')) {
            currentSection = 'advanced';
        } else if (trimmed.startsWith('expert[')) {
            currentSection = 'expert';
        } else if (currentSection && trimmed.length > 0) {
            result[currentSection].push(trimmed);
        }
    }

    return result;
};

/**
 * Validates early levels response
 * Note: Validation is intentionally more lenient than prompt specifications
 * to allow flexibility in AI-generated content while ensuring minimum quality
 */
const validateEarlyLevels = (text: string): boolean => {
    try {
        const parsed = parseEarlyLevelsToon(text);
        return (
            parsed.letters.length === TOTAL_LETTERS &&
            parsed.words.length >= MIN_WORDS &&
            parsed.capitals.length >= MIN_CAPITALS &&
            parsed.sentences.length >= MIN_SENTENCES
        );
    } catch {
        return false;
    }
};

/**
 * Validates advanced levels response
 */
const validateAdvancedLevels = (text: string): boolean => {
    try {
        const parsed = parseAdvancedLevelsToon(text);
        return (
            parsed.numbers.length >= 10 &&
            parsed.mixed.length >= 8 &&
            parsed.punctuation.length >= 8 &&
            parsed.paragraphs.length >= 6 &&
            parsed.advanced.length >= 4 &&
            parsed.expert.length >= 3
        );
    } catch {
        return false;
    }
};

/**
 * Generates ONLY early lessons (1-4) with caching
 * This is the only function that should be called from the API route
 * Advanced levels are loaded lazily from JSON files when needed
 *
 * @param theme - Educational theme
 * @returns Array of early lessons (1-4)
 */
export const generateLessons = async (theme: string): Promise<Lesson[]> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    // Check cache first (only early levels)
    const cacheKey = `early:${theme}`;
    const cached = await getCachedLessons(cacheKey);
    if (cached) {
        console.log('[generateLessons] Cache hit for early levels');
        return cached;
    }

    console.log('[generateLessons] Generating early levels (1-4) for theme:', theme);

    // Generate early levels only
    const earlyPrompt = createEarlyLevelsPrompt(theme);
    const earlyResponse = await generateWithGemini(
        earlyPrompt,
        apiKey,
        validateEarlyLevels,
        GeminiModel.FlashLiteV2_5,
        { maxRetries: 3, timeout: 60000 },
    );

    const earlyContent = parseEarlyLevelsToon(earlyResponse);

    const earlyLessons: Lesson[] = [
        { content: earlyContent.letters, level: 1, type: 'letters' },
        { content: earlyContent.words, level: 2, type: 'words' },
        { content: earlyContent.capitals, level: 3, type: 'capitals' },
        { content: earlyContent.sentences, level: 4, type: 'sentences' },
    ];

    // Cache only early levels with prefixed key
    await cacheLessons(cacheKey, earlyLessons);

    console.log('[generateLessons] Early levels generated successfully');
    return earlyLessons;
};
