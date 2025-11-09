import { describe, expect, it } from 'bun:test';
import { getLevelDescription } from './lesson-descriptions';

describe('lesson-descriptions', () => {
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

        it('should return description for sentences level', () => {
            const desc = getLevelDescription('sentences', 3);
            expect(desc).toContain('sentences');
            expect(desc).toContain('rhythm');
        });

        it('should return description for paragraphs level', () => {
            const desc = getLevelDescription('paragraphs', 4);
            expect(desc).toContain('passages');
            expect(desc).toContain('precision');
        });

        it('should return generic description for unknown type', () => {
            const desc = getLevelDescription('unknown' as any, 5);
            expect(desc).toContain('complete this level');
        });
    });
});
