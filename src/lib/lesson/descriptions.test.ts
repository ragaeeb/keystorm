import { describe, expect, it } from 'bun:test';
import { getLevelDescription, getNextLevelRoute } from './descriptions';

describe('descriptions', () => {
    describe('getLevelDescription', () => {
        it('should return description for letters level', () => {
            const desc = getLevelDescription('letters');
            expect(desc).toContain('individual letters');
            expect(desc).toContain('muscle memory');
        });

        it('should return description for words level', () => {
            const desc = getLevelDescription('words');
            expect(desc).toContain('lowercase');
            expect(desc).toContain('transitions');
        });

        it('should return description for capitals level', () => {
            const desc = getLevelDescription('capitals');
            expect(desc).toContain('capital letters');
            expect(desc).toContain('Shift key');
        });

        it('should return description for sentences level', () => {
            const desc = getLevelDescription('sentences');
            expect(desc).toContain('sentences');
            expect(desc).toContain('punctuation');
        });

        it('should return description for numbers level', () => {
            const desc = getLevelDescription('numbers');
            expect(desc).toContain('number row');
            expect(desc).toContain('symbols');
        });

        it('should return description for mixed level', () => {
            const desc = getLevelDescription('mixed');
            expect(desc).toContain('letters');
            expect(desc).toContain('numbers');
        });

        it('should return description for punctuation level', () => {
            const desc = getLevelDescription('punctuation');
            expect(desc).toContain('punctuation');
            expect(desc).toContain('symbols');
        });

        it('should return description for paragraphs level', () => {
            const desc = getLevelDescription('paragraphs');
            expect(desc).toContain('paragraphs');
        });

        it('should return description for advanced level', () => {
            const desc = getLevelDescription('advanced');
            expect(desc).toContain('passages');
            expect(desc).toContain('vocabulary');
        });

        it('should return description for expert level', () => {
            const desc = getLevelDescription('expert');
            expect(desc).toContain('master');
            expect(desc).toContain('character types');
        });

        it('should return generic description for unknown type', () => {
            const desc = getLevelDescription('unknown' as any);
            expect(desc).toContain('complete this level');
        });
    });

    describe('getNextLevelRoute', () => {
        it('should return /practice after letters', () => {
            expect(getNextLevelRoute('letters')).toBe('/practice');
        });

        it('should return /learn/shift after words', () => {
            expect(getNextLevelRoute('words')).toBe('/learn/shift');
        });

        it('should return /learn/numbers after capitals', () => {
            expect(getNextLevelRoute('capitals')).toBe('/learn/numbers');
        });

        it('should return /practice/summary after expert', () => {
            expect(getNextLevelRoute('expert')).toBe('/practice/summary');
        });

        it('should return /learn/numbers after sentences', () => {
            expect(getNextLevelRoute('sentences')).toBe('/learn/numbers');
        });
    });
});
