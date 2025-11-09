import { describe, expect, it } from 'bun:test';
import { getLevelDescription, getNextLevelRoute } from './descriptions';

describe('descriptions', () => {
    describe('getLevelDescription', () => {
        it('should return description for letters level', () => {
            const desc = getLevelDescription('letters', 1);
            expect(desc).toContain('individual letters');
            expect(desc).toContain('muscle memory');
        });

        it('should return description for words level', () => {
            const desc = getLevelDescription('words', 2);
            expect(desc).toContain('lowercase');
            expect(desc).toContain('transitions');
        });

        it('should return description for capitals level', () => {
            const desc = getLevelDescription('capitals', 3);
            expect(desc).toContain('capital letters');
            expect(desc).toContain('Shift key');
        });

        it('should return description for sentences level', () => {
            const desc = getLevelDescription('sentences', 4);
            expect(desc).toContain('sentences');
            expect(desc).toContain('punctuation');
        });

        it('should return description for numbers level', () => {
            const desc = getLevelDescription('numbers', 5);
            expect(desc).toContain('number row');
            expect(desc).toContain('symbols');
        });

        it('should return description for mixed level', () => {
            const desc = getLevelDescription('mixed', 6);
            expect(desc).toContain('letters');
            expect(desc).toContain('numbers');
        });

        it('should return description for punctuation level', () => {
            const desc = getLevelDescription('punctuation', 7);
            expect(desc).toContain('punctuation');
            expect(desc).toContain('symbols');
        });

        it('should return description for paragraphs level', () => {
            const desc = getLevelDescription('paragraphs', 8);
            expect(desc).toContain('paragraphs');
        });

        it('should return description for advanced level', () => {
            const desc = getLevelDescription('advanced', 9);
            expect(desc).toContain('passages');
            expect(desc).toContain('vocabulary');
        });

        it('should return description for expert level', () => {
            const desc = getLevelDescription('expert', 10);
            expect(desc).toContain('master');
            expect(desc).toContain('character types');
        });

        it('should return generic description for unknown type', () => {
            const desc = getLevelDescription('unknown' as any, 5);
            expect(desc).toContain('complete this level');
        });
    });

    describe('getNextLevelRoute', () => {
        it('should return /practice/words after letters', () => {
            expect(getNextLevelRoute('letters')).toBe('/practice/words');
        });

        it('should return /learn/shift after words', () => {
            expect(getNextLevelRoute('words')).toBe('/learn/shift');
        });

        it('should return /practice after capitals', () => {
            expect(getNextLevelRoute('capitals')).toBe('/practice');
        });

        it('should return /practice/summary after expert', () => {
            expect(getNextLevelRoute('expert')).toBe('/practice/summary');
        });

        it('should return /practice for most intermediate levels', () => {
            expect(getNextLevelRoute('sentences')).toBe('/practice');
            expect(getNextLevelRoute('numbers')).toBe('/practice');
            expect(getNextLevelRoute('mixed')).toBe('/practice');
        });
    });
});
