import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { clearUserProfile, getUserName, getUserTheme, saveUserName, saveUserTheme } from './user-profile';

const createLocalStorageMock = () => {
    const store = new Map<string, string>();
    return {
        clear: () => store.clear(),
        getItem: (key: string) => store.get(key) ?? null,
        removeItem: (key: string) => store.delete(key),
        setItem: (key: string, value: string) => store.set(key, value),
    };
};

describe('user-profile', () => {
    const originalLocalStorage = globalThis.localStorage;

    beforeEach(() => {
        Object.defineProperty(globalThis, 'localStorage', {
            configurable: true,
            value: createLocalStorageMock(),
        });
        clearUserProfile();
    });

    afterEach(() => {
        clearUserProfile();
        if (originalLocalStorage) {
            Object.defineProperty(globalThis, 'localStorage', {
                configurable: true,
                value: originalLocalStorage,
            });
        } else {
            delete (globalThis as any).localStorage;
        }
    });

    describe('saveUserName and getUserName', () => {
        it('should save and retrieve user name', () => {
            saveUserName('John Doe');
            expect(getUserName()).toBe('John Doe');
        });

        it('should trim whitespace when saving', () => {
            saveUserName('  John Doe  ');
            expect(getUserName()).toBe('John Doe');
        });

        it('should remove name when saving empty string', () => {
            saveUserName('John Doe');
            saveUserName('');
            expect(getUserName()).toBe('');
        });

        it('should remove name when saving whitespace-only string', () => {
            saveUserName('John Doe');
            saveUserName('   ');
            expect(getUserName()).toBe('');
        });

        it('should return empty string when no name saved', () => {
            expect(getUserName()).toBe('');
        });
    });

    describe('saveUserTheme and getUserTheme', () => {
        it('should save and retrieve user theme', () => {
            saveUserTheme('Science');
            expect(getUserTheme()).toBe('Science');
        });

        it('should trim whitespace when saving theme', () => {
            saveUserTheme('  History  ');
            expect(getUserTheme()).toBe('History');
        });

        it('should return default theme when none saved', () => {
            expect(getUserTheme()).toBe('Islam');
        });

        it('should remove theme when saving empty string', () => {
            saveUserTheme('Science');
            saveUserTheme('');
            expect(getUserTheme()).toBe('Islam');
        });

        it('should remove theme when saving whitespace-only string', () => {
            saveUserTheme('Science');
            saveUserTheme('   ');
            expect(getUserTheme()).toBe('Islam');
        });
    });

    describe('clearUserProfile', () => {
        it('should clear both name and theme', () => {
            saveUserName('John Doe');
            saveUserTheme('Science');

            clearUserProfile();

            expect(getUserName()).toBe('');
            expect(getUserTheme()).toBe('Islam');
        });

        it('should be safe to call when nothing is saved', () => {
            expect(() => clearUserProfile()).not.toThrow();
        });
    });
});
