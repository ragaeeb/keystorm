import { describe, expect, it } from 'bun:test';
import { DEFAULT_ISLAMIC_LESSONS } from './default-lessons';

describe('default-lessons', () => {
    it('should have 4 lessons for all levels', () => {
        expect(DEFAULT_ISLAMIC_LESSONS).toHaveLength(4);
    });

    it('should have correct lesson types in order', () => {
        expect(DEFAULT_ISLAMIC_LESSONS[0].type).toBe('letters');
        expect(DEFAULT_ISLAMIC_LESSONS[1].type).toBe('words');
        expect(DEFAULT_ISLAMIC_LESSONS[2].type).toBe('sentences');
        expect(DEFAULT_ISLAMIC_LESSONS[3].type).toBe('paragraphs');
    });

    it('should have correct level numbers', () => {
        expect(DEFAULT_ISLAMIC_LESSONS[0].level).toBe(1);
        expect(DEFAULT_ISLAMIC_LESSONS[1].level).toBe(2);
        expect(DEFAULT_ISLAMIC_LESSONS[2].level).toBe(3);
        expect(DEFAULT_ISLAMIC_LESSONS[3].level).toBe(4);
    });

    it('should have 26 unique letters + semicolon', () => {
        const letters = DEFAULT_ISLAMIC_LESSONS[0].content;
        expect(letters).toHaveLength(27);
        expect(new Set(letters).size).toBe(27);
    });

    it('should have all lowercase letters', () => {
        const letters = DEFAULT_ISLAMIC_LESSONS[0].content;
        for (const letter of letters) {
            expect(letter).toMatch(/^[a-z;]$/);
        }
    });

    it('should have non-empty words', () => {
        const words = DEFAULT_ISLAMIC_LESSONS[1].content;
        expect(words.length).toBeGreaterThan(0);
        for (const word of words) {
            expect(word.length).toBeGreaterThan(0);
        }
    });

    it('should have non-empty sentences', () => {
        const sentences = DEFAULT_ISLAMIC_LESSONS[2].content;
        expect(sentences.length).toBeGreaterThan(0);
        for (const sentence of sentences) {
            expect(sentence.length).toBeGreaterThan(0);
        }
    });

    it('should have non-empty paragraphs', () => {
        const paragraphs = DEFAULT_ISLAMIC_LESSONS[3].content;
        expect(paragraphs.length).toBeGreaterThan(0);
        for (const paragraph of paragraphs) {
            expect(paragraph.length).toBeGreaterThan(0);
        }
    });
});
