import { FINGER_POSITIONS, KEYBOARD_ROWS } from './constants';

const KEY_SPACING = 40;
const KEY_CENTER_OFFSET = 17;
const ROW_OFFSETS = { 0: 12, 1: 22, 2: 32, 3: 52 } as const;
const BASE_Y_START = 40;

/**
 * Gets the color associated with a keyboard key based on which finger should press it
 * @param key - The keyboard key (case-insensitive)
 * @returns Hex color code for the finger, or gray if key not found
 */
export const getFingerColor = (key: string): string => {
    const upperKey = key.toUpperCase();
    const position = FINGER_POSITIONS.find((fp) => fp.keys.includes(upperKey));
    return position?.color || '#E0E0E0';
};

/**
 * Calculates the x,y pixel position of a key in the keyboard visual
 * @param key - The keyboard key to locate
 * @returns Object with x,y coordinates, or null if key not found in layout
 */
export const getKeyPosition = (key: string): { x: number; y: number } | null => {
    for (let rowIndex = 0; rowIndex < KEYBOARD_ROWS.length; rowIndex++) {
        const keyIndex = KEYBOARD_ROWS[rowIndex].indexOf(key);
        if (keyIndex !== -1) {
            const startX = ROW_OFFSETS[rowIndex as keyof typeof ROW_OFFSETS] || ROW_OFFSETS[0];
            const baseY = BASE_Y_START + rowIndex * KEY_SPACING;
            return { x: startX + keyIndex * KEY_SPACING + KEY_CENTER_OFFSET, y: baseY + KEY_CENTER_OFFSET };
        }
    }
    return null;
};
