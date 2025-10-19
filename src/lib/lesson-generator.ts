import { GeminiModel, generateWithGemini } from './gemini';

type LessonType = 'letters' | 'words' | 'sentences' | 'paragraphs';

type Lesson = { type: LessonType; content: string[]; level: number };

type GeneratedContent = { letters: string[]; words: string[]; sentences: string[]; paragraphs: string[] };

const createPrompt = (theme: string): string => {
    return `You are a typing tutor content generator. Generate educational typing practice content based on the theme: "${theme}".

Requirements:
1. **Letters**: Return all 26 letters of the alphabet in a randomized order (lowercase). These should be individual characters.
2. **Words**: Generate 20 words related to "${theme}". Include proper nouns (names, places). Words should be 3-12 characters long, varied difficulty.
3. **Sentences**: Generate 15 complete sentences about "${theme}". Each sentence should be 40-80 characters. Use proper punctuation and capitalization.
4. **Paragraphs**: Generate 8 paragraphs about "${theme}". Each paragraph should be 150-250 characters. Include alliterations and vivid language.

Return ONLY valid JSON in this exact format:
{
  "letters": ["a", "s", "d", ...],
  "words": ["word1", "word2", ...],
  "sentences": ["Sentence one.", "Sentence two.", ...],
  "paragraphs": ["Paragraph one with alliteration...", "Paragraph two...", ...]
}

Do not include any markdown formatting, explanations, or additional text. Only return the JSON object.`;
};

const validateResponse = (text: string): boolean => {
    try {
        const parsed = JSON.parse(text);
        return (
            parsed &&
            Array.isArray(parsed.letters) &&
            Array.isArray(parsed.words) &&
            Array.isArray(parsed.sentences) &&
            Array.isArray(parsed.paragraphs) &&
            parsed.letters.length === 26 &&
            parsed.words.length >= 15 &&
            parsed.sentences.length >= 10 &&
            parsed.paragraphs.length >= 5
        );
    } catch {
        return false;
    }
};

export const generateLessons = async (theme: string): Promise<Lesson[]> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
    }

    const prompt = createPrompt(theme);
    const responseText = await generateWithGemini(prompt, apiKey, validateResponse, GeminiModel.FlashLiteV2_5, {
        maxRetries: 3,
        timeout: 60000,
    });

    const content: GeneratedContent = JSON.parse(responseText);

    return [
        { content: content.letters, level: 1, type: 'letters' },
        { content: content.words, level: 2, type: 'words' },
        { content: content.sentences, level: 3, type: 'sentences' },
        { content: content.paragraphs, level: 4, type: 'paragraphs' },
    ];
};
