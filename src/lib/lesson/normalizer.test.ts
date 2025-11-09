import { describe, expect, it } from 'bun:test';
import type { Lesson } from '@/types/lesson';
import { normalizeLessonContent } from './normalizer';

describe('normalizer', () => {
    describe('normalizeLessonContent', () => {
        it('should convert words to lowercase', () => {
            const lessons: Lesson[] = [{ content: ['Hello', 'WORLD', 'TeSt'], level: 2, type: 'words' }];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['hello', 'world', 'test']);
        });

        it('should preserve capitals lesson case', () => {
            const lessons: Lesson[] = [{ content: ['Alice', 'BOB', 'Charlie'], level: 3, type: 'capitals' }];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['Alice', 'BOB', 'Charlie']);
        });

        it('should preserve sentences case', () => {
            const lessons: Lesson[] = [{ content: ['Hello World.', 'THIS IS A TEST.'], level: 4, type: 'sentences' }];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['Hello World.', 'THIS IS A TEST.']);
        });

        it('should preserve paragraphs case', () => {
            const lessons: Lesson[] = [
                { content: ['First Paragraph HERE.', 'Second ONE.'], level: 8, type: 'paragraphs' },
            ];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['First Paragraph HERE.', 'Second ONE.']);
        });

        it('should preserve letter lessons', () => {
            const lessons: Lesson[] = [{ content: ['a', 'b', 'c'], level: 1, type: 'letters' }];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['a', 'b', 'c']);
        });

        it('should handle mixed lesson types correctly', () => {
            const lessons: Lesson[] = [
                { content: ['a', 'b'], level: 1, type: 'letters' },
                { content: ['WORD'], level: 2, type: 'words' },
                { content: ['Capital'], level: 3, type: 'capitals' },
                { content: ['Sentence.'], level: 4, type: 'sentences' },
            ];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['a', 'b']);
            expect(result[1].content).toEqual(['word']);
            expect(result[2].content).toEqual(['Capital']);
            expect(result[3].content).toEqual(['Sentence.']);
        });

        it('should return empty array for empty input', () => {
            const result = normalizeLessonContent([]);
            expect(result).toEqual([]);
        });

        it('should preserve numbers lesson case', () => {
            const lessons: Lesson[] = [{ content: ['5 pillars', '99 names'], level: 5, type: 'numbers' }];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['5 pillars', '99 names']);
        });
    });
});
