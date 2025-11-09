import { describe, expect, it } from 'bun:test';
import { getFingerColor, getKeyPosition } from './keyboard';

describe('keyboard', () => {
    describe('getFingerColor', () => {
        it('should return correct color for home row keys', () => {
            expect(getFingerColor('A')).toBe('#8BC34A');
            expect(getFingerColor('S')).toBe('#FF5252');
            expect(getFingerColor('D')).toBe('#FFB74D');
            expect(getFingerColor('F')).toBe('#4DD0E1');
            expect(getFingerColor('J')).toBe('#81C784');
            expect(getFingerColor('K')).toBe('#EC407A');
            expect(getFingerColor('L')).toBe('#AB47BC');
            expect(getFingerColor(';')).toBe('#5C6BC0');
        });

        it('should handle lowercase keys', () => {
            expect(getFingerColor('a')).toBe('#8BC34A');
            expect(getFingerColor('f')).toBe('#4DD0E1');
        });

        it('should return gray for unknown keys', () => {
            expect(getFingerColor('€')).toBe('#E0E0E0');
            expect(getFingerColor('¢')).toBe('#E0E0E0');
        });

        it('should handle special characters assigned to fingers', () => {
            expect(getFingerColor('1')).toBe('#8BC34A');
            expect(getFingerColor('5')).toBe('#4DD0E1');
        });
    });

    describe('getKeyPosition', () => {
        it('should return position for top row keys', () => {
            const pos = getKeyPosition('Q');
            expect(pos).toMatchObject({ x: 39, y: 97 });
        });

        it('should return position for home row keys', () => {
            const posA = getKeyPosition('A');
            expect(posA).toMatchObject({ x: 49, y: 137 });

            const posJ = getKeyPosition('J');
            expect(posJ).toMatchObject({ x: 289, y: 137 });
        });

        it('should return null for non-existent keys', () => {
            expect(getKeyPosition('€')).toBeNull();
            expect(getKeyPosition('¢')).toBeNull();
        });

        it('should handle all rows correctly', () => {
            const row0 = getKeyPosition('1');
            const row1 = getKeyPosition('Q');
            const row2 = getKeyPosition('A');
            const row3 = getKeyPosition('Z');

            expect(row0).not.toBeNull();
            expect(row1).not.toBeNull();
            expect(row2).not.toBeNull();
            expect(row3).not.toBeNull();
        });
    });
});
