import type { Lesson } from '@/types/lesson';

export const DEFAULT_ISLAMIC_LESSONS: ReadonlyArray<Lesson> = [
    {
        content: [
            'a',
            's',
            'd',
            'f',
            'j',
            'k',
            'l',
            ';',
            'g',
            'h',
            'e',
            'i',
            'r',
            'u',
            'w',
            'o',
            'q',
            'p',
            't',
            'y',
            'v',
            'm',
            'c',
            'n',
            'b',
            'x',
            'z',
        ],
        level: 1,
        type: 'letters',
    },
    {
        content: ['salat', 'zakat', 'birr', 'taqwa', 'imam', 'umar', 'ali', 'fatima', 'aisha', 'muhammad'],
        level: 2,
        type: 'words',
    },
    {
        content: [
            'There are five daily obligatory prayers.',
            'Charity purifies the soul and wealth.',
            'Patience is a virtue in times of hardship.',
        ],
        level: 3,
        type: 'sentences',
    },
    {
        content: [
            'Patience persists through persistent practice. Believers build bridges between belief and benevolence. Sincere servants seek sacred serenity.',
        ],
        level: 4,
        type: 'paragraphs',
    },
];
