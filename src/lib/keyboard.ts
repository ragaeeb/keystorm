import { KEYBOARD_ROWS } from './constants';

export const getKeyPosition = (key: string): { x: number; y: number } | null => {
    for (let rowIndex = 0; rowIndex < KEYBOARD_ROWS.length; rowIndex++) {
        const keyIndex = KEYBOARD_ROWS[rowIndex].indexOf(key);
        if (keyIndex !== -1) {
            const startX = rowIndex === 1 ? 22 : rowIndex === 2 ? 32 : rowIndex === 3 ? 52 : 12;
            return { x: startX + keyIndex * 40 + 18, y: 60 + rowIndex * 45 + 18 };
        }
    }
    return null;
};
