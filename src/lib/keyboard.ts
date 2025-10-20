import { FINGER_POSITIONS, KEYBOARD_ROWS } from './constants';

export const getFingerColor = (key: string): string => {
    const upperKey = key.toUpperCase();
    const position = FINGER_POSITIONS.find((fp) => fp.keys.includes(upperKey));
    return position?.color || '#E0E0E0';
};

export const getKeyPosition = (key: string): { x: number; y: number } | null => {
    for (let rowIndex = 0; rowIndex < KEYBOARD_ROWS.length; rowIndex++) {
        const keyIndex = KEYBOARD_ROWS[rowIndex].indexOf(key);
        if (keyIndex !== -1) {
            const startX = rowIndex === 1 ? 22 : rowIndex === 2 ? 32 : rowIndex === 3 ? 52 : 12;
            const baseY = 40 + rowIndex * 40;
            return { x: startX + keyIndex * 40 + 17, y: baseY + 17 };
        }
    }
    return null;
};
