export type FingerPosition = { finger: string; keys: string[]; color: string };

export const FINGER_POSITIONS: FingerPosition[] = [
    { color: '#8BC34A', finger: 'Left Pinky', keys: ['Q', 'A', 'Z', '`', '1', '~', '!'] },
    { color: '#FF5252', finger: 'Left Ring', keys: ['W', 'S', 'X', '2', '@'] },
    { color: '#FFB74D', finger: 'Left Middle', keys: ['E', 'D', 'C', '3', '#'] },
    { color: '#4DD0E1', finger: 'Left Index', keys: ['R', 'F', 'V', 'T', 'G', 'B', '4', '5', '$', '%'] },
    { color: '#81C784', finger: 'Right Index', keys: ['Y', 'H', 'N', 'U', 'J', 'M', '6', '7', '^', '&'] },
    { color: '#EC407A', finger: 'Right Middle', keys: ['I', 'K', ',', '8', '*', '<'] },
    { color: '#AB47BC', finger: 'Right Ring', keys: ['O', 'L', '.', '9', '(', '>'] },
    {
        color: '#5C6BC0',
        finger: 'Right Pinky',
        keys: ['P', ';', '/', '0', '[', ']', "'", '"', ':', '?', '-', '=', '_', '+', ')', '\\', '|', '{', '}'],
    },
];

export const ROUNDS = [
    {
        level: 1,
        sentences: [
            'the quick brown fox jumps over the lazy dog',
            'pack my box with five dozen liquor jugs',
            'how vexingly quick daft zebras jump',
        ],
    },
    {
        level: 2,
        sentences: [
            'the five boxing wizards jump quickly and gracefully',
            'sphinx of black quartz judge my vow',
            'waltz bad nymph for quick jigs vex',
        ],
    },
    {
        level: 3,
        sentences: [
            'jackdaws love my big sphinx of quartz',
            'the quick onyx goblin jumps over the lazy dwarf',
            'crazy frederick bought many very exquisite opal jewels',
        ],
    },
];

export const KEYBOARD_ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
];

const LEFT_FINGERS = [
    { color: FINGER_POSITIONS[0].color, homeX: 32, homeY: 167, width: 28 }, // pinky
    { color: FINGER_POSITIONS[1].color, homeX: 72, homeY: 167, width: 30 }, // ring
    { color: FINGER_POSITIONS[2].color, homeX: 112, homeY: 167, width: 30 }, // middle
    { color: FINGER_POSITIONS[3].color, homeX: 152, homeY: 167, width: 30 }, // index
];
const RIGHT_FINGERS = [
    { color: FINGER_POSITIONS[4].color, homeX: 232, homeY: 167, width: 30 }, // index
    { color: FINGER_POSITIONS[5].color, homeX: 272, homeY: 167, width: 30 }, // middle
    { color: FINGER_POSITIONS[6].color, homeX: 312, homeY: 167, width: 30 }, // ring
    { color: FINGER_POSITIONS[7].color, homeX: 352, homeY: 167, width: 28 }, // pinky
];

export const ALL_FINGERS = LEFT_FINGERS.concat(RIGHT_FINGERS);
