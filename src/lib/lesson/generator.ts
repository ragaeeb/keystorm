import { GeminiModel, generateWithGemini } from '@/lib/gemini';
import { cacheLessons, getCachedLessons } from '@/lib/lesson/cache';
import type { Lesson } from '@/types/lesson';

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
 * Creates TOON-formatted prompt for advanced levels (5-10)
 * Called lazily when user reaches level 5
 */
const createAdvancedLevelsPrompt = (theme: string): string => {
    return `Generate typing practice content for advanced levels (5-10) based on theme: "${theme}".

Respond in TOON format.

Level Requirements:
numbers[15]: Items mixing words and numbers
mixed[12]: Sentences (60-100 chars) with mixed case and numbers
punctuation[12]: Sentences (70-110 chars) with complex punctuation (:;""''()-)
paragraphs[8]: Paragraphs (150-250 chars) with alliterations
advanced[6]: Long paragraphs (250-400 chars) with advanced vocabulary
expert[5]: Expert paragraphs (400-600 chars) with all character types

TOON format:
numbers[15]:
<5 pillars>
...

mixed[12]:
<Mixed sentence with 7 numbers.>
...

punctuation[12]:
<Complex: sentence; with (various) punctuation!>
...

paragraphs[8]:
<Paragraph one...>
...

advanced[6]:
<Advanced paragraph...>
...

expert[5]:
<Expert paragraph...>
...

Only output TOON format. No markdown.`;
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
 */
const validateEarlyLevels = (text: string): boolean => {
    try {
        const parsed = parseEarlyLevelsToon(text);
        return (
            parsed.letters.length === 26 &&
            parsed.words.length >= 15 &&
            parsed.capitals.length >= 15 &&
            parsed.sentences.length >= 10
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
 * Generates lessons with caching and lazy loading
 * Early levels (1-4) generate immediately
 * Advanced levels (5-10) generated on-demand when user reaches level 5
 *
 * @param theme - Educational theme
 * @param levelsNeeded - 'early' (1-4) or 'all' (1-10)
 * @returns Array of lessons
 */
export const generateLessons = async (theme: string, levelsNeeded: 'early' | 'all' = 'all'): Promise<Lesson[]> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    // Check cache first
    const cached = await getCachedLessons(theme);
    if (cached) {
        return levelsNeeded === 'early' ? cached.slice(0, 4) : cached;
    }

    // Generate early levels (always needed)
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

    // If only early levels needed, return now (save tokens!)
    if (levelsNeeded === 'early') {
        return earlyLessons;
    }

    // Generate advanced levels (lazy loaded)
    const advancedPrompt = createAdvancedLevelsPrompt(theme);
    const advancedResponse = await generateWithGemini(
        advancedPrompt,
        apiKey,
        validateAdvancedLevels,
        GeminiModel.FlashLiteV2_5,
        { maxRetries: 3, timeout: 90000 },
    );

    const advancedContent = parseAdvancedLevelsToon(advancedResponse);

    const advancedLessons: Lesson[] = [
        { content: advancedContent.numbers, level: 5, type: 'numbers' },
        { content: advancedContent.mixed, level: 6, type: 'mixed' },
        { content: advancedContent.punctuation, level: 7, type: 'punctuation' },
        { content: advancedContent.paragraphs, level: 8, type: 'paragraphs' },
        { content: advancedContent.advanced, level: 9, type: 'advanced' },
        { content: advancedContent.expert, level: 10, type: 'expert' },
    ];

    const allLessons = [...earlyLessons, ...advancedLessons];

    // Cache for future requests (3 day TTL)
    await cacheLessons(theme, allLessons);

    return allLessons;
};
