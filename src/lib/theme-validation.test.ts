import { describe, expect, it } from 'bun:test';
import { isThemeAllowed } from './theme-validation';

describe('theme-validation', () => {
    describe('isThemeAllowed', () => {
        it('should allow valid educational themes', () => {
            expect(isThemeAllowed('Islam')).toBe(true);
            expect(isThemeAllowed('Science')).toBe(true);
            expect(isThemeAllowed('History')).toBe(true);
            expect(isThemeAllowed('Mathematics')).toBe(true);
        });

        it('should reject themes that are too short', () => {
            expect(isThemeAllowed('ab')).toBe(false);
            expect(isThemeAllowed('a')).toBe(false);
            expect(isThemeAllowed('')).toBe(false);
        });

        it('should reject themes that are too long', () => {
            const longTheme = 'a'.repeat(65);
            expect(isThemeAllowed(longTheme)).toBe(false);
        });

        it('should accept themes at length boundaries', () => {
            expect(isThemeAllowed('abc')).toBe(true);
            expect(isThemeAllowed('a'.repeat(64))).toBe(true);
        });

        it('should reject themes with blocked words', () => {
            expect(isThemeAllowed('violence')).toBe(false);
            expect(isThemeAllowed('sexual content')).toBe(false);
            expect(isThemeAllowed('gambling')).toBe(false);
            expect(isThemeAllowed('drugs')).toBe(false);
        });

        it('should use word boundaries for blocking', () => {
            expect(isThemeAllowed('classic games')).toBe(true);
            expect(isThemeAllowed('assassin history')).toBe(true);
        });

        it('should reject themes with special characters', () => {
            expect(isThemeAllowed('theme@test')).toBe(false);
            expect(isThemeAllowed('theme#tag')).toBe(false);
            expect(isThemeAllowed('theme!!')).toBe(false);
        });

        it('should allow themes with spaces, hyphens, and ampersands', () => {
            expect(isThemeAllowed('science & technology')).toBe(true);
            expect(isThemeAllowed('world-history')).toBe(true);
            expect(isThemeAllowed('art and design')).toBe(true);
        });

        it('should handle case insensitivity', () => {
            expect(isThemeAllowed('ISLAM')).toBe(true);
            expect(isThemeAllowed('Science')).toBe(true);
            expect(isThemeAllowed('VIOLENCE')).toBe(false);
        });

        it('should trim whitespace', () => {
            expect(isThemeAllowed('  Islam  ')).toBe(true);
            expect(isThemeAllowed('  ab  ')).toBe(false);
        });
    });
});
