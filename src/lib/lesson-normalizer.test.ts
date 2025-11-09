import { describe, expect, it } from 'bun:test';
import type { Lesson } from '@/types/lesson';
import { normalizeLessonContent } from './lesson-normalizer';

describe('lesson-normalizer', () => {
    describe('normalizeLessonContent', () => {
        it('should convert words to lowercase', () => {
            const lessons: Lesson[] = [{ content: ['Hello', 'WORLD', 'TeSt'], level: 2, type: 'words' }];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['hello', 'world', 'test']);
        });

        it('should convert sentences to lowercase', () => {
            const lessons: Lesson[] = [{ content: ['Hello World.', 'THIS IS A TEST.'], level: 3, type: 'sentences' }];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['hello world.', 'this is a test.']);
        });

        it('should convert paragraphs to lowercase', () => {
            const lessons: Lesson[] = [
                { content: ['First Paragraph HERE.', 'Second ONE.'], level: 4, type: 'paragraphs' },
            ];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['first paragraph here.', 'second one.']);
        });

        it('should not modify letter lessons', () => {
            const lessons: Lesson[] = [{ content: ['A', 'B', 'C'], level: 1, type: 'letters' }];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['A', 'B', 'C']);
        });

        it('should handle mixed lesson types', () => {
            const lessons: Lesson[] = [
                { content: ['a', 'b'], level: 1, type: 'letters' },
                { content: ['WORD'], level: 2, type: 'words' },
                { content: ['Sentence.'], level: 3, type: 'sentences' },
            ];

            const result = normalizeLessonContent(lessons);

            expect(result[0].content).toEqual(['a', 'b']);
            expect(result[1].content).toEqual(['word']);
            expect(result[2].content).toEqual(['sentence.']);
        });

        it('should return empty array for empty input', () => {
            const result = normalizeLessonContent([]);
            expect(result).toEqual([]);
        });
    });
});
